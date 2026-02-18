"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: NotificationType, title: string, message: string, duration?: number) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback(
    (type: NotificationType, title: string, message: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const notification: Notification = { id, type, title, message, duration };
      
      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    [removeNotification]
  );

  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification("success", title, message, duration);
    },
    [showNotification]
  );

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification("error", title, message, duration);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification("warning", title, message, duration);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification("info", title, message, duration);
    },
    [showNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeNotification,
      }}
    >
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

function NotificationContainer({
  notifications,
  onRemove,
}: {
  notifications: Notification[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onRemove,
}: {
  notification: Notification;
  onRemove: (id: string) => void;
}) {
  const { id, type, title, message } = notification;

  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-500",
      titleColor: "text-green-900",
      messageColor: "text-green-700",
      progressColor: "bg-green-500",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-500",
      titleColor: "text-red-900",
      messageColor: "text-red-700",
      progressColor: "bg-red-500",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-500",
      titleColor: "text-yellow-900",
      messageColor: "text-yellow-700",
      progressColor: "bg-yellow-500",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
      titleColor: "text-blue-900",
      messageColor: "text-blue-700",
      progressColor: "bg-blue-500",
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, titleColor, messageColor, progressColor } =
    config[type];

  return (
    <div
      className={`pointer-events-auto w-full ${bgColor} border ${borderColor} rounded-xl shadow-lg p-4 animate-in slide-in-from-right-full fade-in duration-300`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${titleColor}`}>{title}</h4>
          <p className={`text-sm mt-1 ${messageColor}`}>{message}</p>
        </div>
        <button
          onClick={() => onRemove(id)}
          className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${messageColor}`}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-1 bg-black/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${progressColor} rounded-full animate-progress`}
          style={{
            animationDuration: `${notification.duration}ms`,
            animationTimingFunction: "linear",
            animationFillMode: "forwards",
          }}
        />
      </div>
    </div>
  );
}

// Standalone notification component for use outside of provider (for pages that don't have access to context)
export function NotificationSplash({
  type,
  title,
  message,
  isOpen,
  onClose,
  duration = 4000,
}: {
  type: NotificationType;
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-500",
      titleColor: "text-green-900",
      messageColor: "text-green-700",
      progressColor: "bg-green-500",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-500",
      titleColor: "text-red-900",
      messageColor: "text-red-700",
      progressColor: "bg-red-500",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-500",
      titleColor: "text-yellow-900",
      messageColor: "text-yellow-700",
      progressColor: "bg-yellow-500",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
      titleColor: "text-blue-900",
      messageColor: "text-blue-700",
      progressColor: "bg-blue-500",
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, titleColor, messageColor, progressColor } =
    config[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end p-4 pointer-events-none">
      <div
        className={`pointer-events-auto w-full max-w-md ${bgColor} border ${borderColor} rounded-xl shadow-xl p-5 animate-in slide-in-from-right-full fade-in duration-300`}
        role="alert"
      >
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 ${iconColor}`}>
            <Icon size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-base ${titleColor}`}>{title}</h4>
            <p className={`text-sm mt-1 ${messageColor}`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`flex-shrink-0 p-1.5 rounded-lg hover:bg-black/5 transition-colors ${messageColor}`}
            aria-label="Close notification"
          >
            <X size={18} />
          </button>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-1.5 bg-black/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} rounded-full`}
            style={{
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
