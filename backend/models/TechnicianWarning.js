import mongoose from "mongoose";

const technicianWarningSchema = new mongoose.Schema(
  {
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
      index: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["SLA Breach", "Too Many Active Complaints", "Delayed Resolution", "Emergency Assignment", "General Warning"],
      required: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const TechnicianWarning = mongoose.model("TechnicianWarning", technicianWarningSchema);

export default TechnicianWarning;
