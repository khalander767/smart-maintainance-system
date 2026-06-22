import mongoose from "mongoose";

const apartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true
    },
    code: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    contactEmail: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Apartment = mongoose.model("Apartment", apartmentSchema);

export default Apartment;