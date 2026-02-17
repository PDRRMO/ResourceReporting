// types/index.ts
// Shared type definitions for the Resource Mapping Application

export type ResourceType = 
  | "ver" 
  | "comm" 
  | "tools" 
  | "trucks" 
  | "watercraft" 
  | "fr" 
  | "har" 
  | "usar" 
  | "wasar" 
  | "ews" 
  | "ems" 
  | "firetruck" 
  | "cssr" 
  | "ambulance";

export interface MarkerData {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  quantity: number;
  latitude: number;
  longitude: number;
  municipality: string;
  createdAt?: string;
  user_id?: string;
}

export interface ResourceConfig {
  label: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
}

export interface FilterState {
  activeTypes: ResourceType[];
  searchQuery: string;
}

export interface ResourceCounts {
  [key: string]: number;
}
