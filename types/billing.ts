export type UnitType = 'packet' | 'piece' | 'kg' | 'gm' | 'litre' | 'box' | 'meter';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  gstin?: string;
  state?: string;
  creditBalance: number; // Positive means customer owes store (Udhar)
  createdAt: string;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  invoiceId?: string;
  date: string;
  type: 'debit' | 'credit'; // debit: purchased on credit; credit: paid towards balance
  amount: number;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  code: string; // SKU or Barcode
  hsnCode?: string;
  unit: UnitType;
  purchasePrice: number;
  sellingPrice: number; // Base selling price (exclusive of GST)
  currentStock: number;
  minStockAlert: number;
  gstRate: number; // 0, 5, 12, 18, 28 (%)
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  hsnCode?: string;
  unit: UnitType;
  quantity: number;
  unitPrice: number; // Base rate
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
}

export type PaymentMethod = 'cash' | 'upi' | 'credit' | 'split';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId?: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  customerGstin?: string;
  customerState?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  notes?: string;
  createdAt: string;
}

export interface BusinessSettings {
  storeName: string;
  tagline?: string;
  phone: string;
  email?: string;
  address: string;
  state: string;
  stateCode: string; // e.g., '07' for Delhi, '27' for Maharashtra
  gstin: string;
  pan?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  upiId?: string; // For dynamic QR code payments
  invoicePrefix: string;
  invoiceCounter: number;
  gstMode: 'exclusive' | 'inclusive'; // Client selected 'exclusive'
  terms: string;
  footerMessage: string;
  securityPin?: string; // 4-digit store PIN (default: "1234")
  isLockEnabled?: boolean; // default true
}
