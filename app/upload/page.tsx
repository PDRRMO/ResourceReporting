"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useNotification } from "@/components/Notification";
import { useAuth } from "@/contexts/AuthContext";
import browserImageCompression from "browser-image-compression";
import {
  Save,
  MapPin,
  Loader2,
  Activity,
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
  Phone,
  WifiOff,
  CheckCircle,
} from "lucide-react";
import type { ResourceType, ResourceStatus } from "@/types";
import { RESOURCE_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import { getAllMunicipalities } from "@/lib/municipalities";
// FIX: removed getMunicipalityByName — no longer doing network lookup on save
import { createResource } from "@/lib/resources";
import { getAllResourceTypes } from "@/lib/resourceTypes";
// FIX: removed getResourceTypeByCode — no longer doing network lookup on save
import { uploadBase64ToCloudinary, deleteImageFromCloudinary } from "@/lib/storage";
import { isOnline, queueOfflineAction } from "@/lib/offline";
import type { Municipality } from "@/lib/database.types";

export default function UploadResourcePage() {
  const router = useRouter();
  const { showError, showSuccess } = useNotification();
  const { user, authUser, role } = useAuth();

  const [locationLoading, setLocationLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  // FIX: pre-load resource types in state instead of fetching during save
  const [resourceTypes, setResourceTypes] = useState<any[]>([]);
  const [cameraKey, setCameraKey] = useState(0);

  // Uploaded photo — preview is shown immediately, url/publicId set after Cloudinary responds
  const [uploadedPhoto, setUploadedPhoto] = useState<{
    preview: string;
    url: string;
    publicId: string;
  } | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isSaving = useRef(false);
  const isProcessingImage = useRef(false);

  const [formData, setFormData] = useState<{
    title: string;
    type: ResourceType;
    quantity: number;
    latitude: number;
    longitude: number;
    description: string;
    municipality: string;
    status: ResourceStatus;
    contactNumber: string;
  }>({
    title: "",
    type: "trucks" as ResourceType,
    quantity: 1,
    latitude: 10.720321,
    longitude: 122.562019,
    description: "",
    municipality: "",
    status: "ready" as ResourceStatus,
    contactNumber: "",
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod/i.test(ua);
    setIsMobile(mobile);

    setIsOffline(!isOnline());
    const handleOnline = () => { setIsOffline(false); };
    const handleOffline = () => { setIsOffline(true); };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    Promise.all([getAllMunicipalities(), getAllResourceTypes()])
      .then(([m, t]) => {
        setMunicipalities(m);
        setResourceTypes(t);
      })
      .catch((e) => console.log(`INIT load error: ${e}`));

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // FIX: auto-select the first municipality once data loads so formData is never ""
  useEffect(() => {
    if (municipalities.length > 0 && formData.municipality === "") {
      setFormData((prev) => ({ ...prev, municipality: municipalities[0].name }));
    }
  }, [municipalities]);

  const compressImage = async (file: File): Promise<string> => {
    const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
    try {
      const compressed = await browserImageCompression(file, options);
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(compressed);
      });
    } catch {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { return; }
    if (isProcessingImage.current) { return; }
    isProcessingImage.current = true;

    if (!file.type.startsWith("image/")) {
      showError("Invalid File", "Please select an image file.");
      isProcessingImage.current = false;
      return;
    }

    try {
      // Show preview immediately
      const preview = await compressImage(file);
      setUploadedPhoto({ preview, url: "", publicId: "" });
      setCameraKey((k) => k + 1);

      // Upload to Cloudinary via API route — completely separate from Supabase
      setImageUploading(true);
      const { url, publicId } = await uploadBase64ToCloudinary(preview);
      setUploadedPhoto({ preview, url, publicId });
      setImageUploading(false);

    } catch (err) {
      setImageUploading(false);
      setUploadedPhoto(null);
      showError("Image Error", "Could not upload image. Please try another.");
    } finally {
      isProcessingImage.current = false;
    }
  };

  const handleRemoveImage = async () => {
    if (uploadedPhoto?.publicId) {
      try {
        await deleteImageFromCloudinary(uploadedPhoto.publicId);
      } catch (err) {
      }
    }
    setUploadedPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setCameraKey((k) => k + 1);
  };

  const canUpload = user && authUser && (role === "responder" || role === "admin");

  const isSecureContext = typeof window !== "undefined" && window.isSecureContext;

  const isGettingLocation = useRef(false);

  const getLocation = () => {
    if (isGettingLocation.current) return;

    if (!navigator.geolocation || !isSecureContext) {
      showError("Location Error", "GPS requires a secure connection (https). Please enter coordinates manually.");
      return;
    }
    isGettingLocation.current = true;
    setLocationLoading(true);

    // Android ignores the built-in timeout option — use a manual one instead
    let settled = false;
    const geoTimeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        isGettingLocation.current = false;
        setLocationLoading(false);
        showError("Location Error", "Location request timed out. Please try again or enter coordinates manually.");
      }
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (settled) return; // timeout already fired
        settled = true;
        clearTimeout(geoTimeout);
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        isGettingLocation.current = false;
        setLocationLoading(false);
        showSuccess("Location Found", "GPS coordinates have been updated successfully");
      },
      (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(geoTimeout);
        isGettingLocation.current = false;
        setLocationLoading(false);
        showError("Location Error", "Unable to retrieve your location. Please check your permissions.");
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const handleSave = async () => {
    if (saving) { return; }

    if (!user || !authUser) {
      showError("Authentication Required", "Please sign in to add resources.");
      router.push("/login");
      return;
    }

    if (!canUpload) {
      showError("Access Denied", "Only responders and admins can add resources.");
      return;
    }

    // FIX: added municipality to required field validation
    if (!formData.title || !formData.municipality || !formData.latitude || !formData.longitude || !formData.contactNumber) {
      showError("Validation Error", "Please fill in all required fields including the contact number.");
      return;
    }

    const phoneRegex = /^\+639[0-9]{9}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      showError("Validation Error", "Please enter a valid Philippine mobile number (+63 followed by 10 digits).");
      return;
    }

    if (imageUploading) {
      showError("Please Wait", "Image is still uploading. Please wait a moment.");
      return;
    }

    setSaving(true);

    try {
      const statusMap: Record<ResourceStatus, string> = {
        ready: "ready",
        deployed: "deployed",
        maintenance: "maintenance",
      };

      // ✅ photoUrl already ready — no Cloudinary call here
      const photoUrl = uploadedPhoto?.url || null;

      // FIX: resolve municipality from in-memory state — zero network calls, no stale client hang
      const municipalityMatch = municipalities.find((m) => m.name === formData.municipality);
      const municipalityId = municipalityMatch?.municipality_id ?? null;

      if (!municipalityId) {
        showError("Validation Error", "Please select a valid municipality.");
        setSaving(false);
        return;
      }

      // FIX: resolve resource type from in-memory state — zero network calls, no stale client hang
      const resourceTypeMatch = resourceTypes.find((t) => t.code === formData.type);
      const typeId = resourceTypeMatch?.id ?? null;

      if (!typeId) {
        showError("Validation Error", "Invalid resource type selected.");
        setSaving(false);
        return;
      }

      const resourceData = {
        name: formData.title,
        type_id: typeId,
        municipality_id: municipalityId,
        quantity: formData.quantity,
        status: statusMap[formData.status],
        photo_url: photoUrl,
        description: formData.description,
        contactNumber: formData.contactNumber,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      if (isOnline()) {
        const res = await fetch('/api/resources/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resourceData),
        });

        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error || 'Failed to save resource');
        }
        showSuccess("Resource Saved", "Your resource has been added successfully!");
      } else {
        queueOfflineAction({
          type: "create",
          table: "resource",
          data: { ...resourceData, added_by: user.id },
        });
        showSuccess("Saved Offline", "Your resource has been queued and will be synced when you're back online.");
      }

      setFormData({
        title: "",
        type: "trucks",
        quantity: 1,
        latitude: 10.720321,
        longitude: 122.562019,
        description: "",
        // FIX: was municipalities[0]?.municipality_id (UUID) — must use .name to match dropdown values
        municipality: municipalities[0]?.name ?? "",
        status: "ready",
        contactNumber: "",
      });
      setUploadedPhoto(null);
      setCameraKey((k) => k + 1);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (error: unknown) {
      const err = error as Error;
      showError("Save Failed", err.message || "Could not save resource. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const currentResourceConfig = RESOURCE_CONFIG[formData.type];
  const currentStatusConfig = STATUS_CONFIG[formData.status];
  const StatusIcon = currentStatusConfig.icon;
  const ResourceIcon = currentResourceConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header showBackButton={true} backHref="/" backLabel="Back to Dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {isOffline && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <WifiOff className="text-amber-600" size={20} />
            <span className="text-amber-800 text-sm font-medium">
              You&apos;re offline. Resources will be saved locally and synced when you&apos;re back online.
            </span>
          </div>
        )}

        {(!user || !canUpload) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-800 text-sm font-medium">
              {!user
                ? "Please sign in to add resources."
                : "Only responders and admins can add resources. Your role: " + (role || "viewer")}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
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
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    onChange={handleImageChange}
                  />
                  <input
                    key={cameraKey}
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  {uploadedPhoto ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={uploadedPhoto.preview}
                        alt="Resource preview"
                        className="w-full h-full object-cover"
                      />

                      {/* Uploading overlay */}
                      {imageUploading && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-white" size={28} />
                          <span className="text-white text-sm font-semibold">Uploading photo...</span>
                          <span className="text-white/70 text-xs">Fill the form while this uploads</span>
                        </div>
                      )}

                      {/* Uploaded badge */}
                      {!imageUploading && uploadedPhoto.url && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                          <CheckCircle size={12} />
                          Photo uploaded
                        </div>
                      )}

                      {/* Remove button */}
                      {!imageUploading && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        isMobile ? cameraInputRef.current?.click() : fileInputRef.current?.click()
                      }
                      className="w-full h-48 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        {isMobile ? (
                          <Camera size={28} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                        ) : (
                          <Upload size={28} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-600 group-hover:text-blue-600">
                          {isMobile ? "Take a Photo" : "Click to upload image"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {isMobile ? "Opens your camera" : "PNG, JPG up to 5MB"}
                        </p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Resource Type + Status */}
                <div className="upload-type-status-fields grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Package size={16} className="text-blue-500" />
                      Resource Type
                    </label>
                    <select
                      value={formData.type}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm outline-none border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white"
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
                    >
                      {Object.entries(RESOURCE_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Activity size={16} className="text-blue-500" />
                      Status
                    </label>
                    <select
                      value={formData.status}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm outline-none border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white"
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ResourceStatus })}
                    >
                      <option value="ready">Ready</option>
                      <option value="deployed">Deployed</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Quantity + Municipality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Building size={16} className="text-blue-500" />
                      Municipality
                    </label>
                    <select
                      value={formData.municipality}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm outline-none border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white"
                      onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                    >
                      {municipalities.length > 0 ? (
                        municipalities.map((m) => (
                          <option key={m.municipality_id} value={m.name}>{m.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="Iloilo City">Iloilo City</option>
                          <option value="Oton">Oton</option>
                          <option value="Pavia">Pavia</option>
                          <option value="Leganes">Leganes</option>
                          <option value="Santa Barbara">Santa Barbara</option>
                          <option value="Dumangas">Dumangas</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Contact Number */}
                <div className="upload-contact-field">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Phone size={16} className="text-blue-500" />
                    Contact Number (Person Responsible) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                      +639
                    </span>
                    <input
                      type="tel"
                      placeholder="XX XXX XXXX"
                      value={formData.contactNumber.replace(/^\+639/, "")}
                      maxLength={9}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 pl-12 pr-3.5 py-3.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none border hover:bg-white"
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        if (rawValue.length <= 9) {
                          setFormData({ ...formData, contactNumber: rawValue ? `+639${rawValue}` : "" });
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter 10-digit Philippine mobile number (e.g., 9171234567)
                  </p>
                </div>

                {/* GPS Coordinates */}
                <div className="upload-location-field bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <MapPinned size={18} className="text-blue-600" />
                    GPS Coordinates
                  </label>
                  {isSecureContext ? (
                    <button
                      type="button"
                      onClick={getLocation}
                      disabled={locationLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {locationLoading ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
                      {locationLoading ? "Detecting Location..." : "Use Current Location"}
                    </button>
                  ) : (
                    <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3.5 text-sm font-medium text-slate-400 border-2 border-slate-200">
                      <Navigation size={20} />
                      GPS requires https — enter coordinates manually
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                        className="w-full bg-transparent text-sm font-mono font-semibold text-slate-700 outline-none"
                      />
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
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
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !canUpload || imageUploading}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] ${
                      saving || !canUpload || imageUploading
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                    }`}
                  >
                    {imageUploading ? (
                      <><Loader2 className="animate-spin" size={20} />Uploading Photo...</>
                    ) : saving ? (
                      <><Loader2 className="animate-spin" size={20} />Saving...</>
                    ) : !user ? (
                      <><AlertCircle size={20} />Sign In to Add Resource</>
                    ) : !canUpload ? (
                      <><AlertCircle size={20} />Access Denied</>
                    ) : (
                      <><Save size={20} />Register Resource</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="upload-preview-section lg:sticky lg:top-24 lg:h-full text-white">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
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
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <ToolCase size={20} className="text-blue-600" />
                      Resource Details
                    </h2>
                    <button className="p-1.5 hover:bg-slate-200 rounded-full transition-colors">
                      <X size={18} className="text-slate-500" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4 overflow-y-auto">
                    {uploadedPhoto?.preview ? (
                      <div className="w-full h-40 rounded-xl overflow-hidden">
                        <img src={uploadedPhoto.preview} alt="Resource" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
                        <div className="text-center">
                          <Package size={40} className="text-slate-400 mx-auto mb-2" />
                          <span className="text-xs text-slate-500">Equipment Photo</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <h1 className="text-lg font-black text-slate-900 leading-tight mb-1">
                        {formData.title || "Resource Name"}
                      </h1>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: currentStatusConfig.color, boxShadow: `0 0 8px ${currentStatusConfig.color}` }}
                        />
                        <span className={`text-xs font-medium flex items-center gap-1 ${
                          formData.status === "ready" ? "text-green-600" :
                          formData.status === "deployed" ? "text-orange-600" : "text-yellow-600"
                        }`}>
                          <StatusIcon size={12} />
                          {currentStatusConfig.label}
                        </span>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg">
                      <ResourceIcon size={16} className="text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">{currentResourceConfig.label}</span>
                    </div>

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

                    <div className="bg-white rounded-lg border border-slate-200 p4 shadow-sm">
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}