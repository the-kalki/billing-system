import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { SecurityGuard } from "@/components/SecurityGuard";

export const metadata: Metadata = {
  title: "BharatPOS - Fast Billing & Invoicing System",
  description: "High-speed retail and wholesale GST billing, inventory, and Khata ledger.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-100 text-slate-900">
        <SecurityGuard>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </SecurityGuard>
      </body>
    </html>
  );
}
