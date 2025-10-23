import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  taskDetail: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dueDate: { type: Date },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
}, { timestamps: true });

export default mongoose.models.TaskDetail || mongoose.model("TaskDetail", taskSchema);
