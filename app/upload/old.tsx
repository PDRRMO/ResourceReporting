"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useNotification } from "@/components/Notification";
import { useAuth } from "@/contexts/AuthContext";

import browserImageCompression from "browser-image-compression";

import {
  Save,
  Loader2,
  Package,
  Camera,
  Upload,
  X,
  AlertCircle,
  WifiOff,
  CheckCircle,
} from "lucide-react";

import type { ResourceType, ResourceStatus } from "@/types";

import { RESOURCE_CONFIG, STATUS_CONFIG } from "@/lib/constants";

import { getAllMunicipalities } from "@/lib/municipalities";
import { createResource } from "@/lib/resources";
import { getResourceTypeByCode } from "@/lib/resourceTypes";

import {
  uploadBase64ToCloudinary,
  deleteImageFromCloudinary,
} from "@/lib/storage";

import { isOnline, queueOfflineAction } from "@/lib/offline";

import type { Municipality } from "@/lib/database.types";

export default function UploadResourcePage() {

  const router = useRouter();
  const { showError, showSuccess } = useNotification();
  const { user, authUser, role } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);

  const [uploadedPhoto, setUploadedPhoto] = useState<{
    preview: string;
    url: string;
    publicId: string;
  } | null>(null);

  const [formData, setFormData] = useState({
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

  const canUpload = user && authUser && (role === "responder" || role === "admin");

  useEffect(() => {

    setIsOffline(!isOnline());

    const ua = navigator.userAgent;
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(ua));

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    getAllMunicipalities()
      .then((m) => {

        setMunicipalities(m);

        if (m.length > 0) {
          setFormData((prev) => ({
            ...prev,
            municipality: m[0].municipality_id,
          }));
        }

      })
      .catch(() => {
        showError("Error", "Failed to load municipalities.");
      });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };

  }, []);

  const compressImage = async (file: File): Promise<string> => {

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    const compressed = await browserImageCompression(file, options);

    const reader = new FileReader();

    return new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(compressed);
    });
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Invalid File", "Please select an image.");
      return;
    }

    try {

      const preview = await compressImage(file);

      setUploadedPhoto({
        preview,
        url: "",
        publicId: "",
      });

      setImageUploading(true);

      const { url, publicId } = await uploadBase64ToCloudinary(preview);

      setUploadedPhoto({
        preview,
        url,
        publicId,
      });

    } catch {

      showError("Upload Error", "Failed to upload image.");
      setUploadedPhoto(null);

    } finally {

      setImageUploading(false);
    }
  };

  const removeImage = async () => {

    if (uploadedPhoto?.publicId) {
      try {
        await deleteImageFromCloudinary(uploadedPhoto.publicId);
      } catch {}
    }

    setUploadedPhoto(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validatePhone = (phone: string) => {

    const regex = /^\+639[0-9]{9}$/;
    return regex.test(phone);
  };

  const handleSave = async () => {

    if (saving) return;

    if (!user || !authUser) {
      showError("Authentication Required", "Please sign in.");
      router.push("/login");
      return;
    }

    if (!canUpload) {
      showError("Access Denied", "Only responders or admins can add resources.");
      return;
    }

    if (!formData.title || !formData.contactNumber) {
      showError("Validation Error", "Please fill required fields.");
      return;
    }

    if (!validatePhone(formData.contactNumber)) {
      showError("Validation Error", "Invalid phone number.");
      return;
    }

    if (imageUploading) {
      showError("Please Wait", "Image still uploading.");
      return;
    }

    setSaving(true);

    try {

      const resourceType = await getResourceTypeByCode(formData.type);

      if (!resourceType) {
        throw new Error("Invalid resource type.");
      }

      const resourceData = {

        name: formData.title,
        type_id: resourceType.id,
        municipality_id: formData.municipality,
        quantity: formData.quantity,
        status: formData.status,
        photo_url: uploadedPhoto?.url ?? null,
        description: formData.description,
        contact_number: formData.contactNumber,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      if (isOnline()) {

        await createResource(resourceData, user.id);

        showSuccess("Resource Saved", "Resource added successfully.");

      } else {

        queueOfflineAction({
          type: "create",
          table: "resource",
          data: { ...resourceData, added_by: user.id },
        });

        showSuccess("Saved Offline", "Will sync when online.");
      }

      setFormData({
        title: "",
        type: "trucks",
        quantity: 1,
        latitude: 10.720321,
        longitude: 122.562019,
        description: "",
        municipality: municipalities[0]?.municipality_id ?? "",
        status: "ready",
        contactNumber: "",
      });

      setUploadedPhoto(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {

      const error = err as Error;

      showError("Save Failed", error.message);

    } finally {

      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <Header showBackButton backHref="/" backLabel="Back to Dashboard" />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {isOffline && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 items-center">
            <WifiOff size={18} className="text-amber-600" />
            <span className="text-sm text-amber-800">
              You are offline. Resources will sync when back online.
            </span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow border p-6 space-y-5">

          <h2 className="text-lg font-bold flex items-center gap-2">
            <Package size={20} />
            Register Resource
          </h2>

          <input
            type="text"
            placeholder="Resource Name"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border rounded-lg p-3"
          />

          <div>

            {uploadedPhoto ? (

              <div className="relative">

                <img
                  src={uploadedPhoto.preview}
                  className="rounded-lg h-48 w-full object-cover"
                />

                {imageUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" />
                  </div>
                )}

                {!imageUploading && (
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                  >
                    <X size={16} />
                  </button>
                )}

              </div>

            ) : (

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center"
              >
                {isMobile ? <Camera size={28}/> : <Upload size={28}/>}
                <span className="text-sm text-gray-500 mt-2">
                  Upload Resource Image
                </span>
              </button>

            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture={isMobile ? "environment" : undefined}
              className="hidden"
              onChange={handleImageChange}
            />

          </div>

          <button
            onClick={handleSave}
            disabled={saving || imageUploading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18}/>
                Saving...
              </>
            ) : (
              <>
                <Save size={18}/>
                Register Resource
              </>
            )}
          </button>

        </div>

      </main>

    </div>
  );
}