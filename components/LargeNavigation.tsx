"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface LargeNavigationProps {
  icon: LucideIcon;
  label: string;
  goTo: string;
  color?: string;
}

export default function LargeNavigation({
  icon: Icon,
  label,
  goTo,
  color = "#2563eb",
}: LargeNavigationProps) {
  return (
    <Link
      href={goTo}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 group min-w-[140px]"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={28} style={{ color }} />
      </div>
      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 text-center">
        {label}
      </span>
    </Link>
  );
}
