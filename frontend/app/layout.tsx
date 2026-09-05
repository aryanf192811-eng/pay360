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
        {/* Fixed Ambient Corporate Architectural Canvas Overlay */}
        <div
          className="fixed inset-0 pointer-events-none -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(circle at 10% 10%, rgba(113, 75, 103, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(0, 160, 157, 0.07) 0%, transparent 40%), url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80') center/cover fixed",
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
