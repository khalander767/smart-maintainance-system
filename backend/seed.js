import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import Apartment from "./models/Apartment.js";
import Complaint from "./models/Complaint.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Complaint.deleteMany({});
  await User.deleteMany({});
  await Apartment.deleteMany({});
  console.log("Cleared existing data");

  // Create apartment
  const apartment = await Apartment.create({
    name: "Sunshine Apartments",
    address: "123 Main Street, Hyderabad",
    code: "SUN123",
    contactEmail: "sunshine@apartments.com",
  });

  const hash = async (pw) => bcrypt.hash(pw, 10);

  // Create admin
  const admin = await User.create({
    name: "Admin User",
    email: "admin@sunshine.com",
    password: await hash("admin123"),
    role: "ADMIN",
    apartmentId: apartment._id,
  });

  // Create technicians
  const [t1, t2, t3, t4] = await User.insertMany([
    {
      name: "Ravi Kumar",
      email: "ravi@sunshine.com",
      password: await hash("tech123"),
      role: "TECHNICIAN",
      apartmentId: apartment._id,
    },
    {
      name: "Suresh Reddy",
      email: "suresh@sunshine.com",
      password: await hash("tech123"),
      role: "TECHNICIAN",
      apartmentId: apartment._id,
    },
    {
      name: "Vikram Singh",
      email: "vikram@sunshine.com",
      password: await hash("tech123"),
      role: "TECHNICIAN",
      apartmentId: apartment._id,
    },
    {
      name: "Amit Sharma",
      email: "amit@sunshine.com",
      password: await hash("tech123"),
      role: "TECHNICIAN",
      apartmentId: apartment._id,
    },
  ]);

  // Create residents
  const [r1, r2, r3, r4, r5] = await User.insertMany([
    {
      name: "Arjun Reddy",
      email: "arjun@sunshine.com",
      password: await hash("res123"),
      role: "RESIDENT",
      apartmentId: apartment._id,
    },
    {
      name: "Priya Sharma",
      email: "priya@sunshine.com",
      password: await hash("res123"),
      role: "RESIDENT",
      apartmentId: apartment._id,
    },
    {
      name: "Rahul Verma",
      email: "rahul@sunshine.com",
      password: await hash("res123"),
      role: "RESIDENT",
      apartmentId: apartment._id,
    },
    {
      name: "Sneha Patel",
      email: "sneha@sunshine.com",
      password: await hash("res123"),
      role: "RESIDENT",
      apartmentId: apartment._id,
    },
    {
      name: "Karthik Nair",
      email: "karthik@sunshine.com",
      password: await hash("res123"),
      role: "RESIDENT",
      apartmentId: apartment._id,
    },
  ]);

  const now = new Date();
  const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000);
  const sla = (priority) => {
    const h = priority === "HIGH" ? 24 : priority === "MEDIUM" ? 48 : 72;
    return new Date(now.getTime() + h * 60 * 60 * 1000);
  };

  // Create complaints
  await Complaint.insertMany([
    {
      title: "Water Leakage in Kitchen",
      description: "There is a major pipe leakage under the kitchen sink. Water is flooding the cabinet.",
      category: "Plumbing",
      priority: "HIGH",
      status: "OPEN",
      apartmentId: apartment._id,
      createdBy: r1._id,
      slaDeadline: sla("HIGH"),
      createdAt: hoursAgo(2),
    },
    {
      title: "Lift Not Working",
      description: "The elevator on Block A has stopped working since morning. Residents are stuck using stairs.",
      category: "Other",
      priority: "HIGH",
      status: "IN_PROGRESS",
      apartmentId: apartment._id,
      createdBy: r2._id,
      assignedTo: t1._id,
      slaDeadline: sla("HIGH"),
      createdAt: hoursAgo(5),
    },
    {
      title: "Electrical Short Circuit",
      description: "Short circuit in Block B corridor. Lights flickering and one socket is sparking.",
      category: "Electrical",
      priority: "HIGH",
      status: "OPEN",
      apartmentId: apartment._id,
      createdBy: r3._id,
      slaDeadline: sla("HIGH"),
      createdAt: hoursAgo(1),
    },
    {
      title: "Bathroom Pipe Leakage",
      description: "Bathroom pipe is leaking and water is dripping into the flat below.",
      category: "Plumbing",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      apartmentId: apartment._id,
      createdBy: r4._id,
      assignedTo: t2._id,
      slaDeadline: sla("MEDIUM"),
      createdAt: hoursAgo(10),
    },
    {
      title: "Fan Not Working in Bedroom",
      description: "The ceiling fan in the master bedroom has stopped working completely.",
      category: "Electrical",
      priority: "MEDIUM",
      status: "RESOLVED",
      apartmentId: apartment._id,
      createdBy: r5._id,
      assignedTo: t3._id,
      slaDeadline: sla("MEDIUM"),
      resolvedAt: hoursAgo(1),
      autoCloseAt: new Date(now.getTime() + 23 * 60 * 60 * 1000),
      proofImages: { before: "", after: "" },
      createdAt: hoursAgo(20),
    },
    {
      title: "Cleaning Required in Common Area",
      description: "The common area on the ground floor needs deep cleaning. Very unhygienic.",
      category: "Cleaning",
      priority: "LOW",
      status: "CLOSED",
      apartmentId: apartment._id,
      createdBy: r1._id,
      assignedTo: t4._id,
      slaDeadline: hoursAgo(10),
      resolvedAt: hoursAgo(5),
      isSLABreached: false,
      createdAt: hoursAgo(48),
    },
    {
      title: "AC Not Cooling Properly",
      description: "The AC in the living room is running but not cooling. Gas may need refilling.",
      category: "Other",
      priority: "MEDIUM",
      status: "OPEN",
      apartmentId: apartment._id,
      createdBy: r2._id,
      slaDeadline: sla("MEDIUM"),
      createdAt: hoursAgo(3),
    },
    {
      title: "Window Broken",
      description: "The window glass in bedroom 2 is cracked and needs replacement urgently.",
      category: "Other",
      priority: "LOW",
      status: "REOPENED",
      apartmentId: apartment._id,
      createdBy: r3._id,
      assignedTo: t1._id,
      slaDeadline: sla("LOW"),
      reopenedCount: 1,
      createdAt: hoursAgo(72),
    },
  ]);

  console.log("\n✅ Seed complete!\n");
  console.log(`APARTMENT JOIN CODE (for resident signup): ${apartment.code}\n`);
  console.log("=== LOGIN CREDENTIALS ===");
  console.log("ADMIN:      admin@sunshine.com     / admin123");
  console.log("TECHNICIAN: ravi@sunshine.com      / tech123");
  console.log("TECHNICIAN: suresh@sunshine.com    / tech123");
  console.log("TECHNICIAN: vikram@sunshine.com    / tech123");
  console.log("TECHNICIAN: amit@sunshine.com      / tech123");
  console.log("RESIDENT:   arjun@sunshine.com     / res123");
  console.log("RESIDENT:   priya@sunshine.com     / res123");
  console.log("RESIDENT:   rahul@sunshine.com     / res123");
  console.log("RESIDENT:   sneha@sunshine.com     / res123");
  console.log("RESIDENT:   karthik@sunshine.com   / res123");
  console.log("=========================\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
