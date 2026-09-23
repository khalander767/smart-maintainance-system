import dotenv from "dotenv";
import mongoose from "mongoose";

import Apartment from "./models/Apartment.js";
import Complaint from "./models/Complaint.js";
import User from "./models/User.js";

dotenv.config();

// Additive and idempotent: this script never deletes or updates application data.
const DATABASE_NAME = "aptcare_test";
const APARTMENT_CODE = "LVT926";
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const templates = [
  ["Plumbing", "Plumber", "Kitchen sink drainage is slow", "Water is draining slowly from the kitchen sink despite basic cleaning."],
  ["Plumbing", "Plumber", "Bathroom tap is leaking", "The bathroom tap continues to drip after it has been closed fully."],
  ["Plumbing", "Plumber", "Water pressure is low", "The water pressure in the bathroom has dropped noticeably since this morning."],
  ["Electrical", "Electrician", "Corridor light is flickering", "The corridor light outside the flat flickers intermittently during the evening."],
  ["Electrical", "Electrician", "Bedroom fan is not starting", "The ceiling fan in the bedroom hums but does not start when switched on."],
  ["Electrical", "Electrician", "Power socket needs inspection", "One wall socket is loose and should be checked before it is used again."],
  ["Cleaning", "Cleaner", "Common stairwell needs cleaning", "Dust and debris have accumulated in the shared stairwell near the flat."],
  ["Cleaning", "Cleaner", "Lift lobby cleaning requested", "The lift lobby floor needs a routine clean after muddy footprints were tracked in."],
  ["Cleaning", "Cleaner", "Waste area needs attention", "The nearby waste collection area needs cleaning and deodorising."],
  ["Other", "General", "Door closer needs adjustment", "The common-area door closes too quickly and needs a general maintenance adjustment."],
  ["Other", "Security", "Visitor access panel is unresponsive", "The visitor access panel did not respond consistently while a guest was arriving."],
  ["Other", "AC Technician", "AC cooling needs inspection", "The AC is running but the room is not cooling as expected."],
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function keyFor(complaint) {
  return `${complaint.createdBy}|${complaint.title}|${complaint.description}`;
}

function countBy(items, field) {
  return items.reduce((counts, item) => {
    const value = item[field] ?? "UNASSIGNED";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

// Keep the same 18 unassigned records as new reports, then make completed work
// the largest share of the technician-assigned queue (90 complaints total).
function statusForIndex(index) {
  if (index % 5 === 0) return "OPEN";
  const assignedIndex = index - Math.floor(index / 5) - 1;
  if (assignedIndex < 50) return "CLOSED";
  if (assignedIndex < 66) return "IN_PROGRESS";
  return "REOPENED";
}

function buildComplaints(residents, techniciansBySpecialty, apartmentId) {
  const now = new Date();
  const complaints = [];

  residents.forEach((resident, residentIndex) => {
    for (let issueIndex = 0; issueIndex < 3; issueIndex += 1) {
      const index = residentIndex * 3 + issueIndex;
      const [category, specialty, baseTitle, baseDescription] = templates[index % templates.length];
      const status = statusForIndex(index);
      const priority = PRIORITIES[(index * 2 + residentIndex) % PRIORITIES.length];
      const location = `Flat ${String(101 + residentIndex).padStart(3, "0")}`;
      const createdAt = new Date(now.getTime() - ((index * 19 + 5) % 78 + 1) * 24 * 60 * 60 * 1000 - (index % 12) * 60 * 60 * 1000);
      const slaHours = priority === "HIGH" ? 24 : priority === "MEDIUM" ? 48 : 72;
      const technician = status === "OPEN" ? null : techniciansBySpecialty.get(specialty);

      assert(!technician || String(technician.apartmentId) === String(apartmentId), "Technician is not in the target apartment");

      const complaint = {
        title: `${baseTitle} — ${location}`,
        description: `${baseDescription} Reported from ${location}.`,
        category,
        priority,
        status,
        apartmentId,
        createdBy: resident._id,
        slaDeadline: new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000),
        isSLABreached: ["OPEN", "IN_PROGRESS", "REOPENED"].includes(status) && now > new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000),
        createdAt,
        updatedAt: createdAt,
      };

      if (technician) complaint.assignedTo = technician._id;
      if (["RESOLVED", "CLOSED"].includes(status)) {
        complaint.resolvedAt = new Date(createdAt.getTime() + (8 + (index % 28)) * 60 * 60 * 1000);
      }
      if (status === "CLOSED") complaint.autoCloseAt = new Date(complaint.resolvedAt.getTime() + 24 * 60 * 60 * 1000);
      if (status === "REOPENED") complaint.reopenedCount = 1 + (index % 2);
      complaints.push(complaint);
    }
  });

  return complaints;
}

function matchesPlan(existing, plan) {
  return (
    existing.category === plan.category &&
    existing.priority === plan.priority &&
    String(existing.apartmentId) === String(plan.apartmentId) &&
    String(existing.createdBy) === String(plan.createdBy) &&
    String(existing.assignedTo || "") === String(plan.assignedTo || "")
  );
}

async function verify(seedComplaints, residents, technicians, apartmentId) {
  const residentIds = new Set(residents.map((user) => String(user._id)));
  const technicianIds = new Set(technicians.map((user) => String(user._id)));
  const seeded = await Complaint.find({ apartmentId, createdBy: { $in: residents.map((user) => user._id) } }).lean();
  const seededByKey = new Map(seeded.map((complaint) => [keyFor(complaint), complaint]));
  const matched = seedComplaints.map((plan) => seededByKey.get(keyFor(plan)));

  assert(matched.every(Boolean), "One or more seeded complaints are missing");
  assert(matched.every((complaint) => String(complaint.apartmentId) === String(apartmentId)), "A complaint has an invalid apartmentId");
  assert(matched.every((complaint) => residentIds.has(String(complaint.createdBy))), "A complaint has an invalid resident creator");
  assert(matched.every((complaint) => complaint.status === "OPEN" || technicianIds.has(String(complaint.assignedTo))), "A non-open complaint lacks a valid apartment technician");
  assert(matched.every((complaint) => complaint.status !== "OPEN" || !complaint.assignedTo || technicianIds.has(String(complaint.assignedTo))), "An open complaint has an invalid technician");

  const perResident = Object.fromEntries(residents.map((resident) => [resident.email, matched.filter((complaint) => String(complaint.createdBy) === String(resident._id)).length]));
  assert(Object.values(perResident).every((count) => count === 3), "Each resident must have exactly 3 seeded complaints");

  const technicianNames = new Map(technicians.map((technician) => [String(technician._id), technician.name]));
  const assignments = matched.reduce((counts, complaint) => {
    const name = complaint.assignedTo ? technicianNames.get(String(complaint.assignedTo)) : "Unassigned";
    counts[name] = (counts[name] || 0) + 1;
    return counts;
  }, {});

  return {
    seededComplaints: matched.length,
    complaintsPerResident: perResident,
    byStatus: countBy(matched, "status"),
    byPriority: countBy(matched, "priority"),
    byCategory: countBy(matched, "category"),
    technicianAssignments: assignments,
  };
}

async function seed() {
  assert(process.env.MONGO_URI, "MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI, { dbName: DATABASE_NAME });
  assert(mongoose.connection.name === DATABASE_NAME, `Refusing to seed ${mongoose.connection.name}; expected ${DATABASE_NAME}`);

  const [usersBefore, apartmentsBefore, complaintsBefore] = await Promise.all([
    User.countDocuments(), Apartment.countDocuments(), Complaint.countDocuments(),
  ]);
  const session = await mongoose.startSession();
  let plannedComplaints;
  let apartmentId;
  let createdComplaints = 0;

  try {
    await session.withTransaction(async () => {
      const apartment = await Apartment.findOne({ code: APARTMENT_CODE }).session(session);
      assert(apartment, `Apartment ${APARTMENT_CODE} was not found`);
      apartmentId = apartment._id;

      const apartmentUsers = await User.find({ apartmentId }).sort({ email: 1 }).session(session);
      const residents = apartmentUsers.filter((user) => user.role === "RESIDENT");
      const technicians = apartmentUsers.filter((user) => user.role === "TECHNICIAN");
      const admins = apartmentUsers.filter((user) => user.role === "ADMIN");
      assert(residents.length === 30 && technicians.length === 6 && admins.length === 1 && apartmentUsers.length === 37, "Target apartment must contain exactly 1 admin, 30 residents, and 6 technicians");

      const techniciansBySpecialty = new Map(technicians.map((technician) => [technician.specialty, technician]));
      for (const specialty of ["Plumber", "Electrician", "Cleaner", "AC Technician", "Security", "General"]) {
        assert(techniciansBySpecialty.has(specialty), `Missing ${specialty} technician`);
      }
      plannedComplaints = buildComplaints(residents, techniciansBySpecialty, apartmentId);
      assert(plannedComplaints.length === 90, `Expected 90 planned complaints, found ${plannedComplaints.length}`);

      const existing = await Complaint.find({ apartmentId, createdBy: { $in: residents.map((resident) => resident._id) } }).session(session);
      const existingByKey = new Map(existing.map((complaint) => [keyFor(complaint), complaint]));
      const missing = [];
      for (const plan of plannedComplaints) {
        const found = existingByKey.get(keyFor(plan));
        if (found) assert(matchesPlan(found, plan), `Existing complaint ${found._id} conflicts with seed data; no changes were made`);
        else missing.push(plan);
      }

      if (missing.length) {
        await Complaint.insertMany(missing, { session });
        createdComplaints = missing.length;
      }
    });

    const apartmentUsers = await User.find({ apartmentId }).sort({ email: 1 });
    const report = await verify(
      plannedComplaints,
      apartmentUsers.filter((user) => user.role === "RESIDENT"),
      apartmentUsers.filter((user) => user.role === "TECHNICIAN"),
      apartmentId,
    );
    const [usersAfter, apartmentsAfter, complaintsAfter] = await Promise.all([
      User.countDocuments(), Apartment.countDocuments(), Complaint.countDocuments(),
    ]);
    assert(usersAfter === usersBefore && apartmentsAfter === apartmentsBefore, "Users or apartments changed unexpectedly");

    console.log(JSON.stringify({
      database: DATABASE_NAME,
      apartmentCode: APARTMENT_CODE,
      createdComplaints,
      complaintsBefore,
      complaintsAfter,
      unrelatedDataChanged: false,
      ...report,
    }, null, 2));
  } finally {
    await session.endSession();
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error(`Complaint seed failed: ${error.message}`);
  process.exitCode = 1;
});
