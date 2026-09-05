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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-surface font-sans selection:bg-primary/30">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-bg lg:flex border-r border-border">
        <div className="absolute inset-0 p-32 pb-0">
          <img
            src="/images/hero.jpg"
            alt="Dashboard Layout"
            className="w-full h-full rounded-t-lg object-cover shadow-lg border-t border-l border-r border-border"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />

        <Link to="/" className="relative z-10 flex items-center gap-8 text-sm font-bold text-text hover:text-primary transition-colors p-32">
          <ArrowLeft className="h-16 w-16" /> Back to overview
        </Link>

        <div className="relative z-10 p-48 pt-0">
          <div className="inline-flex items-center justify-center rounded-lg bg-primary p-16 shadow-md mb-24">
            <Wallet className="h-32 w-32 text-white" />
          </div>
          <h1 className="text-4xl font-bold leading-[1.1] text-text tracking-tight">
            The source of truth.
          </h1>
          <p className="mt-16 text-lg text-text-muted font-medium leading-relaxed max-w-md">
            Sign in to access contracts, attendance, and payroll operations.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-24 py-48 bg-surface">
        <div className="w-full max-w-[420px]">
          <div className="mb-48 flex items-center gap-12 lg:hidden">
            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-white shadow-sm">P360</div>
            <span className="text-lg font-bold text-text tracking-tight">PeoplePay360</span>
          </div>

          <h2 className="text-3xl font-bold text-text tracking-tight">Sign In</h2>
          <p className="mt-8 text-base text-text-muted">Enter your HR-issued credentials.</p>

          <form
            className="mt-32 space-y-24"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <div className="space-y-8">
              <Label htmlFor="email" className="text-sm font-bold text-text">Email Address</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus className="h-48 bg-bg" placeholder="name@company.com" />
            </div>
            <div className="space-y-8">
              <Label htmlFor="password" className="text-sm font-bold text-text">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-48 bg-bg" placeholder="••••••••" />
            </div>

            {errorMessage && (
              <div className="rounded-md border border-danger/30 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-16 py-12 text-sm font-medium text-danger">
                {errorMessage}
              </div>
            )}

            <Button type="submit" className="w-full h-48 text-base font-bold shadow-sm" disabled={mutation.isPending}>
              {mutation.isPending ? 'Authenticating…' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
