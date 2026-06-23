import express from "express";
import {
  createComplaint,
  assignTechnician,
  resolveComplaint,
  reopenComplaint,
  cancelComplaint,
  getComplaints,
  getComplaintById,
  getAdminDashboard,
} from "../controllers/complaintController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("RESIDENT"), createComplaint);
router.get("/admin/dashboard", protect, authorize("ADMIN"), getAdminDashboard);
router.get("/", protect, getComplaints);
router.get("/:id", protect, getComplaintById);
router.put("/:id/assign", protect, authorize("ADMIN"), assignTechnician);
router.put("/:id/resolve", protect, authorize("TECHNICIAN"), resolveComplaint);
router.put("/:id/reopen", protect, authorize("RESIDENT"), reopenComplaint);
router.put("/:id/cancel", protect, authorize("RESIDENT"), cancelComplaint);

export default router;
