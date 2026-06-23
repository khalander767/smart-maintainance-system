import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, images } = req.body;

    // SLA Logic
    let slaHours;
    if (priority === "HIGH") slaHours = 24;
    else if (priority === "MEDIUM") slaHours = 48;
    else slaHours = 72;

    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    // Keep only valid image data URLs, max 4
    const safeImages = Array.isArray(images)
      ? images.filter((img) => typeof img === "string" && img.startsWith("data:image/")).slice(0, 4)
      : [];

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      images: safeImages,
      apartmentId: req.user.apartmentId,
      createdBy: req.user._id,
      slaDeadline,
    });

    res.status(201).json({
      message: "Complaint created successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const { id } = req.params;

    // Find complaint
    const complaint = await Complaint.findOne({
      _id: id,
      apartmentId: req.user.apartmentId,
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!["OPEN", "REOPENED"].includes(complaint.status)) {
      return res.status(400).json({
        message: "Only OPEN or REOPENED complaints can be assigned",
      });
    }

    // Verify technician belongs to same apartment
    const technician = await User.findOne({
      _id: technicianId,
      role: "TECHNICIAN",
      apartmentId: req.user.apartmentId,
    });

    if (!technician) {
      return res.status(400).json({
        message: "Invalid technician",
      });
    }

    complaint.assignedTo = technician._id;
    complaint.status = "IN_PROGRESS";

    await complaint.save();
    await complaint.populate("assignedTo", "name email");
    await complaint.populate("createdBy", "name email");

    res.json({
      message: "Technician assigned successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { beforeImage, afterImage } = req.body;

    const complaint = await Complaint.findOne({
      _id: id,
      apartmentId: req.user.apartmentId,
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not assigned to this complaint",
      });
    }

    if (complaint.status !== "IN_PROGRESS") {
      return res.status(400).json({
        message: "Only IN_PROGRESS complaints can be resolved",
      });
    }

    const now = new Date();

    complaint.status = "RESOLVED";
    complaint.resolvedAt = now;
    complaint.autoCloseAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const isImg = (v) => typeof v === "string" && v.startsWith("data:image/");
    if (isImg(beforeImage) || isImg(afterImage)) {
      complaint.proofImages = {
        before: isImg(beforeImage) ? beforeImage : "",
        after: isImg(afterImage) ? afterImage : "",
      };
    }

    // SLA breach check
    if (complaint.slaDeadline && now > complaint.slaDeadline) {
      complaint.isSLABreached = true;
    }

    await complaint.save();

    res.json({
      message: "Complaint resolved successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const reopenComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    // Find complaint within same apartment
    const complaint = await Complaint.findOne({
      _id: id,
      apartmentId: req.user.apartmentId,
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Only RESOLVED or CLOSED complaints can be reopened
    if (!["RESOLVED", "CLOSED"].includes(complaint.status)) {
      return res.status(400).json({
        message: "Only resolved or closed complaints can be reopened",
      });
    }

    // Only the resident who created it can reopen
    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only reopen your own complaints",
      });
    }

    complaint.status = "REOPENED";
    complaint.reopenedCount += 1;
    complaint.autoCloseAt = null;

    await complaint.save();

    res.json({
      message: "Complaint reopened successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const cancelComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    // Find complaint within same apartment
    const complaint = await Complaint.findOne({
      _id: id,
      apartmentId: req.user.apartmentId,
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Only the resident who created it can cancel
    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only revoke your own complaints",
      });
    }

    // Can only revoke before a technician starts work
    if (!["OPEN", "REOPENED"].includes(complaint.status)) {
      return res.status(400).json({
        message: "This complaint can no longer be revoked",
      });
    }

    complaint.status = "CANCELLED";
    await complaint.save();

    res.json({
      message: "Complaint revoked successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;

    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (currentPage - 1) * pageLimit;

    let filter = {
      apartmentId: req.user.apartmentId,
    };

    // Role-based filtering
    if (req.user.role === "RESIDENT") {
      filter.createdBy = req.user._id;
    }

    if (req.user.role === "TECHNICIAN") {
      filter.assignedTo = req.user._id;
    }

    // Optional filters
    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    // Get total count for pagination info
    const totalRecords = await Complaint.countDocuments(filter);

    const complaints = await Complaint.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageLimit),
      currentPage,
      pageLimit,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      apartmentId: req.user.apartmentId,
    })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const apartmentId = req.user.apartmentId;

    const complaints = await Complaint.find({ apartmentId })
      .populate("assignedTo", "name")
      .populate("createdBy", "name");

    const total = complaints.length;

    // Status counts
    const statusCounts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0, REOPENED: 0 };
    let slaBreached = 0;

    complaints.forEach((c) => {
      statusCounts[c.status]++;
      if (c.isSLABreached) slaBreached++;
    });

    const slaBreachPercentage = total === 0 ? 0 : ((slaBreached / total) * 100).toFixed(2);
    const slaCompliance = total === 0 ? 100 : (((total - slaBreached) / total) * 100).toFixed(1);

    // Category breakdown
    const categoryMap = {};
    complaints.forEach((c) => {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Weekly trend — last 7 days
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = complaints.filter((c) => {
        const d = new Date(c.createdAt);
        return d >= date && d < nextDate;
      }).length;

      weeklyTrend.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        count,
      });
    }

    // Technician performance
    const techMap = {};
    complaints.forEach((c) => {
      if (!c.assignedTo) return;
      const id = c.assignedTo._id.toString();
      if (!techMap[id]) {
        techMap[id] = { name: c.assignedTo.name, assigned: 0, resolved: 0, slaBreached: 0 };
      }
      techMap[id].assigned++;
      if (["RESOLVED", "CLOSED"].includes(c.status)) techMap[id].resolved++;
      if (c.isSLABreached) techMap[id].slaBreached++;
    });
    const technicianStats = Object.values(techMap);

    // Recent 5 complaints
    const recentComplaints = complaints
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((c) => ({
        _id: c._id,
        title: c.title,
        category: c.category,
        status: c.status,
        priority: c.priority,
        createdBy: c.createdBy?.name,
        createdAt: c.createdAt,
      }));

    res.json({
      total,
      statusCounts,
      slaBreached,
      slaBreachPercentage,
      slaCompliance,
      categoryBreakdown,
      weeklyTrend,
      technicianStats,
      recentComplaints,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};
