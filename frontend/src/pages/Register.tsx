import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Wallet } from 'lucide-react';
import { register } from '../api/auth.api';
import { Button } from '../components/ui/button';
import { Input, Label } from '../components/ui/input';

// Self-service signup — always creates an 'employee' account (backend-enforced, see
// auth.service.js ALLOWED_SELF_ROLES). An admin who wants to create a privileged account
// (hr_manager and up) does that from User Management instead, which hits the same endpoint
// while authenticated so the backend allows any role.
export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => register(email, password),
    onSuccess: () => {
      navigate('/login', { state: { registered: true, email } });
    },
  });

  const errorMessage =
    localError ||
    (mutation.isError &&
      ((mutation.error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ||
        'Registration failed'));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    mutation.mutate();
  }

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
            Your record starts here.
          </h1>
          <p className="mt-16 text-lg text-text-muted font-medium leading-relaxed max-w-md">
            Create your employee account to view your contracts, attendance, and payslips.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-24 py-48 bg-surface">
        <div className="w-full max-w-[420px]">
          <div className="mb-48 flex items-center gap-12 lg:hidden">
            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-white shadow-sm">P360</div>
            <span className="text-lg font-bold text-text tracking-tight">PeoplePay360</span>
          </div>

          <h2 className="text-3xl font-bold text-text tracking-tight">Create Account</h2>
          <p className="mt-8 text-base text-text-muted">
            Registers a new employee account. Your login will need to be linked to your employee
            record by an admin before you can see your own data.
          </p>

          <form className="mt-32 space-y-24" onSubmit={handleSubmit}>
            <div className="space-y-8">
              <Label htmlFor="email" className="text-sm font-bold text-text">Email Address</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus className="h-48 bg-bg" placeholder="name@company.com" />
            </div>
            <div className="space-y-8">
              <Label htmlFor="password" className="text-sm font-bold text-text">Password</Label>
              <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="h-48 bg-bg" placeholder="At least 8 characters" />
            </div>
            <div className="space-y-8">
              <Label htmlFor="confirm-password" className="text-sm font-bold text-text">Confirm Password</Label>
              <Input id="confirm-password" type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-48 bg-bg" placeholder="Re-enter password" />
            </div>

            {errorMessage && (
              <div className="rounded-md border border-danger/30 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-16 py-12 text-sm font-medium text-danger">
                {errorMessage}
              </div>
            )}

            <Button type="submit" className="w-full h-48 text-base font-bold shadow-sm" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating account…' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-text-muted">
              Already have an account? <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
