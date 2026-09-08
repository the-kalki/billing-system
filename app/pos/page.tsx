"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Customer, 
  Invoice, 
  InvoiceItem, 
  PaymentMethod, 
  Product, 
  BusinessSettings 
} from "@/types/billing";
import { 
  getStoredCustomers, 
  getStoredProducts, 
  getStoredSettings, 
  saveStoredCustomers, 
  saveStoredInvoices, 
  saveStoredProducts, 
  saveStoredSettings,
  saveStoredTransactions,
  getStoredInvoices,
  getStoredTransactions
} from "@/lib/storage";
import { calculateItemAmounts, calculateInvoiceTotals } from "@/lib/calculations";
import { ProductPicker } from "@/components/pos/ProductPicker";
import { PosCart } from "@/components/pos/PosCart";
import { CustomerSelectModal } from "@/components/pos/CustomerSelectModal";
import { PaymentModal } from "@/components/pos/PaymentModal";

export default function PosPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    setProducts(getStoredProducts());
    setCustomers(getStoredCustomers());
    setSettings(getStoredSettings());

    // Restore any existing cart from session storage if available
    const savedCart = sessionStorage.getItem("pos_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to restore cart", e);
      }
    }
  }, []);

  // Save cart to session storage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pos_cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const isInterState = Boolean(
    selectedCustomer?.state &&
    settings?.state &&
    selectedCustomer.state.trim().toLowerCase() !== settings.state.trim().toLowerCase()
  );

  const handleAddToCart = (product: Product) => {
    const existingIndex = cartItems.findIndex((item) => item.productId === product.id);

    if (existingIndex > -1) {
      const existing = cartItems[existingIndex];
      handleUpdateQuantity(existingIndex, existing.quantity + 1);
    } else {
      const calc = calculateItemAmounts({
        unitPrice: product.sellingPrice,
        quantity: 1,
        discountType: "flat",
        discountValue: 0,
        gstRate: product.gstRate,
        isInterState,
      });

      const newItem: InvoiceItem = {
        id: "item-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        hsnCode: product.hsnCode,
        unit: product.unit,
        quantity: 1,
        unitPrice: product.sellingPrice,
        discountType: "flat",
        discountValue: 0,
        discountAmount: calc.discountAmount,
        taxableAmount: calc.taxableAmount,
        gstRate: product.gstRate,
        cgstAmount: calc.cgstAmount,
        sgstAmount: calc.sgstAmount,
        igstAmount: calc.igstAmount,
        totalTax: calc.totalTax,
        totalAmount: calc.totalAmount,
      };

      setCartItems((prev) => [...prev, newItem]);
    }
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }

    setCartItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const calc = calculateItemAmounts({
        unitPrice: item.unitPrice,
        quantity: newQty,
        discountType: item.discountType,
        discountValue: item.discountValue,
        gstRate: item.gstRate,
        isInterState,
      });

      updated[index] = {
        ...item,
        quantity: newQty,
        discountAmount: calc.discountAmount,
        taxableAmount: calc.taxableAmount,
        cgstAmount: calc.cgstAmount,
        sgstAmount: calc.sgstAmount,
        igstAmount: calc.igstAmount,
        totalTax: calc.totalTax,
        totalAmount: calc.totalAmount,
      };
      return updated;
    });
  };

  const handleUpdateDiscount = (
    index: number,
    type: "percentage" | "flat",
    val: number
  ) => {
    setCartItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const calc = calculateItemAmounts({
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        discountType: type,
        discountValue: val,
        gstRate: item.gstRate,
        isInterState,
      });

      updated[index] = {
        ...item,
        discountType: type,
        discountValue: val,
        discountAmount: calc.discountAmount,
        taxableAmount: calc.taxableAmount,
        cgstAmount: calc.cgstAmount,
        sgstAmount: calc.sgstAmount,
        igstAmount: calc.igstAmount,
        totalTax: calc.totalTax,
        totalAmount: calc.totalAmount,
      };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    if (confirm("Are you sure you want to clear the entire billing cart?")) {
      setCartItems([]);
      sessionStorage.removeItem("pos_cart");
    }
  };

  const handleAddNewCustomer = (
    newCustData: Omit<Customer, "id" | "creditBalance" | "createdAt">
  ): Customer => {
    const newCust: Customer = {
      ...newCustData,
      id: "cust-" + Date.now(),
      creditBalance: 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [newCust, ...customers];
    setCustomers(updated);
    saveStoredCustomers(updated);
    return newCust;
  };

  const totals = calculateInvoiceTotals(cartItems);

  const handleCompleteSale = (
    method: PaymentMethod,
    paidAmount: number,
    notes?: string
  ) => {
    if (!settings) return;

    // 1. Generate Invoice Number
    const nextCounter = settings.invoiceCounter + 1;
    const formattedInvoiceNo = `${settings.invoicePrefix}${String(nextCounter).padStart(4, "0")}`;

    // 2. Determine Payment Status
    const paymentStatus =
      method === "credit"
        ? "unpaid"
        : paidAmount >= totals.grandTotal
        ? "paid"
        : "partial";

    // 3. Create Invoice Record
    const newInvoice: Invoice = {
      id: "inv-" + Date.now(),
      invoiceNumber: formattedInvoiceNo,
      date: new Date().toISOString(),
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer ? selectedCustomer.name : "Walk-in Customer",
      customerMobile: selectedCustomer ? selectedCustomer.mobile : "N/A",
      customerAddress: selectedCustomer?.address,
      customerGstin: selectedCustomer?.gstin,
      customerState: selectedCustomer?.state || settings.state,
      items: cartItems,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      taxableAmount: totals.taxableAmount,
      cgstTotal: totals.cgstTotal,
      sgstTotal: totals.sgstTotal,
      igstTotal: totals.igstTotal,
      totalTax: totals.totalTax,
      roundOff: totals.roundOff,
      grandTotal: totals.grandTotal,
      paymentMethod: method,
      paymentStatus: paymentStatus,
      paidAmount: paidAmount,
      notes: notes,
      createdAt: new Date().toISOString(),
    };

    // 4. Update Stock for Products
    const currentProducts = getStoredProducts();
    const updatedProducts = currentProducts.map((p) => {
      const soldItem = cartItems.find((item) => item.productId === p.id);
      if (soldItem) {
        return {
          ...p,
          currentStock: Math.max(0, p.currentStock - soldItem.quantity),
        };
      }
      return p;
    });
    setProducts(updatedProducts);
    saveStoredProducts(updatedProducts);

    // 5. Update Customer Khata / Credit Ledger if credit sale
    if (method === "credit" && selectedCustomer) {
      const currentCustomers = getStoredCustomers();
      const updatedCustomers = currentCustomers.map((c) => {
        if (c.id === selectedCustomer.id) {
          return {
            ...c,
            creditBalance: c.creditBalance + totals.grandTotal,
          };
        }
        return c;
      });
      setCustomers(updatedCustomers);
      saveStoredCustomers(updatedCustomers);

      // Record transaction
      const currentTransactions = getStoredTransactions();
      const newTx = {
        id: "tx-" + Date.now(),
        customerId: selectedCustomer.id,
        invoiceId: newInvoice.id,
        date: new Date().toISOString(),
        type: "debit" as const,
        amount: totals.grandTotal,
        description: `Invoice #${formattedInvoiceNo} on Credit`,
      };
      saveStoredTransactions([newTx, ...currentTransactions]);
    }

    // 6. Save Invoice to storage
    const currentInvoices = getStoredInvoices();
    saveStoredInvoices([newInvoice, ...currentInvoices]);

    // 7. Update Invoice Counter in Settings
    const updatedSettings = {
      ...settings,
      invoiceCounter: nextCounter,
    };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);

    // 8. Clear Cart & Close Modal
    setCartItems([]);
    sessionStorage.removeItem("pos_cart");
    setIsPaymentModalOpen(false);

    // 9. Navigate to newly generated Invoice View
    router.push(`/invoices/${newInvoice.id}`);
  };

  if (!settings) return null;

  return (
    <div className="flex-1 flex flex-col p-3 md:p-4 max-w-[1600px] w-full mx-auto">
      {/* POS Two-Column Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[calc(100vh-5.5rem)]">
        {/* Left Column: Fast Product Catalog / Search (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col h-[550px] lg:h-auto">
          <ProductPicker products={products} onAddToCart={handleAddToCart} />
        </div>

        {/* Right Column: Active Cart & Totals (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-[650px] lg:h-auto">
          <PosCart
            items={cartItems}
            customer={selectedCustomer}
            onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdateDiscount={handleUpdateDiscount}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            totals={totals}
          />
        </div>
      </div>

      {/* Customer Selection / Quick Add Modal */}
      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        onAddNewCustomer={handleAddNewCustomer}
      />

      {/* Checkout / Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        grandTotal={totals.grandTotal}
        customer={selectedCustomer}
        settings={settings}
        onCompleteSale={handleCompleteSale}
      />
    </div>
  );
}
