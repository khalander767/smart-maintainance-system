import express from "express";
import { createUser, getUsers, getUserById, getTechnicianPerformance } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/",          protect, authorize("ADMIN"), createUser);
router.get("/",           protect, authorize("ADMIN"), getUsers);
router.get("/:id",        protect, authorize("ADMIN"), getUserById);
router.get("/:id/performance", protect, authorize("ADMIN"), getTechnicianPerformance);

export default router;
