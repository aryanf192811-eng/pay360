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
      <body className="min-h-full font-sans bg-[#F8FAFC] text-slate-900 flex flex-col relative selection:bg-[#714B67]/20 selection:text-[#714B67]">
        {/* Fixed Atmospheric Environmental Background */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          {/* Architectural Office Backdrop Photo with Vignette */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 scale-105 filter blur-xl"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80')`,
            }}
          />
          {/* Subtle Modern Gradient Overlay & Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/95 via-slate-50/90 to-slate-100/95 backdrop-blur-2xl" />

          {/* Soft Radial Ambient Glow: Plum (#714B67) at Top-Left (10% opacity) */}
          <div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(113, 75, 103, 0.12) 0%, rgba(113, 75, 103, 0) 70%)",
            }}
          />

          {/* Soft Radial Ambient Glow: Teal (#00A09D) at Bottom-Right (8% opacity) */}
          <div
            className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(0, 160, 157, 0.10) 0%, rgba(0, 160, 157, 0) 70%)",
            }}
          />
        </div>

        {children}
      </body>
    </html>
  );
}
