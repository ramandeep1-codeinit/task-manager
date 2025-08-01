import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  role: {
    type: Number,
    enum: [1, 2], // 1 = Manager, 2 = Employee
    required: true,
  }

}, { timestamps: true });

export default mongoose.model('User', userSchema);
