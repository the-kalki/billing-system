import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { 
  BusinessSettings, 
  Customer, 
  CustomerTransaction, 
  Invoice, 
  InvoiceItem, 
  Product 
} from "@/types/billing";

// -------------------------------------------------------------
// Cloud Converters (PostgreSQL snake_case <-> TypeScript camelCase)
// -------------------------------------------------------------

function mapProductToDB(p: Product) {
  return {
    id: p.id,
    name: p.name,
    code: p.code,
    hsn_code: p.hsnCode || null,
    unit: p.unit,
    purchase_price: p.purchasePrice,
    selling_price: p.sellingPrice,
    current_stock: p.currentStock,
    min_stock_alert: p.minStockAlert,
    gst_rate: p.gstRate,
  };
}

function mapProductFromDB(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    hsnCode: row.hsn_code || "",
    unit: row.unit,
    purchasePrice: Number(row.purchase_price) || 0,
    sellingPrice: Number(row.selling_price) || 0,
    currentStock: Number(row.current_stock) || 0,
    minStockAlert: Number(row.min_stock_alert) || 10,
    gstRate: Number(row.gst_rate) || 0,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapCustomerToDB(c: Customer) {
  return {
    id: c.id,
    name: c.name,
    mobile: c.mobile,
    address: c.address || null,
    gstin: c.gstin || null,
    state: c.state || "Delhi",
    credit_balance: c.creditBalance,
  };
}

function mapCustomerFromDB(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    mobile: row.mobile,
    address: row.address || "",
    gstin: row.gstin || "",
    state: row.state || "Delhi",
    creditBalance: Number(row.credit_balance) || 0,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapTransactionToDB(t: CustomerTransaction) {
  return {
    id: t.id,
    customer_id: t.customerId,
    invoice_id: t.invoiceId || null,
    date: t.date,
    type: t.type,
    amount: t.amount,
    description: t.description,
  };
}

function mapTransactionFromDB(row: any): CustomerTransaction {
  return {
    id: row.id,
    customerId: row.customer_id,
    invoiceId: row.invoice_id || undefined,
    date: row.date || row.created_at,
    type: row.type as "debit" | "credit",
    amount: Number(row.amount) || 0,
    description: row.description || "",
  };
}

function mapSettingsToDB(s: BusinessSettings) {
  return {
    id: "default",
    store_name: s.storeName,
    tagline: s.tagline || null,
    phone: s.phone,
    email: s.email || null,
    address: s.address,
    state: s.state,
    state_code: s.stateCode,
    gstin: s.gstin,
    pan: s.pan || null,
    bank_name: s.bankName || null,
    bank_account_no: s.bankAccountNo || null,
    bank_ifsc: s.bankIfsc || null,
    upi_id: s.upiId || null,
    invoice_prefix: s.invoicePrefix,
    invoice_counter: s.invoiceCounter,
    gst_mode: s.gstMode,
    terms: s.terms || null,
    footer_message: s.footerMessage || null,
  };
}

function mapSettingsFromDB(row: any): BusinessSettings {
  return {
    storeName: row.store_name,
    tagline: row.tagline || "",
    phone: row.phone,
    email: row.email || "",
    address: row.address,
    state: row.state,
    stateCode: row.state_code,
    gstin: row.gstin,
    pan: row.pan || "",
    bankName: row.bank_name || "",
    bankAccountNo: row.bank_account_no || "",
    bankIfsc: row.bank_ifsc || "",
    upiId: row.upi_id || "",
    invoicePrefix: row.invoice_prefix,
    invoiceCounter: Number(row.invoice_counter) || 100,
    gstMode: (row.gst_mode as "exclusive" | "inclusive") || "exclusive",
    terms: row.terms || "",
    footerMessage: row.footer_message || "",
  };
}

// -------------------------------------------------------------
// Cloud Sync & Persistence Functions
// -------------------------------------------------------------

export async function fetchProductsFromCloud(): Promise<Product[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(mapProductFromDB);
    }
  } catch (err) {
    console.warn("Supabase fetchProducts error:", err);
  }
  return null;
}

export async function syncProductToCloud(product: Product): Promise<void> {
  if (!supabase) return;
  try {
    const payload = mapProductToDB(product);
    await supabase.from("products").upsert(payload, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase syncProduct error:", err);
  }
}

export async function syncAllProductsToCloud(products: Product[]): Promise<void> {
  if (!supabase || products.length === 0) return;
  try {
    const payloads = products.map(mapProductToDB);
    await supabase.from("products").upsert(payloads, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase syncAllProducts error:", err);
  }
}

export async function deleteProductFromCloud(id: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from("products").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase deleteProduct error:", err);
  }
}

export async function fetchCustomersFromCloud(): Promise<Customer[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(mapCustomerFromDB);
    }
  } catch (err) {
    console.warn("Supabase fetchCustomers error:", err);
  }
  return null;
}

export async function syncCustomerToCloud(customer: Customer): Promise<void> {
  if (!supabase) return;
  try {
    const payload = mapCustomerToDB(customer);
    await supabase.from("customers").upsert(payload, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase syncCustomer error:", err);
  }
}

export async function syncAllCustomersToCloud(customers: Customer[]): Promise<void> {
  if (!supabase || customers.length === 0) return;
  try {
    const payloads = customers.map(mapCustomerToDB);
    await supabase.from("customers").upsert(payloads, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase syncAllCustomers error:", err);
  }
}

export async function deleteCustomerFromCloud(id: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from("customers").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase deleteCustomer error:", err);
  }
}

export async function fetchInvoicesFromCloud(): Promise<Invoice[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*, invoice_items(*)")
      .order("date", { ascending: false });
    if (error) throw error;
    if (data) {
      return data.map((row: any) => ({
        id: row.id,
        invoiceNumber: row.invoice_number,
        date: row.date,
        customerId: row.customer_id || undefined,
        customerName: row.customer_name,
        customerMobile: row.customer_mobile,
        customerAddress: row.customer_address || undefined,
        customerGstin: row.customer_gstin || undefined,
        customerState: row.customer_state || undefined,
        subtotal: Number(row.subtotal) || 0,
        totalDiscount: Number(row.total_discount) || 0,
        taxableAmount: Number(row.taxable_amount) || 0,
        cgstTotal: Number(row.cgst_total) || 0,
        sgstTotal: Number(row.sgst_total) || 0,
        igstTotal: Number(row.igst_total) || 0,
        totalTax: Number(row.total_tax) || 0,
        roundOff: Number(row.round_off) || 0,
        grandTotal: Number(row.grand_total) || 0,
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        paidAmount: Number(row.paid_amount) || 0,
        notes: row.notes || undefined,
        createdAt: row.created_at,
        items: (row.invoice_items || []).map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          productCode: item.product_code,
          hsnCode: item.hsn_code || undefined,
          unit: item.unit,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unit_price) || 0,
          discountType: item.discount_type || "percentage",
          discountValue: Number(item.discount_value) || 0,
          discountAmount: Number(item.discount_amount) || 0,
          taxableAmount: Number(item.taxable_amount) || 0,
          gstRate: Number(item.gst_rate) || 0,
          cgstAmount: Number(item.cgst_amount) || 0,
          sgstAmount: Number(item.sgst_amount) || 0,
          igstAmount: Number(item.igst_amount) || 0,
          totalTax: Number(item.total_tax) || 0,
          totalAmount: Number(item.total_amount) || 0,
        })),
      }));
    }
  } catch (err) {
    console.warn("Supabase fetchInvoices error:", err);
  }
  return null;
}

export async function syncInvoiceToCloud(inv: Invoice): Promise<void> {
  if (!supabase) return;
  try {
    const invoicePayload = {
      id: inv.id,
      invoice_number: inv.invoiceNumber,
      date: inv.date,
      customer_id: inv.customerId || null,
      customer_name: inv.customerName,
      customer_mobile: inv.customerMobile,
      customer_address: inv.customerAddress || null,
      customer_gstin: inv.customerGstin || null,
      customer_state: inv.customerState || null,
      subtotal: inv.subtotal,
      total_discount: inv.totalDiscount,
      taxable_amount: inv.taxableAmount,
      cgst_total: inv.cgstTotal,
      sgst_total: inv.sgstTotal,
      igst_total: inv.igstTotal,
      total_tax: inv.totalTax,
      round_off: inv.roundOff,
      grand_total: inv.grandTotal,
      payment_method: inv.paymentMethod,
      payment_status: inv.paymentStatus,
      paid_amount: inv.paidAmount,
      notes: inv.notes || null,
    };

    await supabase.from("invoices").upsert(invoicePayload, { onConflict: "id" });

    if (inv.items && inv.items.length > 0) {
      const itemsPayload = inv.items.map((item, idx) => ({
        id: item.id || `${inv.id}-${idx}`,
        invoice_id: inv.id,
        product_id: item.productId,
        product_name: item.productName,
        product_code: item.productCode,
        hsn_code: item.hsnCode || null,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_type: item.discountType || "percentage",
        discount_value: item.discountValue || 0,
        discount_amount: item.discountAmount || 0,
        taxable_amount: item.taxableAmount || 0,
        gst_rate: item.gstRate || 0,
        cgst_amount: item.cgstAmount || 0,
        sgst_amount: item.sgstAmount || 0,
        igst_amount: item.igstAmount || 0,
        total_tax: item.totalTax || 0,
        total_amount: item.totalAmount || 0,
      }));

      await supabase.from("invoice_items").upsert(itemsPayload, { onConflict: "id" });
    }
  } catch (err) {
    console.warn("Supabase syncInvoice error:", err);
  }
}

export async function fetchTransactionsFromCloud(): Promise<CustomerTransaction[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("customer_transactions")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    if (data) {
      return data.map(mapTransactionFromDB);
    }
  } catch (err) {
    console.warn("Supabase fetchTransactions error:", err);
  }
  return null;
}

export async function syncTransactionToCloud(t: CustomerTransaction): Promise<void> {
  if (!supabase) return;
  try {
    const payload = mapTransactionToDB(t);
    await supabase.from("customer_transactions").upsert(payload, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase syncTransaction error:", err);
  }
}

export async function fetchSettingsFromCloud(): Promise<BusinessSettings | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("business_settings")
      .select("*")
      .eq("id", "default")
      .single();
    if (error && error.code !== "PGRST116") throw error;
    if (data) {
      return mapSettingsFromDB(data);
    }
  } catch (err) {
    console.warn("Supabase fetchSettings error:", err);
  }
  return null;
}

export async function syncSettingsToCloud(s: BusinessSettings): Promise<void> {
  if (!supabase) return;
  try {
    const payload = mapSettingsToDB(s);
    await supabase.from("business_settings").upsert(payload, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase syncSettings error:", err);
  }
}
