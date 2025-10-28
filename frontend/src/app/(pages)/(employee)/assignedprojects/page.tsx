"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Funnel, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { notifyError } from "@/lib/toast";

interface AssignedTask {
  _id: string;
  taskDetail: string;
  project: { _id: string; projectName: string };
  createdAt?: string;
  dueDate?: string;
  status?: "pending" | "completed";
}

type FilterType = "all" | "today" | "week" | "month" | "year";

const filterOptions: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

export default function AssignedProjects() {
  const { user } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const debounceRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


  // ✅ Fetch assigned tasks
  const fetchAssignedTasks = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await axios.get<{ tasks: AssignedTask[] }>(`${API_BASE_URL}/taskDetail/assigned/${user.id}`);
      const sorted = (res.data?.tasks ?? []).sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
      setTasks(sorted);
    } catch (err) {
      console.error(err);
      notifyError("Failed to fetch assigned tasks");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAssignedTasks();
  }, [fetchAssignedTasks]);

  // ✅ Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // ✅ Close dropdown when clicked outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowFilterOptions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ✅ Filter by date
  const isDateInRange = useCallback(
    (dateStr?: string) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const now = new Date();

      switch (filter) {
        case "today":
          return date.toDateString() === now.toDateString();
        case "week": {
          const start = new Date(now);
          start.setDate(now.getDate() - now.getDay());
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return date >= start && date <= end;
        }
        case "month":
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        case "year":
          return date.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    },
    [filter]
  );

  // ✅ Group tasks by project
  const tasksByProject = useMemo(() => {
    return tasks.reduce((acc: Record<string, AssignedTask[]>, task) => {
      const name = task.project.projectName || "Unknown Project";
      if (!acc[name]) acc[name] = [];
      acc[name].push(task);
      return acc;
    }, {});
  }, [tasks]);

  // ✅ Filter + search
  const filteredProjects = useMemo(() => {
    const q = debouncedQuery;
    return Object.keys(tasksByProject).filter((name) => {
      const projectTasks = tasksByProject[name];
      const hasMatchingTask = projectTasks.some(
        (t) =>
          (filter === "all" || isDateInRange(t.createdAt)) &&
          (t.taskDetail.toLowerCase().includes(q) || name.toLowerCase().includes(q))
      );
      return hasMatchingTask;
    });
  }, [tasksByProject, debouncedQuery, filter, isDateInRange]);

  if (loading) (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-700 text-lg font-semibold">
          Loading...
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-lg p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold text-gray-900">My Assigned Projects</h2>

        <div className="flex items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-64 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />

          {/* Filter dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              className="p-2 bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-2"
              onClick={() => setShowFilterOptions((prev) => !prev)}
            >
              <Funnel className="w-4 h-4" />
              <span className="capitalize">{filter}</span>
            </Button>

            {showFilterOptions && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md z-50">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFilter(opt.value);
                      setShowFilterOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-100 ${
                      filter === opt.value
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "text-gray-700"
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

      {/* Project List */}
      <div className="space-y-4">
        {filteredProjects.length ? (
          filteredProjects.map((name) => {
            const count = tasksByProject[name].length;
            const projectId = tasksByProject[name][0].project._id;
            return (
              <div
                key={projectId}
                className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md cursor-pointer transition flex items-center gap-2"
                onClick={() =>{
                  router.push(`/assignedprojects/${projectId}`)
                }}
              >
                <span className="font-semibold text-gray-900">{name}</span>
                <span className="text-gray-500 text-sm">({count} tasks)</span>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center py-6">No projects / tasks found.</p>
        )}
      </div>
    </div>
  );
}
