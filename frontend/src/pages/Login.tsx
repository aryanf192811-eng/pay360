import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { Button } from '../components/ui/button';
import { Input, Label } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';

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
      const from = (location.state as { from?: string })?.from || '/employees';
      navigate(from, { replace: true });
    },
  });

  const errorMessage =
    mutation.isError &&
    ((mutation.error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ||
      'Login failed');

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-16">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-32">
          <div className="mb-24 flex flex-col items-center gap-8">
            <div className="flex h-40 w-40 items-center justify-center rounded-md bg-primary font-mono text-base font-bold text-white">
              P360
            </div>
            <div className="text-lg font-semibold text-text">PeoplePay360</div>
            <div className="text-sm text-text-muted">HR &amp; Payroll Operations Platform</div>
          </div>

          <form
            className="space-y-16"
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
        </CardContent>
      </Card>
    </div>
  );
}
