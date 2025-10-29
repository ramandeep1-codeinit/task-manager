import Attendance from "../models/attendance.model.js";

// Check-in
export const checkIn = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in
    let attendance = await Attendance.findOne({ employeeId, date: today });
    if (attendance) return res.status(400).json({ message: "Already checked in today" });

    attendance = new Attendance({
      employeeId,
      date: today,
      checkIn: new Date(),
      status: "Present",
    });

    await attendance.save();
    res.status(201).json({ message: "Check-in successful", attendance });
  } catch (error) {
    res.status(500).json({ message: "Error during check-in", error });
  }
};

// ✅ Check-out
export const checkOut = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ employeeId, date: today });
    if (!attendance) return res.status(400).json({ message: "No check-in record found" });

    attendance.checkOut = new Date();

    // Calculate total work duration
    const totalBreaks = attendance.breaks.reduce((acc, b) => {
      if (b.start && b.end) return acc + (b.end - b.start);
      return acc;
    }, 0);

    attendance.workDuration = Math.round((attendance.checkOut - attendance.checkIn - totalBreaks) / (1000 * 60));
    await attendance.save();

    res.status(200).json({ message: "Check-out successful", attendance });
  } catch (error) {
    res.status(500).json({ message: "Error during check-out", error });
  }
};

// Start break
export const startBreak = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ employeeId, date: today });
    if (!attendance) return res.status(400).json({ message: "No check-in found" });

    attendance.breaks.push({ start: new Date() });
    await attendance.save();

    res.status(200).json({ message: "Break started", attendance });
  } catch (error) {
    res.status(500).json({ message: "Error starting break", error });
  }
};

// End break
export const endBreak = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ employeeId, date: today });
    if (!attendance || attendance.breaks.length === 0)
      return res.status(400).json({ message: "No active break found" });

    const lastBreak = attendance.breaks[attendance.breaks.length - 1];
    if (lastBreak.end) return res.status(400).json({ message: "Break already ended" });

    lastBreak.end = new Date();
    await attendance.save();

    res.status(200).json({ message: "Break ended", attendance });
  } catch (error) {
    res.status(500).json({ message: "Error ending break", error });
  }
};

// Today's attendance
export const getTodayAttendance = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ employeeId, date: today });
    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendance", error });
  }
};

// Attendance history
export const getAttendanceHistory = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const attendance = await Attendance.find({ employeeId }).sort({ date: -1 });
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance history", error });
  }
};
