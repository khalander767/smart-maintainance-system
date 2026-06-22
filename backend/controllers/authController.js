import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Apartment from "../models/Apartment.js";

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, apartmentName, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create Apartment (Tenant)
    const apartment = await Apartment.create({
      name: apartmentName,
      address
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
        apartmentName: apartment?.name || "SmartFix",
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};