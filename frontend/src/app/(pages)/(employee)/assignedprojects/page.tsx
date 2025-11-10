"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Funnel, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useTaskDetail } from "@/context/TaskDetailContext";

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

  const { tasks, loading, getAssignedTasks } = useTaskDetail();

  const [filter, setFilter] = useState<FilterType>("all");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const debounceRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Load assigned tasks
  useEffect(() => {
    if (user?.id) getAssignedTasks(user.id);
  }, [user?.id]);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowFilterOptions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Date filtering
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

  // group tasks by project._id
  const tasksByProject = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    tasks.forEach((task) => {
      if (!task.project) return;

      const projectId = task.project._id; //unique id
      if (!grouped[projectId]) grouped[projectId] = [];
      grouped[projectId].push(task);
    });

    return grouped;
  }, [tasks]);

  // filtered project list
  const filteredProjects = useMemo(() => {
    const q = debouncedQuery;

    const allProjects = Object.keys(tasksByProject).map((projectId) => {
      const projectTasks = tasksByProject[projectId];
      const project = projectTasks[0].project;

      return {
        id: projectId,
        name: project.projectName,
        tasks: projectTasks,
      };
    });

    return allProjects.filter(({ name, tasks }) =>
      tasks.some(
        (t) =>
          (filter === "all" || isDateInRange(t.createdAt)) &&
          (t.taskDetail.toLowerCase().includes(q) || name.toLowerCase().includes(q))
      )
    );
  }, [tasksByProject, debouncedQuery, filter, isDateInRange]);

  // Loading UI
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-gray-700 text-lg font-semibold">Loading...</p>
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

          {/* Filter Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              className="p-2 bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-2 cursor-pointer"
              onClick={() => setShowFilterOptions((prev) => !prev)}
            >
              <Funnel className="w-4 h-4" />
              <span className="capitalize">{filter}</span>
            </Button>

            {showFilterOptions && (
              <div className="absolute right-0 mt-2 w-36 bg-white border shadow-lg rounded-md z-50">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFilter(opt.value);
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
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {filteredProjects.length ? (
          filteredProjects.map(({ id, name, tasks }) => (
            <div
              key={id}
              className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md cursor-pointer transition flex items-center gap-2"
              onClick={() => router.push(`/assignedprojects/${id}`)}
            >
              <span className="font-semibold text-gray-900">{name}</span>
              <span className="text-gray-500 text-sm">({tasks.length} tasks)</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-6">No project and tasks assigned.</p>
        )}
      </div>
    </div>
  );
}
