import dotenv from "dotenv";
import mongoose from "mongoose";

import Apartment from "./models/Apartment.js";
import Complaint from "./models/Complaint.js";
import User from "./models/User.js";

dotenv.config();

const DATABASE_NAME = "aptcare_test";
const APARTMENT_CODE = "LVT926";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countByStatus(complaints) {
  return complaints.reduce((counts, complaint) => {
    counts[complaint.status] = (counts[complaint.status] || 0) + 1;
    return counts;
  }, {});
}

async function normalize() {
  assert(process.env.MONGO_URI, "MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI, { dbName: DATABASE_NAME });
  assert(mongoose.connection.name === DATABASE_NAME, `Refusing to update ${mongoose.connection.name}; expected ${DATABASE_NAME}`);

  try {
    const apartment = await Apartment.findOne({ code: APARTMENT_CODE });
    assert(apartment, `Apartment ${APARTMENT_CODE} was not found`);
    const residents = await User.find({ apartmentId: apartment._id, role: "RESIDENT" }).select("_id");
    assert(residents.length === 30, "Expected 30 residents in the target apartment");

    // The title suffix is part of this seed's existing schema-backed fingerprint.
    const complaints = await Complaint.find({
      apartmentId: apartment._id,
      createdBy: { $in: residents.map((resident) => resident._id) },
      title: { $regex: / — Flat \d{3}$/ },
    }).sort({ createdAt: 1, _id: 1 });
    assert(complaints.length === 90, `Expected exactly 90 seeded complaints, found ${complaints.length}`);

    const unassigned = complaints.filter((complaint) => !complaint.assignedTo);
    const assigned = complaints.filter((complaint) => complaint.assignedTo);
    assert(unassigned.length === 18 && assigned.length === 72, "Expected 18 unassigned and 72 technician-assigned complaints");

    const desired = new Map();
    for (const complaint of unassigned) desired.set(String(complaint._id), "OPEN");
    assigned.forEach((complaint, index) => {
      const status = index < 50 ? "CLOSED" : index < 66 ? "IN_PROGRESS" : "REOPENED";
      desired.set(String(complaint._id), status);
    });

    const now = Date.now();
    const operations = [];
    for (const complaint of complaints) {
      const status = desired.get(String(complaint._id));
      const set = {};
      if (complaint.status !== status) set.status = status;
      if (["RESOLVED", "CLOSED"].includes(status) && !complaint.resolvedAt) {
        set.resolvedAt = new Date(Math.min(now - 60 * 60 * 1000, complaint.createdAt.getTime() + 12 * 60 * 60 * 1000));
      }
      if (status === "CLOSED" && !complaint.autoCloseAt) {
        const resolvedAt = set.resolvedAt || complaint.resolvedAt;
        set.autoCloseAt = new Date(resolvedAt.getTime() + 24 * 60 * 60 * 1000);
      }
      if (status === "REOPENED" && (!complaint.reopenedCount || complaint.reopenedCount < 1)) set.reopenedCount = 1;
      if (Object.keys(set).length) operations.push({ updateOne: { filter: { _id: complaint._id }, update: { $set: set } } });
    }
    if (operations.length) await Complaint.bulkWrite(operations);

    const updated = await Complaint.find({ _id: { $in: complaints.map((complaint) => complaint._id) } });
    const statusCounts = countByStatus(updated);
    assert(updated.length === 90, "Complaint total changed unexpectedly");
    assert(statusCounts.OPEN === 18 && statusCounts.IN_PROGRESS === 16 && !statusCounts.RESOLVED && statusCounts.CLOSED === 50 && statusCounts.REOPENED === 6, "Final status distribution is incorrect");
    assert(updated.every((complaint) => String(complaint.apartmentId) === String(apartment._id)), "An apartment relationship changed unexpectedly");
    assert(updated.every((complaint) => !complaint.assignedTo || assigned.some((original) => String(original._id) === String(complaint._id) && String(original.assignedTo) === String(complaint.assignedTo))), "A technician assignment changed unexpectedly");

    console.log(JSON.stringify({
      database: DATABASE_NAME,
      apartmentCode: APARTMENT_CODE,
      totalComplaints: updated.length,
      updatedComplaints: operations.length,
      statusCounts,
      relationshipsPreserved: true,
    }, null, 2));
  } finally {
    await mongoose.disconnect();
  }
}

normalize().catch((error) => {
  console.error(`Status normalization failed: ${error.message}`);
  process.exitCode = 1;
});
