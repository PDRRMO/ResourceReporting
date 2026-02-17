// components/SearchBar.tsx
"use client";

import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  sidebarOpen?: boolean;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search municipality or resource ID...",
  sidebarOpen = true 
}: SearchBarProps) {
  return (
    <div 
      className={`absolute top-4 left-0 right-0 mx-4 z-40 transition-all duration-200 ${
        sidebarOpen ? "md:left-96 md:right-auto md:w-96" : ""
      }`}
    >
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border-none rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg text-sm font-medium transition-all"
          placeholder={placeholder}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
