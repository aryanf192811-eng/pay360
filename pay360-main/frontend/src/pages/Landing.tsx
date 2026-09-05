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
    <div className="min-h-screen bg-bg font-sans text-text">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-surface/95 backdrop-blur-md px-32 py-16 shadow-sm">
        <div className="flex items-center gap-12">
          <div className="flex h-[36px] w-[36px] items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-white">
            P360
          </div>
          <span className="text-xl font-bold tracking-tight text-text">PeoplePay360</span>
        </div>
        <div className="flex items-center gap-16">
          <Button variant="ghost" className="hidden sm:flex font-semibold">Features</Button>
          <Button size="lg" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </nav>

      <section className="mx-auto flex max-w-7xl flex-col items-center px-24 pt-[80px] pb-64 text-center lg:pt-[120px]">
        <div className="inline-flex items-center gap-8 rounded-full border border-primary/20 bg-primary/5 px-16 py-8 mb-32">
          <span className="flex h-8 w-8 rounded-full bg-primary" />
          <span className="text-sm font-semibold text-primary tracking-wide uppercase">Enterprise HRMS & Payroll</span>
        </div>

        <h1 className="max-w-5xl text-5xl font-bold tracking-tight text-text sm:text-7xl lg:leading-[1.1]">
          Payroll that shows its work.
        </h1>

        <p className="mx-auto mt-24 max-w-2xl text-xl text-text-muted leading-relaxed">
          A definitive HR engine where contracts, attendance, and leave perfectly synchronize. Stop trusting black-box spreadsheets; audit every rule in real-time.
        </p>

        <div className="mt-32 flex flex-col sm:flex-row justify-center gap-16 w-full sm:w-auto">
          <Button size="lg" className="px-[40px] h-[56px] text-lg font-bold shadow-md transition-transform hover:-translate-y-1" onClick={() => navigate('/login')}>
            Enter Workspace <ArrowRight className="h-[20px] w-[20px] ml-12" />
          </Button>
        </div>

        <div className="relative mt-48 w-full max-w-6xl rounded-lg bg-surface p-8 shadow-lg border border-border">
          <img
            src="/images/hero.jpg"
            alt="Dashboard Interface"
            className="w-full h-auto rounded-md object-cover aspect-video"
          />
        </div>
      </section>

      <section className="bg-surface border-t border-border py-[120px]">
        <div className="mx-auto max-w-7xl px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-48 items-center">

            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold tracking-tight text-text sm:text-5xl mb-24">
                Auditable Data Pipelines
              </h2>
              <p className="text-lg text-text-muted leading-relaxed mb-32">
                Every payslip exposes the exact pipeline that produced it. Our transparent salary-rule engine ensures you can trust the logic, not just the final number.
                A raise is a new contract row, never an overwrite.
              </p>

              <ul className="space-y-24">
                <li className="flex items-start gap-16">
                  <div className="mt-4 flex h-32 w-32 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <ShieldCheck className="h-[20px] w-[20px]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-text">Payroll Preflight</h4>
                    <p className="text-sm text-text-muted mt-4">Missing bank details and uncontracted employees are caught before a payrun.</p>
                  </div>
                </li>
                <li className="flex items-start gap-16">
                  <div className="mt-4 flex h-32 w-32 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-[20px] w-[20px]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-text">Immutable History</h4>
                    <p className="text-sm text-text-muted mt-4">Old payslips stay correct forever, and overlapping active contracts are impossible.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="order-1 lg:order-2 rounded-lg bg-bg p-8 shadow-md border border-border">
               <img
                src="/images/pipeline.jpg"
                alt="Payroll Pipeline Engine"
                className="w-full h-auto rounded-md object-cover aspect-square"
              />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
