# Software Requirements Specification (SRS)

## Document Information
- **Project Name**: Resource Mapping Application
- **Version**: 0.1.0
- **Last Updated**: February 17, 2026
- **Organization**: PDRRMO Iloilo (Provincial Disaster Risk Reduction and Management Office)
- **System Version**: v2.0

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification document describes the functional and non-functional requirements for the Resource Mapping Application. The system is designed to visualize and manage disaster response resources across Iloilo province using an interactive web-based mapping interface.

### 1.2 Scope
The Resource Mapping Application provides real-time tracking and visualization of emergency response resources including vehicles, equipment, medical units, and specialized rescue teams. The system serves as a Command Center for disaster management operations.

### 1.3 Intended Audience
- Disaster Risk Reduction and Management Officers
- Emergency Response Coordinators
- Municipal/City Government Officials
- Search and Rescue Teams
- Medical Response Units

---

## 2. Current Features

### 2.1 Core Features

#### 2.1.1 Interactive Map Visualization
- Full-screen interactive map using MapLibre GL
- OpenFreeMap integration for base map tiles (Liberty style)
- Custom marker icons for different resource types
- Cluster visualization for dense resource areas
- Smooth zoom and pan functionality
- Pitch control for 3D perspective viewing (up to 50°)

#### 2.1.2 Resource Management
- **14 Resource Types Supported**:
  1. Vehicle Extrication (ver)
  2. Communications (comm)
  3. Tools & Equipment (tools)
  4. General Trucks (trucks)
  5. Watercraft (watercraft)
  6. Fire Rescue (fr)
  7. High Altitude Rescue (har)
  8. Urban Search & Rescue (usar)
  9. Water Search & Rescue (wasar)
  10. Early Warning System (ews)
  11. Emergency Medical (ems)
  12. Fire Truck (firetruck)
  13. Collapsed Structure (cssr)
  14. Ambulance (ambulance)

#### 2.1.3 Resource Registration (/upload)
- Form-based resource registration interface
- **Fields**:
  - Resource Name / Unit ID (required)
  - Resource Type dropdown (required)
  - Quantity / Personnel (required)
  - Latitude (GPS coordinates)
  - Longitude (GPS coordinates)
  - Additional Details (description)
- **GPS Location Detection**:
  - Automatic geolocation via browser API
  - High accuracy positioning enabled
  - Manual coordinate input fallback
- LocalStorage persistence for offline capability

#### 2.1.4 Resource Viewing (/)
- Map-based resource display
- Popup details on marker click
- Resource information displayed:
  - Resource type with icon
  - Title/Unit ID
  - Description
  - Quantity
  - GPS coordinates (Lat/Long)
  - Deploy Resource button
- Data loaded from localStorage

#### 2.1.5 Advanced Prototype Interface (/prototype)
- **Dashboard Sidebar**:
  - Resource filtering by type
  - Live count statistics
  - Total assets counter
  - Active zones indicator (6 zones)
  - Collapsible menu interface
- **Search Functionality**:
  - Municipality-based search
  - Resource ID search
  - Real-time filtering
- **Map Controls**:
  - Navigation control (zoom in/out)
  - Geolocation control (center on user)
- **Cluster Visualization**:
  - Automatic clustering of nearby resources
  - Cluster expansion on click
  - Color-coded by density (10, 30, 50+ items)
  - Click to zoom and expand
- **Popup Information**:
  - Resource type with color indicator
  - Title and description
  - Quantity and municipality
  - View Full Details button

### 2.2 User Interface Features
- Responsive design for desktop and mobile
- Modern UI with Tailwind CSS styling
- Smooth animations and transitions
- Color-coded resource types
- Professional emergency management aesthetic
- High contrast for outdoor/field use

---

## 3. Use Cases

### 3.1 Primary Use Cases

#### UC-001: Register New Resource
**Actor**: Field Officer
**Precondition**: Officer has access to resource location
**Flow**:
1. Navigate to /upload page
2. Enter Resource Name/Unit ID
3. Select Resource Type from dropdown
4. Enter Quantity/Personnel count
5. Click "Use Current Coordinates" to auto-fill GPS
6. Add additional details if needed
7. Click "Register Resource to Database"
8. System saves to localStorage
**Postcondition**: Resource is stored locally and ready for map display

#### UC-002: View All Resources on Map
**Actor**: Command Center Operator
**Precondition**: Resources have been registered
**Flow**:
1. Navigate to home page (/)
2. System loads resources from localStorage
3. Map displays all resources as markers
4. Operator can click markers to view details
**Postcondition**: Operator has situational awareness of all resources

#### UC-003: Search and Filter Resources
**Actor**: Emergency Coordinator
**Precondition**: User is on prototype page
**Flow**:
1. Access prototype interface
2. Use search bar to find municipality or resource ID
3. Toggle resource type filters in sidebar
4. View filtered results on map
5. Review resource counts per type
**Postcondition**: Coordinator can quickly locate specific resources

#### UC-004: Deploy Resource
**Actor**: Field Commander
**Precondition**: Resource marker is visible on map
**Flow**:
1. Click on resource marker
2. Review resource details in popup
3. Click "Deploy Resource" or "View Full Details"
4. Coordinate deployment
**Postcondition**: Resource is identified for deployment action

#### UC-005: Analyze Resource Distribution
**Actor**: DRRM Officer
**Precondition**: Multiple resources registered
**Flow**:
1. Open prototype map
2. Observe cluster visualization
3. Click clusters to expand dense areas
4. Review distribution across municipalities
5. Identify gaps in coverage
**Postcondition**: Officer understands resource allocation patterns

### 3.2 Possible Applications

#### 3.2.1 Disaster Response
- Typhoon/Pandemic response resource tracking
- Flood rescue team deployment
- Earthquake SAR operations
- Fire emergency response coordination

#### 3.2.2 Preparedness Planning
- Pre-positioning assets before disasters
- Resource inventory management
- Gap analysis for equipment needs
- Municipality coverage assessment

#### 3.2.3 Training and Simulation
- Mock drill resource deployment
- Training exercise tracking
- Response time analysis
- Team coordination practice

#### 3.2.4 Reporting and Documentation
- Resource availability reports
- Deployment history tracking
- Municipality asset inventories
- Audit and compliance documentation

---

## 4. Code Structure

### 4.1 Project Directory Structure

```
resourcemapping/
├── app/                          # Next.js App Router
│   ├── favicon.ico              # Application icon
│   ├── globals.css              # Global styles + Tailwind
│   ├── layout.tsx               # Root layout with fonts
│   ├── page.tsx                 # Main map page (resource viewer)
│   ├── prototype/               # Advanced prototype interface
│   │   └── page.tsx             # Full-featured map system
│   └── upload/                  # Resource registration
│       └── page.tsx             # Upload form interface
├── components/                   # Reusable React components
│   ├── mapComponent.tsx         # Base map with markers
│   ├── popUpComponent.tsx       # Resource detail popup
│   └── oldPrototypes/           # Legacy implementations
│       └── mapComponent.tsx
├── lib/                          # Utility libraries
│   └── constants.ts             # Resource type definitions
├── public/                       # Static assets
│   └── pins/                    # Map marker icons (14 PNG files)
│       ├── ambulance.png
│       ├── comm.png
│       ├── cssr.png
│       ├── ems.png
│       ├── ews.png
│       ├── firetruck.png
│       ├── fr.png
│       ├── har.png
│       ├── tools.png
│       ├── trucks.png
│       ├── usar.png
│       ├── ver.png
│       ├── wasar.png
│       └── watercraft.png
├── .next/                        # Next.js build output
├── .vercel/                      # Vercel deployment config
├── .git/                         # Git repository
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── eslint.config.mjs             # ESLint configuration
├── postcss.config.mjs            # PostCSS configuration
└── README.md                     # Basic setup instructions
```

### 4.2 Component Architecture

#### 4.2.1 Main Components

**1. BaseMap (`components/mapComponent.tsx`)**
```typescript
interface BaseMapProps {
  markers?: MarkerData[];
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  className?: string;
}

interface MarkerData {
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
```
- Renders MapLibre GL map
- Displays markers with custom icons
- Handles marker click events
- Shows popup with ResourcePopup component

**2. ResourcePopup (`components/popUpComponent.tsx`)**
```typescript
interface PopupProps {
  selectedMarker: MarkerData | null;
  onClose: () => void;
}
```
- Displays resource details in modal
- Shows resource type with icon
- Displays quantity, coordinates
- "Deploy Resource" action button
- Click-outside-to-close functionality

**3. UploadResourcePage (`app/upload/page.tsx`)**
- Form interface for resource registration
- Geolocation API integration
- LocalStorage persistence
- Form validation
- Success feedback

**4. IloiloMapSystem (`app/prototype/page.tsx`)**
- Advanced dashboard interface
- Sidebar with filters and statistics
- Search functionality
- Cluster visualization
- GeoJSON data management
- Real-time filtering

### 4.3 Data Flow

```
User Input → Component State → localStorage → Map Display
     ↑                                              ↓
     └────────────── LocalStorage ←─────────────────┘
```

### 4.4 Configuration Constants

**Resource Types (`lib/constants.ts`)**
```typescript
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
```

---

## 5. Technologies Used

### 5.1 Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React framework with App Router |
| **React** | 19.2.3 | UI component library |
| **React DOM** | 19.2.3 | DOM rendering |
| **TypeScript** | 5.x | Type-safe JavaScript |

### 5.2 Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **@tailwindcss/postcss** | ^4 | PostCSS integration |
| **Geist Font** | - | Primary font family (Sans + Mono) |

### 5.3 Mapping Libraries

| Technology | Version | Purpose |
|------------|---------|---------|
| **react-map-gl** | ^8.1.0 | React wrapper for MapLibre |
| **maplibre-gl** | ^5.17.0 | Open-source mapping library |
| **OpenFreeMap** | - | Free map tile service (Liberty style) |

### 5.4 UI Components & Icons

| Technology | Version | Purpose |
|------------|---------|---------|
| **lucide-react** | ^0.563.0 | Icon library (2000+ icons) |

### 5.5 Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | ^9 | Code linting |
| **eslint-config-next** | 16.1.6 | Next.js ESLint rules |
| **PostCSS** | - | CSS processing |
| **Bun** | - | JavaScript runtime & package manager |

### 5.6 Browser APIs

- **Geolocation API**: GPS coordinate detection
- **localStorage API**: Client-side data persistence
- **Crypto API**: UUID generation for resources

### 5.7 Deployment

| Technology | Purpose |
|------------|---------|
| **Vercel** | Cloud deployment platform |

---

## 6. Technical Specifications

### 6.1 Default Map Configuration
```typescript
{
  longitude: 122.5591,  // Iloilo City center
  latitude: 10.7002,
  zoom: 14,
  pitch: 50
}
```

### 6.2 Supported Municipalities
- Iloilo City
- Oton
- Pavia
- Leganes
- Santa Barbara
- Dumangas

### 6.3 Data Schema

**MarkerData Interface**
```typescript
interface MarkerData {
  id: string;              // UUID generated via crypto.randomUUID()
  title: string;           // Resource Name / Unit ID
  description: string;     // Additional details
  type: ResourceType;      // One of 14 resource types
  quantity: number;        // Count or personnel
  latitude: number;        // GPS latitude
  longitude: number;       // GPS longitude
  municipality: string;    // Location municipality
  createdAt?: string;      // ISO timestamp
  user_id?: string;        // User identifier (placeholder)
}
```

### 6.4 Cluster Configuration
```typescript
{
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50
}
```

### 6.5 Icon Specifications
- **Format**: PNG
- **Size**: Custom markers (60x60px)
- **Location**: `/public/pins/*.png`
- **Total Icons**: 14 resource types

---

## 7. Future Enhancements (TODO)

### 7.1 Backend Integration
- Supabase integration for persistent storage
- User authentication and authorization
- Real-time synchronization
- Role-based access control

### 7.2 Mobile Application
- React Native or PWA version
- Offline-first capability
- GPS tracking in background
- Photo attachment support

### 7.3 Advanced Features
- Route optimization for deployments
- Historical tracking and analytics
- Integration with weather APIs
- SMS/notification system
- Multi-province support
- Resource status tracking (available, deployed, maintenance)
- Equipment maintenance scheduling
- QR code scanning for quick registration

### 7.4 Data Import/Export
- Excel/CSV import
- PDF report generation
- API endpoints for external systems
- Data backup and restore

---

## 8. Constraints and Limitations

### 8.1 Current Limitations
1. **Storage**: Uses localStorage only (no persistent backend)
2. **Multi-user**: No user authentication or concurrent editing
3. **Offline**: Requires internet for map tiles
4. **Data Volume**: localStorage limited to ~5-10MB
5. **Device**: Browser-based only (no native mobile app)

### 8.2 Browser Requirements
- Modern browsers with ES2017 support
- Geolocation API support
- LocalStorage enabled
- WebGL enabled for map rendering

---

## 9. Glossary

| Term | Definition |
|------|------------|
| **PDRRMO** | Provincial Disaster Risk Reduction and Management Office |
| **SAR** | Search and Rescue |
| **USAR** | Urban Search and Rescue |
| **WASAR** | Water Search and Rescue |
| **HAR** | High Altitude Rescue |
| **CSSR** | Collapsed Structure Search and Rescue |
| **EMS** | Emergency Medical Services |
| **EWS** | Early Warning System |
| **GeoJSON** | JSON format for encoding geographic data structures |
| **MapLibre** | Open-source mapping library (fork of Mapbox GL) |

---

## 10. Appendices

### Appendix A: Resource Type Icons
Each resource type has a corresponding PNG icon in `/public/pins/`:
- 14 unique icon files
- Named by type code (e.g., `ambulance.png`, `firetruck.png`)
- Custom designed for emergency services

### Appendix B: Scripts
```json
{
  "dev": "next dev",      // Development server
  "build": "next build",  // Production build
  "start": "next start",  // Production server
  "lint": "eslint"        // Code linting
}
```

### Appendix C: Environment Setup
- Node.js 18+ or Bun runtime
- Package manager: Bun (preferred) or npm/yarn/pnpm
- Development server: `http://localhost:3000`
- Default port: 3000

---

**Document End**

*This SRS document provides a comprehensive overview of the Resource Mapping Application as of February 2026. For questions or updates, contact the development team.*
