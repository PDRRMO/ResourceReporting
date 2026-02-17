import { 
  Truck, Wrench, ShieldAlert, Waves, 
  Mountain, Building2, Radio, Activity, Syringe, HardHat 
} from "lucide-react";

export const RESOURCE_CONFIG = {
  "ver": { label: "Vehicle Extrication", icon: Truck, color: "#2563eb" },
  "comm": { label: "Communications", icon: Radio, color: "#2563eb" },
  "tools": { label: "Tools & Equipment", icon: Wrench, color: "#2563eb" },
  "trucks": { label: "General Trucks", icon: Truck, color: "#2563eb" },
  "watercraft": { label: "Watercraft", icon: Waves, color: "#2563eb" },
  "fr": { label: "Fire Rescue", icon: ShieldAlert, color: "#2563eb" },
  "har": { label: "High Altitude Rescue", icon: Mountain, color: "#2563eb" },
  "usar": { label: "Urban Search & Rescue", icon: Building2, color: "#2563eb" },
  "wasar": { label: "Water Search & Rescue", icon: Waves, color: "#2563eb" },
  "ews": { label: "Early Warning System", icon: Radio, color: "#2563eb" },
  "ems": { label: "Emergency Medical", icon: Activity, color: "#2563eb" },
  "firetruck": { label: "Fire Truck", icon: ShieldAlert, color: "#2563eb" },
  "cssr": { label: "Collapsed Structure", icon: HardHat, color: "#2563eb" },
  "ambulance": { label: "Ambulance", icon: Activity, color: "#2563eb" },
} as const;

export type ResourceType = keyof typeof RESOURCE_CONFIG;

// "ver" , "comm" , "tools", "trucks", "watercraft" , "fr" , "har" , "usar" , "wasar" , "ews" , "ems" , "firetruck" , "cssr" , "ambulance"