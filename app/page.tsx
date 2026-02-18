// app/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import ResourceMap from "@/components/ResourceMap";
import { MarkerData, ResourceType, ResourceStatus } from "@/types";
import { RESOURCE_CONFIG } from "@/lib/constants";
import { 
  Search, 
  User, 
  SlidersHorizontal, 
  LocateFixed, 
  PlusCircle,
  X,
  Truck,
  MapPin,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  ToolCase
} from "lucide-react";
import Image from "next/image";

const RESOURCE_TYPES: ResourceType[] = [
  "ver", "comm", "tools", "trucks", "watercraft", 
  "fr", "har", "usar", "wasar", "ews", "ems", 
  "firetruck", "cssr", "ambulance"
];

const MUNICIPALITIES = [
  "Iloilo City", "Oton", "Pavia", "Leganes", 
  "Santa Barbara", "Dumangas"
];

const RESOURCE_NAMES: Record<ResourceType, string[]> = {
  ver: ["Vehicle Extrication Unit", "Crash Response Vehicle", "Auto Rescue Truck"],
  comm: ["Mobile Command Center", "Radio Communications Van", "Emergency Dispatch Unit"],
  tools: ["Equipment Transport", "Tool & Gear Vehicle", "Rescue Equipment Truck"],
  trucks: ["Utility Truck", "Transport Vehicle", "General Service Truck"],
  watercraft: ["Rescue Boat", "Marine Patrol Vessel", "Water Transport Unit"],
  fr: ["Fire Engine Alpha", "Fire Suppression Unit", "Emergency Fire Truck"],
  har: ["High Altitude Rescue Team", "Tower Rescue Unit", "Cliff Rescue Squad"],
  usar: ["Urban Search Team", "Disaster Response Unit", "Collapse Rescue Squad"],
  wasar: ["Water Rescue Team", "Marine Rescue Unit", "Coastal Response Team"],
  ews: ["Early Warning Vehicle", "Alert System Unit", "Monitoring Station"],
  ems: ["Emergency Medical Team", "Field Medics Unit", "Medical Response Squad"],
  firetruck: ["Fire Engine", "Fire Apparatus", "Firefighting Truck"],
  cssr: ["Structure Collapse Team", "Building Rescue Unit", "Rubble Rescue Squad"],
  ambulance: ["Ambulance Unit", "Medical Transport", "Emergency Medical Vehicle"],
};

const STATUS_CONFIG = {
  ready: { color: "#22c55e", bgColor: "bg-green-500", label: "Ready", icon: CheckCircle2 },
  deployed: { color: "#f97316", bgColor: "bg-orange-500", label: "Deployed", icon: Activity },
  maintenance: { color: "#eab308", bgColor: "bg-yellow-500", label: "Maintenance", icon: Clock },
};

const STATUSES: ResourceStatus[] = ["ready", "deployed", "maintenance"];

const generateRandomMockResource = (): Omit<MarkerData, "id" | "createdAt"> => {
  const type = RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)];
  const municipality = MUNICIPALITIES[Math.floor(Math.random() * MUNICIPALITIES.length)];
  const names = RESOURCE_NAMES[type];
  const title = names[Math.floor(Math.random() * names.length)] + " " + Math.floor(Math.random() * 100);
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  
  const baseLat = 10.720321;
  const baseLng = 122.562019;
  const latOffset = (Math.random() - 0.5) * 0.1;
  const lngOffset = (Math.random() - 0.5) * 0.1;
  
  return {
    title,
    description: `Emergency response unit for ${type} operations`,
    type,
    quantity: Math.floor(Math.random() * 10) + 1,
    latitude: baseLat + latOffset,
    longitude: baseLng + lngOffset,
    municipality,
    status,
  };
};

// Resource Detail Sidebar Component
const ResourceDetailSidebar = ({ 
  marker, 
  isOpen, 
  onClose 
}: { 
  marker: MarkerData | null; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  if (!isOpen || !marker) return null;

  const config = RESOURCE_CONFIG[marker.type];
  // Use marker's status or default to ready
  const status = marker.status || "ready";
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed left-0 top-0 h-full w-full md:w-[30vw] bg-white/95 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-r border-slate-200/50">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-[#1e293b] flex items-center gap-2"> <ToolCase size={28}/>Resource Details</h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-500" />
        </button>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-80px)]">
        {/* Image Placeholder */}
        <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300">
          <div className="text-center">
            <Truck size={48} className="text-slate-400 mx-auto mb-2" />
            <span className="text-sm text-slate-500">Equipment Photo</span>
          </div>
        </div>

        {/* Resource Name */}
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] leading-tight mb-2">
            {marker.title}
          </h1>
          <div className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: statusConfig.color, boxShadow: `0 0 8px ${statusConfig.color}` }}
            />
            <span className="text-sm font-medium text-slate-600 flex items-center gap-1">
              <StatusIcon size={14} className={status === 'ready' ? 'text-green-500' : status === 'deployed' ? 'text-orange-500' : 'text-yellow-500'} />
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Resource Type Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb]/10 rounded-xl">
          {config?.icon && <config.icon size={18} className="text-[#2563eb]" />}
          <span className="text-sm font-semibold text-[#2563eb]">{config?.label}</span>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity</span>
            </div>
            <span className="text-2xl font-black text-[#1e293b]">{marker.quantity}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Municipality</span>
            </div>
            <span className="text-lg font-bold text-[#1e293b]">{marker.municipality}</span>
          </div>
        </div>

        {/* Detailed Specifications */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-[#2563eb]" />
            Detailed Specifications
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Resource ID</span>
              <span className="text-sm font-mono font-medium text-slate-700">{marker.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Coordinates</span>
              <span className="text-sm font-mono text-slate-700">
                {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Last Updated</span>
              <span className="text-sm text-slate-700">
                {marker.createdAt ? new Date(marker.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="pt-2">
              <span className="text-sm text-slate-500 block mb-2">Description</span>
              <p className="text-sm text-slate-700 leading-relaxed">{marker.description}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full py-3 bg-[#2563eb] text-white rounded-xl font-semibold hover:bg-[#1d4ed8] transition-colors shadow-lg shadow-blue-500/25">
            Update Status
          </button>
          <button className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

// Filter Modal Component
const FilterModal = ({ 
  isOpen, 
  onClose, 
  activeFilters, 
  onFilterChange 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  activeFilters: ResourceType[];
  onFilterChange: (filters: ResourceType[]) => void;
}) => {
  if (!isOpen) return null;

  const toggleFilter = (type: ResourceType) => {
    if (activeFilters.includes(type)) {
      onFilterChange(activeFilters.filter(t => t !== type));
    } else {
      onFilterChange([...activeFilters, type]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex  items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden mx-2 md:w-[50vw]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-[#1e293b]">Filter Resources</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(RESOURCE_CONFIG) as ResourceType[]).map((type) => {
              const config = RESOURCE_CONFIG[type];
              const isActive = activeFilters.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    isActive 
                      ? "border-[#2563eb] bg-[#2563eb]/5" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {config?.icon && <config.icon size={20} className={isActive ? "text-[#2563eb]" : "text-slate-400"} />}
                  <span className={`text-sm font-medium ${isActive ? "text-[#2563eb]" : "text-slate-600"}`}>
                    {config?.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button 
            onClick={() => onFilterChange(RESOURCE_TYPES)}
            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
          >
            Select All
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-[#2563eb] text-white rounded-xl font-semibold hover:bg-[#1d4ed8] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ResourceType[]>(['ver']);

  useEffect(() => {
    const loadResources = () => {
      try {
        const savedData = localStorage.getItem("map-resources");
        const parsedData = savedData ? JSON.parse(savedData) : [];
        const validatedData = parsedData.map((item: MarkerData) => ({
          ...item,
          municipality: item.municipality || "Iloilo City",
          status: item.status || "ready",
        }));
        setMarkers(validatedData);
      } catch (error) {
        console.error("Error loading resources:", error);
        setMarkers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadResources();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "map-resources") {
        loadResources();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleMarkerSelect = useCallback((marker: MarkerData | null) => {
    setSelectedMarker(marker);
    setIsSidebarOpen(!!marker);
  }, []);

  const addMockData = () => {
    const existingData = JSON.parse(localStorage.getItem("map-resources") || "[]");
    const numResources = Math.floor(Math.random() * 5) + 3;
    
    const newMockData: MarkerData[] = Array.from({ length: numResources }, () => {
      const resource = generateRandomMockResource();
      return {
        ...resource,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
    });
    
    const updatedData = [...existingData, ...newMockData];
    localStorage.setItem("map-resources", JSON.stringify(updatedData));
    setMarkers(updatedData);
  };

  const centerToLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Dispatch event to center map on user's location
          window.dispatchEvent(new CustomEvent('center-map', { 
            detail: { latitude, longitude } 
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#2563eb] border-t-transparent mx-auto mb-6"></div>
          <p className="text-[#64748b] font-medium text-lg">Loading PDRRMO Resource Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-slate-900">
      {/* Map Background */}
      <div className="absolute inset-0">
        <ResourceMap 
          markers={markers} 
          activeZones={6}
          onMarkerSelect={handleMarkerSelect}
          selectedMarker={selectedMarker}
          activeFilters={activeFilters}
          searchQuery={searchQuery}
        />
      </div>

      {/* Glassmorphism Header */}
      <header className="absolute top-6 z-40 flex items-center gap-1 w-[95vw] mx-2 md:gap-5 md:ml-5">
        {/* Logo */}
        <div className="w-15 h-15 bg-[#1e293b] rounded-full flex items-center justify-center shadow-xl">
          <Image src='/logo.png' width={100} height={100}  alt="Logo"/>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-70 md:w-100">
          <div className="flex items-center bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-3.5">
            <Search size={20} className="text-[#64748b] mr-3" />
            <input
              type="text"
              placeholder="Search Municipality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[#1e293b] placeholder-[#64748b] font-medium text-sm "
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="ml-2 p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={16} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Right Control Panel */}
      <div className="absolute top-25 right-6 z-40 flex flex-col gap-3 md:top-5">
        {/* Add Mock Data Button */}
        <button
          onClick={addMockData}
          className="w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 flex items-center justify-center hover:bg-white transition-all group"
          title="Add Mock Data"
        >
          <PlusCircle size={22} className="text-[#2563eb] group-hover:scale-110 transition-transform" />
        </button>

        {/* User Profile */}
        <button className="w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 flex items-center justify-center hover:bg-white transition-all group">
          <User size={22} className="text-[#1e293b] group-hover:scale-110 transition-transform" />
        </button>

        {/* Filter Settings */}
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 flex items-center justify-center hover:bg-white transition-all group relative"
        >
          <SlidersHorizontal size={22} className="text-[#1e293b] group-hover:scale-110 transition-transform" />
          {activeFilters.length < RESOURCE_TYPES.length && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#2563eb] rounded-full border-2 border-white" />
          )}
        </button>

        {/* GPS Center */}
        <button 
          onClick={centerToLocation}
          className="w-12 h-12 bg-[#2563eb] rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center hover:bg-[#1d4ed8] transition-all group"
        >
          <LocateFixed size={22} className="text-white group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Resource Detail Sidebar */}
      <ResourceDetailSidebar 
        marker={selectedMarker}
        isOpen={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false);
          setSelectedMarker(null);
        }}
      />

      {/* Backdrop when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => {
            setIsSidebarOpen(false);
            setSelectedMarker(null);
          }}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
      />

      {/* Stats Badge - Bottom Left */}
      <div className="absolute bottom-6 mx-4 z-40">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 px-5 py-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Total Resources</p>
              <p className="text-2xl font-black text-[#1e293b]">{markers.length}</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Active Zones</p>
              <p className="text-2xl font-black text-[#2563eb]">6</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Ready Units</p>
              <p className="text-2xl font-black text-green-500">{Math.floor(markers.length * 0.7)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
