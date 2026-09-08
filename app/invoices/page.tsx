"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Invoice } from "@/types/billing";
import { getStoredInvoices, markInvoiceAsPaidInStorage } from "@/lib/storage";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { 
  FileText, 
  Search, 
  Filter, 
  PlusCircle, 
  Printer, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  CreditCard 
} from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [methodFilter, setMethodFilter] = useState<"all" | "cash" | "upi" | "credit">("all");

  useEffect(() => {
    const load = () => {
      setInvoices(getStoredInvoices());
    };
    load();

    const handleSync = () => load();
    window.addEventListener("billing_cloud_synced", handleSync);
    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("billing_cloud_synced", handleSync);
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleMarkPaid = async (e: React.MouseEvent, inv: Invoice) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Mark Invoice #${inv.invoiceNumber} (${inv.customerName}) as PAID in Cash/UPI?`)) {
      await markInvoiceAsPaidInStorage(inv.id);
      setInvoices(getStoredInvoices());
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerMobile.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ? true : inv.paymentStatus === statusFilter;

    const matchesMethod =
      methodFilter === "all" ? true : inv.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Calculate Metrics
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalCollected = invoices
    .filter((inv) => inv.paymentStatus === "paid")
    .reduce((sum, inv) => sum + inv.grandTotal, 0);
  const unpaidInvoices = invoices.filter((inv) => inv.paymentStatus === "unpaid");
  const totalPendingInvoices = unpaidInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Invoices & Sales Bills
          </h1>
          <p className="text-sm text-slate-500">
            View, search, reprint, and track customer payments
          </p>
        </div>
        <Link
          href="/pos"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-xs transition shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New Bill (POS)</span>
        </Link>
      </div>

      {/* Summary KPI Cards - Invoices & Collections */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Sales Invoiced
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {formatCurrency(totalRevenue)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Across {invoices.length} invoices
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
            Collected Cash / UPI
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 tabular-nums">
            {formatCurrency(totalCollected)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Fully settled bills
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
            Unpaid Bill Slips
          </span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1 tabular-nums">
            {formatCurrency(totalPendingInvoices)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {unpaidInvoices.length === 0 ? "All current bills settled" : `${unpaidInvoices.length} bill(s) pending payment`}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            aria-label="Search invoices"
            placeholder="Search invoice #, customer, or mobile…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                statusFilter === "paid" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600"
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setStatusFilter("unpaid")}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                statusFilter === "unpaid" ? "bg-white text-amber-800 shadow-xs" : "text-slate-600"
              }`}
            >
              Credit / Unpaid
            </button>
          </div>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as any)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
          >
            <option value="all">All Payment Modes</option>
            <option value="cash">Cash Only</option>
            <option value="upi">UPI Only</option>
            <option value="credit">Credit (Khata)</option>
          </select>
        </div>
      </div>

      {/* Mobile Invoices Cards List (< 640px) */}
      <div className="block sm:hidden space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">
            No invoices found matching your criteria.
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="font-bold text-teal-700 font-mono text-sm flex items-center gap-1 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    {inv.invoiceNumber}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(inv.date)}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-slate-950 tabular-nums">
                    {formatCurrency(inv.grandTotal)}
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold capitalize mt-0.5 ${
                      inv.paymentStatus === "paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {inv.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                <div>
                  <span className="font-semibold text-slate-900 block">{inv.customerName}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{inv.customerMobile}</span>
                </div>
                <div className="text-right">
                  <span className="uppercase font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px]">
                    {inv.paymentMethod}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {inv.items.length} {inv.items.length === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>

              <div className="pt-1 flex gap-2">
                <Link
                  href={`/invoices/${inv.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View / Print</span>
                </Link>
                {inv.paymentStatus === "unpaid" && (
                  <button
                    onClick={(e) => handleMarkPaid(e, inv)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Paid</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Invoices Data Table (>= 640px) */}
      <div className="hidden sm:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-bold">Invoice No</th>
                <th className="p-3.5 font-bold">Date & Time</th>
                <th className="p-3.5 font-bold">Customer Details</th>
                <th className="p-3.5 font-bold text-center">Items</th>
                <th className="p-3.5 font-bold text-right">Grand Total</th>
                <th className="p-3.5 font-bold text-center">Payment Mode</th>
                <th className="p-3.5 font-bold text-center">Status</th>
                <th className="p-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No invoices found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-slate-900 font-mono">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="text-teal-700 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="p-3.5 text-slate-600 text-xs whitespace-nowrap">
                      {formatDateTime(inv.date)}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-xs text-slate-500 font-mono">{inv.customerMobile}</div>
                    </td>
                    <td className="p-3.5 text-center text-slate-700 font-semibold">
                      {inv.items.length}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-950 tabular-nums">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="uppercase text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          inv.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                      {inv.paymentStatus === "unpaid" && (
                        <button
                          onClick={(e) => handleMarkPaid(e, inv)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Paid</span>
                        </button>
                      )}
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print / View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
