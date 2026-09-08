"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BusinessSettings, Customer, Invoice } from "@/types/billing";
import { 
  getStoredInvoices, 
  getStoredSettings, 
  markInvoiceAsPaidInStorage
} from "@/lib/storage";
import { A4TaxInvoice } from "@/components/invoice/A4TaxInvoice";
import { ThermalReceipt } from "@/components/invoice/ThermalReceipt";
import { 
  Printer, 
  ArrowLeft, 
  CheckCircle, 
  FileText, 
  Receipt, 
  PlusCircle, 
  Share2 
} from "lucide-react";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [viewFormat, setViewFormat] = useState<"a4" | "thermal">("a4"); // A4 default as requested

  useEffect(() => {
    const reloadInvoice = () => {
      const invoices = getStoredInvoices();
      const found = invoices.find((inv) => inv.id === id || inv.invoiceNumber === id);
      if (found) {
        setInvoice(found);
      }
      setSettings(getStoredSettings());
    };

    reloadInvoice();

    window.addEventListener("billing_cloud_synced", reloadInvoice);
    window.addEventListener("focus", reloadInvoice);

    return () => {
      window.removeEventListener("billing_cloud_synced", reloadInvoice);
      window.removeEventListener("focus", reloadInvoice);
    };
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAsPaid = async () => {
    if (!invoice || invoice.paymentStatus === "paid") return;

    if (confirm(`Mark Invoice #${invoice.invoiceNumber} as PAID in Cash/UPI?`)) {
      const updated = await markInvoiceAsPaidInStorage(invoice.id);
      if (updated) {
        setInvoice(updated);
      }
    }
  };

  if (!invoice || !settings) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center p-6 bg-white rounded-xl shadow-xs border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Invoice Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">
          The requested invoice does not exist or has been deleted.
        </p>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-4 px-2 sm:px-4">
      {/* Top Action Bar (Hidden on print) */}
      <div className="max-w-4xl mx-auto mb-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center space-x-2">
          <Link
            href="/invoices"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Back to All Invoices"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Invoice #{invoice.invoiceNumber}
            </h1>
            <span className="text-xs text-slate-500">
              Customer: {invoice.customerName} ({invoice.customerMobile})
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Format Switcher */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
            <button
              onClick={() => setViewFormat("a4")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                viewFormat === "a4"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              A4 Tax Invoice (Default)
            </button>
            <button
              onClick={() => setViewFormat("thermal")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                viewFormat === "thermal"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              3&quot; Thermal Slip
            </button>
          </div>

          {/* Mark as paid button if unpaid */}
          {invoice.paymentStatus !== "paid" && (
            <button
              onClick={handleMarkAsPaid}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Paid
            </button>
          )}

          {/* Print / Save PDF button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Print / PDF
          </button>

          {/* Create New Bill shortcut */}
          <Link
            href="/pos"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            New Bill
          </Link>
        </div>
      </div>

      {/* Invoice Document Canvas */}
      <div className="max-w-4xl mx-auto">
        {viewFormat === "a4" ? (
          <div className="overflow-x-auto pb-6 -mx-2 px-2 sm:mx-0 sm:px-0">
            <div className="sm:hidden mb-2 text-center no-print">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-200 text-slate-700">
                📄 Full A4 Tax Invoice (Pan horizontally or Print)
              </span>
            </div>
            <div className="w-fit mx-auto min-w-[760px] md:min-w-0 md:w-full">
              <A4TaxInvoice invoice={invoice} settings={settings} />
            </div>
          </div>
        ) : (
          <div className="pb-6">
            <ThermalReceipt invoice={invoice} settings={settings} />
          </div>
        )}
      </div>
    </div>
  );
}
