"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ManagerSidebar from "@/components/manager/ManagerSidebar";
import AddEmployeeSection from "@/components/manager/AddEmployeeSection";
import AddProjectSection from "@/components/manager/AddProjectSection";
import EmployeeTaskPage from "@/components/manager/TaskDetail";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notifyError } from "@/lib/toast";
import { Funnel } from "lucide-react";

interface Task {
  _id: string;
  userId: string;
  userName: string;
  project: string;
  taskDetail: string;
  status: string;
  createdAt?: string;
}

const statusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
};

// Debounce hook
function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Check if date matches filter
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

export default function ManagerDashboard() {
  const [section, setSection] = useState("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"today" | "week" | "month" | "year" | "all">("all");
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const debouncedTerm = useDebounce(searchTerm, 300);
  const filterRef = useRef<HTMLDivElement>(null);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/users/task/all"); // backend route
      setTasks(res.data.data || []);    //"http://localhost:8080/api/tasks/users/task/all"
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks");
      notifyError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (section === "tasks" || section === "employees") fetchTasks();
  }, [section]);

  // Close filter if click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Group tasks by employee
  const tasksByEmployee = tasks.reduce((acc: Record<string, Task[]>, task) => {
    if (!acc[task.userName]) acc[task.userName] = [];
    acc[task.userName].push(task);
    return acc;
  }, {});

  // Filter employees based on search and date filter
  const filteredEmployees = Object.keys(tasksByEmployee).filter((employee) => {
    const empTasks = tasksByEmployee[employee];
    const term = debouncedTerm.toLowerCase();

    const matchesEmployee = employee.toLowerCase().includes(term);
    const matchesTaskOrProject = empTasks.some(
      (t) =>
        t.taskDetail.toLowerCase().includes(term) ||
        t.project.toLowerCase().includes(term)
    );

    const hasTasksInFilter = empTasks.some((t) => (t.createdAt ? isDateInRange(t.createdAt, filter) : false));

    return (matchesEmployee || matchesTaskOrProject) && (filter === "all" || hasTasksInFilter);
  });

  const todayDate = new Date().toDateString();
  const sortedEmployees = filteredEmployees.sort((a, b) => {
    const latestA = tasksByEmployee[a].sort(
      (t1, t2) => new Date(t2.createdAt || "").getTime() - new Date(t1.createdAt || "").getTime()
    )[0];
    const latestB = tasksByEmployee[b].sort(
      (t1, t2) => new Date(t2.createdAt || "").getTime() - new Date(t1.createdAt || "").getTime()
    )[0];

    const isTodayA = new Date(latestA.createdAt || "").toDateString() === todayDate ? 1 : 0;
    const isTodayB = new Date(latestB.createdAt || "").toDateString() === todayDate ? 1 : 0;

    if (isTodayA !== isTodayB) return isTodayB - isTodayA;

    return (new Date(latestB.createdAt || "").getTime() || 0) - (new Date(latestA.createdAt || "").getTime() || 0);
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  const filterOptions: { label: string; value: typeof filter }[] = [
    { label: "All", value: "all" },
    { label: "Today", value: "today" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
    { label: "Year", value: "year" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 border-r border-gray-200 shadow-sm hidden md:block sticky top-0 h-screen">
        <ManagerSidebar onSectionChange={setSection} onEmployeeSelect={setSelectedEmployee} />
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {selectedEmployee ? (
          <EmployeeTaskPage
            employeeName={selectedEmployee}
            tasks={tasks.filter((t) => t.userName === selectedEmployee)}
            onBack={() => setSelectedEmployee(null)}
            formatDate={formatDate}
          />
        ) : section === "tasks" ? (
          <Card className="shadow-lg">
            <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <CardTitle className="text-xl font-bold">Employee Tasks Overview</CardTitle>

              <div className="flex items-center gap-2 w-full max-w-md">
                <Input
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />

                {/* Filter Icon */}
                <div className="relative" ref={filterRef}>
                  <button
                    className="p-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setShowFilterOptions(!showFilterOptions)}
                  >
                    <Funnel className="w-4 h-4" />
                  </button>

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
                            filter === opt.value ? "bg-blue-500 text-white" : "text-gray-700"
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

            <CardContent className="space-y-4">
              {sortedEmployees.map((employee) => {
                const empTasks = tasksByEmployee[employee].filter((t) =>
                  t.createdAt ? isDateInRange(t.createdAt, filter) : false
                );

                if (empTasks.length === 0) return null;

                const todayTask =
                  empTasks.find((t) => new Date(t.createdAt || "").toDateString() === todayDate) ||
                  empTasks.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())[0];

                return (
                  <div
                    key={employee}
                    className="border rounded-xl mb-4 overflow-hidden shadow-sm hover:shadow-md transition-all bg-white"
                  >
                    <button
                      onClick={() => setSelectedEmployee(employee)}
                      className="w-full text-left px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 transition"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-lg">
                          {employee}{" "}
                          <span className="text-gray-500 text-sm">({empTasks.length} tasks)</span>
                        </span>
                        <span
                          className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                            new Date(todayTask.createdAt || "").toDateString() === todayDate
                              ? "bg-blue-100 text-blue-700"
                              : statusColors[todayTask.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {new Date(todayTask.createdAt || "").toDateString() === todayDate
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
              })}
            </CardContent>
          </Card>
        ) : section === "projects" ? (
          <AddProjectSection />
        ) : (
          <AddEmployeeSection />
        )}
      </main>
    </div>
  );
}
