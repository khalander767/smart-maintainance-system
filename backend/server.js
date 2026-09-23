import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
// express-mongo-sanitize is incompatible with Express 5 (req.query is read-only)
// Using a simple custom sanitizer instead
const sanitizeBody = (req, _res, next) => {
  const clean = (obj) => {
    if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
        } else {
          clean(obj[key]);
        }
      });
    }
  };
  if (req.body) clean(req.body);
  next();
};
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import Complaint from "./models/Complaint.js";

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// CORS — localhost for dev, plus the deployed frontend URL via CLIENT_URL
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "12mb" }));

// Strip $ and . from request body to prevent NoSQL injection
app.use(sanitizeBody);

// Rate limit for auth routes — 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for all other API routes — 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", apiLimiter, userRoutes);
app.use("/api/complaints", apiLimiter, complaintRoutes);

app.get("/", (_req, res) => {
  res.send("API Running...");
});

// Background job — auto-close RESOLVED complaints after 24h
const runAutoClose = async () => {
  try {
    const result = await Complaint.updateMany(
      { status: "RESOLVED", autoCloseAt: { $lt: new Date() } },
      { $set: { status: "CLOSED" } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Auto-Close] Closed ${result.modifiedCount} complaint(s)`);
    }
  } catch (err) {
    console.error("[Auto-Close] Error:", err.message);
  }
};

const PORT = process.env.PORT || 8000;

const redactMongoUri = (value = "") =>
  value.replace(/(mongodb(?:\+srv)?:\/\/[^:/?#]+:)[^@/]+@/i, "$1<redacted>@");

const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("MongoDB connection failed: MONGO_URI is not set");
    process.exit(1);
  }

  try {
    console.log("MongoDB connecting...");
    await mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB_NAME });
    console.log("MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`Server running on port ${PORT}`)
    );
    runAutoClose();
    setInterval(runAutoClose, 5 * 60 * 1000);
  } catch (error) {
    const message = redactMongoUri(error.message || String(error));
    console.error(`MongoDB connection failed: ${message}`);
    process.exit(1);
  }
};

connectDatabase();
