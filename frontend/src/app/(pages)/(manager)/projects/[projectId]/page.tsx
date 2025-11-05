"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Trash2, Pencil, Calendar, Plus, Edit2 } from "lucide-react";
import { notifySuccess, notifyError, notifyDelete } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";
import { useTaskDetail } from "@/context/TaskDetailContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEmployee } from "@/context/EmployeeContext";
import { useProject } from "@/context/ProjectContext";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const COLORS = [
  "from-blue-500 to-blue-700",
  "from-green-500 to-green-700",
  "from-purple-500 to-purple-700",
  "from-pink-500 to-rose-700",
  "from-orange-500 to-yellow-600",
  "from-cyan-500 to-sky-700",
];

interface Task {
  _id: string;
  taskDetail: string;
  assignedTo?: { _id: string; userName: string };
  createdAt?: string;
  dueDate?: string;
  status?: "pending" | "completed";
}

export default function ProjectTaskPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // Use TaskDetailContext
  const {
    tasks,
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask,
    markTaskDone,
  } = useTaskDetail();

  // Use EmployeeContext
  const { employees, getEmployees } = useEmployee();

  //use ProjectContext
  const { getProjectById } = useProject();

  const [project, setProject] = useState<{ _id: string; projectName: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [assignedUser, setAssignedUser] = useState<string>("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedEmployeeQuery = useDebounce(employeeSearchQuery, 300);
  const debouncedTaskQuery = useDebounce(taskSearchQuery, 300);


  // Fetch project with taskDetailContext
  const fetchProject = async () => {
  try {
    const id = Array.isArray(projectId) ? projectId[0] : projectId;
    if (!id) return;

    const project = await getProjectById(id);
    setProject(project);
  } catch (error) {
    notifyError("Failed to fetch project");
  }
};

  // Fetch tasks with taskDetailContext
  const fetchTasks = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      await getTasksByProject(projectId as string);
    } catch {
      notifyError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchTasks();
    getEmployees(); 
  }, [projectId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetTaskForm = () => {
    setNewTask("");
    setEditTaskId(null);
    setAssignedUser("");
    setDueDate(null);
  };

  // Add or Edit Task 
  const handleAddOrEditTask = async () => {
    if (!newTask.trim()) return notifyError("Task detail cannot be empty");
    if (!project) return;

    try {
      if (editTaskId) {
        await updateTask(editTaskId, {
          taskDetail: newTask,
          assignedTo: assignedUser || undefined,
          dueDate: dueDate || undefined,
        });
        notifySuccess("Task updated successfully");
      } else {
        await createTask({
          project: project._id,
          taskDetail: newTask,
          createdBy: user?.id,
          assignedTo: assignedUser || undefined,
          dueDate: dueDate || undefined,
        });
        notifySuccess("Task added successfully");
      }

      resetTaskForm();
      fetchTasks();
      setTaskModalOpen(false);
    } catch (err: any) {
      notifyError(err.response?.data?.message || "Failed to save task");
    }
  };

  // Delete Task using taskdetail context
  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    setDeleting(true);
    try {
      await deleteTask(deleteTaskId);
      notifyDelete("Task deleted successfully");
      fetchTasks();
    } catch {
      notifyError("Failed to delete task");
    } finally {
      setDeleting(false);
      setDeleteTaskId(null);
    }
  };

  const startEditing = (task: Task) => {
    setEditTaskId(task._id);
    setNewTask(task.taskDetail);
    setAssignedUser(task.assignedTo?._id || "");
    setDueDate(task.dueDate || null);
    setTaskModalOpen(true);
  };

  // Mark Task Done with taskdetailcontext
  const handleMarkAsDone = async (taskId: string) => {
    try {
      await markTaskDone(taskId);
      notifySuccess("Task marked as completed!");
      fetchTasks();
    } catch {
      notifyError("Failed to mark task done");
    }
  };

  const getBadgeColor = (userId: string) =>
    COLORS[
      Math.abs(userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) %
        COLORS.length
    ];

  const filteredEmployees = useMemo(
    () =>
      employees.filter((emp) =>
        emp.userName.toLowerCase().includes(debouncedEmployeeQuery.toLowerCase())
      ),
    [employees, debouncedEmployeeQuery]
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.taskDetail.toLowerCase().includes(debouncedTaskQuery.toLowerCase()) ||
          task.assignedTo?.userName
            ?.toLowerCase()
            .includes(debouncedTaskQuery.toLowerCase())
      ),
    [tasks, debouncedTaskQuery]
  );

  if (!user) return <p>Loading user...</p>;
  if (!project) return <p>Loading project...</p>;

  return (
    <div>
      <Button variant="outline" className="mb-4 cursor-pointer" onClick={() => router.push("/projects")}>
        ← Back to Projects
      </Button>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <CardTitle className="text-xl font-semibold text-gray-800">
            {project.projectName} - Tasks
          </CardTitle>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search tasks or employee..."
              value={taskSearchQuery}
              onChange={(e) => setTaskSearchQuery(e.target.value)}
              className="max-w-md h-9"
            />
            <Button
              className="flex items-center gap-1 h-9 cursor-pointer"
              onClick={() => {
                resetTaskForm();
                setTaskModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" /> Add Task
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p>Loading tasks...</p>
          ) : filteredTasks.length === 0 ? (
            <p>No tasks found.</p>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex justify-between items-center bg-gray-50 px-4 py-3 border rounded-md shadow-sm hover:shadow-md transition-all"
                >
                  <div>
                    <p className="font-medium text-gray-800">{task.taskDetail}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Assigned to:{" "}
                      {task.assignedTo && (
                        <span
                          className={`bg-gradient-to-r ${getBadgeColor(
                            task.assignedTo._id
                          )} text-white font-semibold px-3 py-1 rounded-full text-xs shadow-sm`}
                        >
                          {task.assignedTo.userName}
                        </span>
                      )}
                      {task.status === "completed" && (
                        <span className="ml-2 text-green-600 font-semibold">
                          ✅ Completed
                        </span>
                      )}
                      {task.status !== "completed" && (
                        <>
                          | Assigned Date:{" "}
                          <span className="text-gray-500">
                            {task.createdAt
                              ? new Date(task.createdAt).toLocaleDateString("en-GB")
                              : "-"}
                          </span>
                          {task.dueDate && (
                            <>
                              {" "}
                              | Due Date:{" "}
                              <span className="text-gray-500">
                                {new Date(task.dueDate).toLocaleDateString("en-GB")}
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-5">
                    {user.role === "employee" && task.status !== "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsDone(task._id)}
                      >
                        Mark as Done
                      </Button>
                    )}
                    <button
                      className="cursor-pointer"
                      onClick={() => startEditing(task)}
                    >
                      <Edit2 className="text-blue-500 w-4 h-4" />
                    </button>
                    <button
                      className="cursor-pointer"
                      onClick={() => setDeleteTaskId(task._id)}
                    >
                      <Trash2 className="text-red-500 w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Task Modal */}
      <Dialog open={taskModalOpen} onOpenChange={() => setTaskModalOpen(false)}>
  <DialogContent className="sm:max-w-lg rounded-2xl p-6">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold">
        {editTaskId ? "Edit Task" : "Add Task"}
      </DialogTitle>
      <DialogDescription className="text-gray-500">
        Fill in task details, assign an employee, and set a due date.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-5 mt-4">

      {/* Task Description */}
      <div>
        <textarea
          placeholder="Task details..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 focus:bg-white transition focus:ring-2 focus:ring-gray-300 resize-none min-h-[100px]"
        />
      </div>

      {/* Employee Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div
          className="w-full border border-gray-300 bg-gray-50 rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className="text-gray-800">
            {assignedUser
              ? employees.find((e) => e._id === assignedUser)?.userName
              : "-- Select Employee --"}
          </span>

          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {dropdownOpen && (
          <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-2 max-h-60 overflow-y-auto z-30 animate-in fade-in slide-in-from-top-2">
            {/* Search */}
            <div className="px-3 py-2">
              <Input
                placeholder="Search employee..."
                value={employeeSearchQuery}
                onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                className="w-full text-sm"
                autoFocus
              />
            </div>

            {/* List */}
            {filteredEmployees.map((emp) => (
              <div
                key={emp._id}
                className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => {
                  setAssignedUser(emp._id);
                  setDropdownOpen(false);
                  setEmployeeSearchQuery("");
                }}
              >
                <User className="w-4 h-4 text-gray-600" />
                <span className="capitalize text-gray-800">{emp.userName}</span>
              </div>
            ))}

            {filteredEmployees.length === 0 && (
              <div className="px-4 py-3 text-gray-500 text-sm">No employees found</div>
            )}
          </div>
        )}
      </div>

      {/* Due Date Picker */}
      <div className="relative">
        <div
          className="w-full border border-gray-300 bg-gray-50 rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
          onClick={() => inputRef.current?.showPicker()}
        >
          <span className={dueDate ? "text-gray-900" : "text-gray-400"}>
            {dueDate
              ? new Date(dueDate).toLocaleDateString("en-GB")
              : "Select Due Date"}
          </span>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>

        <input
          type="date"
          ref={inputRef}
          value={dueDate || ""}
          onChange={(e) => setDueDate(e.target.value)}
          className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none"
        />
      </div>
    </div>

    {/* Footer Buttons */}
    <DialogFooter className="flex justify-end gap-3 mt-6">
      <Button
        variant="outline"
        className="cursor-pointer rounded-lg"
        onClick={() => setTaskModalOpen(false)}
      >
        Cancel
      </Button>
      <Button
        className="cursor-pointer rounded-lg bg-black text-white hover:bg-gray-900"
        onClick={handleAddOrEditTask}
      >
        {editTaskId ? "Update Task" : "Add Task"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setDeleteTaskId(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 text-white cursor-pointer"
              onClick={handleDeleteTask}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
