"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Funnel } from "lucide-react"; // Filter icon

interface Task {
  _id: string;
  project: string;
  taskDetail: string;
  status: string;
  createdAt?: string;
}

// Helper: check if date is in filter range
function isDateInRange(dateStr: string, filter: string) {
  const date = new Date(dateStr);
  const now = new Date();

  switch (filter) {
    case "today":
      return date.toDateString() === now.toDateString();
    case "week": {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return date >= startOfWeek && date <= endOfWeek;
    }
    case "month":
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    case "year":
      return date.getFullYear() === now.getFullYear();
    case "all":
    default:
      return true;
  }
}

export default function EmployeeTaskPage({
  employeeName,
  tasks,
  onBack,
  formatDate,
}: {
  employeeName: string;
  tasks: Task[];
  onBack: () => void;
  formatDate: (d?: string) => string;
}) {
  const [filter, setFilter] = useState<"today" | "week" | "month" | "year" | "all">("all");
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!tasks || tasks.length === 0)
    return (
      <div className="text-center mt-10">
        <p>No tasks found for {employeeName}.</p>
        <Button className="mt-4" onClick={onBack}>
          ← Back
        </Button>
      </div>
    );

  // Apply filter
  const filteredTasks = tasks.filter((t) =>
    t.createdAt ? isDateInRange(t.createdAt, filter) : false
  );

  // Sort tasks by createdAt descending
  const sortedTasks = [...filteredTasks].sort(
    (a, b) =>
      new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
  );

  const today = new Date().toDateString();

  const highlightTaskId =
    sortedTasks.find(
      (t) => new Date(t.createdAt || "").toDateString() === today
    )?._id || sortedTasks[0]?._id;

  const filterOptions: { label: string; value: typeof filter }[] = [
    { label: "All", value: "all" },
    { label: "Today", value: "today" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
    { label: "Year", value: "year" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {employeeName} - Task Details
        </h2>

        <div className="flex items-center gap-2">
          {/* Back Button */}
          <Button
            onClick={onBack}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            ← Back
          </Button>

          {/* Filter Icon */}
          <div className="relative" ref={dropdownRef}>
            <Button
              className="p-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={() => setShowFilterOptions(!showFilterOptions)}
            >
              <Funnel className="w-4 h-4" />
            </Button>

            {showFilterOptions && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 shadow-lg rounded-md z-50">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFilter(opt.value);
                      setShowFilterOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded text-sm hover:bg-gray-100 ${
                      filter === opt.value ? "bg-blue-500 text-gray-700" : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
        <Table className="min-w-full border-collapse">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b">
              <TableHead>Project</TableHead>
              <TableHead>Task Detail</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => (
              <TableRow
                key={task._id}
                className={`transition-all ${
                  task._id === highlightTaskId
                    ? "bg-blue-50 border-l-4 border-blue-500 font-semibold"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <TableCell className="font-medium">{task.project}</TableCell>
                <TableCell>{task.taskDetail}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      task.status.toLowerCase() === "completed"
                        ? "bg-green-100 text-green-700"
                        : task.status.toLowerCase() === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {task.status}
                  </span>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {formatDate(task.createdAt)}
                  {task._id === highlightTaskId && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Today
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
