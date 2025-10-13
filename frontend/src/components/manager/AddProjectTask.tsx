"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Trash2, Pencil } from "lucide-react";
import { notifySuccess, notifyError } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";

interface Task {
  _id: string;
  taskDetail: string;
  createdBy: { _id: string; userName: string };
  assignedTo?: { _id: string; userName: string };
  createdAt?: string;
}

interface Props {
  project: { _id: string; projectName: string };
  onBack: () => void;
}

export default function ProjectTaskDashboard({ project, onBack }: Props) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/managerTasks/${project._id}`);
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
      notifyError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  // Add task
 const handleAddTask = async () => {
  if (!newTask.trim()) return;

  const managerId = user?.id; // use id, not _id
  if (!managerId) {
    notifyError("Manager not logged in");
    return;
  }

  try {
    await axios.post("http://localhost:8080/api/managerTasks/add", {
      project: project._id,
      taskDetail: newTask,
      createdBy: managerId, // matches backend field
    });

    setNewTask("");
    fetchTasks();
    notifySuccess("Task added successfully");
  } catch (err: any) {
    console.error(err);
    notifyError(err.response?.data?.message || "Failed to add task");
  }
};


  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      <Button variant="outline" onClick={onBack} className="mb-4">
        Back to Projects
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{project.projectName} - Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter new task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <Button onClick={handleAddTask}>Add Task</Button>
          </div>

          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p>No tasks added yet.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="flex justify-between items-center bg-gray-50 px-4 py-2 border rounded-md"
                >
                  <div>
                    <p>{task.taskDetail}</p>
                    <p className="text-sm text-gray-500">
                      Created by: {task.createdBy.userName}{" "}
                      {task.assignedTo ? `| Assigned to: ${task.assignedTo.userName}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log("Edit task", task._id)}
                    >
                      <Pencil className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log("Delete task", task._id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
