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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-[#fefefe] font-sans selection:bg-[#3062e1]/30">
      {/* Premium Image Panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#faf6dc] lg:flex border-r border-[#c5c7c7]/30">
        <div className="absolute inset-0 p-32 pb-0">
          <img 
            src="/images/hero.jpg" 
            alt="Dashboard Layout" 
            className="w-full h-full rounded-t-[24px] object-cover shadow-2xl shadow-[#454134]/20 border-t border-l border-r border-[#c5c7c7]/30"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf6dc] via-[#faf6dc]/60 to-transparent" />

        <Link to="/" className="relative z-10 flex items-center gap-8 text-sm font-bold text-[#454134] hover:text-[#3062e1] transition-colors p-32">
          <ArrowLeft className="h-16 w-16" /> Back to overview
        </Link>

        <div className="relative z-10 p-48 pt-0">
          <div className="inline-flex items-center justify-center rounded-lg bg-[#3062e1] p-16 shadow-md mb-24">
            <Wallet className="h-32 w-32 text-[#fefefe]" />
          </div>
          <h1 className="text-4xl font-bold leading-[1.1] text-[#454134] tracking-tight">
            The source of truth.
          </h1>
          <p className="mt-16 text-lg text-[#91918d] font-medium leading-relaxed max-w-md">
            Sign in to access contracts, attendance, and payroll operations.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center px-24 py-48 bg-[#fefefe]">
        <div className="w-full max-w-[420px]">
          <div className="mb-48 flex items-center gap-12 lg:hidden">
            <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-[#3062e1] font-mono text-sm font-bold text-[#fefefe] shadow-sm">P360</div>
            <span className="text-lg font-bold text-[#454134] tracking-tight">PeoplePay360</span>
          </div>

          <h2 className="text-3xl font-bold text-[#454134] tracking-tight">Sign In</h2>
          <p className="mt-8 text-base text-[#91918d]">Enter your HR-issued credentials.</p>

          <form
            className="mt-40 space-y-24"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <div className="space-y-8">
              <Label htmlFor="email" className="text-sm font-bold text-[#454134]">Email Address</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus className="h-48 rounded-md bg-[#faf6dc] border-[#c5c7c7]/50 focus:border-[#3062e1] focus:ring-[#3062e1] transition-colors text-[#454134]" placeholder="name@company.com" />
            </div>
            <div className="space-y-8">
              <Label htmlFor="password" className="text-sm font-bold text-[#454134]">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-48 rounded-md bg-[#faf6dc] border-[#c5c7c7]/50 focus:border-[#3062e1] focus:ring-[#3062e1] transition-colors text-[#454134]" placeholder="••••••••" />
            </div>

            {errorMessage && (
              <div className="rounded-md border border-red-200 bg-red-50 px-16 py-12 text-sm font-medium text-red-600">
                {errorMessage}
              </div>
            )}

            <Button type="submit" className="w-full h-48 rounded-md text-base font-bold bg-[#3062e1] text-[#fefefe] hover:bg-[#3062e1]/90 shadow-sm transition-all" disabled={mutation.isPending}>
              {mutation.isPending ? 'Authenticating…' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
