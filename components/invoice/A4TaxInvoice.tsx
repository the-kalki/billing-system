"use client";

import React from "react";
import { BusinessSettings, Invoice } from "@/types/billing";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { numberToWordsRupees } from "@/lib/calculations";
import { QrCode } from "@/components/QrCode";

interface A4TaxInvoiceProps {
  invoice: Invoice;
  settings: BusinessSettings;
}

export const A4TaxInvoice: React.FC<A4TaxInvoiceProps> = ({ invoice, settings }) => {
  // UPI QR payload: upi://pay?pa={upiId}&pn={storeName}&am={grandTotal}&cu=INR
  const upiPayload = settings.upiId
    ? `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(
        settings.storeName
      )}&am=${invoice.grandTotal}&cu=INR&tn=Bill_${invoice.invoiceNumber}`
    : "";

  return (
    <div className="bg-white text-slate-900 border border-slate-300 shadow-sm p-8 max-w-4xl mx-auto my-4 text-xs font-sans print:border-none print:shadow-none print:my-0 print:p-0">
      {/* Title Header */}
      <div className="text-center pb-3 border-b-2 border-slate-900">
        <h1 className="text-xl font-bold tracking-tight uppercase text-slate-950">TAX INVOICE</h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
          (Original for Recipient / Tax-Compliant Invoice)
        </p>
      </div>

      {/* Seller & Invoice Metadata Grid */}
      <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-300">
        {/* Company / Seller Details */}
        <div>
          <h2 className="text-base font-bold text-slate-950">{settings.storeName}</h2>
          {settings.tagline && <p className="text-slate-600 text-[11px] mb-1 italic">{settings.tagline}</p>}
          <p className="text-slate-700">{settings.address}</p>
          <p className="text-slate-700">
            State: <span className="font-semibold">{settings.state}</span> (Code: {settings.stateCode})
          </p>
          <p className="text-slate-700">Phone: {settings.phone}</p>
          {settings.email && <p className="text-slate-700">Email: {settings.email}</p>}
          <p className="font-bold text-slate-900 mt-1">
            GSTIN: <span className="tracking-wider">{settings.gstin}</span>
          </p>
        </div>

        {/* Invoice Meta */}
        <div className="bg-slate-50 p-3 rounded border border-slate-200 text-right space-y-1">
          <div className="flex justify-between items-center text-left">
            <span className="text-slate-500 font-medium">Invoice No:</span>
            <span className="font-bold text-sm text-slate-900">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between items-center text-left">
            <span className="text-slate-500 font-medium">Invoice Date:</span>
            <span className="font-semibold text-slate-900">{formatDateTime(invoice.date)}</span>
          </div>
          <div className="flex justify-between items-center text-left">
            <span className="text-slate-500 font-medium">Payment Mode:</span>
            <span className="uppercase font-semibold text-slate-900">{invoice.paymentMethod}</span>
          </div>
          <div className="flex justify-between items-center text-left">
            <span className="text-slate-500 font-medium">Payment Status:</span>
            <span
              className={`uppercase font-bold px-2 py-0.5 rounded text-[10px] ${
                invoice.paymentStatus === "paid"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {invoice.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Bill To / Customer Details */}
      <div className="py-3 border-b border-slate-300">
        <h3 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider mb-1">
          Bill To (Customer Details)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-sm text-slate-900">{invoice.customerName}</p>
            <p className="text-slate-700">Mobile: {invoice.customerMobile}</p>
            {invoice.customerAddress && <p className="text-slate-700">Address: {invoice.customerAddress}</p>}
          </div>
          <div className="text-right">
            {invoice.customerGstin && (
              <p className="font-semibold text-slate-900">
                Customer GSTIN: <span className="font-bold">{invoice.customerGstin}</span>
              </p>
            )}
            <p className="text-slate-700">
              Place of Supply: {invoice.customerState || settings.state}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-4">
        <table className="w-full border-collapse border border-slate-300 text-left">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
              <th className="p-2 border-r border-slate-300 w-8 text-center">#</th>
              <th className="p-2 border-r border-slate-300">Item Description</th>
              <th className="p-2 border-r border-slate-300 text-center w-16">HSN</th>
              <th className="p-2 border-r border-slate-300 text-right w-14">Qty</th>
              <th className="p-2 border-r border-slate-300 text-center w-14">Unit</th>
              <th className="p-2 border-r border-slate-300 text-right w-20">Rate (₹)</th>
              <th className="p-2 border-r border-slate-300 text-right w-16">Disc.</th>
              <th className="p-2 border-r border-slate-300 text-right w-20">Taxable</th>
              <th className="p-2 border-r border-slate-300 text-right w-14">GST %</th>
              <th className="p-2 text-right w-24">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoice.items.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-slate-50 text-[11px]">
                <td className="p-2 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                <td className="p-2 border-r border-slate-300 font-medium text-slate-950">
                  {item.productName}
                  {item.productCode && (
                    <span className="text-[10px] text-slate-500 block">Code: {item.productCode}</span>
                  )}
                </td>
                <td className="p-2 border-r border-slate-300 text-center text-slate-600 font-mono">
                  {item.hsnCode || "-"}
                </td>
                <td className="p-2 border-r border-slate-300 text-right font-semibold tabular-nums">
                  {item.quantity}
                </td>
                <td className="p-2 border-r border-slate-300 text-center text-slate-600">{item.unit}</td>
                <td className="p-2 border-r border-slate-300 text-right tabular-nums">
                  {item.unitPrice.toFixed(2)}
                </td>
                <td className="p-2 border-r border-slate-300 text-right tabular-nums text-slate-600">
                  {item.discountAmount > 0 ? item.discountAmount.toFixed(2) : "-"}
                </td>
                <td className="p-2 border-r border-slate-300 text-right font-medium tabular-nums">
                  {item.taxableAmount.toFixed(2)}
                </td>
                <td className="p-2 border-r border-slate-300 text-right tabular-nums text-slate-600">
                  {item.gstRate}%
                </td>
                <td className="p-2 text-right font-bold tabular-nums text-slate-950">
                  {item.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tax Breakdown & Totals */}
      <div className="grid grid-cols-12 gap-4 py-2 border-t border-slate-300">
        {/* Left: Amount in words & Bank/UPI Info */}
        <div className="col-span-7 space-y-3">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Amount in Words:
            </span>
            <p className="font-semibold text-slate-900 text-xs italic">
              {numberToWordsRupees(invoice.grandTotal)}
            </p>
          </div>

          {/* Bank & UPI QR Block */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 flex items-start gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-[11px] text-slate-800 uppercase mb-1">Bank & Payment Details</h4>
              {settings.bankName && <p className="text-slate-700">Bank: <span className="font-semibold">{settings.bankName}</span></p>}
              {settings.bankAccountNo && <p className="text-slate-700">A/C No: <span className="font-semibold font-mono">{settings.bankAccountNo}</span></p>}
              {settings.bankIfsc && <p className="text-slate-700">IFSC: <span className="font-semibold font-mono">{settings.bankIfsc}</span></p>}
              {settings.upiId && (
                <p className="text-slate-700 mt-1">
                  UPI ID: <span className="font-semibold text-teal-700 font-mono">{settings.upiId}</span>
                </p>
              )}
            </div>

            {upiPayload && (
              <div className="text-center">
                <QrCode value={upiPayload} size={84} />
                <span className="text-[9px] text-slate-500 font-medium block mt-1">Scan to Pay via UPI</span>
              </div>
            )}
          </div>

          {/* Terms */}
          {settings.terms && (
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Terms & Conditions:
              </span>
              <p className="text-[10px] text-slate-600 whitespace-pre-line leading-relaxed">
                {settings.terms}
              </p>
            </div>
          )}
        </div>

        {/* Right: Tax Breakdown Box & Final Grand Total */}
        <div className="col-span-5 space-y-1 bg-slate-50 p-3 rounded border border-slate-200 text-[11px]">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-600">Subtotal (Base Price):</span>
            <span className="font-semibold tabular-nums">{formatCurrency(invoice.subtotal)}</span>
          </div>

          {invoice.totalDiscount > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-700 font-medium">
              <span>Total Discount:</span>
              <span className="tabular-nums">- {formatCurrency(invoice.totalDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-700 font-medium">Taxable Value:</span>
            <span className="font-semibold tabular-nums">{formatCurrency(invoice.taxableAmount)}</span>
          </div>

          {invoice.cgstTotal > 0 && (
            <div className="flex justify-between py-0.5 text-slate-600">
              <span>Central GST (CGST):</span>
              <span className="tabular-nums">{formatCurrency(invoice.cgstTotal)}</span>
            </div>
          )}

          {invoice.sgstTotal > 0 && (
            <div className="flex justify-between py-0.5 text-slate-600">
              <span>State GST (SGST):</span>
              <span className="tabular-nums">{formatCurrency(invoice.sgstTotal)}</span>
            </div>
          )}

          {invoice.igstTotal > 0 && (
            <div className="flex justify-between py-0.5 text-slate-600">
              <span>Integrated GST (IGST):</span>
              <span className="tabular-nums">{formatCurrency(invoice.igstTotal)}</span>
            </div>
          )}

          <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
            <span>Total GST Tax:</span>
            <span className="font-semibold tabular-nums">{formatCurrency(invoice.totalTax)}</span>
          </div>

          {invoice.roundOff !== 0 && (
            <div className="flex justify-between py-0.5 text-slate-500">
              <span>Round Off:</span>
              <span className="tabular-nums">{invoice.roundOff > 0 ? `+${invoice.roundOff.toFixed(2)}` : invoice.roundOff.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-2 border-t-2 border-slate-900 mt-2 text-slate-950 font-bold text-sm bg-teal-50 px-2 rounded">
            <span>GRAND TOTAL:</span>
            <span className="text-base text-teal-800 tabular-nums">{formatCurrency(invoice.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Signature & Sign-off Footer */}
      <div className="pt-8 mt-6 border-t border-slate-300 flex justify-between items-end">
        <div className="text-left text-[11px] text-slate-500 italic">
          {settings.footerMessage}
        </div>
        <div className="text-center w-48">
          <div className="h-12"></div>
          <p className="border-t border-slate-400 pt-1 font-bold text-[11px] text-slate-900">
            For {settings.storeName}
          </p>
          <p className="text-[10px] text-slate-500">Authorized Signatory</p>
        </div>
      </div>

      {/* Developer Colophon / Attribution */}
      <div className="pt-4 text-center text-[9px] text-slate-400 font-medium">
        Billing System Architecture &amp; Design by{" "}
        <a
          href="https://www.shunya-labs.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-teal-700 underline"
        >
          Shunya Labs (www.shunya-labs.com)
        </a>
      </div>
    </div>
  );
};
