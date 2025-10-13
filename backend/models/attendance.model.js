import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },

  breaks: [
    {
      start: Date,
      end: Date
    }
  ],
  status: {
    type: String,
    enum: ["Present", "Absent", "Half Day", "On Leave"],
    default: "Present"
  },
  workDuration: { type: Number, default: 0 } // total working time (in minutes)
}, { timestamps: true });

export default mongoose.model('Attendance', AttendanceSchema);
