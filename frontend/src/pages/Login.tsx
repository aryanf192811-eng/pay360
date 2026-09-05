import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Wallet } from 'lucide-react';
import { login } from '../api/auth.api';
import { useAuthStore, homeFor } from '../store/auth.store';
import { Button } from '../components/ui/button';
import { Input, Label } from '../components/ui/input';
import { cn } from '../lib/utils';

// Auto-rotating office photography, cross-fading every few seconds.
const CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80',
];

export function Login() {
  const location = useLocation();
  const locationState = location.state as { from?: string; registered?: boolean; email?: string } | null;
  const [email, setEmail] = useState(locationState?.email || '');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % CAROUSEL_IMAGES.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      navigate(locationState?.from && locationState.from !== '/login' ? locationState.from : homeFor(data.user.role), { replace: true });
    },
  });

  const errorMessage =
    mutation.isError &&
    ((mutation.error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ||
      'Login failed');

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-surface font-sans selection:bg-primary/30">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-surface-dark lg:flex">
        <AnimatePresence mode="sync">
          <motion.div
            key={slide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${CAROUSEL_IMAGES[slide]}')` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/70 to-black/20" />

        <Link to="/" className="relative z-10 flex items-center gap-8 text-sm font-bold text-white hover:text-accent transition-colors p-32">
          <ArrowLeft className="h-16 w-16" /> Back to overview
        </Link>

        <div className="relative z-10 p-48 pt-0">
          <div className="inline-flex items-center justify-center rounded-lg bg-primary p-16 shadow-md mb-24">
            <Wallet className="h-32 w-32 text-white" />
          </div>
          <h1 className="text-4xl font-bold leading-[1.1] text-white tracking-tight">
            The source of truth.
          </h1>
          <p className="mt-16 text-lg text-white/80 font-medium leading-relaxed max-w-md">
            Sign in to access contracts, attendance, and payroll operations.
          </p>
          <div className="mt-24 flex gap-6">
            {CAROUSEL_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn('h-4 rounded-full transition-all', i === slide ? 'w-24 bg-white' : 'w-4 bg-white/40')}
              />
            ))}
          </div>
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

          {locationState?.registered && (
            <div className="mt-16 rounded-md border border-success/30 bg-[color-mix(in_srgb,var(--success)_10%,transparent)] px-16 py-12 text-sm font-medium text-success">
              Account created — sign in below. An admin needs to link your account to your employee record before you can see your own data.
            </div>
          )}

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

            <p className="text-center text-sm text-text-muted">
              New here? <Link to="/register" className="font-bold text-primary hover:underline">Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
