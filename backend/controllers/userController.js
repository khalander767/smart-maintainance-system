import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, specialty } = req.body;

    // Only allow specific roles to be created by Admin
    if (!["TECHNICIAN", "RESIDENT"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Admin can only create TECHNICIAN or RESIDENT"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user within same apartment
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      specialty: role === "TECHNICIAN" ? specialty : null,
      apartmentId: req.user.apartmentId,
    });

    res.status(201).json({
      message: `${role} created successfully`,
      user
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = { apartmentId: req.user.apartmentId };
    if (role) filter.role = role;

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });

    // For technicians, attach live availability derived from active complaints
    if (role === "TECHNICIAN") {
      const usersWithStatus = await Promise.all(
        users.map(async (user) => {
          const activeComplaints = await Complaint.find({
            assignedTo: user._id,
            status: "IN_PROGRESS",
            apartmentId: req.user.apartmentId,
          }).select("title category priority");

          return {
            ...user.toObject(),
            isAvailable: activeComplaints.length === 0,
            activeComplaints,
          };
        })
      );
      return res.json(usersWithStatus);
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const getTechnicianPerformance = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      assignedTo: req.params.id,
      apartmentId: req.user.apartmentId,
    });

    const assigned   = complaints.length;
    const resolved   = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status)).length;
    const slaBreached = complaints.filter((c) => c.isSLABreached).length;
    const resolutionRate = assigned > 0 ? Math.round((resolved / assigned) * 100) : 0;

    // Weekly trend — last 7 days resolved
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = complaints.filter((c) => {
        if (!c.resolvedAt) return false;
        const d = new Date(c.resolvedAt);
        return d >= date && d < nextDate;
      }).length;

      weeklyTrend.push({ day: date.toLocaleDateString("en-US", { weekday: "short" }), count });
    }

    res.json({ assigned, resolved, slaBreached, resolutionRate, weeklyTrend });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      apartmentId: req.user.apartmentId,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    const complaints = await Complaint.find({
      createdBy: user._id,
      apartmentId: req.user.apartmentId,
    }).sort({ createdAt: -1 });

    res.json({ user, complaints });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};