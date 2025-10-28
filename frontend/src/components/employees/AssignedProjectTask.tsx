// "use client";

// import { Button } from "@/components/ui/button";
// import { Calendar } from "lucide-react";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import axios from "axios";
// import { notifyError, notifySuccess } from "@/lib/toast";

// interface AssignedTask {
//   _id: string;
//   taskDetail: string;
//   createdAt?: string;
//   dueDate?: string;
//   status?: "pending" | "completed";
// }

// interface Props {
//   projectName: string;
//   tasks: AssignedTask[];
//   onBack: () => void;
// }

// export default function AssignedProjectTasks({ projectName, tasks, onBack }: Props) {
//   const API_BASE = "http://localhost:8080/api/taskDetail";

//   const formatDate = (date?: string) =>
//     date
//       ? new Date(date).toLocaleDateString("en-IN", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//         })
//       : "-";

//   const handleMarkDone = async (taskId: string) => {
//     try {
//       await axios.put(`${API_BASE}/${taskId}/mark-done`);
//       notifySuccess("Task marked as completed!");
//       window.location.reload(); // simple refresh to update list
//     } catch (err: any) {
//       console.error(err);
//       notifyError(err.response?.data?.message || "Failed to update task status");
//     }
//   };

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-xl font-bold text-gray-900">
//           {projectName} - Task Details
//         </h2>
//         <Button onClick={onBack} className="bg-gray-200 text-black hover:bg-gray-300">
//           ← Back
//         </Button>
//       </div>

//       <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
//         <Table className="min-w-full border-collapse">
//           <TableHeader>
//             <TableRow className="bg-gray-100 border-b">
//               <TableHead>Task Detail</TableHead>
//               <TableHead>Assigned Date</TableHead>
//               <TableHead>Due Date</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Action</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {tasks.length > 0 ? (
//               tasks.map((task) => (
//                 <TableRow key={task._id} className="bg-white hover:bg-gray-50">
//                   <TableCell>{task.taskDetail}</TableCell>
//                   <TableCell>
//                     <Calendar className="w-4 h-4 inline mr-1 text-gray-500" />
//                     {formatDate(task.createdAt)}
//                   </TableCell>
//                   <TableCell>
//                     <Calendar className="w-4 h-4 inline mr-1 text-gray-500" />
//                     {formatDate(task.dueDate)}
//                   </TableCell>
//                   <TableCell>
//                     {task.status === "completed" ? (
//                       <span className="text-green-600 font-semibold">Completed</span>
//                     ) : (
//                       <span className="text-yellow-600 font-semibold">Pending</span>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {task.status !== "completed" && (
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleMarkDone(task._id)}
//                       >
//                         Mark as Done
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={5} className="text-center text-gray-500 py-4">
//                   No tasks found for this project.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }
