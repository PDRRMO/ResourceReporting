"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/Header"
import { useAuth } from "@/contexts/AuthContext"
import { useNotification } from "@/components/Notification"
import { Loader2, Mail, Lock, User, Shield } from "lucide-react"
import { type UserRole } from "@/lib/auth"

export default function SignUpPage() {
    const router = useRouter()
    const { signUp } = useAuth()
    const { showError, showSuccess } = useNotification()

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        role: "viewer" as UserRole,
    })

    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            showError("Validation Error", "Passwords do not match")
            return
        }

        if (formData.password.length < 6) {
            showError("Validation Error", "Password must be atleast 6 characters")
            return
        }

        setLoading(true)

        try {
            await signUp(formData.email, formData.password, formData.role)
            showSuccess("Account Created!", "Please check your email to verify your account!")
            router.push("/signin")
        } catch (error: any) {
            showError("Sign Up Failed!", error.message || "Could not create account")
        } finally {
            setLoading(false)
        }
    }

return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header showBackButton={true} backHref="/" backLabel="Back to Home" />
      
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-500 mt-2">Sign up to access the resource mapping system</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <User size={16} className="text-blue-500" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none border"
                placeholder="Enter your full name"
                required
              />
            </div>
            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Mail size={16} className="text-blue-500" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none border"
                placeholder="you@example.com"
                required
              />
            </div>
            {/* Role Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Shield size={16} className="text-blue-500" />
                Account Type
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none border"
              >
                <option value="viewer">Viewer (Read-only access)</option>
                <option value="responder">Responder (Can add/update resources)</option>
                <option value="admin">Admin (Full access)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Choose &quot;Responder&quot; or &quot;Admin&quot; if you need to manage resources
              </p>
            </div>
            {/* Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Lock size={16} className="text-blue-500" />
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none border"
                placeholder="••••••••"
                required
              />
            </div>
            {/* Confirm Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Lock size={16} className="text-blue-500" />
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none border"
                placeholder="••••••••"
                required
              />
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          {/* Login Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}