"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useNotification } from "@/components/Notification";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Plus, Trash2, FileText, MapPin, AlertCircle } from "lucide-react";
import type { ResourceType, ResourceStatus } from "@/types";
import { RESOURCE_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import type { Municipality, Resource } from "@/lib/database.types";

interface ResourceWithDetails extends Resource {
  resource_types?: { code: string; full_name: string };
  municipality?: { name: string };
}

export default function AdminResourcesPage() {
  const { showError, showSuccess } = useNotification();
  const { user, authUser, role, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [resources, setResources] = useState<ResourceWithDetails[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type_code: "document",
    quantity: 1,
    latitude: 10.720321,
    longitude: 122.562019,
    description: "",
    municipality_id: "",
    status: "ready" as ResourceStatus,
  });

  const canAccess = user && authUser && (role === "admin" || role === "responder");

  useEffect(() => {
    if (canAccess) {
      fetchData();
    }
  }, [canAccess]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resourcesRes, municipalitiesRes] = await Promise.all([
        supabase.from("resource").select("*, resource_types(code, full_name), municipality(name)").order("created_at", { ascending: false }),
        supabase.from("municipality").select("*").order("name"),
      ]);

      if (resourcesRes.error) throw resourcesRes.error;
      if (municipalitiesRes.error) throw municipalitiesRes.error;

      setResources(resourcesRes.data || []);
      setMunicipalities(municipalitiesRes.data || []);
      
      if (municipalitiesRes.data?.length && !formData.municipality_id) {
        setFormData((prev) => ({ ...prev, municipality_id: municipalitiesRes.data![0].municipality_id }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showError("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.municipality_id) {
      showError("Validation Error", "Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase.from("resource").insert({
        name: formData.name,
        type_id: null,
        quantity: formData.quantity,
        latitude: formData.latitude,
        longitude: formData.longitude,
        description: formData.description,
        municipality_id: formData.municipality_id,
        status: formData.status,
        added_by: user?.id,
      });

      if (error) throw error;

      showSuccess("Success", "Resource added successfully");
      setShowAddForm(false);
      setFormData({
        name: "",
        type_code: "document",
        quantity: 1,
        latitude: 10.720321,
        longitude: 122.562019,
        description: "",
        municipality_id: municipalities[0]?.municipality_id || "",
        status: "ready",
      });
      fetchData();
    } catch (error: unknown) {
      console.error("Error adding resource:", error);
      const err = error as { message?: string };
      showError("Error", err.message || "Failed to add resource");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const { error } = await supabase.from("resource").delete().eq("resource_id", id);
      if (error) throw error;

      showSuccess("Deleted", "Resource deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting resource:", error);
      showError("Error", "Failed to delete resource");
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
        <Header showBackButton={true} backHref="/" backLabel="Back to Dashboard" />
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-500">Only responders and admins can access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header showBackButton={true} backHref="/" backLabel="Back to Dashboard" />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText size={24} />
              Resource Management
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Add and manage resources
            </p>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-700">
                Resources ({resources.length})
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Add Resource
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleSubmit} className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-4">Add New Resource</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Type</label>
                    <select
                      value={formData.type_code}
                      onChange={(e) => setFormData({ ...formData, type_code: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.entries(RESOURCE_CONFIG).map(([code, config]) => (
                        <option key={code} value={code}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ResourceStatus })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                        <option key={status} value={status}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Municipality *</label>
                    <select
                      value={formData.municipality_id}
                      onChange={(e) => setFormData({ ...formData, municipality_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {municipalities.map((m) => (
                        <option key={m.municipality_id} value={m.municipality_id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add Resource
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No resources found. Add one to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Municipality</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resources.map((resource) => (
                      <tr key={resource.resource_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{resource.name}</div>
                          {resource.description && (
                            <div className="text-sm text-slate-500 truncate max-w-xs">{resource.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {resource.resource_types?.full_name || resource.resource_types?.code || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{resource.quantity}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${resource.status === "ready" ? "bg-green-100 text-green-800" : ""}
                            ${resource.status === "deployed" ? "bg-orange-100 text-orange-800" : ""}
                            ${resource.status === "maintenance" ? "bg-yellow-100 text-yellow-800" : ""}
                          `}>
                            {STATUS_CONFIG[resource.status as ResourceStatus]?.label || resource.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {resource.municipality?.name || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(resource.resource_id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            name="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
