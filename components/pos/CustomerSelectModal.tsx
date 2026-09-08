"use client";

import React, { useState } from "react";
import { Customer } from "@/types/billing";
import { Search, UserPlus, X, Check, Phone, User, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  onAddNewCustomer: (newCust: Omit<Customer, "id" | "creditBalance" | "createdAt">) => Customer;
}

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  isOpen,
  onClose,
  customers,
  selectedCustomer,
  onSelectCustomer,
  onAddNewCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Customer Form State
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [state, setState] = useState("Delhi");

  if (!isOpen) return null;

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      alert("Please enter both Customer Name and Mobile Number");
      return;
    }
    const created = onAddNewCustomer({
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim() || undefined,
      gstin: gstin.trim().toUpperCase() || undefined,
      state: state.trim() || "Delhi",
    });
    onSelectCustomer(created);
    setIsAddingNew(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base">Select or Add Customer</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {!isAddingNew ? (
            <div className="space-y-4">
              {/* Search & Actions */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Name, Mobile or GSTIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>New</span>
                </button>
              </div>

              {/* Quick Walk-in Customer Option */}
              <div
                onClick={() => {
                  onSelectCustomer(null); // Walk-in / Guest customer
                  onClose();
                }}
                className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                  selectedCustomer === null
                    ? "border-teal-500 bg-teal-50/50"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50"
                }`}
              >
                <div>
                  <span className="font-bold text-sm text-slate-900 block">Walk-in Customer</span>
                  <span className="text-xs text-slate-500">Fast checkout without registered details</span>
                </div>
                {selectedCustomer === null && <Check className="w-5 h-5 text-teal-600" />}
              </div>

              {/* Customer List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {filteredCustomers.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No customers found matching &quot;{searchTerm}&quot;.
                    <button
                      onClick={() => {
                        setName(searchTerm);
                        setIsAddingNew(true);
                      }}
                      className="text-teal-600 font-semibold block mx-auto mt-2 hover:underline"
                    >
                      + Add &quot;{searchTerm}&quot; as new customer
                    </button>
                  </div>
                ) : (
                  filteredCustomers.map((cust) => {
                    const isSelected = selectedCustomer?.id === cust.id;
                    return (
                      <div
                        key={cust.id}
                        onClick={() => {
                          onSelectCustomer(cust);
                          onClose();
                        }}
                        className={`p-3 cursor-pointer transition flex items-center justify-between ${
                          isSelected ? "bg-teal-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-900">{cust.name}</span>
                            {cust.gstin && (
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">
                                GST
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-slate-500">
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {cust.mobile}
                            </span>
                            {cust.state && <span>{cust.state}</span>}
                          </div>
                          {cust.creditBalance > 0 && (
                            <span className="text-xs font-semibold text-amber-700 block">
                              Khata Balance Due: {formatCurrency(cust.creditBalance)}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-teal-600" />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Quick Add Customer Form */
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h4 className="font-bold text-sm text-slate-900">Add New Customer</h4>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Back to search
                </button>
              </div>

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

              <div className="grid grid-cols-2 gap-2">
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
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                    placeholder="e.g. Delhi, Maharashtra"
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
                  placeholder="15-digit GST Number (Optional)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop/House number, Street, City"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition"
                >
                  Save & Select
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
