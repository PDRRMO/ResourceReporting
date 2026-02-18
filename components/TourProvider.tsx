"use client";

import React, { useRef, useCallback, createContext, useContext, useState, useEffect } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { HelpCircle, X, AlertTriangle } from "lucide-react";

// Tour context
type TourContextType = {
  startTour: (tourName: string) => void;
  endTour: () => void;
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
};

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

// Tour Button Component
export function TourButton({ 
  tourName, 
  className = "" 
}: { 
  tourName: string; 
  className?: string;
}) {
  const { startTour, isActive } = useTour();

  if (isActive) return null;

  return (
    <button
      onClick={() => startTour(tourName)}
      className={`flex items-center px-2 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors ${className}`}
      title="Start Guided Tour"
    >
      <HelpCircle size={24} />
    </button>
  );
}

// Tour Progress Component
function TourProgress({
  current,
  total,
  onClose
}: {
  current: number;
  total: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-white rounded-full shadow-lg border border-slate-200 px-6 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-600">
          Step {current} of {total}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < current ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1 hover:bg-slate-100 rounded-full transition-colors"
        title="End Tour"
      >
        <X size={16} className="text-slate-400" />
      </button>
    </div>
  );
}

// Exit Confirmation Modal Component
function ExitConfirmationModal({
  isOpen,
  onConfirm,
  onCancel
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex items-center gap-3">
          <AlertTriangle size={24} className="text-white" />
          <h3 className="text-lg font-bold text-white">Exit Tour?</h3>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-slate-600 text-base leading-relaxed">
            Are you sure you want to exit the tour? You can restart it anytime by clicking the Tour button.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Continue Tour
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl transition-all shadow-lg shadow-orange-500/25"
          >
            Exit Tour
          </button>
        </div>
      </div>
    </div>
  );
}

// Tour Provider Component
export function TourProvider({ children }: { children: React.ReactNode }) {
  const tourRef = useRef<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentTourName, setCurrentTourName] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  // Common tour options
  const defaultTourOptions = {
    defaultStepOptions: {
      cancelIcon: {
        enabled: true,
        label: "Close",
      },
      classes: "shepherd-theme-custom",
      scrollTo: {
        behavior: "smooth" as ScrollBehavior,
        block: "center" as ScrollLogicalPosition,
      },
      modalOverlayOpeningPadding: 8,
      modalOverlayOpeningRadius: 8,
    },
    useModalOverlay: true,
    confirmCancel: false,
  };

  // Dashboard Tour Steps
  const dashboardTourSteps = [
    {
      id: "welcome",
      title: "Welcome to PDRRMO Dashboard",
      text: "This is your resource management command center. Let me show you around the key features.",
      attachTo: {
        element: ".dashboard-header",
        on: "bottom" as const,
      },
      buttons: [
        {
          text: "Skip Tour",
          action: () => tourRef.current?.cancel(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Start Tour",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "key-stats",
      title: "Key Statistics",
      text: "These cards show your most important metrics at a glance: total resources, readiness status, deployment count, and maintenance status.",
      attachTo: {
        element: ".key-stats-section",
        on: "bottom" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "status-distribution",
      title: "Status Distribution",
      text: "See how your resources are distributed across different statuses. Green means ready, orange means deployed, and yellow indicates maintenance.",
      attachTo: {
        element: ".status-distribution-section",
        on: "right" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "resource-types",
      title: "Resource Types",
      text: "View the breakdown of your resources by type - from fire trucks to ambulances, rescue boats to communication equipment.",
      attachTo: {
        element: ".resource-types-section",
        on: "right" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "municipalities",
      title: "Municipality Distribution",
      text: "See how resources are distributed across different municipalities. This helps you identify coverage gaps and plan deployments.",
      attachTo: {
        element: ".municipalities-section",
        on: "top" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "quick-actions",
      title: "Quick Actions",
      text: "Access frequently used features quickly: view the live map, add new resources, search the database, or generate reports.",
      attachTo: {
        element: ".quick-actions-section",
        on: "left" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "recent-activity",
      title: "Recent Activity",
      text: "Stay up to date with the latest changes to your resources. See what was added, updated, or deployed recently.",
      attachTo: {
        element: ".recent-activity-section",
        on: "left" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Finish Tour",
          action: () => tourRef.current?.complete(),
          classes: "shepherd-button-primary",
        },
      ],
    },
  ];

  // Map Tour Steps
  const mapTourSteps = [
    {
      id: "map-welcome",
      title: "Interactive Resource Map",
      text: "Welcome to the map view! This is where you can visualize all your resources geographically. Let me show you the key features.",
      attachTo: {
        element: ".map-header",
        on: "bottom" as const,
      },
      buttons: [
        {
          text: "Skip Tour",
          action: () => tourRef.current?.cancel(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Start Tour",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "map-search",
      title: "Search Resources",
      text: "Use the search bar to quickly find resources by name, municipality, or type. Type a few letters and matching results will appear.",
      attachTo: {
        element: ".map-search-bar",
        on: "bottom" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "map-markers",
      title: "Resource Markers",
      text: "Each marker on the map represents a resource. Click on any marker to see detailed information about that resource, including its status, location, and specifications.",
      attachTo: {
        element: ".map-container",
        on: "top" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "map-controls",
      title: "Control Panel",
      text: "These buttons give you quick access to key features: Dashboard view, add new resources, filters, and center the map on your current location.",
      attachTo: {
        element: ".map-control-panel",
        on: "left" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "map-filters",
      title: "Filter Resources",
      text: "Click the filter button to show only specific resource types. This helps you focus on what you need - like showing only fire trucks or ambulances.",
      attachTo: {
        element: ".map-filter-btn",
        on: "left" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "map-gps",
      title: "GPS Location",
      text: "Click the GPS button to center the map on your current location. This helps you find the nearest resources to where you are right now.",
      attachTo: {
        element: ".map-gps-btn",
        on: "left" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "map-stats",
      title: "Quick Stats",
      text: "These floating stats show you a quick summary: total resources, active zones, and ready units - all visible at a glance while you browse the map.",
      attachTo: {
        element: ".map-stats-badge",
        on: "top" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Finish Tour",
          action: () => tourRef.current?.complete(),
          classes: "shepherd-button-primary",
        },
      ],
    },
  ];

  // Upload Page Tour Steps
  const uploadTourSteps = [
    {
      id: "upload-welcome",
      title: "Add New Resource",
      text: "This form allows you to register new equipment, vehicles, or personnel into the system. Let me guide you through each field.",
      attachTo: {
        element: ".upload-form-header",
        on: "bottom" as const,
      },
      buttons: [
        {
          text: "Skip Tour",
          action: () => tourRef.current?.cancel(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Start Tour",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "upload-name",
      title: "Resource Name",
      text: "Enter a clear, descriptive name for the resource. This will help you identify it later. Examples: 'Fire Truck Alpha' or 'Rescue Boat 01'.",
      attachTo: {
        element: ".upload-name-field",
        on: "right" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "upload-photo",
      title: "Resource Photo",
      text: "Upload a clear photo of the equipment or vehicle. This helps with visual identification and documentation. A picture is worth a thousand words!",
      attachTo: {
        element: ".upload-photo-field",
        on: "right" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "upload-type",
      title: "Resource Type & Status",
      text: "Select the appropriate resource type from the dropdown, and set its current status: Ready (available), Deployed (in use), or Maintenance (being repaired).",
      attachTo: {
        element: ".upload-type-status-fields",
        on: "right" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "upload-location",
      title: "Location & Coordinates",
      text: "Select the municipality where this resource is located. Use the 'Use Current Location' button to automatically fill GPS coordinates, or enter them manually.",
      attachTo: {
        element: ".upload-location-field",
        on: "right" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tourRef.current?.next(),
          classes: "shepherd-button-primary",
        },
      ],
    },
    {
      id: "upload-preview",
      title: "Live Preview",
      text: "As you fill out the form, this preview shows exactly how your resource will appear in the system. Make sure everything looks correct before saving!",
      attachTo: {
        element: ".upload-preview-section",
        on: "left" as const,
      },
      buttons: [
        {
          text: "Back",
          action: () => tourRef.current?.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Finish Tour",
          action: () => tourRef.current?.complete(),
          classes: "shepherd-button-primary",
        },
      ],
    },
  ];

  // Tours configuration
  const tours: Record<string, unknown[]> = {
    dashboard: dashboardTourSteps,
    map: mapTourSteps,
    upload: uploadTourSteps,
  };

  const startTour = useCallback((tourName: string) => {
    // End any existing tour
    if (tourRef.current) {
      tourRef.current.complete();
    }

    const steps = tours[tourName];
    if (!steps) {
      console.warn(`Tour "${tourName}" not found`);
      return;
    }

    setCurrentTourName(tourName);

    // Create new tour
    const tour = new Shepherd.Tour({
      ...defaultTourOptions,
      steps: steps as any[],
    });

    // Event handlers
    tour.on("start", () => {
      setIsActive(true);
      setCurrentStep(1);
      setTotalSteps(steps.length);
    });

    tour.on("show", () => {
      const stepIndex = tour.steps.indexOf(tour.getCurrentStep()!) + 1;
      setCurrentStep(stepIndex);
    });

    tour.on("complete", () => {
      setIsActive(false);
      setCurrentStep(0);
      // Mark tour as completed in localStorage
      const completedTours = JSON.parse(localStorage.getItem("completedTours") || "[]");
      if (currentTourName && !completedTours.includes(currentTourName)) {
        completedTours.push(currentTourName);
        localStorage.setItem("completedTours", JSON.stringify(completedTours));
      }
    });

    tour.on("cancel", () => {
      // Show custom exit confirmation modal instead of native confirm
      setShowExitModal(true);
    });

    tourRef.current = tour;
    tour.start();
  }, [defaultTourOptions, currentTourName]);

  const endTour = useCallback(() => {
    // Show exit confirmation modal instead of immediately ending
    setShowExitModal(true);
  }, []);

  const confirmExitTour = useCallback(() => {
    setShowExitModal(false);
    if (tourRef.current) {
      tourRef.current.complete();
      tourRef.current = null;
    }
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  const cancelExitTour = useCallback(() => {
    setShowExitModal(false);
  }, []);

  return (
    <TourContext.Provider value={{ startTour, endTour, isActive, currentStep, totalSteps }}>
      {children}
      {isActive && (
        <TourProgress
          current={currentStep}
          total={totalSteps}
          onClose={endTour}
        />
      )}
      <ExitConfirmationModal
        isOpen={showExitModal}
        onConfirm={confirmExitTour}
        onCancel={cancelExitTour}
      />
      <style jsx global>{`
        .shepherd-theme-custom {
          max-width: 400px !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        
        .shepherd-theme-custom .shepherd-content {
          border-radius: 16px !important;
          overflow: hidden;
        }
        
        .shepherd-theme-custom .shepherd-header {
          background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
          padding: 20px 24px !important;
          border-radius: 16px 16px 0 0 !important;
        }
        
        .shepherd-theme-custom .shepherd-title {
          color: white !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          margin: 0 !important;
        }
        
        .shepherd-theme-custom .shepherd-text {
          padding: 20px 24px !important;
          font-size: 15px !important;
          line-height: 1.6 !important;
          color: #334155 !important;
        }
        
        .shepherd-theme-custom .shepherd-footer {
          padding: 0 24px 20px 24px !important;
          border-top: none !important;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        
        .shepherd-button-primary {
          background: #2563eb !important;
          color: white !important;
          padding: 10px 20px !important;
          border-radius: 10px !important;
          font-weight: 600 !important;
          border: none !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
        
        .shepherd-button-primary:hover {
          background: #1d4ed8 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }
        
        .shepherd-button-secondary {
          background: #f1f5f9 !important;
          color: #64748b !important;
          padding: 10px 20px !important;
          border-radius: 10px !important;
          font-weight: 600 !important;
          border: none !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
        
        .shepherd-button-secondary:hover {
          background: #e2e8f0 !important;
          color: #475569 !important;
        }
        
        .shepherd-cancel-icon {
          color: rgba(255, 255, 255, 0.8) !important;
          transition: color 0.2s !important;
        }
        
        .shepherd-cancel-icon:hover {
          color: white !important;
        }
        
        .shepherd-modal-overlay-container {
          background: rgba(15, 23, 42, 0.6) !important;
          backdrop-filter: blur(4px);
        }
        
        .shepherd-has-title .shepherd-content .shepherd-header {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }
        
        .shepherd-element.shepherd-has-title[data-popper-placement^="bottom"] > .shepherd-arrow:before {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }
      `}</style>
    </TourContext.Provider>
  );
}
