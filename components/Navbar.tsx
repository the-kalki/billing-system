"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Receipt, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  Store, 
  AlertTriangle,
  Cloud,
  Lock,
  RefreshCw 
} from "lucide-react";
import { getStoredProducts, getStoredSettings, syncAllWithCloud, subscribeToCloudRealtime } from "@/lib/storage";
import { useSecurity } from "./SecurityGuard";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { lockApp, settings: secSettings } = useSecurity();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [storeName, setStoreName] = useState("Billing POS");
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshLocalState = () => {
    const settings = getStoredSettings();
    setStoreName(settings.storeName);

    const products = getStoredProducts();
    const low = products.filter((p) => p.currentStock <= p.minStockAlert).length;
    setLowStockCount(low);
  };

  const triggerSync = async () => {
    setIsSyncing(true);
    const success = await syncAllWithCloud();
    setIsSyncing(false);
    if (success) {
      setIsCloudSynced(true);
      refreshLocalState();
    }
  };

  useEffect(() => {
    refreshLocalState();

    // Trigger sync on initial load
    triggerSync();

    // ⚡ Activate Supabase Realtime WebSocket for instantaneous cross-device sync
    const unsubscribeRealtime = subscribeToCloudRealtime();

    // Re-sync whenever user focuses window or wakes up phone screen
    const onFocus = () => triggerSync();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        triggerSync();
      }
    };
    const onCloudSynced = () => refreshLocalState();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("billing_cloud_synced", onCloudSynced);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("billing_cloud_synced", onCloudSynced);
      unsubscribeRealtime();
    };
  }, []);

  useEffect(() => {
    refreshLocalState();
  }, [pathname]);

  const navItems = [
    { href: "/pos", label: "POS", icon: ShoppingCart, highlight: true },
    { 
      href: "/products", 
      label: "Products", 
      icon: Package, 
      badge: lowStockCount > 0 ? lowStockCount : undefined 
    },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/customers", label: "Khata", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Store Title */}
            <div className="flex items-center space-x-2.5">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm group-hover:bg-teal-500 transition">
                  <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm sm:text-base tracking-tight block leading-tight text-white line-clamp-1 max-w-[140px] sm:max-w-xs">
                    {storeName}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 block font-normal leading-none">
                    GST Billing &amp; POS
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links (hidden on mobile) */}
            <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                      item.highlight
                        ? "bg-teal-600 text-white hover:bg-teal-500 shadow-sm"
                        : isActive
                        ? "bg-slate-800 text-teal-400 border border-slate-700"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-slate-950 ml-1">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Controls: Cloud Status + Lock */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={triggerSync}
                disabled={isSyncing}
                title="Tap to sync cloud database now"
                className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400 font-medium bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-800/60 px-2 py-1 rounded-full transition active:scale-95"
              >
                <Cloud className={`w-3 h-3 text-emerald-400 ${isSyncing ? "animate-pulse" : ""}`} />
                <span className="hidden xs:inline">{isSyncing ? "Syncing..." : "Cloud Live"}</span>
                {isSyncing && <RefreshCw className="w-2.5 h-2.5 animate-spin ml-0.5" />}
              </button>

              {secSettings?.isLockEnabled !== false && (
                <button
                  type="button"
                  onClick={lockApp}
                  className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition active:scale-95"
                  title="Lock POS Terminal"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Lock</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Only visible on mobile screens < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-1.5 px-2 safe-area-pb no-print shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                item.highlight
                  ? "text-teal-400 font-bold"
                  : isActive
                  ? "text-teal-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  isActive ? "bg-teal-950/80 border border-teal-800/60" : ""
                }`}
              >
                <Icon className={`w-5 h-5 ${item.highlight ? "text-teal-400" : ""}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {item.badge !== undefined && (
                <span className="absolute top-0 right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
};
