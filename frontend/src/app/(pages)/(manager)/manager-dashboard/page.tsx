"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notifyError } from "@/lib/toast";
import {
  CheckCircle,
  Clock,
  Funnel,
  Hourglass,
  ListTodo,
  Loader2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTask } from "@/context/TaskContext"; 

// Debounce hook
function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Check if a task date is within the selected filter
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
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    case "year":
      return date.getFullYear() === now.getFullYear();
    case "all":
    default:
      return true;
  }
}

export default function ManagerDashboard() {
  const { tasks, loading, error, getTasks } = useTask();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<
    "today" | "week" | "month" | "year" | "all"
  >("today");
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const debouncedTerm = useDebounce(searchTerm, 300);
  const router = useRouter();

  // Fetch all tasks from Taskcontext
  useEffect(() => {
    getTasks("manager");
  }, [getTasks]);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilterOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Group tasks by employee
  const tasksByEmployee = useMemo(() => {
    return tasks.reduce((acc: Record<string, any[]>, task) => {
      if (!acc[task.userName]) acc[task.userName] = [];
      acc[task.userName].push(task);
      return acc;
    }, {});
  }, [tasks]);

  // Filter employees based on search and date filter
  const filteredEmployees = useMemo(() => {
    return Object.keys(tasksByEmployee).filter((employee) => {
      const empTasks = tasksByEmployee[employee];
      const term = debouncedTerm.toLowerCase();
      const matchesEmployee = employee.toLowerCase().includes(term);
      const matchesTaskOrProject = empTasks.some(
        (t) =>
          t.taskDetail.toLowerCase().includes(term) ||
          t.project.toLowerCase().includes(term)
      );
      const hasTasksInFilter = empTasks.some(
        (t) => t.createdAt && isDateInRange(t.createdAt, filter)
      );

      return (
        (matchesEmployee || matchesTaskOrProject) &&
        (filter === "all" || hasTasksInFilter)
      );
    });
  }, [tasksByEmployee, debouncedTerm, filter]);

  const todayDate = new Date().toDateString();

  const sortedEmployees = useMemo(() => {
    return filteredEmployees.sort((a, b) => {
      const latestA = [...tasksByEmployee[a]].sort(
        (t1, t2) =>
          new Date(t2.createdAt || 0).getTime() -
          new Date(t1.createdAt || 0).getTime()
      )[0];
      const latestB = [...tasksByEmployee[b]].sort(
        (t1, t2) =>
          new Date(t2.createdAt || 0).getTime() -
          new Date(t1.createdAt || 0).getTime()
      )[0];

      const isTodayA =
        latestA &&
        new Date(latestA.createdAt || "").toDateString() === todayDate
          ? 1
          : 0;
      const isTodayB =
        latestB &&
        new Date(latestB.createdAt || "").toDateString() === todayDate
          ? 1
          : 0;

      if (isTodayA !== isTodayB) return isTodayB - isTodayA;

      return (
        new Date(latestB?.createdAt || 0).getTime() -
        new Date(latestA?.createdAt || 0).getTime()
      );
    });
  }, [filteredEmployees, tasksByEmployee]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-gray-700 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );

  if (error)
    return <div className="p-6 text-center text-red-500">{error}</div>;

  // Task summary
  let completedCount = 0;
  let inProgressCount = 0;
  let pendingCount = 0;

  const userSet = new Set<string>();

  for (const task of tasks) {
    const status = task.status?.toLowerCase();
    if (status === "completed") completedCount++;
    if (status === "in-progress") inProgressCount++;
    if (status === "pending") pendingCount++;
    if (task.userId) userSet.add(task.userId);
  }

  const totalTasks = tasks.length;
  const teamMembers = userSet.size;

  const statusColors: Record<string, string> = {
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    "In Progress": "bg-blue-100 text-blue-700",
  };

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Today", value: "today" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
    { label: "Year", value: "year" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <CardTitle className="text-xl font-bold">
            Employee Tasks Overview
          </CardTitle>

          <div className="flex items-center gap-2 w-full max-w-md">
            <Input
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />

            <div className="relative" ref={filterRef}>
              <button
                className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center gap-1 cursor-pointer"
                onClick={() => setShowFilterOptions(!showFilterOptions)}
              >
                <Funnel className="w-4 h-4" />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {filter}
                </span>
              </button>

              {showFilterOptions && (
                <div className="absolute right-0 mt-2 w-36 bg-white border shadow-lg rounded-md z-50">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilter(opt.value as any);
                        setShowFilterOptions(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm rounded cursor-pointer ${
                        filter === opt.value
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

       {/* Summary Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-4 mx-6">

  {/* Total Tasks */}
  <div className="relative bg-white rounded-xl shadow p-4 border-t-4 border-gray-400">
    <div className="absolute top-3 right-3 bg-gray-100 p-2 rounded-full">
      <ListTodo className="h-5 w-5 text-gray-600" />
    </div>
    <h2 className="text-sm text-gray-500">Total Tasks</h2>
    <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
  </div>
  
  {/* Completed */}
  <div className="relative bg-white rounded-xl shadow p-4 border-t-4 border-green-500">
    <div className="absolute top-3 right-3 bg-green-100 p-2 rounded-full">
      <CheckCircle className="h-5 w-5 text-green-600" />
    </div>
    <h2 className="text-sm text-gray-500">Completed</h2>
    <p className="text-2xl font-bold text-green-600">{completedCount}</p>
  </div>

  {/* In Progress */}
  <div className="relative bg-white rounded-xl shadow p-4 border-t-4 border-orange-500">
    <div className="absolute top-3 right-3 bg-orange-100 p-2 rounded-full">
      <Clock className="h-5 w-5 text-orange-500" />
    </div>
    <h2 className="text-sm text-gray-500">In Progress</h2>
    <p className="text-2xl font-bold text-orange-600">{inProgressCount}</p>
  </div>

  {/* ✅ Pending (NEW) */}
  <div className="relative bg-white rounded-xl shadow p-4 border-t-4 border-yellow-500">
    <div className="absolute top-3 right-3 bg-yellow-100 p-2 rounded-full">
      <Hourglass className="h-5 w-5 text-yellow-600" />
    </div>
    <h2 className="text-sm font-medium text-gray-500">Pending</h2>
    <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
  </div>

  {/* Team Members */}
  <div className="relative bg-white rounded-xl shadow p-4 border-t-4 border-blue-500">
    <div className="absolute top-3 right-3 bg-blue-100 p-2 rounded-full">
      <Users className="h-5 w-5 text-blue-600" />
    </div>
    <h2 className="text-sm text-gray-500">Team Members</h2>
    <p className="text-2xl font-bold text-blue-600">{teamMembers}</p>
  </div>

</div>


        {/* Employee Task List */}
        <CardContent className="space-y-4">
          {sortedEmployees.length === 0 ? (
            <div className="text-center text-gray-500 py-6 text-sm">
              No employee and tasks
            </div>
          ) : (
            sortedEmployees.map((employee) => {
              const empTasks = tasksByEmployee[employee].filter(
                (t) => t.createdAt && isDateInRange(t.createdAt, filter)
              );
              if (empTasks.length === 0) return null;

              const todayTask =
                empTasks.find(
                  (t) =>
                    new Date(t.createdAt || "").toDateString() === todayDate
                ) ||
                [...empTasks].sort(
                  (a, b) =>
                    new Date(b.createdAt || 0).getTime() -
                    new Date(a.createdAt || 0).getTime()
                )[0];

              return (
                <div
                  key={employee}
                  className="border rounded-xl mb-4 shadow-sm hover:shadow-md bg-white"
                >
                  <button
                    onClick={() =>
                      router.push(
                        `/manager-dashboard/${tasksByEmployee[employee][0].userId}`
                      )
                    }
className="w-full px-4 py-3 text-left flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 cursor-pointer"                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 text-lg">
                        {employee}{" "}
                        <span className="text-gray-500 text-sm">
                          ({empTasks.length} tasks)
                        </span>
                      </span>

                      <span
                        className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                          new Date(todayTask.createdAt || "").toDateString() ===
                          todayDate
                            ? "bg-blue-100 text-blue-700"
                            : statusColors[todayTask.status] ||
                              "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {new Date(todayTask.createdAt || "").toDateString() ===
                        todayDate
                          ? "Today"
                          : todayTask.createdAt
                          ? formatDate(todayTask.createdAt)
                          : "N/A"}{" "}
                        - {todayTask.project} ({todayTask.status})
                      </span>
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}