"use client";

import React, { useState } from "react";
import { BusinessSettings, Customer, PaymentMethod } from "@/types/billing";
import { formatCurrency } from "@/lib/utils";
import { QrCode } from "@/components/QrCode";
import { 
  X, 
  CreditCard, 
  Banknote, 
  QrCode as QrIcon, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  customer: Customer | null;
  settings: BusinessSettings;
  onCompleteSale: (
    method: PaymentMethod,
    paidAmount: number,
    notes?: string
  ) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  grandTotal,
  customer,
  settings,
  onCompleteSale,
}) => {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashReceived, setCashReceived] = useState<string>(grandTotal.toString());
  const [notes, setNotes] = useState<string>("");

  if (!isOpen) return null;

  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeDue = Math.max(0, cashReceivedNum - grandTotal);

  // Dynamic UPI URL
  const upiPayload = settings.upiId
    ? `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(
        settings.storeName
      )}&am=${grandTotal}&cu=INR&tn=Bill_Payment`
    : "";

  const handleConfirm = () => {
    if (method === "credit" && !customer) {
      alert("Credit (Udhar) sale requires selecting or adding a customer with mobile number.");
      return;
    }

    const paid = method === "credit" ? 0 : grandTotal;
    onCompleteSale(method, paid, notes);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Final Checkout</span>
            <h3 className="font-bold text-lg text-white">Payment & Billing</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Big Amount Due Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block">
              Total Amount Payable
            </span>
            <div className="text-3xl font-extrabold text-teal-800 mt-0.5 tabular-nums">
              {formatCurrency(grandTotal)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Customer: <span className="font-semibold text-slate-800">{customer ? customer.name : "Walk-in Customer"}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Payment Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMethod("cash");
                  setCashReceived(grandTotal.toString());
                }}
                className={`py-3 px-2 rounded-xl border font-semibold text-sm flex flex-col items-center justify-center gap-1.5 transition ${
                  method === "cash"
                    ? "border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("upi")}
                className={`py-3 px-2 rounded-xl border font-semibold text-sm flex flex-col items-center justify-center gap-1.5 transition ${
                  method === "upi"
                    ? "border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                }`}
              >
                <QrIcon className="w-5 h-5" />
                <span>UPI (QR)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("credit")}
                className={`py-3 px-2 rounded-xl border font-semibold text-sm flex flex-col items-center justify-center gap-1.5 transition ${
                  method === "credit"
                    ? "border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Credit (Khata)</span>
              </button>
            </div>
          </div>

          {/* Method Specific UI */}
          {method === "cash" && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cash Received (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold tabular-nums border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCashReceived(grandTotal.toString())}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
                >
                  Exact ({grandTotal})
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived((Math.ceil(grandTotal / 100) * 100).toString())}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
                >
                  Round 100 ({Math.ceil(grandTotal / 100) * 100})
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived((Math.ceil(grandTotal / 500) * 500).toString())}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
                >
                  Round 500 ({Math.ceil(grandTotal / 500) * 500})
                </button>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-sm font-semibold text-slate-700">Change to Return:</span>
                <span className="text-base font-extrabold text-teal-800 tabular-nums">
                  {formatCurrency(changeDue)}
                </span>
              </div>
            </div>
          )}

          {method === "upi" && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
              <span className="text-xs font-semibold text-slate-600 block">
                Show QR to Customer to Scan & Pay
              </span>
              {upiPayload ? (
                <div className="inline-block p-2 bg-white rounded-lg shadow-xs border border-slate-200">
                  <QrCode value={upiPayload} size={150} />
                </div>
              ) : (
                <div className="p-4 text-xs text-amber-700 bg-amber-50 rounded">
                  Please set UPI ID in Settings to generate dynamic payment QR.
                </div>
              )}
              <div className="text-xs text-slate-500">
                UPI ID: <span className="font-mono font-bold text-slate-800">{settings.upiId || "Not Configured"}</span>
              </div>
            </div>
          )}

          {method === "credit" && (
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2">
              {!customer ? (
                <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Please select an existing customer or add a new customer before saving as Credit.</span>
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Customer Name:</span>
                    <span className="font-bold text-slate-900">{customer.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Previous Outstanding (Khata):</span>
                    <span className="font-semibold text-amber-900">{formatCurrency(customer.creditBalance)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>This Bill Amount:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-amber-200 font-bold text-slate-900 text-sm">
                    <span>New Total Balance Due:</span>
                    <span className="text-amber-900">{formatCurrency(customer.creditBalance + grandTotal)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Bill Note / Reference (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Counter sale, special agreement, token #14"
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={method === "credit" && !customer}
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete & Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
