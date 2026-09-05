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
          {/* Architectural Corporate Office Backdrop Photo (7% opacity) */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-7 scale-105 filter blur-sm"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80')`,
            }}
          />

          {/* Radial Vignette Mask */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 50% 30%, rgba(248, 250, 252, 0.4) 0%, rgba(248, 250, 252, 0.92) 75%, rgba(241, 245, 249, 0.98) 100%)",
            }}
          />

          {/* Soft Dispersed Gradient Glow: Odoo Plum (#714B67) at Top-Left (15% opacity blur-3xl) */}
          <div
            className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-3xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(113, 75, 103, 0.15) 0%, rgba(113, 75, 103, 0) 70%)",
            }}
          />

          {/* Soft Dispersed Gradient Glow: Enterprise Teal (#00A09D) at Bottom-Right (10% opacity blur-3xl) */}
          <div
            className="absolute -bottom-32 -right-32 w-[650px] h-[650px] rounded-full blur-3xl pointer-events-none"
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
