// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import ResourceMap from "@/components/ResourceMap";
import { MarkerData, ResourceType } from "@/types";
import { PlusCircle } from "lucide-react";

const RESOURCE_TYPES: ResourceType[] = ["ver", "comm", "tools", "trucks", "watercraft", "fr", "har", "usar", "wasar", "ews", "ems", "firetruck", "cssr", "ambulance"];

const MUNICIPALITIES = ["Iloilo City", "Oton", "Pavia", "Leganes", "Santa Barbara", "Dumangas"];

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

const generateRandomMockResource = (): Omit<MarkerData, "id" | "createdAt"> => {
  const type = RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)];
  const municipality = MUNICIPALITIES[Math.floor(Math.random() * MUNICIPALITIES.length)];
  const names = RESOURCE_NAMES[type];
  const title = names[Math.floor(Math.random() * names.length)] + " " + Math.floor(Math.random() * 100);
  
  // Base coordinates for Iloilo City area
  const baseLat = 10.720321;
  const baseLng = 122.562019;
  
  // Random offset within ~5km radius
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
  };
};

export default function HomePage() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load resources from localStorage
    const loadResources = () => {
      try {
        const savedData = localStorage.getItem("map-resources");
        const parsedData = savedData ? JSON.parse(savedData) : [];
        
        // Ensure all markers have required fields (backward compatibility)
        const validatedData = parsedData.map((item: MarkerData) => ({
          ...item,
          municipality: item.municipality || "Iloilo City", // Default municipality
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

    // Listen for storage changes (in case resources are added in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "map-resources") {
        loadResources();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addMockData = () => {
    const existingData = JSON.parse(localStorage.getItem("map-resources") || "[]");
    const numResources = Math.floor(Math.random() * 5) + 3; // Add 3-8 random resources
    
    const newMockData: MarkerData[] = Array.from({ length: numResources }, () => {
      const resource = generateRandomMockResource();
      return {
        ...resource,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        user_id: "mock-user-id",
      };
    });
    
    const updatedData = [...existingData, ...newMockData];
    localStorage.setItem("map-resources", JSON.stringify(updatedData));
    setMarkers(updatedData);
    alert(`Added ${newMockData.length} random mock resources to the map!`);
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative">
      <ResourceMap 
        markers={markers} 
        activeZones={6}
      />
      <button
        onClick={addMockData}
        className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg hover:bg-slate-50 transition-all border border-slate-200"
      >
        <PlusCircle size={18} className="text-blue-600" />
        <span className="text-sm font-medium text-slate-700">Add Mock Data</span>
      </button>
    </div>
  );
}
