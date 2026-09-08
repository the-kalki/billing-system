"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getStoredSettings } from "@/lib/storage";
import { BusinessSettings } from "@/types/billing";
import { LockScreen } from "./LockScreen";

interface SecurityContextType {
  isLocked: boolean;
  lockApp: () => void;
  unlockApp: () => void;
  settings: BusinessSettings;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurity must be used within a SecurityGuard");
  }
  return context;
};

export const SecurityGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const s = getStoredSettings();
    setSettings(s);

    if (s.isLockEnabled !== false) {
      const unlocked = sessionStorage.getItem("pos_session_unlocked");
      if (unlocked !== "true") {
        setIsLocked(true);
      }
    }
  }, []);

  const lockApp = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pos_session_unlocked");
    }
    setIsLocked(true);
  };

  const unlockApp = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pos_session_unlocked", "true");
    }
    setIsLocked(false);
  };

  if (!mounted || !settings) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  return (
    <SecurityContext.Provider value={{ isLocked, lockApp, unlockApp, settings }}>
      {settings.isLockEnabled !== false && isLocked && (
        <LockScreen settings={settings} onUnlock={unlockApp} />
      )}
      {children}
    </SecurityContext.Provider>
  );
};
