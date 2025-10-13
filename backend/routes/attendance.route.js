import express from "express";
import {
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getAttendanceHistory,
  getTodayAttendance, 
} from "../controllers/attend.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// all routes protected
router.post("/checkin", protect, checkIn);
router.put("/checkout", protect, checkOut);
router.put("/break/start", protect, startBreak);
router.put("/break/end", protect, endBreak);
router.get("/history", protect, getAttendanceHistory);

// ✅ Today’s attendance
router.get("/today", protect, getTodayAttendance);

export default router;
