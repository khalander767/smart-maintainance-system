import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["Plumbing", "Electrical", "Lift", "Carpentry", "Cleaning", "AC", "Security", "Other"],
      required: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED", "CANCELLED"],
      default: "OPEN",
    },

    // Photos attached by the resident when raising the complaint (base64 data URLs)
    images: {
      type: [String],
      default: [],
    },

    proofImages: {
      before: String,
      after: String,
    },

    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    slaDeadline: {
      type: Date,
    },

    resolvedAt: {
      type: Date,
    },

    autoCloseAt: {
      type: Date,
    },

    reopenedCount: {
      type: Number,
      default: 0,
    },

    isSLABreached: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
