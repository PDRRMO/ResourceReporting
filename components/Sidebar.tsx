// components/Sidebar.tsx
"use client";

import React from "react";
import { Filter, Menu, X } from "lucide-react";
import { RESOURCE_CONFIG } from "@/lib/constants";
import { ResourceType, ResourceCounts } from "@/types";

interface SidebarProps {
  filters: ResourceType[];
  toggleFilter: (type: ResourceType) => void;
  counts: ResourceCounts;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeZones?: number;
}

export default function Sidebar({
  filters,
  toggleFilter,
  counts,
  isOpen,
  setIsOpen,
  activeZones = 6,
}: SidebarProps) {
  // Calculate total assets
  const totalAssets = Object.values(counts).reduce((a, b) => a + b, 0);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute left-4 top-4 z-50 bg-white p-3 rounded-xl shadow-lg hover:bg-slate-50 transition-all text-slate-700"
      >
        <Menu size={24} />
      </button>
    );
  }

  return (
    <div className="absolute left-4 top-4 bottom-4 w-80 bg-white/95 backdrop-blur-sm z-50 rounded-2xl shadow-2xl flex flex-col border border-slate-200 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-xl text-slate-800">Iloilo DRRM</h1>
          <p className="text-xs text-slate-500 font-medium">Resource Command Center</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
        >
          <X size={20} />
        </button>
      </div>

      {/* Stats */}
      <div className="p-5 grid grid-cols-2 gap-3 bg-slate-50/50">
        <div className="bg-blue-600 rounded-xl p-3 text-white shadow-blue-200 shadow-lg">
          <p className="text-xs opacity-80 uppercase font-bold">Total Assets</p>
          <p className="text-2xl font-black">{totalAssets}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <p className="text-xs text-slate-400 uppercase font-bold">Active Zones</p>
          <p className="text-2xl font-black text-slate-700">{activeZones}</p>
        </div>
      </div>

      {/* Resource Filters */}
      <div className="flex-1 overflow-y-auto p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter size={12} /> Resource Layers
        </h3>
        <div className="space-y-3">
          {(Object.keys(RESOURCE_CONFIG) as ResourceType[]).map((type) => {
            const config = RESOURCE_CONFIG[type];
            const Icon = config.icon;
            const isActive = filters.includes(type);
            const count = counts[type] || 0;

            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? "bg-white border-slate-300 shadow-md translate-x-1"
                    : "bg-slate-50 border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isActive ? "text-white" : "text-slate-400 bg-slate-200"
                    }`}
                    style={{ backgroundColor: isActive ? config.color : undefined }}
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isActive ? "text-slate-700" : "text-slate-500"
                    }`}
                  >
                    {config.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400">PDRRMO Iloilo System v2.0</p>
      </div>
    </div>
  );
}
