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
  Lock 
} from "lucide-react";
import { getStoredProducts, getStoredSettings, syncAllWithCloud } from "@/lib/storage";
import { useSecurity } from "./SecurityGuard";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { lockApp, settings: secSettings } = useSecurity();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [storeName, setStoreName] = useState("Billing POS");
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  useEffect(() => {
    const settings = getStoredSettings();
    setStoreName(settings.storeName);

    const products = getStoredProducts();
    const low = products.filter((p) => p.currentStock <= p.minStockAlert).length;
    setLowStockCount(low);

    // Initial background sync with Supabase
    syncAllWithCloud().then((synced) => {
      if (synced) setIsCloudSynced(true);
    });
  }, [pathname]);

  const navItems = [
    { href: "/pos", label: "POS Terminal", icon: ShoppingCart, highlight: true },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { 
      href: "/products", 
      label: "Products & Stock", 
      icon: Package, 
      badge: lowStockCount > 0 ? lowStockCount : undefined 
    },
    { href: "/customers", label: "Customers & Khata", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Store Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm group-hover:bg-teal-500 transition">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight block leading-tight text-white">
                  {storeName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 block font-normal">
                    GST Billing & POS
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded-full">
                    <Cloud className="w-2.5 h-2.5 text-emerald-400" />
                    Supabase Cloud
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
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
                  <span className="hidden md:inline">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-slate-950 ml-1">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {secSettings?.isLockEnabled !== false && (
              <button
                type="button"
                onClick={lockApp}
                className="flex items-center space-x-1.5 px-2.5 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1 border border-slate-700/50"
                title="Lock POS Terminal"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">Lock</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
