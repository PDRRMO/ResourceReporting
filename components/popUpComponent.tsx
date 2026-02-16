// components/popUpComponent.tsx
import React, { useEffect, useRef } from "react";
import { X, MapPin } from "lucide-react";
import { RESOURCE_CONFIG, type ResourceType } from "@/lib/constants";
import type { MarkerData } from "./mapComponent";

interface PopupProps {
  selectedMarker: MarkerData | null;
  onClose: () => void;
}

export default function ResourcePopup({ selectedMarker, onClose }: PopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run the logic if we actually have a marker
    if (!selectedMarker) return;

    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectedMarker, onClose]);

  // 2. Early return AFTER all hooks have been declared
  if (!selectedMarker) return null;

  const config = RESOURCE_CONFIG[selectedMarker.type as ResourceType] || {
    label: "Unknown",
    icon: MapPin,
  };
  const Icon = config.icon;

  return (
    <div
      ref={popupRef}
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-72 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 animate-in fade-in zoom-in duration-150"
    >
      {/* Header */}
      <div className="bg-blue-600 px-4 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-blue-100" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {config.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {selectedMarker.title}
            </h3>
            <p className="text-xs">{selectedMarker.description}</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg text-center">
            <span className="block text-[9px] font-black text-slate-400 uppercase">
              Qty
            </span>
            <span className="text-lg font-black text-blue-600">
              {selectedMarker.quantity}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Lat</p>
            <p className="font-mono text-xs font-bold text-slate-700">
              {selectedMarker.latitude.toFixed(4)}
            </p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-[9px] font-bold text-slate-400 uppercase">
              Long
            </p>
            <p className="font-mono text-xs font-bold text-slate-700">
              {selectedMarker.longitude.toFixed(4)}
            </p>
          </div>
        </div>

        <button className="mt-5 w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95">
          Deploy Resource
        </button>
      </div>
    </div>
  );
}
