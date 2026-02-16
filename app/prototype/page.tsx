"use client"
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  GeolocateControl, 
  Source, 
  Layer, 
  MapRef
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { 
  Search, 
  Filter, 
  Menu, 
  X,
  Ambulance, 
  Flame, 
  ShieldAlert, 
  Package, 
  Truck, 
  Droplet,
  Radio,
  Wrench,
  Waves,
  Mountain,
  Building2,
  Activity,
  HardHat
} from "lucide-react";

// --- 1. TYPES & CONSTANTS ---

export type ResourceType = "ver" | "comm" | "tools" | "trucks" | "watercraft" | "fr" | "har" | "usar" | "wasar" | "ews" | "ems" | "firetruck" | "cssr" | "ambulance"

export interface MarkerData {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  quantity: number;
  latitude: number;
  longitude: number;
  municipality: string;
}

const RESOURCE_CONFIG: Record<ResourceType, { label: string; color:string, icon: any }> = {
  "ver": { label: "Vehicle Extrication", icon: Truck  , color: 'blue'},
  "comm": { label: "Communications", icon: Radio, color: 'blue' },
  "tools": { label: "Tools & Equipment", icon: Wrench, color: 'blue' },
  "trucks": { label: "General Trucks", icon: Truck , color: 'blue'},
  "watercraft": { label: "Watercraft", icon: Waves , color: 'blue'},
  "fr": { label: "Fire Rescue", icon: ShieldAlert , color: 'blue'},
  "har": { label: "High Altitude Rescue", icon: Mountain, color: 'blue' },
  "usar": { label: "Urban Search & Rescue", icon: Building2 , color: 'blue'},
  "wasar": { label: "Water Search & Rescue", icon: Waves, color: 'blue' },
  "ews": { label: "Early Warning System", icon: Radio , color: 'blue'},
  "ems": { label: "Emergency Medical", icon: Activity , color: 'blue'},
  "firetruck": { label: "Fire Truck", icon: ShieldAlert , color: 'blue'},
  "cssr": { label: "Collapsed Structure", icon: HardHat , color: 'blue'},
  "ambulance": { label: "Ambulance", icon: Activity , color: 'blue'},
};

// --- 2. MOCK DATA SERVICE ---

const ILOILO_CENTER = { lat: 10.7202, lng: 122.5621 };

const generateMockData = (): MarkerData[] => {
  const municipalities = ["Iloilo City", "Oton", "Pavia", "Leganes", "Santa Barbara", "Dumangas"];
  const types: ResourceType[] = ["ver" , "comm" , "tools", "trucks", "watercraft" , "fr" , "har" , "usar" , "wasar" , "ews" , "ems" , "firetruck" , "cssr" , "ambulance"];
  
  return Array.from({ length: 150 }).map((_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const lat = ILOILO_CENTER.lat + (Math.random() - 0.5) * 0.4;
    const lng = ILOILO_CENTER.lng + (Math.random() - 0.5) * 0.4;
    
    return {
      id: `marker-${i}`,
      title: `${RESOURCE_CONFIG[type].label} Unit #${i + 1}`,
      description: "Operational and ready for deployment.",
      type,
      quantity: Math.floor(Math.random() * 50) + 1,
      latitude: lat,
      longitude: lng,
      municipality: municipalities[Math.floor(Math.random() * municipalities.length)]
    };
  });
};

// --- 3. COMPONENTS ---

const Sidebar = ({ 
  filters, 
  toggleFilter, 
  counts, 
  isOpen, 
  setIsOpen 
}: { 
  filters: ResourceType[], 
  toggleFilter: (t: ResourceType) => void, 
  counts: Record<ResourceType, number>,
  isOpen: boolean,
  setIsOpen: (v: boolean) => void
}) => {
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute left-4 top-4 z-50 bg-white p-3 rounded-xl shadow-lg hover:bg-slate-50 transition-all text-slate-700"
      >
        <Menu size={24} />
      </button>
    );
  }

  return (
    <div className="absolute left-4 top-4 bottom-4 w-80 bg-white/95 backdrop-blur-sm z-50 rounded-2xl shadow-2xl flex flex-col border border-slate-200 animate-in slide-in-from-left duration-200">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-xl text-slate-800">Iloilo DRRM</h1>
          <p className="text-xs text-slate-500 font-medium">Resource Command Center</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
          <X size={20} />
        </button>
      </div>

      <div className="p-5 grid grid-cols-2 gap-3 bg-slate-50/50">
        <div className="bg-blue-600 rounded-xl p-3 text-white shadow-blue-200 shadow-lg">
          <p className="text-xs opacity-80 uppercase font-bold">Total Assets</p>
          <p className="text-2xl font-black">{Object.values(counts).reduce((a, b) => a + b, 0)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <p className="text-xs text-slate-400 uppercase font-bold">Active Zones</p>
          <p className="text-2xl font-black text-slate-700">6</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter size={12} /> Resource Layers
        </h3>
        <div className="space-y-3">
          {(Object.keys(RESOURCE_CONFIG) as ResourceType[]).map((type) => {
            const config = RESOURCE_CONFIG[type];
            const Icon = config.icon;
            const isActive = filters.includes(type);
            // const isActive = null;
            
            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                  isActive 
                    ? "bg-white border-slate-300 shadow-md translate-x-1" 
                    : "bg-slate-50 border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`p-2 rounded-lg ${isActive ? 'text-white' : 'text-slate-400 bg-slate-200'}`}
                    style={{ backgroundColor: isActive ? config.color : undefined }}
                  >
                    <Icon size={16} />
                  </div>
                  <span className={`text-sm font-semibold ${isActive ? 'text-slate-700' : 'text-slate-500'}`}>
                    {config.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                  {counts[type] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400">PDRRMO Iloilo System v2.0</p>
      </div>
    </div>
  );
};

const SearchBar = ({ onSearch }: { onSearch: (q: string) => void }) => {
  return (
    <div className="absolute top-4 left-0 right-0 md:left-96 md:right-auto md:w-96 mx-4 z-40">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border-none rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg text-sm font-medium transition-all"
          placeholder="Search municipality or resource ID..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

// --- 4. MAIN APP COMPONENT ---

export default function IloiloMapSystem() {
  const mapRef = useRef<MapRef>(null);
  const [data, setData] = useState<MarkerData[]>([]);
  const [activeFilters, setActiveFilters] = useState<ResourceType[]>(["ver"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const mock = generateMockData();
    setData(mock);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesType = activeFilters.includes(item.type);
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.municipality.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [data, activeFilters, searchQuery]);

  const resourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activeFilters.forEach(f => counts[f] = 0); 
    filteredData.forEach(d => {
      counts[d.type] = (counts[d.type] || 0) + 1;
    });
    return counts;
  }, [filteredData, activeFilters]);

  const geojsonData = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: filteredData.map(m => ({
        type: "Feature",
        properties: { ...m },
        geometry: {
          type: "Point",
          coordinates: [m.longitude, m.latitude]
        }
      }))
    };
  }, [filteredData]);

  // --- IMAGE LOADING LOGIC (FIXED WITH STATE) ---
// Remove the onMapLoad callback entirely

useEffect(() => {
  if (!mapRef.current) return;
  
  const map = mapRef.current.getMap();
  
  // Wait for map style to fully load (like your vanilla example)
  map.on('load', async () => {
    console.log('🗺️ Map loaded, starting image loading...');
    
    const types: ResourceType[] = ["ver", "comm", "tools", "trucks", "watercraft", "fr", "har", "usar", "wasar", "ews", "ems", "firetruck", "cssr", "ambulance"];
    
    // Load all images FIRST (like your vanilla example)
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
    
    console.log('🎉 All images loaded!');
    setImagesLoaded(true);
    
    // NOW add the source (if not exists)
    if (!map.getSource('resources')) {
      map.addSource('resources', {
        type: 'geojson',
        data: geojsonData as any,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });
    }
    
    // NOW add the layers (AFTER images are loaded)
    if (!map.getLayer('clusters')) {
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'resources',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#60a5fa', 10, '#3b82f6', 30, '#1d4ed8'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, 10, 30, 30, 40
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
    }
    
    if (!map.getLayer('cluster-count')) {
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'resources',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Noto Sans Regular'],
          'text-size': 14,
        },
        paint: { 'text-color': '#ffffff' }
      });
    }
    
    if (!map.getLayer('unclustered-point')) {
      map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'resources',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': ['concat', 'icon-', ['get', 'type']],
          'icon-size': 0.2,
          'icon-allow-overlap': true
        }
      });
    }
  });
  
}, [mapRef.current, geojsonData]);

// SEPARATE useEffect to update data when filters change
useEffect(() => {
  if (!mapRef.current || !imagesLoaded) return;
  
  const map = mapRef.current.getMap();
  const source = map.getSource('resources') as any;
  
  if (source) {
    console.log('🔄 Updating source with new filtered data');
    source.setData(geojsonData);  
  }
}, [geojsonData, imagesLoaded]); // Re-run when data changes

  
  const onClickMap = (event: any) => {
    const feature = event.features?.[0];
    if (!feature) return;

    const clusterId = feature.properties.cluster_id;

    if (clusterId) {
      const mapboxSource = mapRef.current?.getSource('resources') as any;
      mapboxSource.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;
        mapRef.current?.flyTo({
          center: feature.geometry.coordinates,
          zoom: zoom + 1,
          duration: 500
        });
      });
    } else {
      setSelectedMarker(feature.properties as MarkerData);
    }
  };

  const toggleFilter = (type: ResourceType) => {
    setActiveFilters(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="w-full h-screen relative bg-slate-100 overflow-hidden font-sans">
      <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />

      <Sidebar 
        filters={activeFilters} 
        toggleFilter={toggleFilter} 
        counts={resourceCounts}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <SearchBar onSearch={setSearchQuery} />

      <div className="absolute inset-0 z-0">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: ILOILO_CENTER.lng,
            latitude: ILOILO_CENTER.lat,
            zoom: 11,
            pitch: 0
          }}
          mapLib={maplibregl}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
          interactiveLayerIds={['clusters', 'unclustered-point']}
          onClick={onClickMap}
          // onLoad={onMapLoad}
        >
          <NavigationControl position="bottom-right" />
          <GeolocateControl position="bottom-right" />

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
                    style={{ backgroundColor: RESOURCE_CONFIG[selectedMarker.type]?.color || '#333' }} 
                  />
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {RESOURCE_CONFIG[selectedMarker.type]?.label}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{selectedMarker.title}</h3>
                <p className="text-slate-600 text-sm mb-3">{selectedMarker.description}</p>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase font-bold">Quantity</span>
                    <span className="font-mono font-bold text-slate-700">{selectedMarker.quantity}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase font-bold">Municipality</span>
                    <span className="font-bold text-slate-700 text-xs">{selectedMarker.municipality}</span>
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