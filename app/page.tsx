"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  getStoredInvoices, 
  getStoredProducts, 
  getStoredCustomers, 
  getStoredSettings,
  syncAllWithCloud
} from "@/lib/storage";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Invoice, Product, Customer, BusinessSettings } from "@/types/billing";
import { 
  ShoppingCart, 
  Receipt, 
  Users, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  TrendingUp, 
  CreditCard, 
  PlusCircle, 
  FileText, 
  Clock 
} from "lucide-react";

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    const refreshData = () => {
      setInvoices(getStoredInvoices());
      setProducts(getStoredProducts());
      setCustomers(getStoredCustomers());
      setSettings(getStoredSettings());
    };

    refreshData();

    // Trigger cloud sync in background on mount
    syncAllWithCloud().then(() => refreshData());

    window.addEventListener("billing_cloud_synced", refreshData);
    window.addEventListener("focus", refreshData);
    window.addEventListener("storage", refreshData);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshData();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("billing_cloud_synced", refreshData);
      window.removeEventListener("focus", refreshData);
      window.removeEventListener("storage", refreshData);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const totalSales = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalCollected = invoices
    .filter((inv) => inv.paymentStatus === "paid")
    .reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalKhataDue = customers.reduce((acc, c) => acc + c.creditBalance, 0);
  const lowStockItems = products.filter((p) => p.currentStock <= p.minStockAlert);

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 w-full">
      {/* Welcome Banner & Instant POS CTA */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-950 text-teal-300 text-xs font-semibold border border-teal-800">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            POS & GST Engine Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {settings ? settings.storeName : "BharatPOS Billing System"}
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Create GST tax invoices, manage inventory stock, track customer credit khata, and print instant A4 or 3-inch thermal receipts.
          </p>
        </div>

        <Link
          href="/pos"
          className="inline-flex items-center space-x-3 px-6 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-500/20 transition shrink-0 text-base"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Open POS Counter (New Bill)</span>
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales Invoiced</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(totalSales)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>{invoices.length} Bills Issued</span>
            <span className="text-emerald-600 font-semibold">{formatCurrency(totalCollected)} Paid</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Customer Khata (Udhar)</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2 tabular-nums">
            {formatCurrency(totalKhataDue)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {customers.filter((c) => c.creditBalance > 0).length} customers with pending balance
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Inventory Catalog</span>
            <Package className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {products.length} Items
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Active SKUs</span>
            {lowStockItems.length > 0 && (
              <span className="text-amber-600 font-semibold">{lowStockItems.length} Low Stock</span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Customer Directory</span>
            <Users className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {customers.length} Accounts
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {customers.filter((c) => Boolean(c.gstin)).length} with registered GSTIN
          </div>
        </div>
      </div>

      {/* Low Stock Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-amber-900">
            <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {lowStockItems.length} Item(s) Running Low on Stock
              </h4>
              <p className="text-xs text-amber-800">
                {lowStockItems.map((p) => `${p.name} (${p.currentStock} ${p.unit})`).join(", ")}
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition shrink-0 text-center"
          >
            Update Inventory
          </Link>
        </div>
      )}

      {/* Quick Launchpad & Recent Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Invoices Table (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900">Recent Sales Invoices</h3>
            </div>
            <Link
              href="/invoices"
              className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>View All Invoices</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-3">Invoice No</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Payment</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold font-mono text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-400">{formatDateTime(inv.date)}</div>
                    </td>
                    <td className="p-3 text-right font-extrabold text-slate-950 tabular-nums">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="p-3 text-center uppercase font-semibold text-slate-600 text-[10px]">
                      {inv.paymentMethod}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          inv.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px]"
                      >
                        Print / View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fast Action Cards (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Quick Shortcuts
            </h3>

            <div className="space-y-2">
              <Link
                href="/pos"
                className="flex items-center justify-between p-3 rounded-lg bg-teal-50/60 hover:bg-teal-100/60 border border-teal-200 text-teal-900 font-semibold text-xs transition"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4 text-teal-700" />
                  <span>Start New Bill (POS)</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Link
                href="/products"
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-slate-700" />
                  <span>Add or Restock Products</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Link
                href="/customers"
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-700" />
                  <span>Customer Khata Ledger</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Link
                href="/settings"
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-slate-700" />
                  <span>Store GST & UPI Settings</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* GST Info Note */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">GST Compliance Mode:</span>
            <p>
              Exclusive GST calculation is enabled. Selling rates serve as the base taxable value, with automatic CGST+SGST (Intra-state) or IGST (Inter-state) calculated at checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
