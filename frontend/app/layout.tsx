import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PeoplePay360 | Odoo 18 Enterprise HR & Payroll",
  description: "Unified Human Resource and Payroll Operations Platform for Odoo 18 Enterprise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-[#F8FAFC] text-slate-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
