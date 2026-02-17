"use client";

import React, { useState, useEffect, useMemo } from "react";
import ResourceMap from "@/components/ResourceMap";
import { MarkerData } from "@/types";
import { 
  Search, 
  User, 
  Filter, 
  Target, 
  PlusCircle, 
  X,
  Info
} from "lucide-react";

export default function HomePage() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedResource, setSelectedResource] = useState<MarkerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadResources = () => {
      try {
        const savedData = localStorage.getItem("map-resources");
        const parsedData = savedData ? JSON.parse(savedData) : [];
        setMarkers(parsedData);
      } catch (error) {
        console.error("Error loading resources:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadResources();
  }, []);

  // Filter markers based on search query for the map
  const filteredMarkers = useMemo(() => {
    return markers.filter(m => 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [markers, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased">
      {/* Header Overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-6">
        <div className="pointer-events-auto flex items-center gap-6">
          {/* Logo Section */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-xs font-bold text-white shadow-xl">
            LOGO
          </div>

          {/* Search Bar Container */}
          <div className="flex flex-col gap-1">
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-800 drop-shadow-sm">
              PDRRMO Resource Management
            </h1>
            <div className="relative flex w-96 items-center">
              <Search className="absolute left-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search resources, units, or locations..."
                className="w-full rounded-xl border border-slate-200 bg-white/90 py-3 pl-10 pr-4 shadow-lg backdrop-blur-md transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons (Right) */}
        <div className="pointer-events-auto flex flex-col gap-3">
          <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg transition-transform hover:scale-105 active:scale-95 text-slate-600">
            <User size={24} />
          </button>
          <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg transition-transform hover:scale-105 active:scale-95 text-slate-600">
            <Filter size={24} />
          </button>
        </div>
      </div>

      {/* Main Map Content */}
      <div className="absolute inset-0 z-0">
        <ResourceMap 
          markers={filteredMarkers} 
          activeZones={6}
          onMarkerClick={(marker) => setSelectedResource(marker)}
        />
      </div>

      {/* Sidebar - Conditional Rendering based on Selection */}
      <aside 
        className={`absolute left-0 top-0 z-30 h-full w-[400px] transform bg-white shadow-2xl transition-transform duration-500 ease-in-out ${
          selectedResource ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {selectedResource && (
          <div className="flex h-full flex-col p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Resource Details</h2>
              <button 
                onClick={() => setSelectedResource(null)}
                className="rounded-full p-2 hover:bg-slate-100 text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Resource Image Placeholder */}
            <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedResource.type}`} 
                className="absolute inset-0 h-full w-full object-cover opacity-20"
                alt="Resource"
              />
              <span className="relative font-medium uppercase tracking-widest">Resource Picture</span>
            </div>

            {/* Details Content */}
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-blue-600">Resource Name</label>
                <p className="text-lg font-semibold text-slate-800">{selectedResource.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <label className="block text-[10px] font-bold uppercase text-slate-500">Status</label>
                  <span className="text-sm font-medium text-green-600">● Active</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <label className="block text-[10px] font-bold uppercase text-slate-500">Quantity</label>
                  <span className="text-sm font-medium text-slate-800">{selectedResource.quantity} Units</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-blue-600">Description</label>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {selectedResource.description}
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100">
                <button className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98]">
                  Deploy Unit
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Bottom Right Controls */}
      <div className="absolute bottom-10 right-6 z-20 flex flex-col gap-3">
        <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-2xl transition-all hover:bg-blue-50 active:scale-90 border border-slate-100">
          <Target size={28} />
        </button>
      </div>
    </main>
  );
}