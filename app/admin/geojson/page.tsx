"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useNotification } from "@/components/Notification";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, FileJson, Database, CheckCircle, AlertCircle, Loader2, MapPin } from "lucide-react";

interface GeoJSONFeature {
  type: "Feature";
  properties: {
    name: string;
    [key: string]: unknown;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export default function AdminGeoJSONPage() {
  const router = useRouter();
  const { showError, showSuccess } = useNotification();
  const { user, authUser, role, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<GeoJSONFeatureCollection | null>(null);
  const [parsedMunicipalities, setParsedMunicipalities] = useState<{ name: string; boundary: string }[]>([]);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "preview" | "uploading" | "success">("idle");
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentName: "" });

  const canAccess = user && authUser && (role === "admin");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Auth check - user:", user?.id, "authUser:", authUser, "role:", role);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json") && !file.name.endsWith(".geojson")) {
      showError("Invalid File", "Please upload a JSON or GeoJSON file");
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text) as GeoJSONFeatureCollection;

      // Validate GeoJSON structure
      if (json.type !== "FeatureCollection" || !Array.isArray(json.features)) {
        showError("Invalid GeoJSON", "File must be a GeoJSON FeatureCollection");
        return;
      }

      setPreviewData(json);

      // Parse municipalities from GeoJSON
      const municipalities = json.features
        .filter((feature) => feature.properties?.name)
        .map((feature) => ({
          name: feature.properties.name as string,
          boundary: JSON.stringify({
            type: feature.geometry.type,
            coordinates: feature.geometry.coordinates,
          }),
        }));

      setParsedMunicipalities(municipalities);
      setUploadStatus("preview");

      showSuccess("File Parsed", `Found ${municipalities.length} municipalities`);
    } catch (error) {
      console.error("Error parsing GeoJSON:", error);
      showError("Parse Error", "Failed to parse GeoJSON file");
    }
  };

  const handleUpload = async () => {
    if (!canAccess) {
      showError("Access Denied", "Only admins can upload GeoJSON data");
      return;
    }

    if (parsedMunicipalities.length === 0) {
      showError("No Data", "No municipalities to upload");
      return;
    }

    setLoading(true);
    setUploadStatus("uploading");
    setUploadProgress({ current: 0, total: parsedMunicipalities.length, currentName: "" });

    try {
      // Import Supabase client
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      let successCount = 0;
      let errorCount = 0;

    for (let i = 0; i < parsedMunicipalities.length; i++) {
      const muni = parsedMunicipalities[i];

      setUploadProgress({ current: i + 1, total: parsedMunicipalities.length, currentName: muni.name });

      // Check if the row exists first
      const { data: existing } = await supabase
        .from("municipality")
        .select("name")
        .eq("name", muni.name)
        .maybeSingle();

      if (existing) {
        // Row exists — update it
        const { error } = await supabase
          .from("municipality")
          .update({ boundary_shape: JSON.parse(muni.boundary) })
          .eq("name", muni.name);

        if (error) {
          console.error(`Update error for ${muni.name}:`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
      } else {
        // Row doesn't exist — insert it
        const { error: insertError } = await supabase
          .from("municipality")
          .insert({
            name: muni.name,
            boundary_shape: JSON.parse(muni.boundary),
            latitude: null,
            longitude: null,
          });

        if (insertError) {
          console.error(`Insert error for ${muni.name}:`, insertError.message);
          errorCount++;
        } else {
          successCount++;
        }
      }
    }

      if (errorCount > 0) {
        console.log(`Upload result: ${successCount} success, ${errorCount} failed`);
        alert(`Upload result: ${successCount} success, ${errorCount} failed. Check console for details.`);
        showError("Upload Complete", `Updated ${successCount}, failed ${errorCount} municipalities`);
      } else {
        showSuccess("Upload Successful", `${successCount} municipalities updated`);
      }

      setUploadStatus("success");
      setPreviewData(null);
      setParsedMunicipalities([]);
    } catch (error) {
      console.error("Upload error:", error);
      showError("Upload Failed", "Failed to upload GeoJSON data");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPreviewData(null);
    setParsedMunicipalities([]);
    setUploadStatus("idle");
    setUploadProgress({ current: 0, total: 0, currentName: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-500">Only admins can access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header showBackButton={true} backHref="/" backLabel="Back to Dashboard" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin size={24} />
              GeoJSON Municipality Upload
            </h1>
            <p className="text-purple-100 text-sm mt-1">
              Upload GeoJSON file to update municipality boundaries
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Upload Area */}
            {uploadStatus === "idle" && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,.geojson"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-4 hover:border-purple-400 hover:bg-purple-50 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Upload size={28} className="text-slate-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600 group-hover:text-purple-600">
                      Click to upload GeoJSON file
                    </p>
                    <p className="text-xs text-slate-400 mt-1">JSON or GeoJSON format</p>
                  </div>
                </button>
              </div>
            )}

            {/* Preview */}
            {(uploadStatus === "preview" || uploadStatus === "uploading") && previewData && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="font-semibold text-green-800">File parsed successfully</p>
                    <p className="text-sm text-green-600">
                      {parsedMunicipalities.length} municipalities found
                    </p>
                  </div>
                </div>

                {/* Preview List */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                      <FileJson size={18} />
                      Preview ({parsedMunicipalities.length} municipalities)
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedMunicipalities.map((muni, idx) => {
                          const geom = previewData?.features[idx]?.geometry;
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-4 py-2 text-sm text-slate-700">{muni.name}</td>
                              <td className="px-4 py-2 text-sm text-slate-500">{geom?.type || "Unknown"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Database size={20} />
                        Upload to Database
                      </>
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                {uploadStatus === "uploading" && uploadProgress.total > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        Uploading: <span className="font-medium">{uploadProgress.currentName}</span>
                      </span>
                      <span className="text-slate-500">
                        {uploadProgress.current} / {uploadProgress.total}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 transition-all duration-200 ease-out"
                        style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Success */}
            {uploadStatus === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Upload Complete!</h2>
                <p className="text-slate-500 mb-6">Municipality boundaries have been updated.</p>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Upload Another File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-800 mb-2">GeoJSON Format Requirements</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• File must be a GeoJSON FeatureCollection</li>
            <li>• Each feature must have a <code className="bg-blue-100 px-1 rounded">name</code> property</li>
            <li>• Geometry must be Polygon or MultiPolygon</li>
            <li>• Existing municipalities will be updated, new ones will be created</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
