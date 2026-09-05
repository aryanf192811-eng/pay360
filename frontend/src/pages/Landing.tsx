import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { useAuthStore, homeFor } from '../store/auth.store';
import { Button } from '../components/ui/button';

export function Landing() {
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  const navigate = useNavigate();

  if (isInitializing) return null;
  if (isAuthenticated) {
    return <Navigate to={homeFor(user?.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-[#faf6dc] font-sans text-[#454134]">
      {/* Crisp White Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[#c5c7c7]/50 bg-[#fefefe]/95 backdrop-blur-md px-32 py-16 shadow-sm">
        <div className="flex items-center gap-12">
          <div className="flex h-36 w-36 items-center justify-center rounded-lg bg-[#3062e1] font-mono text-sm font-bold text-[#fefefe]">
            P360
          </div>
          <span className="text-xl font-bold tracking-tight text-[#454134]">PeoplePay360</span>
        </div>
        <div className="flex items-center gap-16">
          <Button variant="ghost" className="hidden sm:flex text-[#454134] font-semibold hover:bg-[#faf6dc]">Features</Button>
          <Button size="lg" className="rounded-md bg-[#3062e1] text-[#fefefe] hover:bg-[#3062e1]/90 shadow-sm font-semibold" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-24 pt-[80px] pb-64 text-center lg:pt-[120px]">
        <div className="inline-flex items-center gap-8 rounded-full border border-[#3062e1]/20 bg-[#3062e1]/5 px-16 py-8 mb-32">
          <span className="flex h-8 w-8 rounded-full bg-[#3062e1]" />
          <span className="text-sm font-semibold text-[#3062e1] tracking-wide uppercase">Enterprise HRMS & Payroll</span>
        </div>
        
        <h1 className="max-w-5xl text-5xl font-bold tracking-tight text-[#454134] sm:text-7xl lg:leading-[1.1]">
          Payroll that shows its work.
        </h1>
        
        <p className="mx-auto mt-24 max-w-2xl text-xl text-[#91918d] leading-relaxed">
          A definitive HR engine where contracts, attendance, and leave perfectly synchronize. Stop trusting black-box spreadsheets; audit every rule in real-time.
        </p>
        
        <div className="mt-40 flex flex-col sm:flex-row justify-center gap-16 w-full sm:w-auto">
          <Button size="lg" className="rounded-md px-40 h-56 text-lg font-bold bg-[#3062e1] hover:bg-[#3062e1]/90 text-[#fefefe] shadow-md transition-all hover:-translate-y-1" onClick={() => navigate('/login')}>
            Enter Workspace <ArrowRight className="h-20 w-20 ml-12" />
          </Button>
        </div>

        {/* Hero HD Image */}
        <div className="relative mt-48 w-full max-w-6xl rounded-[24px] bg-[#fefefe] p-8 shadow-2xl shadow-[#454134]/10 border border-[#c5c7c7]/30">
          <img 
            src="/images/hero.jpg" 
            alt="Dashboard Interface" 
            className="w-full h-auto rounded-[16px] object-cover aspect-video"
          />
        </div>
      </section>

      {/* Features Grid with HD Image */}
      <section className="bg-[#fefefe] border-t border-[#c5c7c7]/30 py-[120px]">
        <div className="mx-auto max-w-7xl px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-48 items-center">
            
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold tracking-tight text-[#454134] sm:text-5xl mb-24">
                Auditable Data Pipelines
              </h2>
              <p className="text-lg text-[#91918d] leading-relaxed mb-40">
                Every payslip exposes the exact pipeline that produced it. Our transparent smart-contract engine ensures you can trust the logic, not just the final number. 
                A raise is a new contract row, never an overwrite.
              </p>
              
              <ul className="space-y-24">
                <li className="flex items-start gap-16">
                  <div className="mt-4 flex h-32 w-32 shrink-0 items-center justify-center rounded-md bg-[#3062e1]/10 text-[#3062e1]">
                    <ShieldCheck className="h-20 w-20" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#454134]">Payroll Preflight</h4>
                    <p className="text-sm text-[#91918d] mt-4">Missing bank details and uncontracted employees are caught before a payrun.</p>
                  </div>
                </li>
                <li className="flex items-start gap-16">
                  <div className="mt-4 flex h-32 w-32 shrink-0 items-center justify-center rounded-md bg-[#3062e1]/10 text-[#3062e1]">
                    <FileText className="h-20 w-20" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#454134]">Immutable History</h4>
                    <p className="text-sm text-[#91918d] mt-4">Old payslips stay correct forever, and overlapping active contracts are impossible.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="order-1 lg:order-2 rounded-[24px] bg-[#faf6dc] p-8 shadow-xl shadow-[#454134]/5 border border-[#c5c7c7]/30">
               <img 
                src="/images/pipeline.jpg" 
                alt="Payroll Pipeline Engine" 
                className="w-full h-auto rounded-[16px] object-cover aspect-square"
              />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
