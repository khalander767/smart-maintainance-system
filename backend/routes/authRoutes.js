import express from "express";
import { registerAdmin, registerResident, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/register-resident", registerResident);
router.post("/login", login);

export default router;