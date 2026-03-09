"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/components/Notification";
import { getUserProfile, updateUserProfile } from "@/lib/userProfiles";
import { type UserProfile } from "@/lib/database.types";
import { type UserRole } from "@/lib/auth";
import {
  Loader2,
  User,
  Mail,
  Shield,
  Camera,
  Save,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    role: "viewer" as UserRole,
  });

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      const profileData = await getUserProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || "",
          role: (profileData.role as UserRole) || "viewer",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      showError("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user, showError]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
      return;
    }

    if (user) {
      loadProfile();
    }
  }, [user, authLoading, router, loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await updateUserProfile(user.id, {
        full_name: formData.full_name,
        role: formData.role,
      });
      showSuccess("Profile Updated!", "Your profile has been saved successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      showError("Update Failed", error instanceof Error ? error.message : "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-slate-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header
        showBackButton={true}
        backHref="/"
        backLabel="Back to Home"
        title="My Profile"
        subtitle="Manage your account settings"
      />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border-4 border-white/30">
                  {profile.full_name ? (
                    <span className="text-4xl font-bold text-white">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User size={40} className="text-white/70" />
                  )}
                </div>
                <button
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Change profile picture"
                >
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">
                {profile.full_name || "Your Profile"}
              </h2>
              <p className="text-blue-100 text-sm">{profile.email}</p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <User size={16} className="text-blue-500" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none border"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Mail size={16} className="text-blue-500" />
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-xl border-slate-200 bg-slate-100 p-3.5 text-sm text-slate-500 cursor-not-allowed border"
              />
              <p className="text-xs text-slate-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Shield size={16} className="text-blue-500" />
                Account Type
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserRole })
                }
                className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none border"
              >
                <option value="viewer">Viewer (Read-only access)</option>
                <option value="responder">Responder (Can add/update resources)</option>
                <option value="admin">Admin (Full access)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Contact an administrator if you need to change your role
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
            Account Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Account ID</span>
              <span className="text-slate-700 font-mono text-xs truncate max-w-[200px]">
                {profile.user_id}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Member Since</span>
              <span className="text-slate-700">
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
