import { BusinessSettings, Customer, CustomerTransaction, Invoice, Product } from "@/types/billing";

export const DEFAULT_SETTINGS: BusinessSettings = {
  storeName: "Shree Ganesh Retail & Traders",
  tagline: "Quality Groceries & Daily Needs at Best Rates",
  phone: "+91 98765 43210",
  email: "contact@shreeganeshstore.in",
  address: "Shop No. 12, Main Market Road, Sector 18",
  state: "Delhi",
  stateCode: "07",
  gstin: "07AAAAA0000A1Z5",
  pan: "AAAAA0000A",
  bankName: "State Bank of India",
  bankAccountNo: "38920192839",
  bankIfsc: "SBIN0001234",
  upiId: "shreeganesh@upi",
  invoicePrefix: "INV-2026-",
  invoiceCounter: 104,
  gstMode: "exclusive", // As selected by client
  terms: "1. Goods once sold will not be exchanged without invoice.\n2. Interest @18% p.a. will be charged if bill is not paid within 15 days.\n3. Subject to local jurisdiction only.",
  footerMessage: "Thank You for Shopping with Us! Visit Again.",
  securityPin: "1234",
  isLockEnabled: true,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Basmati Rice Royal Premium",
    code: "RIC-001",
    hsnCode: "1006",
    unit: "kg",
    purchasePrice: 95,
    sellingPrice: 120,
    currentStock: 150,
    minStockAlert: 20,
    gstRate: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-2",
    name: "Aashirvaad Shudh Chakki Atta (10kg)",
    code: "ATT-010",
    hsnCode: "1101",
    unit: "packet",
    purchasePrice: 380,
    sellingPrice: 440,
    currentStock: 45,
    minStockAlert: 10,
    gstRate: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-3",
    name: "Tata Salt Vacuum Evaporated (1kg)",
    code: "SLT-001",
    hsnCode: "2501",
    unit: "packet",
    purchasePrice: 22,
    sellingPrice: 28,
    currentStock: 80,
    minStockAlert: 15,
    gstRate: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-4",
    name: "Amul Butter Pasteurized (500g)",
    code: "AMU-500",
    hsnCode: "0405",
    unit: "packet",
    purchasePrice: 240,
    sellingPrice: 275,
    currentStock: 25,
    minStockAlert: 5,
    gstRate: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-5",
    name: "Fortune Sunlite Refined Oil (1L)",
    code: "OIL-001",
    hsnCode: "1512",
    unit: "litre",
    purchasePrice: 130,
    sellingPrice: 155,
    currentStock: 60,
    minStockAlert: 12,
    gstRate: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-6",
    name: "Surf Excel Easy Wash Detergent Powder (1kg)",
    code: "DET-001",
    hsnCode: "3402",
    unit: "packet",
    purchasePrice: 125,
    sellingPrice: 145,
    currentStock: 40,
    minStockAlert: 8,
    gstRate: 18,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-7",
    name: "Britannia Good Day Butter Cookies (Box)",
    code: "BIS-002",
    hsnCode: "1905",
    unit: "box",
    purchasePrice: 70,
    sellingPrice: 90,
    currentStock: 35,
    minStockAlert: 10,
    gstRate: 18,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-8",
    name: "Colgate Strong Teeth Toothpaste (200g)",
    code: "TP-001",
    hsnCode: "3306",
    unit: "piece",
    purchasePrice: 88,
    sellingPrice: 110,
    currentStock: 50,
    minStockAlert: 10,
    gstRate: 18,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-9",
    name: "Haldiram Bhujia Sev (400g)",
    code: "SNK-001",
    hsnCode: "2106",
    unit: "packet",
    purchasePrice: 95,
    sellingPrice: 115,
    currentStock: 3, // Low stock demo
    minStockAlert: 10,
    gstRate: 12,
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Rajesh Kumar",
    mobile: "9811223344",
    address: "H-42, Vikas Puri, New Delhi",
    state: "Delhi",
    gstin: "07BBLPK1234F1Z8",
    creditBalance: 1250, // Udhar balance
    createdAt: new Date().toISOString(),
  },
  {
    id: "cust-2",
    name: "Amit Sharma",
    mobile: "9871122334",
    address: "Flat 102, Green Park, New Delhi",
    state: "Delhi",
    creditBalance: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cust-3",
    name: "Pooja Verma",
    mobile: "9988776655",
    address: "Shop 4, Karol Bagh, New Delhi",
    state: "Delhi",
    gstin: "07AAPFV9876E1Z1",
    creditBalance: 3400,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cust-4",
    name: "Suresh Gupta (Wholesale)",
    mobile: "9899001122",
    address: "Industrial Area, Noida",
    state: "Uttar Pradesh", // Inter-state IGST demo
    gstin: "09AAHPG5555C1Z9",
    creditBalance: 0,
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-101",
    invoiceNumber: "INV-2026-0101",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    customerId: "cust-1",
    customerName: "Rajesh Kumar",
    customerMobile: "9811223344",
    customerAddress: "H-42, Vikas Puri, New Delhi",
    customerGstin: "07BBLPK1234F1Z8",
    customerState: "Delhi",
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        productName: "Basmati Rice Royal Premium",
        productCode: "RIC-001",
        hsnCode: "1006",
        unit: "kg",
        quantity: 5,
        unitPrice: 120,
        discountType: "flat",
        discountValue: 0,
        discountAmount: 0,
        taxableAmount: 600,
        gstRate: 5,
        cgstAmount: 15,
        sgstAmount: 15,
        igstAmount: 0,
        totalTax: 30,
        totalAmount: 630,
      },
      {
        id: "item-2",
        productId: "prod-4",
        productName: "Amul Butter Pasteurized (500g)",
        productCode: "AMU-500",
        hsnCode: "0405",
        unit: "packet",
        quantity: 2,
        unitPrice: 275,
        discountType: "flat",
        discountValue: 0,
        discountAmount: 0,
        taxableAmount: 550,
        gstRate: 12,
        cgstAmount: 33,
        sgstAmount: 33,
        igstAmount: 0,
        totalTax: 66,
        totalAmount: 616,
      }
    ],
    subtotal: 1150,
    totalDiscount: 0,
    taxableAmount: 1150,
    cgstTotal: 48,
    sgstTotal: 48,
    igstTotal: 0,
    totalTax: 96,
    roundOff: 0,
    grandTotal: 1246,
    paymentMethod: "upi",
    paymentStatus: "paid",
    paidAmount: 1246,
    notes: "Counter sale",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "inv-102",
    invoiceNumber: "INV-2026-0102",
    date: new Date(Date.now() - 86400000).toISOString(),
    customerId: "cust-3",
    customerName: "Pooja Verma",
    customerMobile: "9988776655",
    customerAddress: "Shop 4, Karol Bagh, New Delhi",
    customerGstin: "07AAPFV9876E1Z1",
    customerState: "Delhi",
    items: [
      {
        id: "item-3",
        productId: "prod-2",
        productName: "Aashirvaad Shudh Chakki Atta (10kg)",
        productCode: "ATT-010",
        hsnCode: "1101",
        unit: "packet",
        quantity: 2,
        unitPrice: 440,
        discountType: "flat",
        discountValue: 40,
        discountAmount: 40,
        taxableAmount: 840,
        gstRate: 5,
        cgstAmount: 21,
        sgstAmount: 21,
        igstAmount: 0,
        totalTax: 42,
        totalAmount: 882,
      }
    ],
    subtotal: 880,
    totalDiscount: 40,
    taxableAmount: 840,
    cgstTotal: 21,
    sgstTotal: 21,
    igstTotal: 0,
    totalTax: 42,
    roundOff: 0,
    grandTotal: 882,
    paymentMethod: "credit",
    paymentStatus: "unpaid",
    paidAmount: 0,
    notes: "Credit purchase added to Khata",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "inv-103",
    invoiceNumber: "INV-2026-0103",
    date: new Date().toISOString(),
    customerName: "Walk-in Customer",
    customerMobile: "N/A",
    customerState: "Delhi",
    items: [
      {
        id: "item-4",
        productId: "prod-7",
        productName: "Britannia Good Day Butter Cookies (Box)",
        productCode: "BIS-002",
        hsnCode: "1905",
        unit: "box",
        quantity: 3,
        unitPrice: 90,
        discountType: "percentage",
        discountValue: 5,
        discountAmount: 13.5,
        taxableAmount: 256.5,
        gstRate: 18,
        cgstAmount: 23.09,
        sgstAmount: 23.08,
        igstAmount: 0,
        totalTax: 46.17,
        totalAmount: 302.67,
      }
    ],
    subtotal: 270,
    totalDiscount: 13.5,
    taxableAmount: 256.5,
    cgstTotal: 23.09,
    sgstTotal: 23.08,
    igstTotal: 0,
    totalTax: 46.17,
    roundOff: 0.33,
    grandTotal: 303,
    paymentMethod: "cash",
    paymentStatus: "paid",
    paidAmount: 303,
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_TRANSACTIONS: CustomerTransaction[] = [
  {
    id: "tx-1",
    customerId: "cust-1",
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    type: "debit",
    amount: 1250,
    description: "Previous balance carried forward",
  },
  {
    id: "tx-2",
    customerId: "cust-3",
    invoiceId: "inv-102",
    date: new Date(Date.now() - 86400000).toISOString(),
    type: "debit",
    amount: 882,
    description: "Bill #INV-2026-0102 on Credit",
  }
];

import { 
  fetchProductsFromCloud, 
  syncAllProductsToCloud,
  fetchCustomersFromCloud,
  syncAllCustomersToCloud,
  fetchInvoicesFromCloud,
  syncInvoiceToCloud,
  fetchTransactionsFromCloud,
  syncTransactionToCloud,
  fetchSettingsFromCloud,
  syncSettingsToCloud,
  deleteProductFromCloud,
  deleteCustomerFromCloud
} from "./supabaseSync";

const KEYS = {
  SETTINGS: "billing_settings",
  PRODUCTS: "billing_products",
  CUSTOMERS: "billing_customers",
  INVOICES: "billing_invoices",
  TRANSACTIONS: "billing_transactions",
};

export function getStoredSettings(): BusinessSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(KEYS.SETTINGS);
  return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: BusinessSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  syncSettingsToCloud(settings);
}

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS;
  const raw = localStorage.getItem(KEYS.PRODUCTS);
  if (!raw) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(raw);
}

export function saveStoredProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  syncAllProductsToCloud(products);
}

export function removeProduct(id: string) {
  if (typeof window === "undefined") return;
  const current = getStoredProducts().filter((p) => p.id !== id);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(current));
  deleteProductFromCloud(id);
}

export function getStoredCustomers(): Customer[] {
  if (typeof window === "undefined") return INITIAL_CUSTOMERS;
  const raw = localStorage.getItem(KEYS.CUSTOMERS);
  if (!raw) {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
  }
  return JSON.parse(raw);
}

export function saveStoredCustomers(customers: Customer[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  syncAllCustomersToCloud(customers);
}

export function removeCustomer(id: string) {
  if (typeof window === "undefined") return;
  const current = getStoredCustomers().filter((c) => c.id !== id);
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(current));
  deleteCustomerFromCloud(id);
}

export function getStoredInvoices(): Invoice[] {
  if (typeof window === "undefined") return INITIAL_INVOICES;
  const raw = localStorage.getItem(KEYS.INVOICES);
  if (!raw) {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
    return INITIAL_INVOICES;
  }
  return JSON.parse(raw);
}

export function saveStoredInvoices(invoices: Invoice[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  // Sync the latest invoice to cloud
  if (invoices.length > 0) {
    syncInvoiceToCloud(invoices[0]);
  }
}

export function getStoredTransactions(): CustomerTransaction[] {
  if (typeof window === "undefined") return INITIAL_TRANSACTIONS;
  const raw = localStorage.getItem(KEYS.TRANSACTIONS);
  if (!raw) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }
  return JSON.parse(raw);
}

export function saveStoredTransactions(transactions: CustomerTransaction[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  if (transactions.length > 0) {
    syncTransactionToCloud(transactions[0]);
  }
}

/**
 * Background initial sync with Supabase cloud
 */
export async function syncAllWithCloud(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const [cloudProducts, cloudCustomers, cloudInvoices, cloudTransactions, cloudSettings] =
      await Promise.all([
        fetchProductsFromCloud(),
        fetchCustomersFromCloud(),
        fetchInvoicesFromCloud(),
        fetchTransactionsFromCloud(),
        fetchSettingsFromCloud(),
      ]);

    if (cloudProducts && cloudProducts.length > 0) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(cloudProducts));
    }
    if (cloudCustomers && cloudCustomers.length > 0) {
      localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(cloudCustomers));
    }
    if (cloudInvoices && cloudInvoices.length > 0) {
      localStorage.setItem(KEYS.INVOICES, JSON.stringify(cloudInvoices));
    }
    if (cloudTransactions && cloudTransactions.length > 0) {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(cloudTransactions));
    }
    if (cloudSettings) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(cloudSettings));
    }

    // Broadcast update event so all open views (POS, Products, Invoices) update immediately
    window.dispatchEvent(
      new CustomEvent("billing_cloud_synced", {
        detail: {
          products: cloudProducts,
          customers: cloudCustomers,
          invoices: cloudInvoices,
          transactions: cloudTransactions,
          settings: cloudSettings,
        },
      })
    );

    return true;
  } catch (err) {
    console.warn("Error syncing with cloud:", err);
    return false;
  }
}

