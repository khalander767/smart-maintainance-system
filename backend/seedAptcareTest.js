import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import Apartment from "./models/Apartment.js";
import User from "./models/User.js";

dotenv.config();

// This script is intentionally additive. It never deletes or updates records.
const DATABASE_NAME = "aptcare_test";
const TEST_PASSWORD = "AptCareTest!2026";

const apartmentData = {
  name: "Lakeview Heights Test Residences",
  address: "412 Lakeview Road, HSR Layout, Bengaluru, Karnataka 560102",
  code: "LVT926",
  contactEmail: "contact@lakeviewheights-test.example.com",
};

const admin = {
  name: "Tiku",
  email: "tiku.admin@lakeviewheights",
  role: "ADMIN",
  specialty: null,
};

const residents = [
  "Aarav Mehta", "Diya Nair", "Vihaan Kapoor", "Ishita Menon", "Kabir Shah",
  "Meera Iyer", "Arjun Bhat", "Kavya Reddy", "Rohan Malhotra", "Sneha Kulkarni",
  "Aditya Joshi", "Nisha Verma", "Rahul Khanna", "Pooja Desai", "Siddharth Rao",
  "Anika Gupta", "Karan Sethi", "Riya Chawla", "Varun Iyer", "Neha Kapoor",
  "Manav Arora", "Tanya Bansal", "Dev Patel", "Aditi Singh", "Yash Malhotra",
  "Simran Kaur", "Nikhil Jain", "Priya Nambiar", "Harsh Vohra", "Sana Qureshi",
].map((name, index) => ({
  name,
  email: `resident${String(index + 1).padStart(2, "0")}@lakeviewheights-test.example.com`,
  role: "RESIDENT",
  specialty: null,
}));

const technicians = [
  ["Ramesh Patil", "ramesh.patil.plumber@lakeviewheights-test.example.com", "Plumber"],
  ["Farah Siddiqui", "farah.siddiqui.electrician@lakeviewheights-test.example.com", "Electrician"],
  ["Joseph Mathew", "joseph.mathew.cleaner@lakeviewheights-test.example.com", "Cleaner"],
  ["Kiran Shetty", "kiran.shetty.ac@lakeviewheights-test.example.com", "AC Technician"],
  ["Imran Ali", "imran.ali.security@lakeviewheights-test.example.com", "Security"],
  ["Leela Krishnan", "leela.krishnan.general@lakeviewheights-test.example.com", "General"],
].map(([name, email, specialty]) => ({ name, email, specialty, role: "TECHNICIAN" }));

const plannedUsers = [admin, ...residents, ...technicians];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function userMatchesPlan(user, plan, apartmentId) {
  return (
    user.name === plan.name &&
    user.email === plan.email &&
    user.role === plan.role &&
    user.specialty === plan.specialty &&
    String(user.apartmentId) === String(apartmentId)
  );
}

async function verify(apartmentId) {
  const users = await User.find({ apartmentId }).lean();
  const roleCounts = Object.fromEntries(
    ["ADMIN", "RESIDENT", "TECHNICIAN"].map((role) => [
      role,
      users.filter((user) => user.role === role).length,
    ]),
  );
  const userEmails = users.map((user) => user.email);
  const duplicateEmailGroups = await User.aggregate([
    { $group: { _id: "$email", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  assert(users.length === 37, `Expected 37 users, found ${users.length}`);
  assert(roleCounts.ADMIN === 1, `Expected 1 admin, found ${roleCounts.ADMIN}`);
  assert(roleCounts.RESIDENT === 30, `Expected 30 residents, found ${roleCounts.RESIDENT}`);
  assert(roleCounts.TECHNICIAN === 6, `Expected 6 technicians, found ${roleCounts.TECHNICIAN}`);
  assert(users.every((user) => String(user.apartmentId) === String(apartmentId)), "A user has an incorrect apartmentId");
  assert(new Set(userEmails).size === userEmails.length, "Duplicate email found in seeded users");
  assert(duplicateEmailGroups.length === 0, "Duplicate email found in the database");
  assert(
    (await Promise.all(users.map((user) => bcrypt.compare(TEST_PASSWORD, user.password)))).every(Boolean),
    "One or more password hashes do not match the test password",
  );

  return roleCounts;
}

async function seed() {
  assert(process.env.MONGO_URI, "MONGO_URI is required");
  assert(new Set(plannedUsers.map((user) => user.email)).size === plannedUsers.length, "Seed data has duplicate emails");

  await mongoose.connect(process.env.MONGO_URI, { dbName: DATABASE_NAME });
  assert(mongoose.connection.name === DATABASE_NAME, `Refusing to seed ${mongoose.connection.name}; expected ${DATABASE_NAME}`);

  const session = await mongoose.startSession();
  let apartmentId;
  let createdApartment = false;
  let createdUsers = 0;

  try {
    await session.withTransaction(async () => {
      let apartment = await Apartment.findOne({ code: apartmentData.code }).session(session);
      if (apartment) {
        assert(
          apartment.name === apartmentData.name &&
          apartment.address === apartmentData.address &&
          apartment.contactEmail === apartmentData.contactEmail,
          `Apartment code ${apartmentData.code} belongs to a different record; no changes were made`,
        );
      } else {
        [apartment] = await Apartment.create([apartmentData], { session });
        createdApartment = true;
      }
      apartmentId = apartment._id;

      const usersAtApartment = await User.find({ apartmentId }).session(session);
      assert(
        usersAtApartment.length <= plannedUsers.length,
        `Apartment already has ${usersAtApartment.length} users; refusing to change unrelated records`,
      );

      for (const plan of plannedUsers) {
        const existing = await User.findOne({ email: plan.email }).session(session);
        if (existing) {
          assert(
            userMatchesPlan(existing, plan, apartmentId) && await bcrypt.compare(TEST_PASSWORD, existing.password),
            `Email ${plan.email} belongs to a different or incompatible user; no changes were made`,
          );
          continue;
        }

        await User.create([{
          ...plan,
          password: await bcrypt.hash(TEST_PASSWORD, 10),
          apartmentId,
        }], { session });
        createdUsers += 1;
      }

      const finalCount = await User.countDocuments({ apartmentId }).session(session);
      assert(finalCount === plannedUsers.length, `Expected 37 users after seeding, found ${finalCount}`);
    });

    const roleCounts = await verify(apartmentId);
    console.log(JSON.stringify({
      database: DATABASE_NAME,
      apartmentId: String(apartmentId),
      apartmentCode: apartmentData.code,
      createdApartment,
      createdUsers,
      totalUsers: 37,
      roleCounts,
      usernameNote: "The User schema has no username field; email is the unique account identifier.",
      phoneNote: "The User schema has no phone field, so no phone data was added.",
    }, null, 2));
  } finally {
    await session.endSession();
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
});
