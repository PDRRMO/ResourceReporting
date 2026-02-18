"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Map, {
  Popup,
  NavigationControl,
  GeolocateControl,
  MapRef,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { RESOURCE_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import { MarkerData, ResourceType, ResourceCounts, MapViewState, ResourceStatus } from "@/types";

interface ResourceMapProps {
  markers: MarkerData[];
  initialViewState?: MapViewState;
  activeZones?: number;
  onMarkerSelect?: (marker: MarkerData | null) => void;
  selectedMarker?: MarkerData | null;
  activeFilters?: ResourceType[];
  searchQuery?: string;
}

const DEFAULT_VIEW_STATE: MapViewState = {
  longitude: 122.5621,
  latitude: 10.7202,
  zoom: 11,
  pitch: 30,
};

const ALL_RESOURCE_TYPES: ResourceType[] = [
  "ver", "comm", "tools", "trucks", "watercraft",
  "fr", "har", "usar", "wasar", "ews", "ems",
  "firetruck", "cssr", "ambulance"
];

export default function ResourceMap({
  markers,
  initialViewState = DEFAULT_VIEW_STATE,
  activeZones = 6,
  onMarkerSelect,
  selectedMarker: externalSelectedMarker,
  activeFilters: externalFilters,
  searchQuery: externalSearchQuery,
}: ResourceMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [internalFilters, setInternalFilters] = useState<ResourceType[]>(ALL_RESOURCE_TYPES);
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalSelectedMarker, setInternalSelectedMarker] = useState<MarkerData | null>(null);

  // Track whether the map + images are ready to receive data
  const [mapReady, setMapReady] = useState(false);

  const activeFilters = externalFilters !== undefined ? externalFilters : internalFilters;
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const selectedMarker = externalSelectedMarker !== undefined ? externalSelectedMarker : internalSelectedMarker;

  const setSelectedMarker = (marker: MarkerData | null) => {
    setInternalSelectedMarker(marker);
    onMarkerSelect?.(marker);
  };

  // Filter markers
  const filteredMarkers = useMemo(() => {
    return markers.filter((item) => {
      const matchesType = activeFilters.includes(item.type);
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [markers, activeFilters, searchQuery]);

  // Build GeoJSON
 const geojsonData = useMemo(() => {
  const validMarkers = filteredMarkers.filter(
    (m) =>
      m.longitude != null &&        // catches null AND undefined
      m.latitude != null &&
      typeof m.longitude === "number" &&
      typeof m.latitude === "number" &&
      isFinite(m.longitude) &&      // catches NaN and Infinity
      isFinite(m.latitude) &&
      m.longitude >= -180 && m.longitude <= 180 &&  // valid lng range
      m.latitude >= -90 && m.latitude <= 90          // valid lat range
  );

    return {
      type: "FeatureCollection" as const,
      features: validMarkers.map((m) => ({
        type: "Feature" as const,
        properties: { ...m },
        geometry: {
          type: "Point" as const,
          coordinates: [m.longitude, m.latitude],
        },
      })),
    };
  }, [filteredMarkers]);

  // Keep a ref so initializeMap always reads fresh data
  // Think of this like a whiteboard that anyone can read at any time,
  // vs. a photocopy (closure) that's frozen at one moment
  const geojsonDataRef = useRef(geojsonData);
  useEffect(() => {
    geojsonDataRef.current = geojsonData;
  }, [geojsonData]);

  // Step 1: Initialize map layers + images ONCE
// Remove this entire useEffect block:
// useEffect(() => {
//   if (!mapRef.current) return;
//   const map = mapRef.current.getMap();
//   const initializeMap = async () => { ... }
//   if (map.loaded()) { ... } else { map.once("load", initializeMap); }
// }, []);

// Replace with a plain async function:
  const initializeMap = async () => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    const loadPromises = ALL_RESOURCE_TYPES.map(async (type) => {
      const id = `icon-${type}`;
      const url = `/pins/${type}.png`;
      if (!map.hasImage(id)) {
        try {
          const image = await map.loadImage(url);
          map.addImage(id, image.data);
        } catch (error) {
          console.error(`Failed to load ${url}:`, error);
        }
      }
    });
    await Promise.all(loadPromises);

    if (!map.getSource("resources")) {
      map.addSource("resources", {
        type: "geojson",
        data: geojsonDataRef.current,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });
    }

    if (!map.getLayer("clusters")) {
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "resources",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": ["step", ["get", "point_count"], "#60a5fa", 10, "#3b82f6", 30, "#1d4ed8"],
          "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 30, 40],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
    }

    if (!map.getLayer("cluster-count")) {
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "resources",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Noto Sans Regular"],
          "text-size": 14,
        },
        paint: { "text-color": "#ffffff" },
      });
    }

    if (!map.getLayer("unclustered-point")) {
      map.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "resources",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": ["concat", "icon-", ["get", "type"]],
          "icon-size": 0.2,
          "icon-allow-overlap": true,
        },
      });
    }

    setMapReady(true);
  };

  // Step 2: Push updated GeoJSON whenever data OR map readiness changes
  // Like a delivery driver — they only deliver once the warehouse is open (mapReady)
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current.getMap();
    const source = map.getSource("resources") as maplibregl.GeoJSONSource | undefined;

    if (source) {
      source.setData(geojsonData);
    }
  }, [geojsonData, mapReady]); // ✅ fires when data changes AND when map first becomes ready

  // Handle center-map events from parent
  useEffect(() => {
    const handleCenterMap = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { latitude, longitude } = customEvent.detail;
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: 14,
        duration: 1000,
      });
    };
    window.addEventListener("center-map", handleCenterMap);
    return () => window.removeEventListener("center-map", handleCenterMap);
  }, []);

  // Handle map click
  const onClickMap = (
    event: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }
  ) => {
    const feature = event.features?.[0];
    if (!feature) return;

    const clusterId = feature.properties?.cluster_id as number | undefined;

    if (clusterId) {
      const source = mapRef.current?.getSource("resources") as maplibregl.GeoJSONSource;
      source
        .getClusterExpansionZoom(clusterId)
        .then((zoom: number) => {
          mapRef.current?.flyTo({
            center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom + 1,
            duration: 500,
          });
        })
        .catch((err: Error) => console.error("Error expanding cluster:", err));
    } else {
      const markerData = feature.properties as MarkerData;
      setSelectedMarker(markerData);
      
      // Center map on the selected marker
      mapRef.current?.flyTo({
        center: [markerData.longitude, markerData.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 13),
        duration: 500,
        essential: true
      });
    }
  };

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapLib={maplibregl}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        interactiveLayerIds={["clusters", "unclustered-point"]}
        onClick={onClickMap}
        onLoad={initializeMap}
      >
        {/* <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" /> */}

        {selectedMarker && (
          <Popup
            longitude={selectedMarker.longitude}
            latitude={selectedMarker.latitude}
            onClose={() => setSelectedMarker(null)}
            closeOnClick={false}
            className="z-50"
            maxWidth="320px"
            anchor="bottom"
            offset={25}
          >
            <div className="p-1">
              {/* Resource Type Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      RESOURCE_CONFIG[selectedMarker.type]?.color || "#333",
                  }}
                />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {RESOURCE_CONFIG[selectedMarker.type]?.label}
                </span>
              </div>
              
              {/* Title */}
              <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">
                {selectedMarker.title}
              </h3>
              
              {/* Status Badge - Prominent */}
              {selectedMarker.status && (() => {
                const statusConfig = STATUS_CONFIG[selectedMarker.status];
                const StatusIcon = statusConfig.icon;
                return (
                  <div className={`flex items-center gap-3 mb-3 px-3 py-2 rounded-lg justify-center ${
                    selectedMarker.status === 'ready' ? 'bg-green-50 border border-green-200' : 
                    selectedMarker.status === 'deployed' ? 'bg-orange-50 border border-orange-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div 
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{ backgroundColor: statusConfig.color, boxShadow: `0 0 10px ${statusConfig.color}` }}
                    />
                    <span className={`text-sm font-bold flex items-center gap-2 justify-center ${
                      selectedMarker.status === 'ready' ? 'text-green-700' : 
                      selectedMarker.status === 'deployed' ? 'text-orange-700' : 'text-yellow-700'
                    }`}>
                      <StatusIcon size={16} />
                      {statusConfig.label}
                    </span>
                  </div>
                );
              })()}
              
              {/* Description */}
              <p className="text-slate-600 text-sm mb-3">
                {selectedMarker.description}
              </p>
              
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase font-bold">
                    Quantity
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {selectedMarker.quantity}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase font-bold">
                    Municipality
                  </span>
                  <span className="font-bold text-slate-700 text-xs">
                    {selectedMarker.municipality}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}