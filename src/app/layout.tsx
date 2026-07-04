import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "SalesCRM — Enterprise CRM System",
  description: "Manage leads, customers, deals, and sales pipelines with role-based access.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
