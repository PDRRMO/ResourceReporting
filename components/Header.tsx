"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { TourButton } from "@/components/TourProvider";
import QuickActionsMenu from "@/components/QuickActionsMenu";

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
  showBackButton = false,
  backHref = "/",
  backLabel = "Back to Map",
  showRefresh = false,
  onRefresh,
  isRefreshing = false,
  additionalActions,
  className = "",
  sticky = true,
  tourName,
}: HeaderProps) {
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
            {/* Refresh Button */}
            {showRefresh && onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}

            {/* Quick Actions Burger Menu */}
            <QuickActionsMenu />

            {/* Additional Custom Actions */}
            {additionalActions}

            {/* Tour Button */}
            {tourName && <TourButton tourName={tourName} />}

            {/* Back Button */}
            {showBackButton && (
              <Link
                href={backHref}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 rounded-lg"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">{backLabel}</span>
              </Link>
            )}
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
      showBackButton={false}
      showRefresh={false}
      additionalActions={additionalActions}
    />
  );
}

export function DashboardPageHeader({
  onRefresh,
  isRefreshing = false,
}: {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  return (
    <Header
      showBackButton={true}
      backHref="/map"
      backLabel="Go to Map"
      showRefresh={true}
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
      tourName="dashboard"
    />
  );
}

export function UploadPageHeader() {
  return (
    <Header
      showBackButton={true}
      backHref="/"
      backLabel="Back to Dashboard"
      showRefresh={false}
      tourName="upload"
    />
  );
}

export function SimplePageHeader({
  title,
  subtitle,
  showBackButton = true,
}: {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}) {
  return (
    <Header
      title={title}
      subtitle={subtitle}
      showBackButton={showBackButton}
      showRefresh={false}
    />
  );
}
