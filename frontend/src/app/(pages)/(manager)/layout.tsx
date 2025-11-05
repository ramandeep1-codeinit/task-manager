"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import ManagerSidebar from "@/components/manager/ManagerSidebar";
export default function ManagerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">    
      {/* Sidebar */}
      {user.role?.toLowerCase() === "manager" && (
        <aside className="w-64 border-r border-gray-200 hidden md:block sticky top-0 h-screen">
          <ManagerSidebar />
        </aside>
      )}
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
