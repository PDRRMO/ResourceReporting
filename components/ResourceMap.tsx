"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Map, {
  Popup,
  NavigationControl,
  GeolocateControl,
  MapRef,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { RESOURCE_CONFIG } from "@/lib/constants";
import { MarkerData, ResourceType, ResourceCounts, MapViewState } from "@/types";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";

interface ResourceMapProps {
  markers: MarkerData[];
  initialViewState?: MapViewState;
  activeZones?: number;
}

const DEFAULT_VIEW_STATE: MapViewState = {
  longitude: 122.5621,
  latitude: 10.7202,
  zoom: 11,
  pitch: 30,
};

export default function ResourceMap({
  markers,
  initialViewState = DEFAULT_VIEW_STATE,
  activeZones = 6,
}: ResourceMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [activeFilters, setActiveFilters] = useState<ResourceType[]>([
    "ver",
    "comm",
    "tools",
    "trucks",
    "watercraft",
    "fr",
    "har",
    "usar",
    "wasar",
    "ews",
    "ems",
    "firetruck",
    "cssr",
    "ambulance",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Filter markers based on active filters and search query
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

  // Convert to GeoJSON
  const geojsonData = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: filteredMarkers.map((m) => ({
        type: "Feature" as const,
        properties: { ...m },
        geometry: {
          type: "Point" as const,
          coordinates: [m.longitude, m.latitude],
        },
      })),
    };
  }, [filteredMarkers]);

  // Calculate resource counts
  const resourceCounts: ResourceCounts = useMemo(() => {
    const counts: ResourceCounts = {};
    activeFilters.forEach((f) => (counts[f] = 0));
    filteredMarkers.forEach((d) => {
      counts[d.type] = (counts[d.type] || 0) + 1;
    });
    return counts;
  }, [filteredMarkers, activeFilters]);

  // Initialize map layers once
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();

    const handleMapLoad = async () => {
      console.log("🗺️ Map loaded, starting image loading...");

      const types: ResourceType[] = [
        "ver",
        "comm",
        "tools",
        "trucks",
        "watercraft",
        "fr",
        "har",
        "usar",
        "wasar",
        "ews",
        "ems",
        "firetruck",
        "cssr",
        "ambulance",
      ];

      // Load all marker images
      for (const type of types) {
        const id = `icon-${type}`;
        const url = `/pins/${type}.png`;

        if (!map.hasImage(id)) {
          try {
            const image = await map.loadImage(url);
            map.addImage(id, image.data);
            console.log(`✅ Loaded ${id}`);
          } catch (error) {
            console.error(`❌ Failed to load ${url}:`, error);
          }
        }
      }


      // Add GeoJSON source with current data (not empty)
      if (!map.getSource("resources")) {
        map.addSource("resources", {
          type: "geojson",
          data: geojsonData,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });
      } else {
        // Update existing source with current data
        const source = map.getSource("resources") as maplibregl.GeoJSONSource;
        source.setData(geojsonData);
      }

      // Add cluster circle layer
      if (!map.getLayer("clusters")) {
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "resources",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#60a5fa",
              10,
              "#3b82f6",
              30,
              "#1d4ed8",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              10,
              30,
              30,
              40,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      }

      // Add cluster count label layer
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

      // Add unclustered point layer with custom icons
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
    };

    // Check if map is already loaded
    if (map.loaded()) {
      handleMapLoad();
    } else {
      map.on("load", handleMapLoad);
    }

    return () => {
      map.off("load", handleMapLoad);
    };
  }, [geojsonData]);



  // Handle map click events
  const onClickMap = useCallback((event: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
    const feature = event.features?.[0];
    if (!feature) return;

    const clusterId = feature.properties?.cluster_id as number | undefined;

    if (clusterId) {
      const mapboxSource = mapRef.current?.getSource("resources") as maplibregl.GeoJSONSource;
      mapboxSource.getClusterExpansionZoom(clusterId).then((zoom: number) => {
        mapRef.current?.flyTo({
          center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: zoom + 1,
          duration: 500,
        });
      }).catch((err: Error) => {
        console.error("Error expanding cluster:", err);
      });
    } else {
      setSelectedMarker(feature.properties as MarkerData);
    }
  }, []);

  // Toggle resource type filter
  const toggleFilter = (type: ResourceType) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="w-full h-screen relative bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        filters={activeFilters}
        toggleFilter={toggleFilter}
        counts={resourceCounts}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeZones={activeZones}
      />

      {/* Search Bar */}
      <SearchBar onSearch={setSearchQuery} sidebarOpen={isSidebarOpen} />

      {/* Map Container */}
      <div className="absolute inset-0 z-0">
        <Map
          ref={mapRef}
          initialViewState={initialViewState}
          mapLib={maplibregl}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
          interactiveLayerIds={["clusters", "unclustered-point"]}
          onClick={onClickMap}
        >
          <NavigationControl position="bottom-right" />
          <GeolocateControl position="bottom-right" />

          {/* Popup for selected marker */}
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
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">
                  {selectedMarker.title}
                </h3>
                <p className="text-slate-600 text-sm mb-3">
                  {selectedMarker.description}
                </p>
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
                <button className="w-full mt-3 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                  View Full Details
                </button>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
}
