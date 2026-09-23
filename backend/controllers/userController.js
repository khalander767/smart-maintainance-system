import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import Apartment from "../models/Apartment.js";
import TechnicianWarning from "../models/TechnicianWarning.js";

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

export const getTechnicianDetails = async (req, res) => {
  try {
    const technician = await User.findOne({
      _id: req.params.id,
      role: "TECHNICIAN",
      apartmentId: req.user.apartmentId,
    }).select("-password");
    if (!technician) return res.status(404).json({ message: "Technician not found" });

    const [apartment, complaints, warnings] = await Promise.all([
      Apartment.findById(req.user.apartmentId).select("name code address"),
      Complaint.find({ assignedTo: technician._id, apartmentId: req.user.apartmentId })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 }),
      TechnicianWarning.find({ technicianId: technician._id, apartmentId: req.user.apartmentId })
        .populate("issuedBy", "name email")
        .sort({ createdAt: -1 }),
    ]);

    const completedStatuses = ["RESOLVED", "CLOSED"];
    const activeStatuses = ["OPEN", "IN_PROGRESS", "REOPENED"];
    const completed = complaints.filter((complaint) => completedStatuses.includes(complaint.status));
    const active = complaints.filter((complaint) => activeStatuses.includes(complaint.status));
    const inProgress = complaints.filter((complaint) => complaint.status === "IN_PROGRESS");
    const open = complaints.filter((complaint) => complaint.status === "OPEN");
    const recentlyCompleted = [...completed]
      .sort((a, b) => new Date(b.resolvedAt || b.updatedAt) - new Date(a.resolvedAt || a.updatedAt))
      .slice(0, 5);
    const slaBreached = complaints.filter((complaint) => complaint.isSLABreached).length;
    const completedWithinSLA = completed.filter((complaint) =>
      complaint.resolvedAt && complaint.slaDeadline && new Date(complaint.resolvedAt) <= new Date(complaint.slaDeadline)
    ).length;
    const slaCompliance = complaints.length ? Math.round(((complaints.length - slaBreached) / complaints.length) * 100) : 100;

    res.json({
      technician,
      apartment,
      stats: {
        totalAssigned: complaints.length,
        totalCompleted: completed.length,
        resolvedOrClosed: completed.length,
        activeCount: active.length,
        openCount: open.length,
        inProgressCount: inProgress.length,
        completionRate: complaints.length ? Math.round((completed.length / complaints.length) * 100) : 0,
        totalHandled: complaints.length,
        completedWithinSLA,
        slaBreached,
        slaCompliance,
        slaPerformance: slaCompliance >= 75 ? "GOOD" : "NEEDS_ATTENTION",
      },
      isAvailable: inProgress.length === 0,
      activeWarningCount: warnings.filter((warning) => warning.isActive).length,
      warnings,
      activeComplaints: active,
      recentlyCompleted,
      workHistory: complaints,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const createTechnicianWarning = async (req, res) => {
  try {
    const technician = await User.findOne({
      _id: req.params.id,
      role: "TECHNICIAN",
      apartmentId: req.user.apartmentId,
    });
    if (!technician) return res.status(404).json({ message: "Technician not found" });

    const { reason, message = "" } = req.body;
    if (typeof reason !== "string" || typeof message !== "string") {
      return res.status(400).json({ message: "A valid warning reason and message are required" });
    }
    const warning = await TechnicianWarning.create({
      technicianId: technician._id,
      apartmentId: req.user.apartmentId,
      issuedBy: req.user._id,
      reason,
      message: message.trim(),
    });
    await warning.populate("issuedBy", "name email");
    res.status(201).json({ message: "Warning sent successfully", warning });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid warning reason or message" });
    }
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const updateTechnician = async (req, res) => {
  try {
    const technician = await User.findOne({
      _id: req.params.id,
      role: "TECHNICIAN",
      apartmentId: req.user.apartmentId,
    });
    if (!technician) return res.status(404).json({ message: "Technician not found" });

    const { name, email, specialty } = req.body;
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim() || typeof specialty !== "string" || !specialty) {
      return res.status(400).json({ message: "Name, email, and specialty are required" });
    }
    const duplicate = await User.findOne({ email: email.trim().toLowerCase(), _id: { $ne: technician._id } });
    if (duplicate) return res.status(400).json({ message: "Email is already in use" });

    technician.name = name.trim();
    technician.email = email.trim().toLowerCase();
    technician.specialty = specialty;
    await technician.save();
    const safeTechnician = technician.toObject({ versionKey: false });
    delete safeTechnician.password;
    res.json({ message: "Technician updated successfully", technician: safeTechnician });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const removeTechnician = async (req, res) => {
  try {
    const technician = await User.findOne({
      _id: req.params.id,
      role: "TECHNICIAN",
      apartmentId: req.user.apartmentId,
    });
    if (!technician) return res.status(404).json({ message: "Technician not found" });

    const assignedComplaints = await Complaint.find({
      assignedTo: technician._id,
      apartmentId: req.user.apartmentId,
    }).select("status");
    const activeCount = assignedComplaints.filter((complaint) => ["OPEN", "IN_PROGRESS", "REOPENED"].includes(complaint.status)).length;
    if (assignedComplaints.length) {
      return res.status(409).json({
        message: "Technician cannot be removed while complaint history references them. Reassign active work first; completed history is retained to avoid broken records.",
        activeComplaintCount: activeCount,
        assignedComplaintCount: assignedComplaints.length,
      });
    }

    await technician.deleteOne();
    res.json({ message: "Technician removed successfully" });
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
