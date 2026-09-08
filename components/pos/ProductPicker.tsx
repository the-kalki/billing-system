"use client";

import React, { useState } from "react";
import { Product } from "@/types/billing";
import { Search, Plus, Barcode, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductPickerProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const ProductPicker: React.FC<ProductPickerProps> = ({ products, onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.hsnCode && p.hsnCode.includes(searchTerm));

    if (selectedCategory === "all") return matchesSearch;
    if (selectedCategory === "low-stock") return matchesSearch && p.currentStock <= p.minStockAlert;
    return matchesSearch && p.unit === selectedCategory;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
        <div className="relative">
          <Barcode className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Scan Barcode or Search Products (Name, SKU, HSN)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-medium"
            autoFocus
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded-full font-medium transition shrink-0 ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setSelectedCategory("low-stock")}
            className={`px-2.5 py-1 rounded-full font-medium transition shrink-0 flex items-center gap-1 ${
              selectedCategory === "low-stock"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </button>
          {["packet", "piece", "kg", "litre", "box"].map((unit) => (
            <button
              key={unit}
              onClick={() => setSelectedCategory(unit)}
              className={`px-2.5 py-1 rounded-full font-medium transition shrink-0 capitalize ${
                selectedCategory === unit
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid / List */}
      <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No products found matching &quot;{searchTerm}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map((prod) => {
              const isLowStock = prod.currentStock <= prod.minStockAlert;
              const isOutOfStock = prod.currentStock <= 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => !isOutOfStock && onAddToCart(prod)}
                  className={`p-3 rounded-lg border transition text-left flex flex-col justify-between ${
                    isOutOfStock
                      ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200"
                      : "cursor-pointer bg-white hover:border-teal-500 hover:shadow-xs border-slate-200 group"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-semibold text-sm text-slate-900 group-hover:text-teal-700 line-clamp-1">
                        {prod.name}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 font-medium">
                        {prod.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>Unit: <b className="text-slate-700 font-semibold">{prod.unit}</b></span>
                      <span>•</span>
                      <span>GST: <b className="text-slate-700 font-semibold">{prod.gstRate}%</b></span>
                      {prod.hsnCode && (
                        <>
                          <span>•</span>
                          <span>HSN: <span className="font-mono">{prod.hsnCode}</span></span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                    <div>
                      <div className="text-base font-bold text-slate-950 tabular-nums">
                        {formatCurrency(prod.sellingPrice)}
                        <span className="text-[10px] text-slate-500 font-normal ml-0.5">/{prod.unit}</span>
                      </div>
                      <div className="text-[10px] flex items-center gap-1">
                        {isOutOfStock ? (
                          <span className="text-red-600 font-bold">Out of stock</span>
                        ) : isLowStock ? (
                          <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> Stock: {prod.currentStock} {prod.unit}
                          </span>
                        ) : (
                          <span className="text-slate-500">Stock: {prod.currentStock} {prod.unit}</span>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      className="p-1.5 rounded-md bg-slate-100 group-hover:bg-teal-600 text-slate-600 group-hover:text-white transition"
                      title="Add to cart"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
