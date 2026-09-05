import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Calculator, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useAuthStore, homeFor } from '../store/auth.store';
import { Button } from '../components/ui/button';

const PILLARS = [
  {
    icon: FileText,
    title: 'Contracts that never lie about history',
    description: 'A raise is a new contract row, never an overwrite — old payslips stay correct forever, and two overlapping active contracts are structurally impossible.',
  },
  {
    icon: Calculator,
    title: 'Payroll you can actually audit',
    description: 'Every payslip shows the real rule pipeline that produced it — Basic → Allowances → Deductions → Net — not just a final number to trust blindly.',
  },
  {
    icon: ShieldCheck,
    title: 'Warnings before money moves',
    description: 'Missing bank details, uncontracted employees, and duplicate payslips are caught and surfaced before a payrun is ever validated.',
  },
  {
    icon: LayoutDashboard,
    title: 'One live dashboard, zero static charts',
    description: 'Every KPI, every chart, every department breakdown is computed from real rows the moment you load the page.',
  },
];

export function Landing() {
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  const navigate = useNavigate();

  if (isInitializing) return null;
  if (isAuthenticated) {
    return <Navigate to={homeFor(user?.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav className="flex items-center justify-between border-b border-border px-32 py-16">
        <div className="flex items-center gap-8">
          <div className="flex h-32 w-32 items-center justify-center rounded-md bg-primary font-mono text-sm font-bold text-white">P360</div>
          <span className="text-sm font-semibold text-text">PeoplePay360</span>
        </div>
        <Button size="sm" variant="secondary" onClick={() => navigate('/login')}>Sign in</Button>
      </nav>

      <section className="mx-auto max-w-3xl px-24 pb-64 pt-96 text-center">
        <h1 className="text-3xl font-bold leading-tight text-text sm:text-4xl">
          HR and payroll that agree with each other.
        </h1>
        <p className="mx-auto mt-16 max-w-xl text-base text-text-muted">
          One employee record connects contracts, attendance, and leave to a payroll engine that
          computes real payslips from real rules — not a spreadsheet pretending to be software.
        </p>
        <div className="mt-32 flex justify-center gap-12">
          <Button size="lg" onClick={() => navigate('/login')}>
            Sign in to your workspace <ArrowRight className="h-16 w-16" />
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-24 px-24 pb-96 sm:grid-cols-2">
        {PILLARS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-lg border border-border bg-surface p-24 shadow-sm">
            <div className="flex h-40 w-40 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]">
              <Icon className="h-20 w-20 text-primary" />
            </div>
            <h3 className="mt-16 text-base font-semibold text-text">{title}</h3>
            <p className="mt-8 text-sm text-text-muted">{description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
