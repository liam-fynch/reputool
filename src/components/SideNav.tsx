"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className={`h-screen border-r border-gray-200 bg-white transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-64"
    }`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && <h1 className="text-xl text-[#333333]">Menu</h1>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transform transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      </div>
      <nav className="p-4 space-y-2">
        <Link
          href="/target-urls"
          className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
            isActive("/target-urls")
              ? "text-[#2FBAA9] bg-[#E5F7F5]"
              : "text-[#666666] hover:bg-gray-50"
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {!isCollapsed && <span>Target URLs</span>}
        </Link>
        <Link
          href="/profile"
          className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
            isActive("/profile")
              ? "text-[#2FBAA9] bg-[#E5F7F5]"
              : "text-[#666666] hover:bg-gray-50"
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {!isCollapsed && <span>Profile</span>}
        </Link>
        <Link
          href="/admin"
          className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
            isActive("/admin")
              ? "text-[#2FBAA9] bg-[#E5F7F5]"
              : "text-[#666666] hover:bg-gray-50"
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
          {!isCollapsed && <span>Admin</span>}
        </Link>
      </nav>
    </div>
  );
} 