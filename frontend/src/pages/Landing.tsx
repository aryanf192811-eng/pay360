import { Navigate, useNavigate } from 'react-router-dom';
import { Wallet, RefreshCw, CalendarCheck, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { useAuthStore, homeFor } from '../store/auth.store';

export function Landing() {
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  const navigate = useNavigate();

  if (isInitializing) return null;
  if (isAuthenticated) {
    return <Navigate to={homeFor(user?.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-[#faf6dc] font-sans text-[#172b4d]">
      <header className="bg-[#fefefe] w-full h-[64px] border-b border-[#dfe1e6] sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-[1440px] mx-auto px-[16px] md:px-[32px] w-full h-full">
          <div className="text-[20px] font-extrabold text-[#3062e1] tracking-tight">
            PeoplePay360
          </div>
          <nav className="hidden md:flex space-x-[24px]">
            <a className="text-[14px] font-semibold text-[#434654] hover:text-[#3062e1] transition-colors duration-200 cursor-pointer">Features</a>
            <a className="text-[14px] font-semibold text-[#434654] hover:text-[#3062e1] transition-colors duration-200 cursor-pointer">Solutions</a>
            <a className="text-[14px] font-semibold text-[#434654] hover:text-[#3062e1] transition-colors duration-200 cursor-pointer">Pricing</a>
            <a className="text-[14px] font-semibold text-[#434654] hover:text-[#3062e1] transition-colors duration-200 cursor-pointer">Resources</a>
          </nav>
          <div className="flex items-center space-x-[16px]">
            <button onClick={() => navigate('/login')} className="text-[14px] font-semibold text-[#3062e1] hover:text-[#2552cc] transition-colors duration-200">Sign In</button>
            <button onClick={() => navigate('/login')} className="bg-[#3062e1] text-[#ffffff] text-[14px] font-semibold px-[16px] py-[8px] rounded-[4px] hover:bg-[#2552cc] transition-colors">Request Demo</button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] py-[48px] md:py-[96px] flex flex-col gap-[64px] md:gap-[128px]">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-[32px]">
          <div className="inline-flex items-center gap-[8px] rounded-full border border-[#3062e1]/20 bg-[#3062e1]/5 px-[16px] py-[8px] mb-[16px]">
            <span className="flex h-[8px] w-[8px] rounded-full bg-[#3062e1]" />
            <span className="text-[12px] font-bold text-[#3062e1] tracking-wide uppercase">Enterprise HRMS & Payroll</span>
          </div>
          <h1 className="text-[48px] md:text-[56px] lg:text-[64px] font-extrabold max-w-[800px] tracking-tight leading-[1.1] text-[#172b4d]">
            The definitive HR and Payroll platform
          </h1>
          <p className="text-[16px] md:text-[20px] text-[#434654] max-w-[600px] leading-relaxed">
            Experience enterprise-grade efficiency with our explainable payroll operations. Designed for clarity, trust, and precision.
          </p>
          <div className="mt-[32px] flex flex-col sm:flex-row justify-center gap-[16px]">
            <button onClick={() => navigate('/login')} className="bg-[#3062e1] hover:bg-[#2552cc] text-[#ffffff] font-bold text-[16px] px-[32px] py-[16px] rounded-[6px] shadow-sm flex items-center justify-center transition-all hover:-translate-y-1">
              Enter Workspace <ArrowRight className="h-[20px] w-[20px] ml-[8px]" />
            </button>
          </div>
        </section>

        {/* Hero Visual */}
        <section className="w-full flex justify-center">
          <div className="w-full max-w-[1152px] bg-[#fefefe] border border-[#dfe1e6] rounded-[12px] shadow-sm overflow-hidden p-[8px]">
            <img alt="Dashboard Interface" className="w-full h-auto rounded-[4px] border border-[#ebecf0] object-cover aspect-video" src="/images/hero.jpg" />
          </div>
        </section>

        {/* Auditable Data Pipelines Section (Original detail preserved in NextGen style) */}
        <section className="bg-[#fefefe] border border-[#dfe1e6] rounded-[12px] shadow-sm overflow-hidden flex flex-col lg:flex-row items-center max-w-[1152px] mx-auto w-full">
          <div className="p-[32px] lg:p-[64px] lg:w-1/2 order-2 lg:order-1 flex flex-col gap-[24px]">
            <h2 className="text-[32px] font-bold tracking-tight text-[#172b4d]">
              Auditable Data Pipelines
            </h2>
            <p className="text-[16px] text-[#434654] leading-relaxed">
              Every payslip exposes the exact pipeline that produced it. Our transparent salary-rule engine ensures you can trust the logic, not just the final number. A raise is a new contract row, never an overwrite.
            </p>
            <ul className="flex flex-col gap-[24px] mt-[16px]">
              <li className="flex items-start gap-[16px]">
                <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[6px] bg-[#e6f0ff] text-[#3062e1]">
                  <ShieldCheck className="h-[20px] w-[20px]" />
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-[#172b4d]">Payroll Preflight</h4>
                  <p className="text-[13px] text-[#434654] mt-[4px]">Missing bank details and uncontracted employees are caught before a payrun.</p>
                </div>
              </li>
              <li className="flex items-start gap-[16px]">
                <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[6px] bg-[#e6f0ff] text-[#3062e1]">
                  <FileText className="h-[20px] w-[20px]" />
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-[#172b4d]">Immutable History</h4>
                  <p className="text-[13px] text-[#434654] mt-[4px]">Old payslips stay correct forever, and overlapping active contracts are impossible.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2 order-1 lg:order-2 w-full h-full min-h-[300px] border-b lg:border-b-0 lg:border-l border-[#dfe1e6] bg-[#faf6dc] p-[32px] flex items-center justify-center">
             <img src="/images/pipeline.jpg" alt="Payroll Pipeline Engine" className="w-full h-auto rounded-[6px] border border-[#dfe1e6] object-cover shadow-sm" />
          </div>
        </section>

        {/* Features Grid */}
        <section className="flex flex-col space-y-[48px] py-[48px] max-w-[1152px] mx-auto w-full">
          <div className="text-center">
            <h2 className="text-[32px] font-bold text-[#172b4d] tracking-tight">Precision engineered for modern HR teams</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px]">
            {/* Feature Card 1 */}
            <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[8px] p-[32px] shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-[16px]">
              <div className="w-[48px] h-[48px] bg-[#e6f0ff] flex items-center justify-center rounded-[8px] text-[#3062e1]">
                <Wallet className="w-[24px] h-[24px]" />
              </div>
              <h3 className="text-[20px] font-bold text-[#172b4d]">Live Ledgers</h3>
              <p className="text-[14px] text-[#434654] leading-relaxed">
                Real-time tracking of payroll expenses and automated reconciliation with your general ledger for unprecedented financial clarity.
              </p>
            </div>
            {/* Feature Card 2 */}
            <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[8px] p-[32px] shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-[16px]">
              <div className="w-[48px] h-[48px] bg-[#e6f0ff] flex items-center justify-center rounded-[8px] text-[#3062e1]">
                <RefreshCw className="w-[24px] h-[24px]" />
              </div>
              <h3 className="text-[20px] font-bold text-[#172b4d]">Automated Payruns</h3>
              <p className="text-[14px] text-[#434654] leading-relaxed">
                Set it and forget it. Our intelligent scheduling ensures employees are paid accurately and on time, every time, with full compliance.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[8px] p-[32px] shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-[16px]">
              <div className="w-[48px] h-[48px] bg-[#e6f0ff] flex items-center justify-center rounded-[8px] text-[#3062e1]">
                <CalendarCheck className="w-[24px] h-[24px]" />
              </div>
              <h3 className="text-[20px] font-bold text-[#172b4d]">Leave Management</h3>
              <p className="text-[14px] text-[#434654] leading-relaxed">
                Streamlined requests, approvals, and balance tracking integrated directly into the payroll calculation engine.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#fefefe] w-full py-[64px] border-t border-[#dfe1e6] mt-[64px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px] max-w-[1440px] mx-auto px-[16px] md:px-[32px]">
          <div className="flex flex-col space-y-[16px]">
            <div className="text-[20px] text-[#172b4d] font-extrabold tracking-tight">
              PeoplePay360
            </div>
            <p className="text-[14px] text-[#434654]">
              © 2024 PeoplePay360. All rights reserved. Precise HR & Payroll solutions.
            </p>
          </div>
          <div className="flex flex-wrap gap-[24px] md:justify-end items-start">
            <a className="text-[14px] text-[#434654] hover:text-[#3062e1] underline transition-colors" href="#">Privacy Policy</a>
            <a className="text-[14px] text-[#434654] hover:text-[#3062e1] underline transition-colors" href="#">Terms of Service</a>
            <a className="text-[14px] text-[#434654] hover:text-[#3062e1] underline transition-colors" href="#">Security</a>
            <a className="text-[14px] text-[#434654] hover:text-[#3062e1] underline transition-colors" href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
