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


// Check in the user (start of workday)
router.post("/checkin", protect, checkIn);

// Check out the user (end of workday)
router.put("/checkout", protect, checkOut);

// Start a break for the user
router.put("/break/start", protect, startBreak);

// End a break for the user
router.put("/break/end", protect, endBreak);

// Get full attendance history of the logged-in user
router.get("/history", protect, getAttendanceHistory);

// Get today’s attendance record for the logged-in user
router.get("/today", protect, getTodayAttendance);


export default router;
