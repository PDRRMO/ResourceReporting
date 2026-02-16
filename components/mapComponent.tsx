"use client";
import React, { useState } from "react";
import Map, { Marker, Popup, AttributionControl } from "react-map-gl/maplibre";
import ResourcePopup from "./popUpComponent";
import Image from "next/image";
import "maplibre-gl/dist/maplibre-gl.css";

interface BaseMapProps {
  markers?: MarkerData[];
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  className?: string;
}

export interface MarkerData {
  id: string | number;
  longitude: number;
  latitude: number;
  title: string;
  description: string;
  type: string;
  quantity: number;
  createdAt?: string;
  user_id?: string;
  onClose?: () => void;
}

const BaseMap = ({ markers = [], initialViewState }: BaseMapProps) => {
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

  return (
    <Map
      initialViewState={
        initialViewState || {
          longitude: 122.5591,
          latitude: 10.7002,
          zoom: 14,
          pitch: 50,
        }
      }
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
      attributionControl={false}
    >
      {markers.map((m, i) => (
        <Marker
          key={i}
          longitude={m.longitude}
          latitude={m.latitude}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setSelectedMarker(m);
          }}
          style={{ cursor: "pointer" }}
        >
          <Image src={`/pins/${m.type}.png`} alt="pin" height={60} width={60} />
        </Marker>
      ))}
      {selectedMarker && (
        <Popup
          longitude={selectedMarker.longitude}
          latitude={selectedMarker.latitude}
          onClose={() => {
            setSelectedMarker(null);
          }}
          closeOnClick={false}
        >
          <ResourcePopup
            selectedMarker={selectedMarker}
            onClose={() => setSelectedMarker(null)}
          />
        </Popup>
      )}
      <AttributionControl customAttribution="PDRRMO 2026" compact={true} />
    </Map>
  );
};

export default BaseMap;
