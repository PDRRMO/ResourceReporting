"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/Header"
import { useNotification } from "@/components/Notification"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, Mail, Lock } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const { signIn } = useAuth()
    const { showError, showSuccess } = useNotification()

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()

        setLoading(true)

        try {
            await signIn(formData.email, formData.password)
            showSuccess("Login Successful", "Welcome back!")
            router.push("/")
        } catch (error: any) {
            showError("Login Failed!", error.message || "Invalid Email or Password!")
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
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 mt-2">Sign in to access the resource mapping system</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
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
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          {/* Signup Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
    )
}