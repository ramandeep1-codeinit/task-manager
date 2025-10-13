// "use client";

// import { useState, useEffect } from "react";
// import { useAuth } from "@/context/AuthContext";
// import axios from "axios";
// import { Button } from "@/components/ui/button";

// export default function EmployeeProfilePage() {
//   const { user, setUser } = useAuth(); // get current user
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     department: "",
    // profileImage: "",
//   });
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         name: user.name || "",
//         email: user.email || "",
//         phone: user.phone || "",
//         department: user.department || "",
//         profileImage: user.profileImage || "",
//       });
//       setLoading(false);
//     }
//   }, [user]);

//   const handleChange = (field: string, value: string) => {
//     setFormData({ ...formData, [field]: value });
//   };

//   const handleSave = async () => {
//     try {
//       setSaving(true);
//       const res = await axios.put(
//         `http://localhost:8080/api/employees/${user._id}`,
//         formData
//       );
//       setUser(res.data.updatedUser); // update context
//       alert("Profile updated successfully!");
//     } catch (err) {
//       console.error("Failed to update profile:", err);
//       alert("Failed to update profile.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-50 rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-6">My Profile</h1>

//       {/* Avatar */}
//       <div className="flex flex-col items-center gap-4 mb-6">
//         <img
//           src={formData.profileImage || "/default-avatar.png"}
//           alt="Profile"
//           className="w-32 h-32 rounded-full object-cover border border-gray-300"
//         />
//         <input
//           type="text"
//           placeholder="Profile Image URL"
//           value={formData.profileImage}
//           onChange={(e) => handleChange("profileImage", e.target.value)}
//           className="border rounded px-3 py-2 text-sm w-full"
//         />
//       </div>

//       {/* Editable form */}
//       <div className="flex flex-col gap-4 text-gray-700">
//         <div>
//           <label className="font-semibold block mb-1">Name</label>
//           <input
//             type="text"
//             value={formData.name}
//             onChange={(e) => handleChange("name", e.target.value)}
//             className="border rounded px-3 py-2 w-full"
//           />
//         </div>

//         <div>
//           <label className="font-semibold block mb-1">Email</label>
//           <input
//             type="email"
//             value={formData.email}
//             onChange={(e) => handleChange("email", e.target.value)}
//             className="border rounded px-3 py-2 w-full"
//           />
//         </div>

//         <div>
//           <label className="font-semibold block mb-1">Phone</label>
//           <input
//             type="text"
//             value={formData.phone}
//             onChange={(e) => handleChange("phone", e.target.value)}
//             className="border rounded px-3 py-2 w-full"
//           />
//         </div>

//         <div>
//           <label className="font-semibold block mb-1">Department</label>
//           <input
//             type="text"
//             value={formData.department}
//             onChange={(e) => handleChange("department", e.target.value)}
//             className="border rounded px-3 py-2 w-full"
//           />
//         </div>
//       </div>

//       {/* Save button */}
//       <div className="mt-6 flex justify-end">
//         <Button onClick={handleSave} disabled={saving}>
//           {saving ? "Saving..." : "Save Profile"}
//         </Button>
//       </div>
//     </div>
//   );
// }
