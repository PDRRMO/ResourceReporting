import { 
  Truck, Wrench, ShieldAlert, Waves, 
  Mountain, Building2, Radio, Activity, Syringe, HardHat 
} from "lucide-react";

export const RESOURCE_CONFIG = {
  "ver": { label: "Vehicle Extrication", icon: Truck },
  "comm": { label: "Communications", icon: Radio },
  "tools": { label: "Tools & Equipment", icon: Wrench },
  "trucks": { label: "General Trucks", icon: Truck },
  "watercraft": { label: "Watercraft", icon: Waves },
  "fr": { label: "Fire Rescue", icon: ShieldAlert },
  "har": { label: "High Altitude Rescue", icon: Mountain },
  "usar": { label: "Urban Search & Rescue", icon: Building2 },
  "wasar": { label: "Water Search & Rescue", icon: Waves },
  "ews": { label: "Early Warning System", icon: Radio },
  "ems": { label: "Emergency Medical", icon: Activity },
  "firetruck": { label: "Fire Truck", icon: ShieldAlert },
  "cssr": { label: "Collapsed Structure", icon: HardHat },
  "ambulance": { label: "Ambulance", icon: Activity },
} as const;

export type ResourceType = keyof typeof RESOURCE_CONFIG;

// "ver" , "comm" , "tools", "trucks", "watercraft" , "fr" , "har" , "usar" , "wasar" , "ews" , "ems" , "firetruck" , "cssr" , "ambulance"