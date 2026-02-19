"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Map,
  Plus,
  Search,
  FileText,
  ChevronRight,
  X,
} from "lucide-react";

interface QuickActionItem {
  icon: React.ElementType;
  label: string;
  href: string;
  color: string;
}

const quickActions: QuickActionItem[] = [
  {
    icon: Map,
    label: "View Live Map",
    href: "/map",
    color: "#2563eb",
  },
  {
    icon: Plus,
    label: "Add New Resource",
    href: "/upload",
    color: "#22c55e",
  },
  {
    icon: Search,
    label: "Search Resources",
    href: "/map",
    color: "#8b5cf6",
  },
  {
    icon: FileText,
    label: "Generate Report",
    href: "#",
    color: "#f59e0b",
  },
];

export default function QuickActionsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="quick-actions-menu relative" ref={menuRef}>
      {/* Burger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
          isOpen
            ? "bg-blue-100 text-blue-600"
            : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
        }`}
        aria-label="Quick Actions Menu"
        title="Quick Actions"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">Quick Actions</h3>
          </div>
          <div className="p-2 space-y-1">
            {quickActions.map((action, index) => (
              <QuickActionLink
                key={action.label}
                {...action}
                onClick={() => setIsOpen(false)}
                delay={index * 50}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickActionLink({
  icon: Icon,
  label,
  href,
  color,
  onClick,
  delay = 0,
}: QuickActionItem & { onClick: () => void; delay?: number }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all duration-200 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <span className="font-medium text-slate-700 group-hover:text-slate-900 flex-1">
        {label}
      </span>
      <ChevronRight
        size={16}
        className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all"
      />
    </Link>
  );
}
