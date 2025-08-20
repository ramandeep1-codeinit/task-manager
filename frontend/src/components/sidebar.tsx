"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu, Home, FolderKanban, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {

    const { user , logout } = useAuth(); // Assuming you have a useAuth hook to get user info
  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home ,roles: [1, 2]},  
    //{ name: "Projects", href: "/projects", icon: FolderKanban ,roles: [1] },
    //{ name: "Users", href: "/users", icon: User ,roles: [2]},
    //{ name: "Settings", href: "/settings", icon: Settings ,roles: [1, 2] },
  ];

   // Filter based on logged-in user's role
  const allowedItems = menuItems.filter((item :any) => item.roles.includes(user?.role));


  return (
    <div className="flex">
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="m-2">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <nav className="flex flex-col gap-2 p-4">
              {allowedItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
            {/* User Profile - Mobile */}
            <div className="border-t p-4 flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">john@example.com</p>
              </div>
              <Button variant="ghost" size="icon">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-background">
        <div className="flex h-16 items-center justify-center border-b">
          <h1 className="text-lg font-bold">MyApp</h1>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {allowedItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Profile - Desktop */}
        <div className="border-t p-4 flex items-center justify-between gap-2">
          {/* Left side */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar>
              <AvatarImage src="/avatar.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">
                {user?.role == "1" ? "Manager" : "Employee"}
              </p>
            </div>
          </div>

          {/* Right side - logout button */}
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

      </aside>
    </div>
  );
}
