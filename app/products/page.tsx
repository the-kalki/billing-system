"use client";

import React, { useState, useEffect, useRef } from "react";
import { Product, UnitType } from "@/types/billing";
import { getStoredProducts, saveStoredProducts, removeProduct } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Barcode, 
  Layers, 
  CheckCircle2, 
  X,
  Upload,
  Download,
  FileSpreadsheet
} from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [unit, setUnit] = useState<UnitType>("piece");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [minStockAlert, setMinStockAlert] = useState("10");
  const [gstRate, setGstRate] = useState("5");

  useEffect(() => {
    const load = () => {
      setProducts(getStoredProducts());
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

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName("");
    setCode("SKU-" + Math.floor(1000 + Math.random() * 9000));
    setHsnCode("");
    setUnit("piece");
    setPurchasePrice("");
    setSellingPrice("");
    setCurrentStock("50");
    setMinStockAlert("10");
    setGstRate("5");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCode(p.code);
    setHsnCode(p.hsnCode || "");
    setUnit(p.unit);
    setPurchasePrice(p.purchasePrice.toString());
    setSellingPrice(p.sellingPrice.toString());
    setCurrentStock(p.currentStock.toString());
    setMinStockAlert(p.minStockAlert.toString());
    setGstRate(p.gstRate.toString());
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !sellingPrice) {
      alert("Please fill in Product Name, Code, and Selling Price");
      return;
    }

    const buyPrice = parseFloat(purchasePrice) || 0;
    const sellPrice = parseFloat(sellingPrice) || 0;
    const stock = parseFloat(currentStock) || 0;
    const alertThreshold = parseFloat(minStockAlert) || 5;
    const taxRate = parseFloat(gstRate) || 0;

    let updatedList: Product[];

    if (editingProduct) {
      updatedList = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: name.trim(),
              code: code.trim(),
              hsnCode: hsnCode.trim() || undefined,
              unit,
              purchasePrice: buyPrice,
              sellingPrice: sellPrice,
              currentStock: stock,
              minStockAlert: alertThreshold,
              gstRate: taxRate,
            }
          : p
      );
    } else {
      const newProduct: Product = {
        id: "prod-" + Date.now(),
        name: name.trim(),
        code: code.trim(),
        hsnCode: hsnCode.trim() || undefined,
        unit,
        purchasePrice: buyPrice,
        sellingPrice: sellPrice,
        currentStock: stock,
        minStockAlert: alertThreshold,
        gstRate: taxRate,
        createdAt: new Date().toISOString(),
      };
      updatedList = [newProduct, ...products];
    }

    setProducts(updatedList);
    saveStoredProducts(updatedList);
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string, prodName: string) => {
    if (confirm(`Are you sure you want to delete "${prodName}" from inventory?`)) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      removeProduct(id);
    }
  };

  const handleDownloadTemplate = () => {
    const header = "Name,Code,HSN,Unit,PurchasePrice,SellingPrice,Stock,MinAlert,GSTRate\n";
    const sample = "Basmati Rice Premium,RIC-001,1006,kg,95,120,100,20,5\nTata Tea Gold,TEA-002,0902,packet,140,165,50,10,5";
    const blob = new Blob([header + sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_inventory_template.csv";
    a.click();
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        alert("CSV file appears to be empty or missing data rows.");
        return;
      }

      // Skip header line
      const newItems: Product[] = [];
      const currentList = [...products];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (cols.length >= 2 && cols[0]) {
          const name = cols[0];
          const code = cols[1] || `SKU-${Date.now()}-${i}`;
          const hsnCode = cols[2] || "";
          const unit = (cols[3] || "piece") as UnitType;
          const purchasePrice = parseFloat(cols[4]) || 0;
          const sellingPrice = parseFloat(cols[5]) || purchasePrice * 1.2;
          const currentStock = parseFloat(cols[6]) || 50;
          const minStockAlert = parseFloat(cols[7]) || 10;
          const gstRate = parseFloat(cols[8]) || 5;

          const existingIdx = currentList.findIndex((p) => p.code === code);
          const item: Product = {
            id: existingIdx > -1 ? currentList[existingIdx].id : `prod-${Date.now()}-${i}`,
            name,
            code,
            hsnCode,
            unit,
            purchasePrice,
            sellingPrice,
            currentStock,
            minStockAlert,
            gstRate,
            createdAt: new Date().toISOString(),
          };

          if (existingIdx > -1) {
            currentList[existingIdx] = item;
          } else {
            currentList.push(item);
          }
        }
      }

      setProducts(currentList);
      saveStoredProducts(currentList);
      alert(`Success! ${lines.length - 1} products processed & synced to cloud.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleAdjustStock = (id: string, delta: number) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          currentStock: Math.max(0, p.currentStock + delta),
        };
      }
      return p;
    });
    setProducts(updated);
    saveStoredProducts(updated);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.hsnCode && p.hsnCode.includes(searchTerm));

    if (unitFilter === "all") return matchesSearch;
    if (unitFilter === "low-stock") return matchesSearch && p.currentStock <= p.minStockAlert;
    return matchesSearch && p.unit === unitFilter;
  });

  const lowStockTotal = products.filter((p) => p.currentStock <= p.minStockAlert).length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Product & Inventory Catalog
          </h1>
          <p className="text-sm text-slate-500">
            Manage items, pricing, units, barcodes, HSN codes, and stock levels
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCSVUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
            title="Download CSV sample template"
          >
            <Download className="w-4 h-4" />
            <span>CSV Template</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs transition"
            title="Upload CSV of products"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-xs transition shrink-0 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Products
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{products.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alerts
          </span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{lowStockTotal}</div>
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, code/barcode, HSN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
          >
            <option value="all">All Units</option>
            <option value="low-stock">Low Stock Only</option>
            <option value="packet">Packet</option>
            <option value="piece">Piece</option>
            <option value="kg">Kilogram (kg)</option>
            <option value="litre">Litre</option>
            <option value="box">Box</option>
          </select>
        </div>
      </div>

      {/* Mobile Products Cards List (< 640px) */}
      <div className="block sm:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">
            No products found matching your search.
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isLow = p.currentStock <= p.minStockAlert;
            return (
              <div
                key={p.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{p.name}</h3>
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                      <Barcode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{p.code}</span>
                      {p.hsnCode && <span className="text-slate-400">• HSN {p.hsnCode}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-extrabold text-slate-950 tabular-nums">
                      {formatCurrency(p.sellingPrice)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Buy: {formatCurrency(p.purchasePrice)} • GST {p.gstRate}%
                    </span>
                  </div>
                </div>

                {/* Mobile Stock Controls & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(p.id, -1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold flex items-center justify-center text-sm border border-slate-200"
                      title="Decrease 1"
                    >
                      -
                    </button>
                    <span
                      className={`font-bold text-xs px-2.5 py-1.5 rounded-lg ${
                        isLow
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                      }`}
                    >
                      {p.currentStock} {p.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(p.id, 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold flex items-center justify-center text-sm border border-slate-200"
                      title="Increase 1"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(p)}
                      className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Product"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Products Table (>= 640px) */}
      <div className="hidden sm:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-bold">Item & Code</th>
                <th className="p-3.5 font-bold text-center">HSN</th>
                <th className="p-3.5 font-bold text-center">Unit</th>
                <th className="p-3.5 font-bold text-right">Buy Rate (₹)</th>
                <th className="p-3.5 font-bold text-right">Sell Rate (₹)</th>
                <th className="p-3.5 font-bold text-center">GST %</th>
                <th className="p-3.5 font-bold text-center">Stock Available</th>
                <th className="p-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.currentStock <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <Barcode className="w-3.5 h-3.5 text-slate-400" />
                          {p.code}
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono text-xs text-slate-600">
                        {p.hsnCode || "-"}
                      </td>
                      <td className="p-3.5 text-center capitalize text-slate-700 font-medium">
                        {p.unit}
                      </td>
                      <td className="p-3.5 text-right tabular-nums text-slate-600">
                        {formatCurrency(p.purchasePrice)}
                      </td>
                      <td className="p-3.5 text-right tabular-nums font-bold text-slate-900">
                        {formatCurrency(p.sellingPrice)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {p.gstRate}%
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAdjustStock(p.id, -1)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs"
                            title="Decrease 1"
                          >
                            -
                          </button>
                          <span
                            className={`font-bold text-xs px-2 py-0.5 rounded ${
                              isLow
                                ? "bg-amber-100 text-amber-900"
                                : "bg-emerald-100 text-emerald-900"
                            }`}
                          >
                            {p.currentStock} {p.unit}
                          </span>
                          <button
                            onClick={() => handleAdjustStock(p.id, 1)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs"
                            title="Increase 1"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tata Tea Premium (500g)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Code / Barcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. TEA-500 or Barcode"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    HSN / SAC Code
                  </label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="e.g. 0902"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitType)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none capitalize"
                  >
                    <option value="piece">Piece</option>
                    <option value="packet">Packet</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="gm">Gram (gm)</option>
                    <option value="litre">Litre</option>
                    <option value="box">Box</option>
                    <option value="meter">Meter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GST Tax Rate (%)
                  </label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="0">0% (Nil / Exempt)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price Base (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Opening Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Low Stock Alert Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold shadow-xs"
                >
                  {editingProduct ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
