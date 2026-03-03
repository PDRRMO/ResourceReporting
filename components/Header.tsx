"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { TourButton } from "@/components/TourProvider";
import QuickActionsMenu from "@/components/QuickActionsMenu";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  /** Title displayed in the header */
  title?: string;
  /** Subtitle displayed below the title */
  subtitle?: string;
  /** Whether to show the back button */
  showBackButton?: boolean;
  /** URL for the back button (defaults to "/") */
  backHref?: string;
  /** Label for the back button */
  backLabel?: string;
  /** Whether to show refresh button */
  showRefresh?: boolean;
  /** Callback when refresh is clicked */
  onRefresh?: () => void;
  /** Whether refresh is loading */
  isRefreshing?: boolean;
  /** Additional actions to show on the right side */
  additionalActions?: React.ReactNode;
  /** Custom className for the header */
  className?: string;
  /** Whether header should be sticky */
  sticky?: boolean;
  /** Tour name to show tour button (dashboard, map, upload) */
  tourName?: string;
}

export default function Header({
  title = "PDRRMO Iloilo",
  subtitle = "Resource Management System",
  additionalActions,
  className = "",
  sticky = true,
  tourName,
}: HeaderProps) {
  const { user, authUser, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <header
      className={`bg-white shadow-sm border-b border-slate-200 z-50 ${
        sticky ? "sticky top-0" : ""
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Image
                src="/logo.png"
                alt="PDRRMO Logo"
                width={32}
                height={32}
                className="object-contain w-8 h-8 sm:w-10 sm:h-10"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">{title}</h1>
              <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Actions Burger Menu */}
            <QuickActionsMenu />

            {/* Auth Buttons */}
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                      <UserIcon size={16} className="text-slate-600" />
                      <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                        {authUser?.email?.split('@')[0]}
                      </span>
                      {authUser?.role && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          authUser.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          authUser.role === 'responder' ? 'bg-green-100 text-green-700' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {authUser.role}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sign out"
                    >
                      <LogOut size={18} />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/signin"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <LogIn size={18} />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                )}
              </>
            )}

            {/* Additional Custom Actions */}
            {additionalActions}

            {/* Tour Button */}
            {tourName && <TourButton tourName={tourName} />}
          </div>
        </div>
      </div>
    </header>
  );
}

// Pre-configured headers for common use cases

export function MapPageHeader({
  additionalActions,
}: {
  additionalActions?: React.ReactNode;
}) {
  return (
    <Header
      additionalActions={additionalActions}
    />
  );
}

export function DashboardPageHeader() {
  return (
    <Header
      tourName="dashboard"
    />
  );
}

export function UploadPageHeader() {
  return (
    <Header
      tourName="upload"
    />
  );
}

export function SimplePageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Header
      title={title}
      subtitle={subtitle}
    />
  );
}
