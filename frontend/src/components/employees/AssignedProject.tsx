// "use client";

// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Calendar, Funnel } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";
// import { notifyError, notifySuccess } from "@/lib/toast";

// /** Types */
// interface AssignedTask {
//   _id: string;
//   taskDetail: string;
//   project: { _id: string; projectName: string };
//   createdAt?: string;
//   dueDate?: string;
//   status?: "pending" | "completed";
// }

// type FilterType = "all" | "today" | "week" | "month" | "year";

// const filterOptions: { label: string; value: FilterType }[] = [
//   { label: "All", value: "all" },
//   { label: "Today", value: "today" },
//   { label: "Week", value: "week" },
//   { label: "Month", value: "month" },
//   { label: "Year", value: "year" },
// ];

// export default function AssignedProjects(){
//   const { user } = useAuth();
//   const API_BASE = "http://localhost:8080/api/taskDetail";

//   const [tasks, setTasks] = useState<AssignedTask[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [filter, setFilter] = useState<FilterType>("all");
//   const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);
//   const [selectedProject, setSelectedProject] = useState<string | null>(null);

//   // Search input (debounced)
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [debouncedQuery, setDebouncedQuery] = useState<string>("");
//   const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const dropdownRef = useRef<HTMLDivElement | null>(null);

//   /** Fetch assigned tasks */
//   const fetchAssignedTasks = useCallback(async () => {
//     if (!user?.id) return;
//     setLoading(true);
//     try {
//       const res = await axios.get<{ tasks: AssignedTask[] }>(`${API_BASE}/assigned/${user.id}`);
//       const received = res.data?.tasks ?? [];

//       const sorted = received.slice().sort((a, b) => {
//         const ta = new Date(a.createdAt ?? 0).getTime();
//         const tb = new Date(b.createdAt ?? 0).getTime();
//         return tb - ta;
//       });

//       setTasks(sorted);
//     } catch (err) {
//       console.error(err);
//       notifyError("Failed to fetch assigned tasks");
//     } finally {
//       setLoading(false);
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     fetchAssignedTasks();
//   }, [fetchAssignedTasks]);

//   /** Debounce search input */
//   useEffect(() => {
//     if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

//     debounceTimerRef.current = setTimeout(() => {
//       setDebouncedQuery(searchQuery.trim().toLowerCase());
//     }, 300);

//     return () => {
//       if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
//     };
//   }, [searchQuery]);

//   /** Close dropdown on outside click */
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
//         setShowFilterOptions(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   /** Date filtering logic */
//   const isDateInRange = useCallback(
//     (dateStr?: string): boolean => {
//       if (!dateStr) return false;
//       const date = new Date(dateStr);
//       const now = new Date();

//       switch (filter) {
//         case "today":
//           return date.toDateString() === now.toDateString();
//         case "week": {
//           const start = new Date(now);
//           start.setHours(0, 0, 0, 0);
//           start.setDate(now.getDate() - now.getDay());
//           const end = new Date(start);
//           end.setDate(start.getDate() + 6);
//           end.setHours(23, 59, 59, 999);
//           return date >= start && date <= end;
//         }
//         case "month":
//           return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
//         case "year":
//           return date.getFullYear() === now.getFullYear();
//         default:
//           return true;
//       }
//     },
//     [filter]
//   );

//   const formatDate = (date?: string): string =>
//     date
//       ? new Date(date).toLocaleDateString("en-IN", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//         })
//       : "-";

//   /** Group tasks by project name */
//   const tasksByProject = useMemo(() => {
//     return tasks.reduce((acc: Record<string, AssignedTask[]>, task) => {
//       const name = task.project.projectName || "Unknown Project";
//       if (!acc[name]) acc[name] = [];
//       acc[name].push(task);
//       return acc;
//     }, {});
//   }, [tasks]);

//   /** Filter + search combined logic */
//   const filteredTasksByProject = useMemo(() => {
//     const out: Record<string, AssignedTask[]> = {};
//     const q = debouncedQuery;

//     for (const [projectName, list] of Object.entries(tasksByProject)) {
//       const byDate = filter === "all" ? list.slice() : list.filter((t) => isDateInRange(t.createdAt));
//       const bySearch = q
//         ? byDate.filter((t) => {
//             const taskText = t.taskDetail.toLowerCase();
//             const projText = t.project.projectName.toLowerCase();
//             return taskText.includes(q) || projText.includes(q);
//           })
//         : byDate;

//       if (bySearch.length > 0) {
//         out[projectName] = bySearch;
//       } else if (q && projectName.toLowerCase().includes(q) && list.length > 0) {
//         out[projectName] = list;
//       }
//     }

//     return out;
//   }, [tasksByProject, debouncedQuery, filter, isDateInRange]);

//   const handleSelectFilter = (value: FilterType) => {
//     setFilter(value);
//     setShowFilterOptions(false);
//   };

//   const handleSelectProject = (name: string) => setSelectedProject(name);

//   const handleMarkDone = async (taskId: string) => {
//     try {
//       await axios.put(`${API_BASE}/${taskId}/mark-done`);
//       notifySuccess("Task marked as completed!");
//       setTasks((prev) =>
//         prev.map((t) => (t._id === taskId ? { ...t, status: "completed" } : t))
//       );
//     } catch (err: any) {
//       console.error(err);
//       notifyError(err.response?.data?.message || "Failed to update task status");
//     }
//   };

//   /** Render */
//   return (
//     <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-lg p-4">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
//         <h2 className="text-xl font-bold text-gray-900">
//           {selectedProject ? `${selectedProject} - Task Details` : "My Assigned Projects"}
//         </h2>

//         <div className="flex items-center gap-2">
//           {selectedProject && (
//             <Button
//               onClick={() => setSelectedProject(null)}
//               className="bg-gray-200 text-black hover:bg-gray-300"
//             >
//               ← Back
//             </Button>
//           )}

//           <div className="flex items-center gap-2">
//             {/* Search Bar */}
//             <input
//               type="text"
//               placeholder="Search project or task..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="h-9 w-64 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
//             />

//             {/* Filter Dropdown */}
//             <div className="relative" ref={dropdownRef}>
//               <Button
//                 className="p-2 bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-2"
//                 onClick={() => setShowFilterOptions((prev) => !prev)}
//               >
//                 <Funnel className="w-4 h-4" />
//                 <span className="capitalize">{filter}</span>
//               </Button>

//               {showFilterOptions && (
//                 <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md z-50">
//                   {filterOptions.map((opt) => (
//                     <button
//                       key={opt.value}
//                       onClick={() => handleSelectFilter(opt.value)}
//                       className={`w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-100 ${
//                         filter === opt.value
//                           ? "bg-blue-100 text-blue-700 font-semibold"
//                           : "text-gray-700"
//                       }`}
//                     >
//                       {opt.label}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Project list or Task table */}
//       {!selectedProject ? (
//         <div className="space-y-4">
//           {Object.keys(filteredTasksByProject).length > 0 ? (
//             Object.keys(filteredTasksByProject).map((projectName) => {
//               const projectTasks = filteredTasksByProject[projectName];
//               return (
//                 <div
//                   key={projectName}
//                   className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md cursor-pointer transition flex items-center gap-2"
//                   onClick={() => handleSelectProject(projectName)}
//                 >
//                   <span className="font-semibold text-gray-900">{projectName}</span>
//                   <span className="text-gray-500 text-sm">({projectTasks.length} tasks)</span>
//                 </div>
//               );
//             })
//           ) : (
//             <p className="text-gray-500 text-center py-6">No projects / tasks found.</p>
//           )}
//         </div>
//       ) : (
//         <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
//           <Table className="min-w-full border-collapse">
//             <TableHeader>
//               <TableRow className="bg-gray-100 border-b">
//                 <TableHead>Task Detail</TableHead>
//                 <TableHead>Assigned Date</TableHead>
//                 <TableHead>Due Date</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Action</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {filteredTasksByProject[selectedProject]?.length ? (
//                 filteredTasksByProject[selectedProject].map((task) => (
//                   <TableRow key={task._id} className="bg-white hover:bg-gray-50">
//                     <TableCell>{task.taskDetail}</TableCell>
//                     <TableCell>
//                       <Calendar className="w-4 h-4 inline mr-1 text-gray-500" />
//                       {formatDate(task.createdAt)}
//                     </TableCell>
//                     <TableCell>
//                       <Calendar className="w-4 h-4 inline mr-1 text-gray-500" />
//                       {formatDate(task.dueDate)}
//                     </TableCell>
//                     <TableCell>
//                       {task.status === "completed" ? (
//                         <span className="text-green-600 font-semibold">Completed</span>
//                       ) : (
//                         <span className="text-yellow-600 font-semibold">Pending</span>
//                       )}
//                     </TableCell>
//                     <TableCell>
//                       {task.status !== "completed" && (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleMarkDone(task._id)}
//                         >
//                           Mark as Done
//                         </Button>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={5} className="text-center text-gray-500 py-4">
//                     No tasks match the filter/search.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}
//     </div>
//   );
// }
