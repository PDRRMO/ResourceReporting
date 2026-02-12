import React from "react";
import BaseMap from "@/components/mapComponent";
import { title } from "process";

export default function App() {
  const myLocations = [
    {
      id: 4,
      longitude: 122.5621,
      latitude: 10.7202,
      title: "Jaro Cathedral",
      description: "National Shrine of Our Lady of Candles",
      type: "watercraft",
      status: "Ready",
      quantity: 1,
    },
    {
      id: 5,
      longitude: 122.545,
      latitude: 10.696,
      title: "Molo Church",
      description: "Gothic-Renaissance Coral Stone Church",
      type: "firetruck",
      status: "Ready",
      quantity: 5,
    },
    {
      id: 6,
      longitude: 122.5714,
      latitude: 10.7276,
      title: "Iloilo River Esplanade",
      description: "Waterfront linear park along Iloilo River",
      type: "tools",
      status: "Ready",
      quantity: 2,
    },
  ];

  return (
    <div className="w-screen h-screen sticky">
      <BaseMap markers={myLocations} />
    </div>
  );
}
