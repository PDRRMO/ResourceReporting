"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useNotification } from "@/components/Notification";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Plus, Trash2, Tag, AlertCircle } from "lucide-react";
import type { ResourceType } from "@/lib/database.types";

export default function AdminResourceTypesPage() {
  const { showError, showSuccess } = useNotification();
  const { user, authUser, role, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    full_name: "",
    icon: "package",
  });

  const canAccess = user && authUser && (role === "admin");

  useEffect(() => {
    if (canAccess) {
      fetchResourceTypes();
    }
  }, [canAccess]);

  const fetchResourceTypes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("resource_types")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setResourceTypes(data || []);
    } catch (error) {
      console.error("Error fetching resource types:", error);
      showError("Error", "Failed to load resource types");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.full_name) {
      showError("Validation Error", "Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase.from("resource_types").insert({
        code: formData.code.toLowerCase().replace(/\s+/g, "_"),
        full_name: formData.full_name,
        icon: formData.icon,
      });

      if (error) throw error;

      showSuccess("Success", "Resource type added successfully");
      setShowAddForm(false);
      setFormData({ code: "", full_name: "", icon: "package" });
      fetchResourceTypes();
    } catch (error: unknown) {
      console.error("Error adding resource type:", error);
      const err = error as { message?: string };
      showError("Error", err.message || "Failed to add resource type");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource type?")) return;

    try {
      const { error } = await supabase.from("resource_types").delete().eq("id", id);
      if (error) throw error;

      showSuccess("Deleted", "Resource type deleted successfully");
      fetchResourceTypes();
    } catch (error) {
      console.error("Error deleting resource type:", error);
      showError("Error", "Failed to delete resource type. It may be in use by existing resources.");
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
            <p className="text-slate-500">Only admins can access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header showBackButton={true} backHref="/admin/resources" backLabel="Back to Resources" />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Tag size={24} />
              Resource Types Management
            </h1>
            <p className="text-emerald-100 text-sm mt-1">
              Add and manage resource type categories
            </p>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-700">
                Resource Types ({resourceTypes.length})
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                <Plus size={20} />
                Add Type
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleSubmit} className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-4">Add New Resource Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., ambulance"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">Short identifier (no spaces)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="e.g., Ambulance"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Icon</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="e.g., ambulance"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Lucide icon name</p>
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
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Add Type
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : resourceTypes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No resource types found. Add one to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Full Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Icon</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resourceTypes.map((type) => (
                      <tr key={type.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <code className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm font-mono">
                            {type.code}
                          </code>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{type.full_name}</td>
                        <td className="px-4 py-3 text-slate-600">{type.icon}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(type.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
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
