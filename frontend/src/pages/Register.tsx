import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Wallet } from 'lucide-react';
import { register } from '../api/auth.api';
import { Button } from '../components/ui/button';
import { Input, Label } from '../components/ui/input';
import { cn } from '../lib/utils';

const CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
];

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
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % CAROUSEL_IMAGES.length), 4000);
    return () => clearInterval(timer);
  }, []);

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
            Your record starts here.
          </h1>
          <p className="mt-16 text-lg text-white/80 font-medium leading-relaxed max-w-md">
            Create your employee account to view your contracts, attendance, and payslips.
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
