"use client";

import React, { useMemo } from "react";
import { MarkerData, ResourceType, ResourceStatus } from "@/types";
import { RESOURCE_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  Activity,
  CheckCircle2,
  BarChart3,
  PieChart,
} from "lucide-react";

interface DashboardProps {
  markers: MarkerData[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function Dashboard({ markers, isOpen, onToggle }: DashboardProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    // Status counts
    const statusCounts: Record<ResourceStatus, number> = {
      ready: 0,
      deployed: 0,
      maintenance: 0,
    };

    // Type counts
    const typeCounts: Record<ResourceType, number> = {
      ver: 0, comm: 0, tools: 0, trucks: 0, watercraft: 0,
      fr: 0, har: 0, usar: 0, wasar: 0, ews: 0, ems: 0,
      firetruck: 0, cssr: 0, ambulance: 0,
    };

    // Municipality counts
    const municipalityCounts: Record<string, number> = {};

    // Total quantity
    let totalQuantity = 0;

    markers.forEach((marker) => {
      // Count by status
      if (marker.status) {
        statusCounts[marker.status] = (statusCounts[marker.status] || 0) + 1;
      }

      // Count by type
      if (marker.type) {
        typeCounts[marker.type] = (typeCounts[marker.type] || 0) + 1;
      }

      // Count by municipality
      if (marker.municipality) {
        municipalityCounts[marker.municipality] =
          (municipalityCounts[marker.municipality] || 0) + 1;
      }

      // Sum quantities
      totalQuantity += marker.quantity || 0;
    });

    return {
      totalResources: markers.length,
      totalQuantity,
      statusCounts,
      typeCounts,
      municipalityCounts,
    };
  }, [markers]);

  // Get top resource types (sorted by count)
  const topResourceTypes = useMemo(() => {
    return Object.entries(stats.typeCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) as [ResourceType, number][];
  }, [stats.typeCounts]);

  // Get municipalities sorted by count
  const sortedMunicipalities = useMemo(() => {
    return Object.entries(stats.municipalityCounts)
      .sort((a, b) => b[1] - a[1]);
  }, [stats.municipalityCounts]);

  // Calculate readiness percentage
  const readinessPercentage = useMemo(() => {
    if (markers.length === 0) return 0;
    return Math.round((stats.statusCounts.ready / markers.length) * 100);
  }, [stats.statusCounts.ready, markers.length]);

  return (
    <>
      {/* Dashboard Panel */}
      <div
        className={`fixed left-0 top-0 h-full bg-white/95 backdrop-blur-xl shadow-2xl z-30 transform transition-transform duration-300 ease-in-out border-r border-slate-200/50 overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "500px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <LayoutDashboard size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Dashboard</h2>
              <p className="text-xs text-blue-100">Resource Overview</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(100%-80px)] p-5 space-y-6">
          {/* Quick Summary */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <PieChart size={18} className="text-blue-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Quick Summary
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Quantity</span>
                <span className="font-bold">{stats.totalQuantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Resource Types</span>
                <span className="font-bold">{topResourceTypes.length} types</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Municipalities</span>
                <span className="font-bold">
                  {sortedMunicipalities.length} areas
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg per Location</span>
                <span className="font-bold">
                  {sortedMunicipalities.length > 0
                    ? (markers.length / sortedMunicipalities.length).toFixed(1)
                    : 0}{" "}
                  units
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Package size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Total
                </span>
              </div>
              <p className="text-3xl font-black text-blue-900">
                {stats.totalResources}
              </p>
              <p className="text-xs text-blue-600 mt-1">Resources</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                  Ready
                </span>
              </div>
              <p className="text-3xl font-black text-green-900">
                {readinessPercentage}%
              </p>
              <p className="text-xs text-green-600 mt-1">
                {stats.statusCounts.ready} units
              </p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Status Breakdown
              </h3>
            </div>

            <div className="space-y-3">
              {(Object.entries(STATUS_CONFIG) as [ResourceStatus, typeof STATUS_CONFIG[ResourceStatus]][]).map(
                ([status, config]) => {
                  const count = stats.statusCounts[status];
                  const percentage =
                    markers.length > 0
                      ? Math.round((count / markers.length) * 100)
                      : 0;
                  const Icon = config.icon;

                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${config.color}20` }}
                          >
                            <Icon size={16} style={{ color: config.color }} />
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {config.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900">
                            {count}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: config.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Resource Types */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Top Resource Types
              </h3>
            </div>

            <div className="space-y-3">
              {topResourceTypes.length > 0 ? (
                topResourceTypes.map(([type, count]) => {
                  const config = RESOURCE_CONFIG[type];
                  const percentage =
                    markers.length > 0
                      ? Math.round((count / markers.length) * 100)
                      : 0;
                  const Icon = config?.icon || Package;

                  return (
                    <div key={type} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700 truncate">
                            {config?.label || type}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {count}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">
                  No resources available
                </p>
              )}
            </div>
          </div>

          {/* Distribution by Municipality */}
          {sortedMunicipalities.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-slate-400" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  By Municipality
                </h3>
              </div>

              <div className="space-y-2">
                {sortedMunicipalities.slice(0, 6).map(([municipality, count]) => (
                  <div
                    key={municipality}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin size={12} className="text-blue-600" />
                      </div>
                      <span className="text-sm text-slate-700">
                        {municipality}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-1/2 -translate-y-1/2 z-40 w-10 h-20 bg-white/95 backdrop-blur-xl shadow-xl border border-slate-200/50 flex items-center justify-center hover:bg-white transition-all duration-300 group ${
          isOpen ? "left-[500px] rounded-r-2xl" : "left-0 rounded-r-2xl"
        }`}
        title={isOpen ? "Close Dashboard" : "Open Dashboard"}
      >
        {isOpen ? (
          <ChevronLeft
            size={24}
            className="text-slate-600 group-hover:text-blue-600 transition-colors"
          />
        ) : (
          <ChevronRight
            size={24}
            className="text-slate-600 group-hover:text-blue-600 transition-colors"
          />
        )}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
