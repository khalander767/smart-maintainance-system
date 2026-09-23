import express from "express";
import { createUser, getUsers, getUserById, getTechnicianPerformance, getTechnicianDetails, updateTechnician, removeTechnician, createTechnicianWarning } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/",          protect, authorize("ADMIN"), createUser);
router.get("/",           protect, authorize("ADMIN"), getUsers);
router.get("/:id",        protect, authorize("ADMIN"), getUserById);
router.get("/:id/performance", protect, authorize("ADMIN"), getTechnicianPerformance);
router.get("/:id/details",     protect, authorize("ADMIN"), getTechnicianDetails);
router.post("/:id/warnings",   protect, authorize("ADMIN"), createTechnicianWarning);
router.put("/:id",             protect, authorize("ADMIN"), updateTechnician);
router.delete("/:id",          protect, authorize("ADMIN"), removeTechnician);

export default router;
