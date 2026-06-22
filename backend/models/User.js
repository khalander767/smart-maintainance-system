import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "TECHNICIAN", "RESIDENT"],
      default: "RESIDENT"
    },
    specialty: {
      type: String,
      enum: ["Plumber", "Electrician", "Lift Technician", "AC Technician", "Carpenter", "Cleaner", "Security", "General"],
      default: null,
    },
    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;