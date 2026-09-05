import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Wallet } from 'lucide-react';
import { login } from '../api/auth.api';
import { useAuthStore, homeFor } from '../store/auth.store';
import { Button } from '../components/ui/button';
import { Input, Label } from '../components/ui/input';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      const from = (location.state as { from?: string })?.from;
      navigate(from && from !== '/login' ? from : homeFor(data.user.role), { replace: true });
    },
  });

  const errorMessage =
    mutation.isError &&
    ((mutation.error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ||
      'Login failed');

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel — deliberately not a plain centered card, per UI_GUIDE's Ledger identity */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-48 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />
        <Link to="/" className="relative flex items-center gap-8 text-sm font-medium text-white/80 hover:text-white">
          <ArrowLeft className="h-16 w-16" /> Back to overview
        </Link>

        <div className="relative">
          <div className="flex h-56 w-56 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
            <Wallet className="h-28 w-28" />
          </div>
          <h1 className="mt-32 text-3xl font-bold leading-tight">
            Payroll that shows its work.
          </h1>
          <p className="mt-16 max-w-sm text-sm text-white/70">
            Every payslip on this platform traces back to the exact rule that produced it —
            sign in to see contracts, attendance, and payroll agree with each other.
          </p>
        </div>

        <div className="relative font-mono text-xs text-white/50">PeoplePay360 · HR &amp; Payroll Operations</div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center px-24 py-48">
        <div className="w-full max-w-sm">
          <div className="mb-32 flex items-center gap-8 lg:hidden">
            <div className="flex h-32 w-32 items-center justify-center rounded-md bg-primary font-mono text-sm font-bold text-white">P360</div>
            <span className="text-sm font-semibold text-text">PeoplePay360</span>
          </div>

          <h2 className="text-xl font-bold text-text">Sign in</h2>
          <p className="mt-4 text-sm text-text-muted">Use the credentials issued by your HR team.</p>

          <form
            className="mt-24 space-y-16"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <div className="space-y-4">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <div className="space-y-4">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {errorMessage && (
              <div className="rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-12 py-8 text-sm text-danger">
                {errorMessage}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
