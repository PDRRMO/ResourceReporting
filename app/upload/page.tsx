"use client";
import React, { useState } from "react";
import {
  Save,
  ArrowLeft,
  Package,
  MapPin,
  ClipboardList,
  Loader2,
} from "lucide-react";
import type { MarkerData } from "@/components/mapComponent";
import { RESOURCE_CONFIG, type ResourceType } from "@/lib/constants";
import type { ResourceStatus } from "@/types";

export default function UploadResourcePage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "trucks",
    quantity: 1,
    latitude: 0,
    longitude: 0,
    description: "",
    municipality: "Iloilo City",
    status: "ready" as ResourceStatus,
  });

  const municipalities = [
    "Iloilo City",
    "Oton",
    "Pavia",
    "Leganes",
    "Santa Barbara",
    "Dumangas",
  ];

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        alert(
          "Unable to retrieve your location. Please check your permissions.",
        );
      },
      { enableHighAccuracy: true }, // Request GPS-level precision
    );
  };

  const handleSave = () => {
    // 1. Validate
    if (!formData.title || !formData.latitude || !formData.longitude) {
      alert("Please fill in all required fields.");
      return;
    }

    // 2. Prepare the object (Supabase-ready structure)
    const newResource: MarkerData = {
      ...formData,
      id: crypto.randomUUID(),
      latitude: formData.latitude,
      longitude: formData.longitude,
      description: formData.description,
      createdAt: new Date().toISOString(),
      user_id: "temp-user-id", // Placeholder for Supabase Auth
    };

    // 3. Save to localStorage
    const existingData = JSON.parse(
      localStorage.getItem("map-resources") || "[]",
    );
    localStorage.setItem(
      "map-resources",
      JSON.stringify([...existingData, newResource]),
    );

    alert("Resource saved locally!");
    // Optional: Reset form or redirect
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Register Resource
            </h1>
            <p className="text-sm text-slate-500">
              Add new equipment or teams to the map
            </p>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
            <ArrowLeft size={16} /> Back to Map
          </button>
        </header>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
          {/* Accent Header */}
          <div className="bg-blue-600 h-2 w-full" />

          <div className="p-8 space-y-6">
            {/* Resource Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Resource Name / Unit ID
              </label>
              <input
                type="text"
                placeholder="e.g. Rescue Squad 5"
                className="w-full rounded-lg border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all outline-none border"
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resource Type Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Resource Type
                </label>
                <select
                  className="w-full rounded-lg border-slate-200 bg-slate-50 p-3 text-sm outline-none border"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as ResourceType,
                    })
                  }
                >
                  {Object.entries(RESOURCE_CONFIG).map(([filename, data]) => (
                    <option key={filename} value={filename}>
                      {data.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Quantity / Personnel
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-lg border-slate-200 bg-slate-50 p-3 text-sm outline-none border"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {/* Municipality */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Municipality
              </label>
              <select
                className="w-full rounded-lg border-slate-200 bg-slate-50 p-3 text-sm outline-none border"
                value={formData.municipality}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    municipality: e.target.value,
                  })
                }
              >
                {municipalities.map((municipality) => (
                  <option key={municipality} value={municipality}>
                    {municipality}
                  </option>
                ))}
              </select>
            </div>

            {/* Coordinates */}
            <div className="space-y-4 p-6 bg-white rounded-xl shadow-md">
              <button
                type="button"
                onClick={getLocation}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 py-3 text-sm font-bold text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <MapPin size={18} />
                )}
                {loading ? "Detecting Location..." : "Use Current Coordinates"}
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    Lat
                  </label>
                  <input
                    type="number"
                    value={formData.latitude || 10.720321}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        latitude: parseFloat(e.target.value),
                      });
                    }}
                    className="w-full rounded-lg bg-slate-50 p-2 text-sm font-mono border"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    Long
                  </label>
                  <input
                    type="number"
                    value={formData.longitude || 122.562019}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        longitude: parseFloat(e.target.value),
                      });
                    }}
                    className="w-full rounded-lg bg-slate-50 p-2 text-sm font-mono border"
                  />
                </div>
              </div>
            </div>
            <div></div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Additional Details
              </label>
              <textarea
                rows={3}
                className="w-full rounded-lg border-slate-200 bg-slate-50 p-3 text-sm outline-none border"
                placeholder="List specialized equipment or crew certifications..."
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              <Save size={18} />
              Register Resource to Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
