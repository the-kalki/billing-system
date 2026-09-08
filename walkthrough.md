# BharatPOS Billing & Invoicing System — Deployment & Setup Summary

The application is now live on **Vercel Production**, backed by a **Supabase PostgreSQL Cloud Database** in Mumbai (`ap-south-1`), and source-controlled on **GitHub**.

---

## 🌐 Live Links

| Resource | URL |
|---|---|
| 🚀 **Live Web App (Vercel)** | [https://billing-system-orcin-eta.vercel.app](https://billing-system-orcin-eta.vercel.app) |
| 💻 **GitHub Repository** | [https://github.com/the-kalki/billing-system](https://github.com/the-kalki/billing-system) |
| ☁️ **Supabase Cloud Database** | Project `bharatpos` (Region: `ap-south-1` Mumbai) |

---

## ☁️ 1. Supabase Cloud Database Architecture

Six production PostgreSQL tables with **Row Level Security (RLS)** have been provisioned:

1. **`products`**: Item catalog, barcode/SKU, HSN, units, purchase/selling price, stock, and GST rate.
2. **`customers`**: Customer directory with phone lookup, address, GSTIN, and Khata credit ledger balance.
3. **`invoices`**: Sequential tax invoices (`INV-2026-0104`), buyer details, subtotal, discount, CGST/SGST/IGST breakdown, round-off, grand total, and payment status.
4. **`invoice_items`**: Relational line items linked to each invoice with rate, tax slabs, and amounts.
5. **`customer_transactions`**: Khata ledger debit/credit entries for udhar and payment settlements.
6. **`business_settings`**: Single-source store configuration (Store Name, GSTIN, Bank, UPI ID, Address).

### ⚡ Resilient Offline-First Sync
- **0ms UI Latency**: Counter operations (adding items, barcode scans, checkout) remain instant by reading from and writing to the local cache.
- **Background Cloud Upsert**: Saves immediately sync to Supabase in the background.
- **Offline Fallback**: If the shop WiFi buffers or disconnects, POS billing never hangs; data syncs when back online.

---

## 📦 2. Fast Bulk Product Upload (CSV / Excel)

Added directly to [`app/products/page.tsx`](file:///home/kalki/Codes/billing-system/app/products/page.tsx):
- **Download CSV Template**: Shopkeeper can download a pre-formatted template (`products_inventory_template.csv`).
- **1-Click Import CSV**: Allows uploading 500+ items in seconds without manual entry.

---

## 🧾 3. Counter POS & Printing

- **POS Terminal**: Barcode scanning, decimal unit quantities (e.g. `1.5 kg`), item-level discounts, intra-state (CGST+SGST) vs inter-state (IGST) tax calculation.
- **Checkout Modal**: Cash (with change calculator), Dynamic UPI QR Code, or Credit (Khata).
- **Dual Printing**:
  - **A4 Statutory GST Tax Invoice**: Standard A4 invoice layout with terms, bank info, and amount in words.
  - **3-inch (80mm) Thermal Slip**: Monospace layout for receipt roll printers.

---

## 🧪 Verification & Health Check

1. **Local Build**: Next.js 15 production build compiled in 4.0s with 0 errors (9/9 routes).
2. **GitHub Push**: Committed to `origin/main` without leaking environment credentials (`.env.local` secured via `.gitignore`).
3. **Vercel Deploy**: Deployed to production (`billing-system-orcin-eta.vercel.app`) with build-time & runtime environment variables.
4. **Live Verification**: HTTP response verified with status 200 and dynamic page rendering.
