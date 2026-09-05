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
    <div className="min-h-screen bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] font-sans text-[var(--text)]">
      <header className="bg-[var(--surface)] w-full h-[64px] border-b border-[var(--border)] sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-[1440px] mx-auto px-[16px] md:px-[32px] w-full h-full">
          <div className="text-[20px] font-extrabold text-[var(--primary)] tracking-tight">
            PeoplePay360
          </div>
          <nav className="hidden md:flex space-x-[24px]">
            <a className="text-[14px] font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors duration-200 cursor-pointer">Features</a>
            <a className="text-[14px] font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors duration-200 cursor-pointer">Solutions</a>
            <a className="text-[14px] font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors duration-200 cursor-pointer">Pricing</a>
            <a className="text-[14px] font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors duration-200 cursor-pointer">Resources</a>
          </nav>
          <div className="flex items-center space-x-[16px]">
            <button onClick={() => navigate('/login')} className="text-[14px] font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors duration-200">Sign In</button>
            <button onClick={() => navigate('/login')} className="bg-[var(--primary)] text-[var(--surface)] text-[14px] font-semibold px-[16px] py-[8px] rounded-[4px] hover:bg-[var(--primary-hover)] transition-colors">Request Demo</button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] py-[48px] md:py-[96px] flex flex-col gap-[64px] md:gap-[128px]">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-[32px]">
          <div className="inline-flex items-center gap-[8px] rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-[16px] py-[8px] mb-[16px]">
            <span className="flex h-[8px] w-[8px] rounded-full bg-[var(--primary)]" />
            <span className="text-[12px] font-bold text-[var(--primary)] tracking-wide uppercase">Enterprise HRMS & Payroll</span>
          </div>
          <h1 className="text-[48px] md:text-[56px] lg:text-[64px] font-extrabold max-w-[800px] tracking-tight leading-[1.1] text-[var(--text)]">
            The definitive HR and Payroll platform
          </h1>
          <p className="text-[16px] md:text-[20px] text-[var(--text-muted)] max-w-[600px] leading-relaxed">
            Experience enterprise-grade efficiency with our explainable payroll operations. Designed for clarity, trust, and precision.
          </p>
          <div className="mt-[32px] flex flex-col sm:flex-row justify-center gap-[16px]">
            <button onClick={() => navigate('/login')} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--surface)] font-bold text-[16px] px-[32px] py-[16px] rounded-[6px] shadow-sm flex items-center justify-center transition-all hover:-translate-y-1">
              Enter Workspace <ArrowRight className="h-[20px] w-[20px] ml-[8px]" />
            </button>
          </div>
        </section>

        {/* Hero Visual */}
        <section className="w-full flex justify-center">
          <div className="w-full max-w-[1152px] bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-sm overflow-hidden p-[8px]">
            <img alt="Dashboard Interface" className="w-full h-auto rounded-[4px] border border-[var(--border)] object-cover aspect-video" src="/images/hero.jpg" />
          </div>
        </section>

        {/* Auditable Data Pipelines Section (Original detail preserved in NextGen style) */}
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-sm overflow-hidden flex flex-col lg:flex-row items-center max-w-[1152px] mx-auto w-full">
          <div className="p-[32px] lg:p-[64px] lg:w-1/2 order-2 lg:order-1 flex flex-col gap-[24px]">
            <h2 className="text-[32px] font-bold tracking-tight text-[var(--text)]">
              Auditable Data Pipelines
            </h2>
            <p className="text-[16px] text-[var(--text-muted)] leading-relaxed">
              Every payslip exposes the exact pipeline that produced it. Our transparent salary-rule engine ensures you can trust the logic, not just the final number. A raise is a new contract row, never an overwrite.
            </p>
            <ul className="flex flex-col gap-[24px] mt-[16px]">
              <li className="flex items-start gap-[16px]">
                <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[6px] bg-[var(--primary-light)] text-[var(--primary)]">
                  <ShieldCheck className="h-[20px] w-[20px]" />
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-[var(--text)]">Payroll Preflight</h4>
                  <p className="text-[13px] text-[var(--text-muted)] mt-[4px]">Missing bank details and uncontracted employees are caught before a payrun.</p>
                </div>
              </li>
              <li className="flex items-start gap-[16px]">
                <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[6px] bg-[var(--primary-light)] text-[var(--primary)]">
                  <FileText className="h-[20px] w-[20px]" />
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-[var(--text)]">Immutable History</h4>
                  <p className="text-[13px] text-[var(--text-muted)] mt-[4px]">Old payslips stay correct forever, and overlapping active contracts are impossible.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2 order-1 lg:order-2 w-full h-full min-h-[300px] border-b lg:border-b-0 lg:border-l border-[var(--border)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] p-[32px] flex items-center justify-center">
             <img src="/images/pipeline.jpg" alt="Payroll Pipeline Engine" className="w-full h-auto rounded-[6px] border border-[var(--border)] object-cover shadow-sm" />
          </div>
        </section>

        {/* Features Grid */}
        <section className="flex flex-col space-y-[48px] py-[48px] max-w-[1152px] mx-auto w-full">
          <div className="text-center">
            <h2 className="text-[32px] font-bold text-[var(--text)] tracking-tight">Precision engineered for modern HR teams</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px]">
            {/* Feature Card 1 */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-[32px] shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-[16px]">
              <div className="w-[48px] h-[48px] bg-[var(--primary-light)] flex items-center justify-center rounded-[8px] text-[var(--primary)]">
                <Wallet className="w-[24px] h-[24px]" />
              </div>
              <h3 className="text-[20px] font-bold text-[var(--text)]">Live Ledgers</h3>
              <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">
                Real-time tracking of payroll expenses and automated reconciliation with your general ledger for unprecedented financial clarity.
              </p>
            </div>
            {/* Feature Card 2 */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-[32px] shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-[16px]">
              <div className="w-[48px] h-[48px] bg-[var(--primary-light)] flex items-center justify-center rounded-[8px] text-[var(--primary)]">
                <RefreshCw className="w-[24px] h-[24px]" />
              </div>
              <h3 className="text-[20px] font-bold text-[var(--text)]">Automated Payruns</h3>
              <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">
                Set it and forget it. Our intelligent scheduling ensures employees are paid accurately and on time, every time, with full compliance.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-[32px] shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-[16px]">
              <div className="w-[48px] h-[48px] bg-[var(--primary-light)] flex items-center justify-center rounded-[8px] text-[var(--primary)]">
                <CalendarCheck className="w-[24px] h-[24px]" />
              </div>
              <h3 className="text-[20px] font-bold text-[var(--text)]">Leave Management</h3>
              <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">
                Streamlined requests, approvals, and balance tracking integrated directly into the payroll calculation engine.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--surface)] w-full py-[64px] border-t border-[var(--border)] mt-[64px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px] max-w-[1440px] mx-auto px-[16px] md:px-[32px]">
          <div className="flex flex-col space-y-[16px]">
            <div className="text-[20px] text-[var(--text)] font-extrabold tracking-tight">
              PeoplePay360
            </div>
            <p className="text-[14px] text-[var(--text-muted)]">
              © 2024 PeoplePay360. All rights reserved. Precise HR & Payroll solutions.
            </p>
          </div>
          <div className="flex flex-wrap gap-[24px] md:justify-end items-start">
            <a className="text-[14px] text-[var(--text-muted)] hover:text-[var(--primary)] underline transition-colors" href="#">Privacy Policy</a>
            <a className="text-[14px] text-[var(--text-muted)] hover:text-[var(--primary)] underline transition-colors" href="#">Terms of Service</a>
            <a className="text-[14px] text-[var(--text-muted)] hover:text-[var(--primary)] underline transition-colors" href="#">Security</a>
            <a className="text-[14px] text-[var(--text-muted)] hover:text-[var(--primary)] underline transition-colors" href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
