import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
    },
    project: {
      type: String,
      required: true,
    },
    taskDetail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
