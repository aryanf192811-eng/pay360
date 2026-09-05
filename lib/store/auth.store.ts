import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  role: string;
  employee_id?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // true while we attempt silent re-auth via the refresh cookie
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setInitializing: (v: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true, isInitializing: false }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setInitializing: (v) => set({ isInitializing: v }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false, isInitializing: false }),
}));

// PS §3 role table — a single source of truth for role-based UI gating.
export const ROLES = {
  EMPLOYEE: 'employee',
  HR_MANAGER: 'hr_manager',
  HR_PAYROLL_USER: 'hr_payroll_user',
  HR_PAYROLL_MANAGER: 'hr_payroll_manager',
  ADMIN: 'admin',
} as const;

export const HR_ROLES: string[] = [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN];
export const PAYROLL_ROLES: string[] = [ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN];
export const PAYROLL_WRITE_ROLES: string[] = [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN];

// Single source of truth for "where does this role land" — every redirect (Landing, Login,
// ProtectedRoute's role-mismatch fallback, the catch-all route) calls this instead of each
// carrying its own copy of the role check, so they can't silently drift out of sync.
export function homeFor(role: string | undefined | null): string {
  return role === ROLES.EMPLOYEE ? '/my-space' : '/employees';
}
