"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(/[._-]/)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full ${
        isLoginPage
          ? "bg-transparent border-0"
          : "border-b bg-white dark:bg-slate-950 dark:border-slate-800"
      }`}
    >
      <div className={`h-16 px-4 flex items-center ${isLoginPage ? "justify-start" : "justify-between"}`}>
        {/* Left: Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-slate-600" />
          ) : (
            <Sun className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {!isLoginPage && (
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="TownSync Logo"
              width={40}
              height={40}
              className="rounded-full w-10 h-10"
            />
            <div className="w-10 h-10 rounded-full bg-slate-700 dark:bg-slate-600 flex items-center justify-center text-white font-semibold text-sm">
              {user ? getInitials(user.email) : "SU"}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
