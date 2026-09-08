# BharatPOS — Modern Retail & Wholesale Billing System

A high-speed, modern **Point of Sale (POS), GST Billing, and Inventory Management** application built for retail shops and wholesale businesses in India.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)

---

## 🚀 Key Features

### ⚡ 1. Rapid Counter POS Terminal
- Instant barcode scanning or keyboard-friendly item search.
- Decimal quantities (e.g. `1.5 kg`, `0.5 litre`) or integer counts (`packets`, `pieces`).
- Item-level & bill-level discounts (Flat ₹ or Percentage %).
- Automatic GST computation (0%, 5%, 12%, 18%, 28%) with CGST + SGST (intra-state) or IGST (inter-state) segregation.
- Dynamic UPI QR generation (`upi://pay?pa=...`) for instant mobile scan & payment at checkout.
- Tendered cash and change calculator.

### 👥 2. Customer Management & Khata Ledger (उधार बहीखाता)
- Customer directory (Name, Mobile, Address, State, GSTIN).
- Udhar / Credit tracking with real-time balance calculations.
- Transaction history recording with one-click payment settlement.

### 📦 3. Inventory & Stock Control
- Item master with Purchase Price, Selling Price, and Low-stock alerts.
- Automatic real-time inventory deduction upon checkout.
- **Bulk CSV / Excel Import & Template Download**: Upload hundreds of items in seconds.

### 🧾 4. Dual Invoice Layout & Printing
- **A4 Statutory GST Tax Invoice**: Complete with HSN summary, seller/buyer details, amount in words, bank details, dynamic UPI QR, and authorized signatory.
- **3-inch (80mm) Thermal POS Slip**: Optimized for counter thermal roll printers (TVS, Epson, Pegasus).
- Native CSS print stylesheets (`window.print()`).

### ☁️ 5. Cloud Database with Offline Fallback (Supabase)
- Hosted on Supabase PostgreSQL (Mumbai `ap-south-1`).
- Cloud-first architecture with optimistic local caching — billing never stops even if shop internet blinks.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **State & Sync**: Optimistic local storage cache with background cloud synchronization

---

## 🏃 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/the-kalki/billing-system.git
cd billing-system
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License
MIT
