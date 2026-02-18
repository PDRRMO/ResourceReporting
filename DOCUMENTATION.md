# PDRRMO Resource & Equipment Management System
## Documentation for Non-Technical Users

---

## Table of Contents
1. [What is This System?](#what-is-this-system)
2. [Who is This For?](#who-is-this-for)
3. [What Can It Do?](#what-can-it-do)
4. [What Data Do We Need?](#what-data-do-we-need)
5. [Budget & Costs](#budget--costs)
6. [PowerPoint Presentation Section](#powerpoint-presentation-section)

---

## What is This System?

**In Simple Terms:**
This is a digital map system (like Google Maps) that shows where all emergency equipment and vehicles are located in Iloilo Province. Think of it as a "Google Maps for Emergency Resources."

**Why We Need It:**
- During emergencies (typhoons, floods, fires), responders need to know WHERE equipment is located
- Prevents confusion about which vehicles are available vs. already deployed
- Helps managers see the "big picture" of all resources
- Replaces paper-based tracking or Excel spreadsheets

**Real-World Example:**
When a typhoon hits Dumangas, the disaster manager can open this system and immediately see:
- How many rescue boats are available nearby
- Which fire trucks are ready to deploy
- Where the closest ambulance is located

---

## Who is This For?

| User | What They Do |
|------|--------------|
| **PDRRMO Operations Center Staff** | Monitor all resources in real-time |
| **Municipal Disaster Coordinators** | Update status of their equipment |
| **Provincial Governor/Mayors** | View overall readiness reports |
| **Emergency Responders** | Find nearest available equipment |
| **Logistics Teams** | Plan resource deployment |

---

## What Can It Do?

### 1. Interactive Map View
- Shows all resources as pins on a map of Iloilo
- Click any pin to see details (photo, status, location)
- Zoom in/out to see specific areas
- Works on computers, tablets, and phones

### 2. Resource Dashboard
**Shows:**
- Total number of resources
- How many are "Ready" vs "Deployed" vs "Under Maintenance"
- Breakdown by type (fire trucks, boats, ambulances, etc.)
- Distribution by municipality
- Quick statistics and percentages

### 3. Add New Resources
- Upload photos of equipment
- Enter details: name, type, quantity, location
- Set status (Ready/Deployed/Maintenance)
- Uses GPS to automatically detect location

### 4. Search & Filter
- Search by municipality name
- Filter by resource type (show only fire trucks, etc.)
- Find specific equipment quickly

### 5. Status Updates
- Change status when equipment is deployed
- Mark as "Under Maintenance" when being repaired
- Mark as "Ready" when available

### 6. Resource Types Supported
| Code | Full Name | Example |
|------|-----------|---------|
| VER | Vehicle Extrication | Crash rescue trucks |
| COMM | Communications | Radio vans, command centers |
| TOOLS | Tools & Equipment | Rescue gear, chainsaws |
| TRUCKS | General Trucks | Utility vehicles |
| WATERCRAFT | Watercraft | Rescue boats |
| FR | Fire Rescue | Fire engines |
| HAR | High Altitude Rescue | Tower/cliff rescue units |
| USAR | Urban Search & Rescue | Collapse rescue teams |
| WASAR | Water Search & Rescue | Diving teams |
| EWS | Early Warning System | Alert vehicles |
| EMS | Emergency Medical | Field medic teams |
| FIRETRUCK | Fire Truck | Fire apparatus |
| CSSR | Collapsed Structure | Building rescue |
| AMBULANCE | Ambulance | Medical transport |

---

## What Data Do We Need?

### Required Information for Each Resource:

#### 1. Basic Information
- **Resource Name/ID** (e.g., "Fire Truck 05", "Rescue Boat Alpha")
- **Resource Type** (choose from the 14 types listed above)
- **Quantity** (how many units or personnel)

#### 2. Location Data
- **Municipality** (Iloilo City, Oton, Pavia, etc.)
- **GPS Coordinates** (Latitude & Longitude)
  - Can use phone/computer GPS to auto-detect
  - Or manually enter coordinates

#### 3. Status
- **Ready** (available for immediate deployment)
- **Deployed** (currently in use)
- **Maintenance** (under repair/service)

#### 4. Optional Information
- **Photo** (image of the equipment)
- **Description** (special features, certifications, notes)
- **Date Added** (automatically recorded)

### Data Collection Checklist:

```
For Each Equipment/Vehicle:
☐ Take a clear photo
☐ Write down the name/ID
☐ Identify the type (fire truck, ambulance, etc.)
☐ Count how many units/personnel
☐ Note the municipality location
☐ Get GPS coordinates (use phone)
☐ Check current status (ready/deployed/maintenance)
☐ Add any special notes
```

### Municipalities to Cover (Initial):
1. Iloilo City
2. Oton
3. Pavia
4. Leganes
5. Santa Barbara
6. Dumangas

*Note: Can be expanded to all 42 municipalities in Iloilo*

---

## Budget & Costs

### One-Time Costs (Development)

| Item | Description | Estimated Cost (PHP) |
|------|-------------|---------------------|
| **System Development** | Building the web application | ₱150,000 - ₱300,000 |
| **Map Tiles** | Map imagery (OpenFreeMap - FREE) | ₱0 |
| **Icons & Graphics** | Pin markers, logos | ₱5,000 - ₱10,000 |
| **Initial Data Entry** | Encoding existing equipment | ₱20,000 - ₱40,000 |
| **Testing & Training** | Staff training sessions | ₱15,000 - ₱25,000 |
| **Contingency** | Unexpected costs | ₱30,000 |
| **TOTAL ONE-TIME** | | **₱220,000 - ₱405,000** |

### Monthly/Annual Costs (Maintenance)

| Item | Description | Monthly Cost | Annual Cost |
|------|-------------|--------------|-------------|
| **Web Hosting** | Vercel (FREE tier available) | ₱0 - ₱1,000 | ₱0 - ₱12,000 |
| **Domain Name** | Custom URL (e.g., pdrrmo-iloilo.gov.ph) | ₱500 | ₱6,000 |
| **SSL Certificate** | Security (FREE via Let's Encrypt) | ₱0 | ₱0 |
| **Data Backup** | Cloud storage | ₱500 | ₱6,000 |
| **Maintenance** | Bug fixes, updates | ₱5,000 | ₱60,000 |
| **TOTAL ANNUAL** | | | **₱72,000 - ₱84,000** |

### Optional Upgrades (Future)

| Item | Description | Cost |
|------|-------------|------|
| **Database Upgrade** | Move from local to cloud database | ₱50,000 - ₱100,000 |
| **Mobile App** | Native Android/iOS app | ₱200,000 - ₱400,000 |
| **SMS Alerts** | Text notifications | ₱2,000/month |
| **Offline Mode** | Works without internet | ₱80,000 - ₱150,000 |
| **Real-time GPS Tracking** | Live vehicle tracking | ₱150,000 - ₱300,000 |
| **AI Prediction** | Predict resource needs | ₱300,000+ |

### Cost-Saving Tips:
1. **Use FREE options first:** Vercel hosting, Let's Encrypt SSL, OpenFreeMap
2. **Start small:** Begin with 6 municipalities, expand later
3. **Train internal staff:** Instead of hiring external data entry
4. **Phased approach:** Add features gradually over time

### Estimated Total First Year Budget:
**₱292,000 - ₱489,000** (includes development + 1 year maintenance)

---

## PowerPoint Presentation Section

### Slide 1: Title Slide
```
PDRRMO Resource & Equipment Management System
Digital Mapping Solution for Iloilo Province

[Insert PDRRMO Logo]
```

### Slide 2: The Problem
```
Current Challenges:
❌ Paper-based tracking is slow
❌ Don't know where equipment is during emergencies
❌ Excel spreadsheets get outdated
❌ No real-time status updates
❌ Difficult to plan resource deployment
```

### Slide 3: The Solution
```
Our Digital Mapping System:
✅ Interactive map showing all resources
✅ Real-time status updates
✅ Search and filter capabilities
✅ Dashboard with statistics
✅ Works on phones, tablets, computers
✅ FREE map data (no Google Maps fees)
```

### Slide 4: Key Features
```
1. MAP VIEW
   - See all equipment locations at a glance
   - Click pins for details

2. DASHBOARD
   - Total resources count
   - Ready vs Deployed vs Maintenance
   - Municipality breakdown

3. RESOURCE MANAGEMENT
   - Add new equipment
   - Upload photos
   - Update status
   - GPS location tracking

4. SEARCH & FILTER
   - Find by municipality
   - Filter by type
   - Quick access
```

### Slide 5: Resource Types
```
14 Types of Resources Supported:

🚒 Fire Rescue (FR)
🚑 Ambulance (AMB)
🚤 Water Search & Rescue (WASAR)
🚛 Vehicle Extrication (VER)
📻 Communications (COMM)
🧰 Tools & Equipment
🏗️ Collapsed Structure Rescue (CSSR)
🏔️ High Altitude Rescue (HAR)
🏢 Urban Search & Rescue (USAR)
⚠️ Early Warning System (EWS)
🏥 Emergency Medical Services (EMS)
🚚 General Trucks
🚤 Watercraft
🚒 Fire Trucks
```

### Slide 6: How It Works (Simple)
```
STEP 1: Take Photo
        ↓
STEP 2: Enter Details (Name, Type, Quantity)
        ↓
STEP 3: Get Location (GPS)
        ↓
STEP 4: Set Status (Ready/Deployed/Maintenance)
        ↓
STEP 5: Save to System
        ↓
STEP 6: View on Map!
```

### Slide 7: Sample Screenshots
```
[Insert screenshot: Main Map View]
[Insert screenshot: Dashboard Panel]
[Insert screenshot: Resource Detail Sidebar]
[Insert screenshot: Add Resource Form]
```

### Slide 8: Coverage Area
```
Phase 1 Municipalities:
🎯 Iloilo City
🎯 Oton
🎯 Pavia
🎯 Leganes
🎯 Santa Barbara
🎯 Dumangas

Future Expansion:
📍 All 42 Municipalities in Iloilo
📍 Province-wide coverage
```

### Slide 9: Benefits
```
FOR DISASTER MANAGERS:
✓ Know exact location of all resources
✓ Make informed deployment decisions
✓ See real-time availability

FOR OPERATIONS STAFF:
✓ Update status with one click
✓ No more paper forms
✓ Works on mobile phones

FOR LEADERSHIP:
✓ Dashboard reports
✓ Readiness percentages
✓ Resource distribution analysis

FOR EMERGENCY RESPONDERS:
✓ Find nearest available equipment
✓ Faster response times
✓ Better coordination
```

### Slide 10: Budget Overview
```
INITIAL INVESTMENT:
Development:        ₱150,000 - ₱300,000
Data Entry:         ₱20,000 - ₱40,000
Training:           ₱15,000 - ₱25,000
Contingency:        ₱30,000
─────────────────────────────────
TOTAL:              ₱220,000 - ₱405,000

ANNUAL MAINTENANCE:
Hosting:            ₱0 - ₱12,000
Domain:             ₱6,000
Backup:             ₱6,000
Support:            ₱60,000
─────────────────────────────────
TOTAL:              ₱72,000 - ₱84,000/year

💡 Many services are FREE!
```

### Slide 11: Timeline
```
MONTH 1: Finalize requirements & design
MONTH 2: System development
MONTH 3: Testing & data entry
MONTH 4: Staff training
MONTH 5: Launch & go live

Total: 5 months to full deployment
```

### Slide 12: Next Steps
```
TO GET STARTED:

1. ✓ Approve budget
2. ✓ Assign project lead
3. ✓ Collect existing equipment data
4. ✓ Schedule staff training
5. ✓ Pilot with 6 municipalities
6. ✓ Expand province-wide

CONTACT:
[Your Name]
[Position]
[Email]
[Phone]
```

### Slide 13: Q&A
```
Questions & Discussion

Thank You!
```

---

## Quick Reference Card

### For Field Staff (Laminated Card)

**HOW TO ADD A RESOURCE:**

1. Open website: [URL]
2. Click "+" button
3. Take photo of equipment
4. Type name (e.g., "Fire Truck 01")
5. Select type (Fire Rescue, Ambulance, etc.)
6. Enter quantity
7. Tap "Use Current Location" for GPS
8. Select municipality
9. Choose status: Ready / Deployed / Maintenance
10. Click "Register Resource"

**Done!**

---

## Technical Notes (For IT Staff)

- **Platform:** Next.js 16 (React-based)
- **Database:** Currently localStorage (browser-based)
  - Future: Upgrade to PostgreSQL or Supabase
- **Maps:** MapLibre GL + OpenFreeMap tiles (FREE)
- **Hosting:** Vercel (FREE tier available)
- **Authentication:** Not yet implemented (local storage)
- **Offline Capability:** Limited (requires internet)

---

*Document Version 1.0*
*Prepared for PDRRMO - Iloilo Province*
