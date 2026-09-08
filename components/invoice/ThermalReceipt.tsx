"use client";

import React from "react";
import { BusinessSettings, Invoice } from "@/types/billing";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { QrCode } from "@/components/QrCode";

interface ThermalReceiptProps {
  invoice: Invoice;
  settings: BusinessSettings;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ invoice, settings }) => {
  const upiPayload = settings.upiId
    ? `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(
        settings.storeName
      )}&am=${invoice.grandTotal}&cu=INR&tn=Bill_${invoice.invoiceNumber}`
    : "";

  return (
    <div className="bg-white text-black p-4 max-w-[80mm] mx-auto my-4 text-[11px] font-mono border border-dashed border-slate-300 shadow-sm print:border-none print:shadow-none print:m-0 print:p-0">
      {/* Store Header */}
      <div className="text-center pb-2 border-b border-black">
        <h2 className="text-sm font-bold uppercase">{settings.storeName}</h2>
        {settings.tagline && <p className="text-[10px] italic">{settings.tagline}</p>}
        <p className="text-[10px]">{settings.address}</p>
        <p className="text-[10px]">Ph: {settings.phone}</p>
        <p className="text-[10px] font-bold">GSTIN: {settings.gstin}</p>
      </div>

      {/* Bill Meta */}
      <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span>Bill No:</span>
          <span className="font-bold">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatDateTime(invoice.date)}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer:</span>
          <span className="font-semibold">{invoice.customerName}</span>
        </div>
        {invoice.customerMobile && invoice.customerMobile !== "N/A" && (
          <div className="flex justify-between">
            <span>Mobile:</span>
            <span>{invoice.customerMobile}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Mode:</span>
          <span className="uppercase font-bold">{invoice.paymentMethod}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="py-2 border-b border-dashed border-black">
        <div className="flex justify-between font-bold border-b border-black pb-1 mb-1 text-[10px]">
          <span className="w-1/2">Item</span>
          <span className="w-1/4 text-right">Qty</span>
          <span className="w-1/4 text-right">Amt (₹)</span>
        </div>

        <div className="space-y-1 text-[10px]">
          {invoice.items.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="font-semibold">{item.productName}</div>
              <div className="flex justify-between text-slate-700">
                <span className="text-[9px]">
                  {item.quantity} {item.unit} @ {item.unitPrice}
                  {item.discountAmount > 0 && ` (Disc -₹${item.discountAmount})`}
                </span>
                <span className="font-bold text-black">{item.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Summary */}
      <div className="py-2 border-b border-black space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{invoice.subtotal.toFixed(2)}</span>
        </div>
        {invoice.totalDiscount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{invoice.totalDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Taxable Value:</span>
          <span>{invoice.taxableAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Total GST Tax:</span>
          <span>{invoice.totalTax.toFixed(2)}</span>
        </div>
        {invoice.roundOff !== 0 && (
          <div className="flex justify-between">
            <span>Round Off:</span>
            <span>{invoice.roundOff > 0 ? `+${invoice.roundOff.toFixed(2)}` : invoice.roundOff.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs font-bold border-t border-dashed border-black pt-1">
          <span>TOTAL PAYABLE:</span>
          <span>{formatCurrency(invoice.grandTotal)}</span>
        </div>
        <div className="flex justify-between text-[10px] font-semibold">
          <span>Status:</span>
          <span className="uppercase">{invoice.paymentStatus}</span>
        </div>
      </div>

      {/* QR & Footer */}
      {upiPayload && (
        <div className="py-3 text-center border-b border-dashed border-black">
          <QrCode value={upiPayload} size={80} />
          <p className="text-[9px] mt-1 font-semibold">Scan to Pay via UPI</p>
        </div>
      )}

      <div className="pt-2 text-center text-[9px] space-y-1">
        <p className="font-semibold">{settings.footerMessage}</p>
        <p className="text-[8px] text-slate-500 font-medium">Computer Generated Receipt • Powered by Shunya Labs</p>
      </div>
    </div>
  );
};
