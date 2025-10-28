// "use client";

// import { useAuth } from "@/context/AuthContext";
// import EmployeeDashboard from "@/app/(pages)/(employee)/emp-dashboard/page";
// import ManagerDashboard from "@/app/(pages)/(manager)/man-dashboard/page";

// export default function DashboardPage() {
//   const { user } = useAuth();

//   if (!user) {
//     return <p className="text-center mt-10">Loading...</p>;
//   }

//   const role = user.role?.toLowerCase();

//   if (role === "employee") {
//     return <EmployeeDashboard />;
//   }

//   if (role === "manager") {
//     return <ManagerDashboard />;
//   }

//     return (
//     <div className="flex items-center justify-center h-screen bg-gray-50">
//       <p className="text-red-600 text-3xl font-semibold">
//         Access Denied!!
//       </p>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If user info not loaded yet, wait
    if (user === undefined) return;

    // 🚀 If not logged in → go to login
    if (!user) {
      router.replace("/login");
      return;
    }

    const role = user.role?.toLowerCase();

    // ✅ Redirect based on role
    if (role === "employee") {
      router.replace("/employee-dashboard");
    } else if (role === "manager") {
      router.replace("/manager-dashboard");
    } else {
      // Unknown role
      setLoading(false);
    }
  }, [user, router]);

  if (loading) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Lucide Icon */}
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />

        {/* Loading text */}
        <p className="text-gray-700 text-lg font-semibold">
          Loading your dashboard...
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <p className="text-red-600 text-3xl font-semibold">Access Denied!!</p>
    </div>
  );
}
