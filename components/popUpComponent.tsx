import React from "react";
import {
  Truck,
  Wrench,
  ShieldAlert,
  Waves,
  Mountain,
  Building2,
  Radio,
  Activity,
} from "lucide-react";
import type { MarkerData } from "./mapComponent";

// Mapping the filenames from your image to Lucide icons
const getIcon = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("truck") || t.includes("ambulance"))
    return <Truck size={18} />;
  if (t.includes("tool") || t.includes("equipment"))
    return <Wrench size={18} />;
  if (t.includes("fire")) return <ShieldAlert size={18} />;
  if (t.includes("water")) return <Waves size={18} />;
  if (t.includes("altitude")) return <Mountain size={18} />;
  if (t.includes("urban") || t.includes("structure"))
    return <Building2 size={18} />;
  if (t.includes("communication") || t.includes("warning"))
    return <Radio size={18} />;
  return <Activity size={18} />;
};

export default function ResourcePopup(selectedMarker: MarkerData) {
  if (!selectedMarker) return null;

  // Formatting the type from the filename (e.g., "vehicle_extrication" -> "Vehicle Extrication")
  const formatType = (str: string) =>
    str.replace(/_/g, " ").replace(".png", "").toUpperCase();

  return (
    <div className="w-72 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200">
      {/* Blue Accent Header */}
      <div className="flex items-center justify-between bg-blue-600 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          {getIcon(selectedMarker.type)}
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">
            {formatType(selectedMarker.type || "Resource")}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-xs font-bold backdrop-blur-sm">
          QTY: {selectedMarker.quantity || 0}
        </div>
      </div>

      <div className="p-4">
        {/* Name and Status */}
        <div className="mb-3">
          <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
            {selectedMarker.title || "Unassigned Unit"}
          </h3>
          <p className="text-xs font-medium text-blue-600">
            {selectedMarker.status || "Ready for Deployment"}
          </p>
        </div>

        {/* Location Info */}
        <div className="flex items-center gap-4 border-t border-slate-100 pt-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Latitude
            </span>
            <span className="text-xs font-mono font-semibold text-slate-700">
              {selectedMarker.latitude?.toFixed(4)}
            </span>
          </div>
          <div className="flex flex-col border-l border-slate-100 pl-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Longitude
            </span>
            <span className="text-xs font-mono font-semibold text-slate-700">
              {selectedMarker.longitude?.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <button className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95">
          Dispatch Resource
        </button>
      </div>
    </div>
  );
}
