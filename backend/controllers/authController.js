import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Apartment from "../models/Apartment.js";

// Generate a short, readable, unique apartment join code (e.g. "K7Q2MX")
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)
const generateApartmentCode = async () => {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    const exists = await Apartment.findOne({ code });
    if (!exists) return code;
  }
  throw new Error("Could not generate a unique apartment code");
};

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, apartmentName, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create Apartment (Tenant) with a unique join code
    const code = await generateApartmentCode();
    const apartment = await Apartment.create({
      name: apartmentName,
      address,
      code
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Admin user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
      apartmentId: apartment._id
    });

    res.status(201).json({
      message: "Admin registered successfully",
      userId: user._id,
      apartmentCode: apartment.code
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const registerResident = async (req, res) => {
  try {
    const { name, email, password, apartmentCode } = req.body;

    if (!name || !email || !password || !apartmentCode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the apartment by its join code
    const apartment = await Apartment.findOne({ code: apartmentCode.trim().toUpperCase() });
    if (!apartment) {
      return res.status(400).json({ message: "Invalid apartment code" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Resident user linked to the apartment
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "RESIDENT",
      apartmentId: apartment._id
    });

    res.status(201).json({
      message: "Resident registered successfully",
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const apartment = await Apartment.findById(user.apartmentId);

    // Backfill a join code for apartments created before codes existed
    if (apartment && !apartment.code) {
      apartment.code = await generateApartmentCode();
      await apartment.save();
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        apartmentId: user.apartmentId
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        apartmentId: user.apartmentId,
        apartmentName: apartment?.name || "AptCare",
        apartmentCode: apartment?.code || null,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};