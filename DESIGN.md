---
version: 1.0.0
name: BharatPOS Billing Design Spec
description: Clean, high-contrast, high-ergonomics design specification for retail and wholesale billing and invoicing.
colors:
  primary: "#0F766E"
  primary-hover: "#115E59"
  secondary: "#0F172A"
  surface: "#FFFFFF"
  surface-subtle: "#F8FAFC"
  surface-card: "#FFFFFF"
  border: "#E2E8F0"
  border-strong: "#CBD5E1"
  text-primary: "#0F172A"
  text-secondary: "#475569"
  text-muted: "#64748B"
  accent-paid: "#16A34A"
  accent-credit: "#D97706"
  accent-danger: "#DC2626"
typography:
  headline-display: { fontFamily: "Inter, system-ui, sans-serif", fontSize: "32px", fontWeight: 700, lineHeight: 1.2 }
  headline-lg: { fontFamily: "Inter, system-ui, sans-serif", fontSize: "24px", fontWeight: 700, lineHeight: 1.25 }
  headline-md: { fontFamily: "Inter, system-ui, sans-serif", fontSize: "18px", fontWeight: 600, lineHeight: 1.3 }
  body-lg: { fontFamily: "Inter, system-ui, sans-serif", fontSize: "16px", fontWeight: 400, lineHeight: 1.5 }
  body-md: { fontFamily: "Inter, system-ui, sans-serif", fontSize: "14px", fontWeight: 400, lineHeight: 1.5 }
  body-sm: { fontFamily: "Inter, system-ui, sans-serif", fontSize: "12px", fontWeight: 500, lineHeight: 1.4 }
  label-bold: { fontFamily: "Inter, system-ui, sans-serif", fontSize: "13px", fontWeight: 600, lineHeight: 1.2 }
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  badge-paid:
    backgroundColor: "#DCFCE7"
    textColor: "{colors.accent-paid}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-credit:
    backgroundColor: "#FEF3C7"
    textColor: "{colors.accent-credit}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# BharatPOS Billing & Invoicing Design Specification

## Overview
A high-efficiency, ergonomic, and distraction-free interface engineered for busy Indian retail and wholesale billing desks. Built for rapid item entry, fast keyboard navigation, barcode scanner compatibility, dynamic UPI payments, and dual-format printing (A4 Tax Invoice & 80mm Thermal Receipt).

## Colors
- **Forest Emerald (`#0F766E` / `#16A34A`)**: Primary brand and checkout action color. Symbolizes financial safety and completed transactions.
- **Deep Slate (`#0F172A`)**: High-contrast text and crisp tabular data lines.
- **Warm Amber (`#D97706`)**: Denotes Khata / Credit / Unpaid ledger balances clearly without alarming the user.
- **Pure Crimson (`#DC2626`)**: Reserved strictly for delete items, voids, and out-of-stock indicators.
- **Strict Prohibition**: Zero purple/violet hues anywhere in the interface.

## Typography
Clean, legible sans-serif hierarchy using tabular numbers for financial columns to guarantee aligned decimals across quantities, taxes, and amounts.

## Layout & Ergonomics
- **POS Screen**: Split view. Left side: Rapid Product Picker with search, category filters, and quick-add shortcuts. Right side: Live Cart with real-time tax breakdown, instant customer switcher, and big Checkout Button.
- **Invoice Layout**: 
  - **A4 View**: Standard statutory GST format with seller header, buyer details, full HSN tax breakdown, bank info, dynamic UPI QR code, amount in words, and authorized signatory.
  - **Thermal Receipt**: 80mm width mono-spaced receipt style with centered store name, itemized bill, and scan-to-pay QR.

## Do's and Don'ts
- **DO** use tabular numerals (`tabular-nums`) for all prices, rates, and stock values.
- **DO** keep POS item entry one-click or enter-key driven for cashier speed.
- **DO** clearly distinguish Paid vs Credit (Udhar) transactions with explicit color badges.
- **DON'T** use low-contrast text or decorative pastel shades on the billing table.
- **DON'T** show navigation bars or buttons when printing invoices (`@media print { .no-print { display: none !important; } }`).
