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
  userName: {
      type: String,
      required: true,
    },
  role: {
    type: String,
    enum: ["Manager", "Employee"], // 1 = Manager, 2 = Employee
    required: true,
  }

}, { timestamps: true });

const User = mongoose.model("User" , userSchema);

export default User;