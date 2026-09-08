"use client";

import React, { useState, useEffect } from "react";
import { BusinessSettings } from "@/types/billing";
import { 
  getStoredSettings, 
  saveStoredSettings, 
  DEFAULT_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_TRANSACTIONS,
  saveStoredProducts,
  saveStoredCustomers,
  saveStoredInvoices,
  saveStoredTransactions,
  syncAllWithCloud
} from "@/lib/storage";
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Store, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Download, 
  QrCode as QrIcon,
  Cloud,
  RefreshCw 
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const success = await syncAllWithCloud();
    setIsSyncing(false);
    if (success) {
      setSettings(getStoredSettings());
      alert("Cloud database sync complete! Latest data pulled from Supabase (Mumbai).");
    } else {
      alert("Could not reach cloud database. Operating in local cache mode.");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetDemoData = () => {
    if (confirm("Reset all products, customers, and sample invoices back to fresh demo state?")) {
      saveStoredProducts(INITIAL_PRODUCTS);
      saveStoredCustomers(INITIAL_CUSTOMERS);
      saveStoredInvoices(INITIAL_INVOICES);
      saveStoredTransactions(INITIAL_TRANSACTIONS);
      saveStoredSettings(DEFAULT_SETTINGS);
      setSettings(DEFAULT_SETTINGS);
      alert("Sample data restored successfully!");
    }
  };

  const handleExportBackup = () => {
    const backup = {
      settings,
      products: localStorage.getItem("billing_products"),
      customers: localStorage.getItem("billing_customers"),
      invoices: localStorage.getItem("billing_invoices"),
      transactions: localStorage.getItem("billing_transactions"),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bharatpos-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Store Profile & Configuration
          </h1>
          <p className="text-sm text-slate-500">
            Configure store metadata, GST credentials, UPI QR payment parameters, and invoice templates
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Cloud"}</span>
          </button>
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={handleResetDemoData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Settings saved successfully! Invoices will now reflect these updated details.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Business Identity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 text-slate-900 font-bold">
            <Store className="w-5 h-5 text-teal-600" />
            <h3>Business & Shop Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store / Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tagline / Subtitle (Optional)
              </label>
              <input
                type="text"
                value={settings.tagline || ""}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="e.g. Quality Daily Needs at Wholesale Rates"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State Name
              </label>
              <input
                type="text"
                value={settings.state}
                onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GST State Code
              </label>
              <input
                type="text"
                value={settings.stateCode}
                onChange={(e) => setSettings({ ...settings, stateCode: e.target.value })}
                placeholder="e.g. 07, 27"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PAN Number (Optional)
              </label>
              <input
                type="text"
                value={settings.pan || ""}
                onChange={(e) => setSettings({ ...settings, pan: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={settings.email || ""}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bank & UPI Payment Config */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 text-slate-900 font-bold">
            <CreditCard className="w-5 h-5 text-teal-600" />
            <h3>Bank & UPI Payment Setup (For Invoices & Dynamic QR)</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store UPI ID / VPA (Used to render instant scan-to-pay QR on invoices and counter POS)
            </label>
            <div className="relative">
              <QrIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={settings.upiId || ""}
                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                placeholder="e.g. yourstore@okhdfcbank or 9876543210@upi"
                className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold text-teal-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={settings.bankName || ""}
                onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                placeholder="e.g. State Bank of India"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={settings.bankAccountNo || ""}
                onChange={(e) => setSettings({ ...settings, bankAccountNo: e.target.value })}
                placeholder="e.g. 38290192839"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={settings.bankIfsc || ""}
                onChange={(e) => setSettings({ ...settings, bankIfsc: e.target.value.toUpperCase() })}
                placeholder="e.g. SBIN0001234"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Invoice Policy & Terms */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 text-slate-900 font-bold">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3>Invoice Numbering & Terms</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                value={settings.invoicePrefix}
                onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Next Invoice Number Counter
              </label>
              <input
                type="number"
                min="1"
                value={settings.invoiceCounter}
                onChange={(e) =>
                  setSettings({ ...settings, invoiceCounter: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Standard Terms & Conditions (Appears on A4 Invoice)
            </label>
            <textarea
              rows={3}
              value={settings.terms}
              onChange={(e) => setSettings({ ...settings, terms: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Footer Greeting Message
            </label>
            <input
              type="text"
              value={settings.footerMessage}
              onChange={(e) => setSettings({ ...settings, footerMessage: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition"
          >
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
