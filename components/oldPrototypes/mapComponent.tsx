import React, { useEffect, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MapComponent = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useRef<Map>(null);
  const [lng] = useState(0);
  const [lat] = useState(0);
  const [zoom] = useState(1);

  useEffect(() => {
    if (map.current) return; // This is for checking if there exists a map loaded already

    if (mapContainerRef.current) {
      // Meaning if wla pa sulod or "ready ang map"
      map.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: "",
        center: [lat, lng],
        zoom: zoom,
      });

      map.current.addControl(
        new maplibregl.NavigationControl(),
        "bottom-right",
      );
    }
  }, [lat, lng, zoom]);

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return <div ref={mapContainerRef} className="map-container" />;
};

export default MapComponent;
