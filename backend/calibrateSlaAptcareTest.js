import dotenv from "dotenv";
import mongoose from "mongoose";

import Apartment from "./models/Apartment.js";
import Complaint from "./models/Complaint.js";
import User from "./models/User.js";

dotenv.config();

const DATABASE_NAME = "aptcare_test";
const APARTMENT_CODE = "LVT926";
const HOUR = 60 * 60 * 1000;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const slaHoursFor = (priority) => (priority === "HIGH" ? 24 : priority === "MEDIUM" ? 48 : 72);

const countBy = (complaints, predicate) => complaints.filter(predicate).length;

async function calibrate() {
  assert(process.env.MONGO_URI, "MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI, { dbName: DATABASE_NAME });
  assert(mongoose.connection.name === DATABASE_NAME, `Refusing to update ${mongoose.connection.name}; expected ${DATABASE_NAME}`);

  try {
    const [apartment, usersBefore, apartmentsBefore] = await Promise.all([
      Apartment.findOne({ code: APARTMENT_CODE }),
      User.countDocuments(),
      Apartment.countDocuments(),
    ]);
    assert(apartment, `Apartment ${APARTMENT_CODE} was not found`);
    const residents = await User.find({ apartmentId: apartment._id, role: "RESIDENT" }).select("_id");
    const complaints = await Complaint.find({
      apartmentId: apartment._id,
      createdBy: { $in: residents.map((resident) => resident._id) },
      title: { $regex: / — Flat \d{3}$/ },
    }).sort({ _id: 1 });
    assert(complaints.length === 90, `Expected exactly 90 seeded complaints, found ${complaints.length}`);

    const byStatus = {
      CLOSED: complaints.filter((item) => item.status === "CLOSED"),
      OPEN: complaints.filter((item) => item.status === "OPEN"),
      IN_PROGRESS: complaints.filter((item) => item.status === "IN_PROGRESS"),
      REOPENED: complaints.filter((item) => item.status === "REOPENED"),
    };
    assert(byStatus.CLOSED.length === 50 && byStatus.OPEN.length === 18 && byStatus.IN_PROGRESS.length === 16 && byStatus.REOPENED.length === 6, "Unexpected complaint status distribution");

    // 8 completed + 5 open + 3 in-progress + 2 reopened = 18 breaches (80% compliance).
    const breachIds = new Set([
      ...byStatus.CLOSED.slice(0, 8),
      ...byStatus.OPEN.slice(0, 5),
      ...byStatus.IN_PROGRESS.slice(0, 3),
      ...byStatus.REOPENED.slice(0, 2),
    ].map((item) => String(item._id)));
    const now = Date.now();
    const operations = complaints.map((complaint, index) => {
      const slaHours = slaHoursFor(complaint.priority);
      const breached = breachIds.has(String(complaint._id));
      let createdAt;
      let resolvedAt = null;
      let autoCloseAt = null;

      if (complaint.status === "CLOSED") {
        const ageHours = 120 + ((index * 29) % 1200);
        createdAt = new Date(now - ageHours * HOUR);
        const deadline = new Date(createdAt.getTime() + slaHours * HOUR);
        resolvedAt = new Date(deadline.getTime() + (breached ? (3 + (index % 12)) * HOUR : -Math.max(2, Math.floor(slaHours * 0.35)) * HOUR));
        autoCloseAt = new Date(resolvedAt.getTime() + 24 * HOUR);
      } else {
        const elapsedHours = breached
          ? slaHours + 2 + (index % 10)
          : Math.max(4, Math.floor(slaHours * 0.45) - (index % 4));
        createdAt = new Date(now - elapsedHours * HOUR);
        if (complaint.status === "REOPENED") {
          // The stored resolution marks the earlier attempt; the current issue remains active.
          resolvedAt = new Date(createdAt.getTime() + Math.max(2, Math.floor(slaHours * 0.2)) * HOUR);
        }
      }

      const slaDeadline = new Date(createdAt.getTime() + slaHours * HOUR);
      return {
        updateOne: {
          filter: { _id: complaint._id },
          update: {
            $set: { createdAt, slaDeadline, resolvedAt, autoCloseAt, isSLABreached: breached },
          },
        },
      };
    });

    await Complaint.bulkWrite(operations);

    const updated = await Complaint.find({ _id: { $in: complaints.map((item) => item._id) } });
    const breached = countBy(updated, (item) => item.isSLABreached);
    const onTime = updated.length - breached;
    const compliance = Number(((onTime / updated.length) * 100).toFixed(1));
    const dateConsistency = updated.every((item) => {
      const deadline = new Date(item.slaDeadline).getTime();
      if (item.status === "CLOSED") return item.resolvedAt && ((item.isSLABreached && item.resolvedAt > item.slaDeadline) || (!item.isSLABreached && item.resolvedAt <= item.slaDeadline));
      return item.isSLABreached === (Date.now() > deadline);
    });
    const [usersAfter, apartmentsAfter] = await Promise.all([User.countDocuments(), Apartment.countDocuments()]);
    assert(updated.length === 90, "Complaint total changed unexpectedly");
    assert(breached === 18 && onTime === 72 && compliance === 80, "SLA target was not reached");
    assert(dateConsistency, "SLA dates are inconsistent with the stored breach result");
    assert(usersBefore === usersAfter && apartmentsBefore === apartmentsAfter, "Unrelated users or apartments changed unexpectedly");

    console.log(JSON.stringify({
      database: DATABASE_NAME,
      totalComplaints: updated.length,
      onTimeComplaints: onTime,
      breachedComplaints: breached,
      slaCompliance: compliance,
      statusCounts: updated.reduce((counts, item) => ({ ...counts, [item.status]: (counts[item.status] || 0) + 1 }), {}),
      dateConsistency,
      unrelatedDataChanged: false,
    }, null, 2));
  } finally {
    await mongoose.disconnect();
  }
}

calibrate().catch((error) => {
  console.error(`SLA calibration failed: ${error.message}`);
  process.exitCode = 1;
});
