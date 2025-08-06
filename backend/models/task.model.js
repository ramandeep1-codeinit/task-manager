import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  project: {
    type: String,
    required: true,
  },

}, { timestamps: true });

const Task = mongoose.model("Task" , taskSchema);

export default Task;