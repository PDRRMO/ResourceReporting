"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MarkerData, ResourceType, ResourceStatus } from "@/types";
import { RESOURCE_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import {
  LayoutDashboard,
  ArrowLeft,
  Package,
  MapPin,
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart3,
  PieChart,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  Truck,
  Shield,
  Building,
  Zap,
  MoreHorizontal,
  FileText,
  Map,
  Search,
} from "lucide-react";

// Type definitions
interface DashboardStats {
  totalResources: number;
  totalQuantity: number;
  readyCount: number;
  deployedCount: number;
  maintenanceCount: number;
  readinessPercentage: number;
  deploymentPercentage: number;
  maintenancePercentage: number;
  averagePerMunicipality: number;
  topMunicipality: { name: string; count: number };
  mostCommonType: { type: string; count: number };
  lastUpdated: Date | null;
}

interface StatusDistribution {
  status: ResourceStatus;
  count: number;
  percentage: number;
  change: number;
}

interface TypeDistribution {
  type: ResourceType;
  count: number;
  percentage: number;
}

interface MunicipalityStats {
  name: string;
  count: number;
  ready: number;
  deployed: number;
  maintenance: number;
  percentage: number;
}

// Mock data generators for demonstration
const generateMockResources = (): MarkerData[] => {
  const municipalities = ["Iloilo City", "Oton", "Pavia", "Leganes", "Santa Barbara", "Dumangas"];
  const types: ResourceType[] = ["ver", "comm", "tools", "trucks", "watercraft", "fr", "har", "usar", "wasar", "ews", "ems", "firetruck", "cssr", "ambulance"];
  const statuses: ResourceStatus[] = ["ready", "deployed", "maintenance"];
  
  const resources: MarkerData[] = [];
  
  for (let i = 0; i < 45; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const municipality = municipalities[Math.floor(Math.random() * municipalities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    resources.push({
      id: `resource-${i}`,
      title: `${RESOURCE_CONFIG[type]?.label || type} Unit ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 100)}`,
      description: `Emergency response unit for ${type} operations`,
      type,
      quantity: Math.floor(Math.random() * 8) + 1,
      latitude: 10.720321 + (Math.random() - 0.5) * 0.1,
      longitude: 122.562019 + (Math.random() - 0.5) * 0.1,
      municipality,
      status,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  return resources;
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp,
  color,
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color: string;
  delay?: number;
}) => (
  <div
    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-in slide-in-from-bottom-4"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-2">{value}</h3>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={28} style={{ color }} />
      </div>
    </div>
  </div>
);

// Status Card Component
const StatusCard = ({
  status,
  count,
  percentage,
  change,
  delay = 0,
}: StatusDistribution & { delay?: number }) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon size={24} style={{ color: config.color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900">{config.label}</h4>
            <span className="text-2xl font-black text-slate-900">{count}</span>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{percentage}% of total</span>
              <span className={`font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%`, backgroundColor: config.color }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Resource Type Card Component
const TypeCard = ({
  type,
  count,
  percentage,
  delay = 0,
}: TypeDistribution & { delay?: number }) => {
  const config = RESOURCE_CONFIG[type];
  const Icon = config?.icon || Package;
  
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 truncate">{config?.label || type}</h4>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-bold text-slate-700">{count}</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 font-medium">{percentage}%</span>
    </div>
  );
};

// Municipality Row Component
const MunicipalityRow = ({
  name,
  count,
  ready,
  deployed,
  maintenance,
  percentage,
  index,
}: MunicipalityStats & { index: number }) => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all duration-200">
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
      #{index + 1}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-slate-900">{name}</h4>
      <div className="flex items-center gap-4 mt-1 text-xs">
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle2 size={12} />
          {ready} ready
        </span>
        <span className="flex items-center gap-1 text-orange-600">
          <Activity size={12} />
          {deployed} deployed
        </span>
        <span className="flex items-center gap-1 text-yellow-600">
          <Clock size={12} />
          {maintenance} maint.
        </span>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xl font-black text-slate-900">{count}</p>
      <p className="text-xs text-slate-400">{percentage}% of total</p>
    </div>
  </div>
);

// Activity Item Component
const ActivityItem = ({
  title,
  description,
  time,
  type,
  delay = 0,
}: {
  title: string;
  description: string;
  time: string;
  type: 'added' | 'updated' | 'deployed' | 'maintenance';
  delay?: number;
}) => {
  const typeConfig = {
    added: { color: '#22c55e', icon: PlusIcon, label: 'Added' },
    updated: { color: '#2563eb', icon: RefreshCw, label: 'Updated' },
    deployed: { color: '#f97316', icon: Activity, label: 'Deployed' },
    maintenance: { color: '#eab308', icon: Clock, label: 'Maintenance' },
  };
  
  const config = typeConfig[type];
  const Icon = config.icon;
  
  return (
    <div
      className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all duration-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${config.color}15` }}
      >
        <Icon size={18} style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-900">{title}</h4>
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ backgroundColor: `${config.color}15`, color: config.color }}
          >
            {config.label}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
        <p className="text-xs text-slate-400 mt-2">{time}</p>
      </div>
    </div>
  );
};

// Plus Icon for activity
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

// Quick Action Button
const QuickAction = ({
  icon: Icon,
  label,
  href,
  color,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  color: string;
  delay?: number;
}) => (
  <Link
    href={href}
    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
      style={{ backgroundColor: `${color}15` }}
    >
      <Icon size={24} style={{ color }} />
    </div>
    <span className="font-semibold text-slate-700 group-hover:text-slate-900">{label}</span>
    <ChevronRight size={18} className="ml-auto text-slate-400 group-hover:text-slate-600" />
  </Link>
);

export default function DashboardPage() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load data
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem("map-resources");
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setMarkers(parsed);
        } else {
          // Use mock data if no saved data
          setMarkers(generateMockResources());
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setMarkers(generateMockResources());
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const savedData = localStorage.getItem("map-resources");
      if (savedData) {
        setMarkers(JSON.parse(savedData));
      }
      setLastRefresh(new Date());
      setIsLoading(false);
    }, 500);
  };

  // Calculate comprehensive statistics
  const stats = useMemo((): DashboardStats => {
    const totalResources = markers.length;
    const totalQuantity = markers.reduce((sum, m) => sum + (m.quantity || 0), 0);
    
    const readyCount = markers.filter(m => m.status === 'ready').length;
    const deployedCount = markers.filter(m => m.status === 'deployed').length;
    const maintenanceCount = markers.filter(m => m.status === 'maintenance').length;
    
    const readinessPercentage = totalResources > 0 ? Math.round((readyCount / totalResources) * 100) : 0;
    const deploymentPercentage = totalResources > 0 ? Math.round((deployedCount / totalResources) * 100) : 0;
    const maintenancePercentage = totalResources > 0 ? Math.round((maintenanceCount / totalResources) * 100) : 0;
    
    // Municipality stats
    const municipalityCounts: Record<string, number> = {};
    markers.forEach(m => {
      municipalityCounts[m.municipality] = (municipalityCounts[m.municipality] || 0) + 1;
    });
    
    const municipalityEntries = Object.entries(municipalityCounts);
    const averagePerMunicipality = municipalityEntries.length > 0
      ? Math.round(totalResources / municipalityEntries.length)
      : 0;
    
    const topMunicipality: [string, number] = municipalityEntries.length > 0
      ? municipalityEntries.sort((a, b) => (b[1] as number) - (a[1] as number))[0] as [string, number]
      : ['None', 0];
    
    // Most common type
    const typeCounts: Record<string, number> = {};
    markers.forEach(m => {
      typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
    });
    
    const mostCommonTypeEntry: [string, number] = Object.entries(typeCounts).length > 0
      ? Object.entries(typeCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0] as [string, number]
      : ['none', 0];
    
    return {
      totalResources,
      totalQuantity,
      readyCount,
      deployedCount,
      maintenanceCount,
      readinessPercentage,
      deploymentPercentage,
      maintenancePercentage,
      averagePerMunicipality,
      topMunicipality: { name: topMunicipality[0], count: topMunicipality[1] },
      mostCommonType: { type: mostCommonTypeEntry[0], count: mostCommonTypeEntry[1] },
      lastUpdated: markers.length > 0
        ? new Date(Math.max(...markers.map(m => new Date(m.createdAt || 0).getTime())))
        : null,
    };
  }, [markers]);

  // Status distribution
  const statusDistribution = useMemo((): StatusDistribution[] => {
    const total = markers.length;
    return [
      {
        status: 'ready',
        count: stats.readyCount,
        percentage: stats.readinessPercentage,
        change: 5, // Mock change - in real app would compare to previous period
      },
      {
        status: 'deployed',
        count: stats.deployedCount,
        percentage: stats.deploymentPercentage,
        change: -2,
      },
      {
        status: 'maintenance',
        count: stats.maintenanceCount,
        percentage: stats.maintenancePercentage,
        change: 1,
      },
    ];
  }, [markers, stats]);

  // Type distribution (top 8)
  const typeDistribution = useMemo((): TypeDistribution[] => {
    const typeCounts: Record<ResourceType, number> = {
      ver: 0, comm: 0, tools: 0, trucks: 0, watercraft: 0,
      fr: 0, har: 0, usar: 0, wasar: 0, ews: 0, ems: 0,
      firetruck: 0, cssr: 0, ambulance: 0,
    };
    
    markers.forEach(m => {
      typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
    });
    
    const total = markers.length;
    
    return Object.entries(typeCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([type, count]) => ({
        type: type as ResourceType,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }));
  }, [markers]);

  // Municipality stats
  const municipalityStats = useMemo((): MunicipalityStats[] => {
    const stats: Record<string, { count: number; ready: number; deployed: number; maintenance: number }> = {};
    
    markers.forEach(m => {
      if (!stats[m.municipality]) {
        stats[m.municipality] = { count: 0, ready: 0, deployed: 0, maintenance: 0 };
      }
      stats[m.municipality].count++;
      stats[m.municipality][m.status]++;
    });
    
    const total = markers.length;
    
    return Object.entries(stats)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({
        name,
        count: data.count,
        ready: data.ready,
        deployed: data.deployed,
        maintenance: data.maintenance,
        percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
      }));
  }, [markers]);

  // Recent activity (mock data based on actual resources)
  const recentActivity = useMemo(() => {
    return markers
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5)
      .map((m, i) => ({
        title: m.title,
        description: `${RESOURCE_CONFIG[m.type]?.label || m.type} in ${m.municipality}`,
        time: m.createdAt
          ? new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : 'Recently',
        type: ['added', 'updated', 'deployed', 'maintenance'][i % 4] as 'added' | 'updated' | 'deployed' | 'maintenance',
      }));
  }, [markers]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="dashboard-header bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="relative w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Image src="/logo.png" alt="PDRRMO Logo" width={32} height={32} className="object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">PDRRMO Iloilo</h1>
                <p className="text-xs text-slate-500">Resource Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back to Map</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <LayoutDashboard size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
              <p className="text-sm text-slate-500">
                Last updated: {lastRefresh.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Key Statistics Grid */}
        <div className="key-stats-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Resources"
            value={stats.totalResources}
            subtitle={`${stats.totalQuantity} total units`}
            icon={Package}
            trend="+12% from last month"
            trendUp={true}
            color="#2563eb"
            delay={0}
          />
          <StatCard
            title="Ready to Deploy"
            value={stats.readyCount}
            subtitle={`${stats.readinessPercentage}% readiness rate`}
            icon={CheckCircle2}
            trend="+5% from last week"
            trendUp={true}
            color="#22c55e"
            delay={100}
          />
          <StatCard
            title="Currently Deployed"
            value={stats.deployedCount}
            subtitle="Active operations"
            icon={Activity}
            trend="-2% from yesterday"
            trendUp={false}
            color="#f97316"
            delay={200}
          />
          <StatCard
            title="Under Maintenance"
            value={stats.maintenanceCount}
            subtitle="Scheduled repairs"
            icon={Clock}
            trend="+1 from last week"
            trendUp={false}
            color="#eab308"
            delay={300}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Status & Types */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Distribution */}
            <section className="status-distribution-section bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <PieChart size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Status Distribution</h3>
                    <p className="text-sm text-slate-500">Current operational status of all resources</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statusDistribution.map((status, index) => (
                  <StatusCard key={status.status} {...status} delay={index * 100} />
                ))}
              </div>
            </section>

            {/* Resource Types */}
            <section className="resource-types-section bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <BarChart3 size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Resource Types</h3>
                    <p className="text-sm text-slate-500">Distribution by equipment category</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {typeDistribution.map((type, index) => (
                  <TypeCard key={type.type} {...type} delay={index * 50} />
                ))}
              </div>
            </section>

            {/* Municipalities Breakdown */}
            <section className="municipalities-section bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Building size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Municipality Distribution</h3>
                    <p className="text-sm text-slate-500">Resources organized by location</p>
                  </div>
                </div>
                <span className="text-sm text-slate-500">
                  {municipalityStats.length} municipalities
                </span>
              </div>
              <div className="space-y-3">
                {municipalityStats.map((municipality, index) => (
                  <MunicipalityRow key={municipality.name} {...municipality} index={index} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Activity & Quick Actions */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <section className="quick-actions-section bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Zap size={24} className="text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <QuickAction
                  icon={Map}
                  label="View Live Map"
                  href="/"
                  color="#2563eb"
                  delay={0}
                />
                <QuickAction
                  icon={PlusIcon}
                  label="Add New Resource"
                  href="/upload"
                  color="#22c55e"
                  delay={100}
                />
                <QuickAction
                  icon={Search}
                  label="Search Resources"
                  href="/"
                  color="#8b5cf6"
                  delay={200}
                />
                <QuickAction
                  icon={FileText}
                  label="Generate Report"
                  href="#"
                  color="#f59e0b"
                  delay={300}
                />
              </div>
            </section>

            {/* Summary Stats */}
            <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-400" />
                Summary Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Average per Municipality</span>
                  <span className="font-bold text-lg">{stats.averagePerMunicipality}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Top Municipality</span>
                  <span className="font-bold">{stats.topMunicipality.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Most Common Type</span>
                  <span className="font-bold">{RESOURCE_CONFIG[stats.mostCommonType.type as ResourceType]?.label || stats.mostCommonType.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Readiness Rate</span>
                  <span className={`font-bold text-lg ${stats.readinessPercentage >= 70 ? 'text-green-400' : stats.readinessPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {stats.readinessPercentage}%
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">System Status</span>
                  <span className="flex items-center gap-2 text-sm text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    Operational
                  </span>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="recent-activity-section bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Activity size={24} className="text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                </div>
              </div>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <ActivityItem key={index} {...activity} delay={index * 100} />
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-8">No recent activity</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>PDRRMO Iloilo Province Resource Management System</p>
            <p> 2024 All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
