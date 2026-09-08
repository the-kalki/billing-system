"use client";

import React from "react";
import { Customer, InvoiceItem } from "@/types/billing";
import { formatCurrency } from "@/lib/utils";
import { 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  ShoppingBag, 
  Percent, 
  ArrowRight, 
  RefreshCcw,
  Sparkles
} from "lucide-react";

interface PosCartProps {
  items: InvoiceItem[];
  customer: Customer | null;
  onOpenCustomerModal: () => void;
  onUpdateQuantity: (index: number, qty: number) => void;
  onUpdateDiscount: (index: number, type: "percentage" | "flat", value: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onOpenPaymentModal: () => void;
  totals: {
    subtotal: number;
    totalDiscount: number;
    taxableAmount: number;
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    totalTax: number;
    roundOff: number;
    grandTotal: number;
  };
}

export const PosCart: React.FC<PosCartProps> = ({
  items,
  customer,
  onOpenCustomerModal,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemoveItem,
  onClearCart,
  onOpenPaymentModal,
  totals,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Customer Header Strip */}
      <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-teal-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">
                {customer ? customer.name : "Walk-in Customer"}
              </span>
              {customer?.gstin && (
                <span className="text-[9px] bg-teal-900 text-teal-300 font-mono px-1 rounded">
                  GST
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">
              {customer ? `Ph: ${customer.mobile}` : "Cash Customer"}
              {customer && customer.creditBalance > 0 && (
                <span className="text-amber-400 font-semibold ml-2">
                  (Khata: {formatCurrency(customer.creditBalance)})
                </span>
              )}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCustomerModal}
          className="text-xs font-semibold px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded border border-slate-700 transition"
        >
          {customer ? "Change" : "+ Select Customer"}
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-300">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-700 text-sm">Billing Cart is Empty</h4>
            <p className="text-xs text-slate-400 mt-1">
              Select products from the catalog or scan barcode to add to bill
            </p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={item.id || idx} className="py-2.5 px-1 space-y-1.5">
              {/* Line 1: Name, Rate, Line Total */}
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                  <div className="font-bold text-sm text-slate-900 leading-tight line-clamp-1">
                    {item.productName}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>Rate: {formatCurrency(item.unitPrice)}/{item.unit}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">GST: {item.gstRate}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-slate-900 tabular-nums">
                    {formatCurrency(item.totalAmount)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Tax: ₹{item.totalTax.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Line 2: Quantity Controls, Discount, Delete */}
              <div className="flex items-center justify-between gap-2 pt-1">
                {/* Quantity Buttons */}
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                    className="p-1 text-slate-600 hover:bg-slate-200 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(idx, parseFloat(e.target.value) || 0)}
                    className="w-14 text-center text-xs font-bold bg-white py-1 focus:outline-none tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                    className="p-1 text-slate-600 hover:bg-slate-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Discount Modifier */}
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-500">Disc:</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={item.discountValue === 0 ? "" : item.discountValue}
                    onChange={(e) =>
                      onUpdateDiscount(
                        idx,
                        item.discountType,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-12 text-center text-xs border border-slate-200 rounded py-0.5 px-1 focus:ring-1 focus:ring-teal-500 focus:outline-none tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateDiscount(
                        idx,
                        item.discountType === "percentage" ? "flat" : "percentage",
                        item.discountValue
                      )
                    }
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                    title={`Current: ${item.discountType}. Click to toggle % / ₹`}
                  >
                    {item.discountType === "percentage" ? "%" : "₹"}
                  </button>
                </div>

                {/* Remove Line */}
                <button
                  type="button"
                  onClick={() => onRemoveItem(idx)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Checkout Footer */}
      <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-2">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal ({items.length} items):</span>
            <span className="font-semibold tabular-nums">{formatCurrency(totals.subtotal)}</span>
          </div>

          {totals.totalDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Total Discount:</span>
              <span className="tabular-nums">- {formatCurrency(totals.totalDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>Taxable Value:</span>
            <span className="font-medium tabular-nums">{formatCurrency(totals.taxableAmount)}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>GST Tax (Exclusive):</span>
            <span className="font-semibold tabular-nums">{formatCurrency(totals.totalTax)}</span>
          </div>

          {totals.roundOff !== 0 && (
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Round Off:</span>
              <span className="tabular-nums">
                {totals.roundOff > 0 ? `+${totals.roundOff.toFixed(2)}` : totals.roundOff.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Grand Total Strip */}
        <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
              Grand Total
            </span>
            <span className="text-2xl font-extrabold text-teal-800 tabular-nums">
              {formatCurrency(totals.grandTotal)}
            </span>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1"
            >
              <RefreshCcw className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Checkout Button */}
        <button
          type="button"
          disabled={items.length === 0}
          onClick={onOpenPaymentModal}
          className="w-full mt-2 py-3.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl font-bold text-base shadow-sm transition flex items-center justify-center space-x-2"
        >
          <span>Pay & Checkout</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
