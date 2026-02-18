"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import { useNotification } from "@/components/Notification";
import {
  Save,
  MapPin,
  Loader2,
  CheckCircle2,
  Activity,
  Clock,
  Package,
  MapPinned,
  FileText,
  Users,
  Building,
  Tag,
  Navigation,
  Camera,
  Upload,
  X,
  AlertCircle,
  ToolCase,
  ArrowLeft,
} from "lucide-react";
import type { MarkerData } from "@/types";
import { RESOURCE_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import type { ResourceType, ResourceStatus } from "@/types";

export default function UploadResourcePage() {
  const { showError, showSuccess } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    type: ResourceType;
    quantity: number;
    latitude: number;
    longitude: number;
    description: string;
    municipality: string;
    status: ResourceStatus;
    image: string | undefined;
  }>({
    title: "",
    type: "trucks",
    quantity: 1,
    latitude: 10.720321,
    longitude: 122.562019,
    description: "",
    municipality: "Iloilo City",
    status: "ready",
    image: undefined,
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      showError("Location Error", "Geolocation is not supported by your browser");
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
        showSuccess("Location Found", "GPS coordinates have been updated successfully");
      },
      (error) => {
        setLoading(false);
        showError(
          "Location Error",
          "Unable to retrieve your location. Please check your permissions."
        );
      },
      { enableHighAccuracy: true },
    );
  };

  const handleSave = () => {
    if (!formData.title || !formData.latitude || !formData.longitude) {
      showError("Validation Error", "Please fill in all required fields.");
      return;
    }

    const newResource: MarkerData = {
      ...formData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      user_id: "temp-user-id",
    };

    const existingData = JSON.parse(
      localStorage.getItem("map-resources") || "[]",
    );
    localStorage.setItem(
      "map-resources",
      JSON.stringify([...existingData, newResource]),
    );

    showSuccess("Resource Saved", "Your resource has been added successfully!");
    
    // Reset form
    setFormData({
      title: "",
      type: "trucks",
      quantity: 1,
      latitude: 10.720321,
      longitude: 122.562019,
      description: "",
      municipality: "Iloilo City",
      status: "ready",
      image: undefined,
    });
  };

  const currentResourceConfig = RESOURCE_CONFIG[formData.type];
  const currentStatusConfig = STATUS_CONFIG[formData.status];
  const StatusIcon = currentStatusConfig.icon;
  const ResourceIcon = currentResourceConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <Header
        showBackButton={true}
        backHref="/"
        backLabel="Back to Dashboard"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Form Header */}
              <div className="upload-form-header bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package size={24} />
                  Register New Resource
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Fill in the details to add a new resource to the system
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Resource Name */}
                <div className="upload-name-field">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Tag size={16} className="text-blue-500" />
                    Resource Name / Unit ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rescue Squad Alpha, Fire Truck 05"
                    value={formData.title}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none border hover:bg-white"
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                {/* Image Upload */}
                <div className="upload-photo-field">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Camera size={16} className="text-blue-500" />
                    Resource Image
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, image: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  
                  {formData.image ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={formData.image}
                        alt="Resource preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: undefined });
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Upload size={28} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-600 group-hover:text-blue-600">Click to upload image</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Two Column Grid */}
                <div className="upload-type-status-fields grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Resource Type */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Package size={16} className="text-blue-500" />
                      Resource Type
                    </label>
                    <select
                      value={formData.type}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm outline-none border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as ResourceType,
                        })
                      }
                    >
                      {Object.entries(RESOURCE_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Activity size={16} className="text-blue-500" />
                      Status
                    </label>
                    <select
                      value={formData.status}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm outline-none border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as ResourceStatus,
                        })
                      }
                    >
                      <option value="ready">Ready</option>
                      <option value="deployed">Deployed</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Quantity and Municipality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quantity */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Users size={16} className="text-blue-500" />
                      Quantity / Personnel
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm outline-none border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>

                  {/* Municipality */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Building size={16} className="text-blue-500" />
                      Municipality
                    </label>
                    <select
                      value={formData.municipality}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm outline-none border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white"
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
                </div>

                {/* GPS Coordinates */}
                <div className="upload-location-field bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <MapPinned size={18} className="text-blue-600" />
                    GPS Coordinates
                  </label>
                  
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Navigation size={20} />
                    )}
                    {loading ? "Detecting Location..." : "Use Current Location"}
                  </button>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.latitude}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            latitude: parseFloat(e.target.value),
                          });
                        }}
                        className="w-full bg-transparent text-sm font-mono font-semibold text-slate-700 outline-none"
                      />
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.longitude}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            longitude: parseFloat(e.target.value),
                          });
                        }}
                        className="w-full bg-transparent text-sm font-mono font-semibold text-slate-700 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <FileText size={16} className="text-blue-500" />
                    Additional Details
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm outline-none border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none hover:bg-white"
                    placeholder="Describe specialized equipment, certifications, or other important details..."
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSave}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98]"
                >
                  <Save size={20} />
                  Register Resource
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="upload-preview-section lg:sticky lg:top-24 lg:h-full text-white">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin size={20} />
                  Sidebar Preview
                </h2>
                <p className="text-white text-sm mt-1">
                  This is how your resource will appear in the details sidebar
                </p>
              </div>

              <div className="p-6">
                {/* Sidebar Preview */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <ToolCase size={20} className="text-blue-600"/>
                      Resource Details
                    </h2>
                    <button className="p-1.5 hover:bg-slate-200 rounded-full transition-colors">
                      <X size={18} className="text-slate-500" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4 overflow-y-auto">
                    {/* Image */}
                    {formData.image ? (
                      <div className="w-full h-40 rounded-xl overflow-hidden">
                        <img 
                          src={formData.image} 
                          alt="Resource" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
                        <div className="text-center">
                          <Package size={40} className="text-slate-400 mx-auto mb-2" />
                          <span className="text-xs text-slate-500">Equipment Photo</span>
                        </div>
                      </div>
                    )}

                    {/* Resource Name & Status */}
                    <div>
                      <h1 className="text-lg font-black text-slate-900 leading-tight mb-1">
                        {formData.title || "Resource Name"}
                      </h1>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ 
                            backgroundColor: currentStatusConfig.color, 
                            boxShadow: `0 0 8px ${currentStatusConfig.color}` 
                          }}
                        />
                        <span className={`text-xs font-medium flex items-center gap-1 ${
                          formData.status === 'ready' ? 'text-green-600' : 
                          formData.status === 'deployed' ? 'text-orange-600' : 'text-yellow-600'
                        }`}>
                          <StatusIcon size={12} />
                          {currentStatusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Resource Type Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg">
                      <ResourceIcon size={16} className="text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">{currentResourceConfig.label}</span>
                    </div>

                    {/* Key Information Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Activity size={12} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity</span>
                        </div>
                        <span className="text-xl font-black text-slate-800">{formData.quantity}</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin size={12} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Municipality</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{formData.municipality}</span>
                      </div>
                    </div>

                    {/* Detailed Specifications */}
                    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertCircle size={14} className="text-blue-600" />
                        Specifications
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span className="text-xs text-slate-500">Resource ID</span>
                          <span className="text-xs font-mono font-medium text-slate-700">ABC12345</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span className="text-xs text-slate-500">Coordinates</span>
                          <span className="text-xs font-mono text-slate-700">
                            {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                          </span>
                        </div>
                        <div className="pt-1.5">
                          <span className="text-xs text-slate-500 block mb-1">Description</span>
                          <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                            {formData.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/25">
                        Update Status
                      </button>
                      <button className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors">
                        View History
                      </button>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                {/* <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">Status Legend</h4>
                  <div className="space-y-2">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <Icon size={14} style={{ color: config.color }} />
                          <span className="text-sm text-slate-600">{config.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
