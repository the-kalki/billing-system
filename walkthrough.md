# BharatPOS Billing & Invoicing System — Mobile/Tablet UX, Cloud Sync & Attribution

The billing system has been upgraded with **Real-Time Cross-Device Stock Sync**, full **Mobile & Tablet Responsiveness** (adhering to `@ui-ux-pro-max` guidelines), and **Shunya Labs Agency Attribution / Colophon**.

---

## 🌐 Live Access

| Resource | Link |
|---|---|
| 🚀 **Live Cloud POS (Vercel)** | [https://billing-system-orcin-eta.vercel.app](https://billing-system-orcin-eta.vercel.app) |
| 💻 **GitHub Repository** | [https://github.com/the-kalki/billing-system](https://github.com/the-kalki/billing-system) |
| ☁️ **Cloud Database** | Supabase Mumbai Edge (`ap-south-1`) |

---

## ⚡ 1. Real-Time Cross-Device Stock Synchronization

### The Issue
When billing on a laptop, opening the cloud link on a mobile phone didn't reflect reduced stock or newly generated invoices immediately because:
1. Next.js client bundle didn't inline fallback Supabase credentials if environment variables weren't present in the browser runtime.
2. Checkout in `app/pos/page.tsx` was navigating (`router.push`) before cloud upserts completed, causing browsers to cancel pending requests.
3. Mobile browser tabs freeze background threads; when a phone screen wakes up, it was only reading stale `localStorage`.

### The Solution
1. **Direct Supabase Mumbai Fallback**: [`lib/supabaseClient.ts`](file:///home/kalki/Codes/billing-system/lib/supabaseClient.ts) now has fallback credentials to the public publishable anon key, guaranteeing DB connection on any device.
2. **Guaranteed Synchronous Checkout Push**: Checkout in [`app/pos/page.tsx`](file:///home/kalki/Codes/billing-system/app/pos/page.tsx) now executes `await Promise.allSettled([syncInvoiceToCloud, syncAllProductsToCloud, syncSettingsToCloud])` before navigating to the invoice view.
3. **Smart Focus & Visibility Sync**: [`components/Navbar.tsx`](file:///home/kalki/Codes/billing-system/components/Navbar.tsx), [`app/products/page.tsx`](file:///home/kalki/Codes/billing-system/app/products/page.tsx), [`app/invoices/page.tsx`](file:///home/kalki/Codes/billing-system/app/invoices/page.tsx), and [`app/customers/page.tsx`](file:///home/kalki/Codes/billing-system/app/customers/page.tsx) now listen to:
   - `window.addEventListener("focus", ...)`
   - `document.addEventListener("visibilitychange", ...)`
   - `window.addEventListener("billing_cloud_synced", ...)`
   Whenever you unlock your phone or switch to the tab, it automatically pulls the latest cloud inventory.
4. **Interactive Manual Sync Pill**: Top navigation bar includes a tapable **"Cloud Live / Sync"** button with spinning refresh animation to force-fetch on demand.

---

## 📱 2. Mobile & Tablet UI/UX Optimization (`@ui-ux-pro-max`)

### A. Dedicated Mobile Bottom Tab Bar (< 768px)
- Natural thumb-reach bottom navigation: **POS Terminal**, **Products**, **Invoices**, **Khata**, and **Settings**.
- Eliminates hamburger menu friction during busy counter sales.

### B. Segmented Dual-View POS Terminal
- On phones and portrait tablets, the screen splits into a toggle between **"📦 Select Products"** and **"🛒 Order Cart"**.
- A **floating bottom action pill** shows: `🛒 View Cart (X items • ₹Total) →` with one-tap checkout trigger.

### C. Touch-Friendly Product, Invoice & Customer Cards
- Wide tables (8 columns) have been supplemented with responsive card lists for mobile screens (`< 640px`):
  - **Products**: Touch-friendly `+` and `-` buttons (36x36px) to adjust stock directly from phone; clear stock badges.
  - **Invoices**: Customer name, phone, item count, payment mode, and "Print / View Slip" button.
  - **Customers**: Direct Khata balance due in amber pill and "Open Khata Ledger" touch action.
- Full tables remain active on tablets and desktops (`sm:block`).

---

## 🏷️ 3. "Designed by Shunya Labs" — Industry Terminology & Placement

### What is this called in the industry?
In software engineering, product design, and digital agency workflows, this branding is officially known as:
1. **Agency Attribution / Developer Signature**: When an agency or software developer signs off their creation (e.g. *"Designed & Engineered by Shunya Labs"*).
2. **Colophon (Software Colophon)**: Originating from classic book typography and adopted by web/software architects, a colophon is the formal section stating the creators, system architecture, and tools used.
3. **"Powered by" Badge / Vendor Mark**: Industry-standard term for SaaS & custom enterprise tools (e.g., *"Powered by Shunya Labs"*).
4. **Discreet Invoice Watermark / Credit Tagline**: Small 8–9px mark at the base of receipts and legal invoices.

### Placements Added:
1. **Application Web Footer**: [`components/Footer.tsx`](file:///home/kalki/Codes/billing-system/components/Footer.tsx) added across all pages:
   > `BharatPOS Cloud Edition • Engineered & Designed with ⚡ by ` [**`Shunya Labs`**](https://www.shunya-labs.com/)
2. **Settings Hub**: [`app/settings/page.tsx`](file:///home/kalki/Codes/billing-system/app/settings/page.tsx) now contains a sleek dark slate & teal **"Software Architecture & Craft: Designed & Engineered by Shunya Labs"** card with an interactive button linking to [**`shunya-labs.com`**](https://www.shunya-labs.com/).
3. **A4 Statutory Tax Invoices**: [`components/invoice/A4TaxInvoice.tsx`](file:///home/kalki/Codes/billing-system/components/invoice/A4TaxInvoice.tsx) bottom colophon:
   > `Billing System Architecture & Design by ` [**`Shunya Labs (www.shunya-labs.com)`**](https://www.shunya-labs.com/)
4. **Thermal Slip Receipts (3-inch / 80mm)**: [`components/invoice/ThermalReceipt.tsx`](file:///home/kalki/Codes/billing-system/components/invoice/ThermalReceipt.tsx) base line:
   > `Computer Generated Receipt • Powered by Shunya Labs (www.shunya-labs.com)`
