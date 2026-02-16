// app/page.tsx
"use client"; // Required for localStorage and hooks
import React, { useState, useEffect } from "react";
import BaseMap from "@/components/mapComponent";

export default function App() {
  const [allMarkers, setAllMarkers] = useState<any[]>([]);

  useEffect(() => {
    // 1. Get user-uploaded pins from localStorage
    const savedData = localStorage.getItem("map-resources");
    const parsedData = savedData ? JSON.parse(savedData) : [];

    setAllMarkers([...parsedData]);
  }, []);

  return (
    <div className="w-screen h-screen">
      <BaseMap markers={allMarkers} />
    </div>
  );
}
