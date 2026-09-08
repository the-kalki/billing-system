"use client";

import React, { useState, useEffect } from "react";
import { Customer, CustomerTransaction } from "@/types/billing";
import { 
  getStoredCustomers, 
  saveStoredCustomers, 
  removeCustomer,
  getStoredTransactions, 
  saveStoredTransactions 
} from "@/lib/storage";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  BookOpen, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CreditCard 
} from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Add / Edit Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Khata Ledger Modal
  const [activeKhataCustomer, setActiveKhataCustomer] = useState<Customer | null>(null);

  // Receive Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("Cash payment received");

  // Form fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [state, setState] = useState("Delhi");

  useEffect(() => {
    setCustomers(getStoredCustomers());
    setTransactions(getStoredTransactions());
  }, []);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setName("");
    setMobile("");
    setAddress("");
    setGstin("");
    setState("Delhi");
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setMobile(c.mobile);
    setAddress(c.address || "");
    setGstin(c.gstin || "");
    setState(c.state || "Delhi");
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      alert("Name and Mobile are required");
      return;
    }

    let updatedList: Customer[];

    if (editingCustomer) {
      updatedList = customers.map((c) =>
        c.id === editingCustomer.id
          ? {
              ...c,
              name: name.trim(),
              mobile: mobile.trim(),
              address: address.trim() || undefined,
              gstin: gstin.trim().toUpperCase() || undefined,
              state: state.trim() || "Delhi",
            }
          : c
      );
    } else {
      const newCust: Customer = {
        id: "cust-" + Date.now(),
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim() || undefined,
        gstin: gstin.trim().toUpperCase() || undefined,
        state: state.trim() || "Delhi",
        creditBalance: 0,
        createdAt: new Date().toISOString(),
      };
      updatedList = [newCust, ...customers];
    }

    setCustomers(updatedList);
    saveStoredCustomers(updatedList);
    setIsCustomerModalOpen(false);
  };

  const handleDeleteCustomer = (id: string, custName: string) => {
    if (confirm(`Are you sure you want to delete customer "${custName}"?`)) {
      const updated = customers.filter((c) => c.id !== id);
      setCustomers(updated);
      removeCustomer(id);
    }
  };

  // Record Payment in Khata
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKhataCustomer) return;
    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) {
      alert("Enter a valid amount");
      return;
    }

    // 1. Update Customer Credit Balance
    const newBalance = Math.max(0, activeKhataCustomer.creditBalance - amt);
    const updatedCustomers = customers.map((c) =>
      c.id === activeKhataCustomer.id ? { ...c, creditBalance: newBalance } : c
    );
    setCustomers(updatedCustomers);
    saveStoredCustomers(updatedCustomers);

    // 2. Record Credit Transaction
    const newTx: CustomerTransaction = {
      id: "tx-" + Date.now(),
      customerId: activeKhataCustomer.id,
      date: new Date().toISOString(),
      type: "credit",
      amount: amt,
      description: paymentNote || "Payment received",
    };
    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    saveStoredTransactions(updatedTx);

    // Update active modal customer
    setActiveKhataCustomer({
      ...activeKhataCustomer,
      creditBalance: newBalance,
    });
    setIsPaymentModalOpen(false);
    setPaymentAmount("");
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + c.creditBalance, 0);

  const customerTransactions = activeKhataCustomer
    ? transactions.filter((tx) => tx.customerId === activeKhataCustomer.id)
    : [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Customer Directory & Khata Ledger
          </h1>
          <p className="text-sm text-slate-500">
            Track customer records, GSTIN, credit purchases, and payment history
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-xs transition shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Customers
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{customers.length}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
            Total Khata Udhar Outstanding
          </span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1 tabular-nums">
            {formatCurrency(totalOutstanding)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Pending customer credit dues
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider block">
            GST Registered Clients
          </span>
          <div className="text-2xl font-extrabold text-teal-700 mt-1">
            {customers.filter((c) => Boolean(c.gstin)).length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">B2B Business Accounts</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer by name, 10-digit mobile, GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-bold">Customer Name</th>
                <th className="p-3.5 font-bold">Mobile Number</th>
                <th className="p-3.5 font-bold">State / Address</th>
                <th className="p-3.5 font-bold">GSTIN</th>
                <th className="p-3.5 font-bold text-right">Khata Balance Due</th>
                <th className="p-3.5 font-bold text-center">Khata Ledger</th>
                <th className="p-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No customers found matching &quot;{searchTerm}&quot;.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-slate-900">{cust.name}</td>
                    <td className="p-3.5 font-mono text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {cust.mobile}
                    </td>
                    <td className="p-3.5 text-slate-600 text-xs">
                      <div>{cust.state || "Delhi"}</div>
                      {cust.address && (
                        <div className="text-slate-400 truncate max-w-xs">{cust.address}</div>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-xs text-slate-700">
                      {cust.gstin ? (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-800">
                          {cust.gstin}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unregistered</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-extrabold tabular-nums">
                      {cust.creditBalance > 0 ? (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          {formatCurrency(cust.creditBalance)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">₹0.00 (Clear)</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setActiveKhataCustomer(cust)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-md text-xs font-semibold transition"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>View Khata</span>
                      </button>
                    </td>
                    <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(cust)}
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Customer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Add/Edit Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State (Place of Supply)
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Delhi, Haryana"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GSTIN (If Applicable)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="15-digit GSTIN (Optional)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop/House number, Street, Area"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold shadow-xs"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Khata Ledger Modal */}
      {activeKhataCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Customer Ledger</span>
                <h3 className="font-bold text-lg text-white">{activeKhataCustomer.name}</h3>
                <span className="text-xs text-slate-300">Ph: {activeKhataCustomer.mobile}</span>
              </div>

              <button
                onClick={() => setActiveKhataCustomer(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Balance Banner & Receive Payment Button */}
            <div className="bg-amber-50 p-4 border-b border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-900 block">Total Balance Due (Udhar):</span>
                <span className="text-2xl font-extrabold text-amber-900 tabular-nums">
                  {formatCurrency(activeKhataCustomer.creditBalance)}
                </span>
              </div>

              <button
                onClick={() => {
                  setPaymentAmount(activeKhataCustomer.creditBalance.toString());
                  setIsPaymentModalOpen(true);
                }}
                disabled={activeKhataCustomer.creditBalance <= 0}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold rounded-lg text-sm transition shadow-xs flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Receive Payment</span>
              </button>
            </div>

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Transaction History
              </h4>

              {customerTransactions.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No ledger transactions recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {customerTransactions.map((tx) => (
                    <div key={tx.id} className="p-3 bg-white flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === "debit"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {tx.type === "debit" ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-900">
                            {tx.description}
                          </div>
                          <div className="text-xs text-slate-400">{formatDateTime(tx.date)}</div>
                        </div>
                      </div>

                      <div
                        className={`font-bold text-sm tabular-nums ${
                          tx.type === "debit" ? "text-amber-800" : "text-emerald-700"
                        }`}
                      >
                        {tx.type === "debit" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 text-right">
              <button
                onClick={() => setActiveKhataCustomer(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {isPaymentModalOpen && activeKhataCustomer && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <h4 className="font-bold text-sm">Receive Customer Payment</h4>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Amount Received (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold tabular-nums border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode & Note
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Cash received, GPay, Bank transfer"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold shadow-xs"
                >
                  Confirm & Update Khata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
