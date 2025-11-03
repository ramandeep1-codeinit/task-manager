"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function ManagerSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Determine active section from current path
  const getSectionFromPath = (path: string | null) => {
    if (!path) return "manager-dashboard";
    if (path.includes("projects")) return "projects";
    if (path.includes("employeedetail")) return "employeedetail";
    if (path.includes("manager-dashboard")) return "manager-dashboard";
    return "manager-dashboard";
  };

  const [active, setActive] = useState<
    "manager-dashboard" | "projects" | "employeedetail"
  >(getSectionFromPath(pathname));

  // Map section to route
  const sectionToRoute = (
    section: "manager-dashboard" | "projects" | "employeedetail"
  ) => {
    switch (section) {
      case "manager-dashboard":
        return "/manager-dashboard";
      case "projects":
        return "/projects";
      case "employeedetail":
        return "/employeedetail";
      default:
        return "/manager-dashboard";
    }
  };

  // Handle sidebar clicks
  const handleClick = (
    section: "manager-dashboard" | "projects" | "employeedetail"
  ) => {
    setActive(section);
    localStorage.setItem("managerActiveSection", section);
    router.push(sectionToRoute(section));
  };

  // Logout
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  //Avtar
  const avatarText = useMemo(() => {
    if (!user?.name && !user?.email) return "NA";

    const name = user.name || user.email;

    const words = name.split(" ").filter(Boolean);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return words[0][0].toUpperCase() + words[1][0].toUpperCase();
  }, [user?.name, user?.email]);

  const sections = useMemo(
    () => [
      { key: "manager-dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "projects", label: "Projects", icon: FolderKanban },
      { key: "employeedetail", label: "Employees", icon: Users },
    ],
    []
  );

  return (
    <aside className="w-64 h-screen bg-gray-50 flex flex-col justify-between border-r border-gray-200 shadow-sm">
      <div className="p-4">
        {/* User info */}
        {user && (
          <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200 text-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
              {avatarText}
            </div>
            <div className="flex flex-col">
              <p className="font-semibold">{user.name || user.email}</p>
              <p className="text-xs text-gray-600">{user.role}</p>
            </div>
          </div>
        )}

        {/* Sidebar navigation */}
        <nav className="mt-4 flex flex-col gap-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = active === section.key;
            return (
              <button
                key={section.key}
                onClick={() => handleClick(section.key as any)}
                className={`flex items-center w-full px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg cursor-pointer ${
                  isActive
                    ? "bg-indigo-100 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="mt-auto p-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 px-2 py-1 text-sm h-8 hover:bg-gray-100 hover:text-accent-foreground cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
