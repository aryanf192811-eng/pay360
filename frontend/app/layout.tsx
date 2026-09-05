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
      <body className="min-h-full font-sans bg-[#F4F6FA] text-slate-900 relative selection:bg-[#714B67]/20 selection:text-[#714B67]">
        {/* Fixed Ambient Gradient Glows (no photo — clean enterprise canvas) */}
        <div
          className="fixed inset-0 pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 10% 10%, rgba(113, 75, 103, 0.10) 0%, transparent 45%), radial-gradient(ellipse at 90% 90%, rgba(0, 160, 157, 0.08) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(248, 250, 252, 0.9) 0%, transparent 80%)",
          }}
        />

        {/* Centered Sleek Rounded App Canvas Container */}
        <div className="max-w-[1550px] mx-auto p-3 sm:p-5 md:p-8 w-full min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
