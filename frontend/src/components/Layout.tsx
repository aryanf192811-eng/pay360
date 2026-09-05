import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, CalendarClock, Clock, Wallet, Settings, LogOut, Home, ShieldCheck, CalendarDays } from 'lucide-react';
import { useAuthStore, ROLES, HR_ROLES, PAYROLL_ROLES } from '../store/auth.store';
import { cn } from '../lib/utils';
import { logout as apiLogout } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Users;
  roles?: string[]; // undefined = every authenticated role
}

// Nav visibility is a UX courtesy, not the security boundary — the real boundary is the
// ProtectedRoute `roles` guard on each route in App.tsx plus API-level authorization
// (independently verified all session). This list just keeps each role from seeing links to
// workspaces that aren't theirs.
const NAV_ITEMS: NavItem[] = [
  { to: '/my-space', label: 'My Space', icon: Home, roles: [ROLES.EMPLOYEE] },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: PAYROLL_ROLES },
  { to: '/employees', label: 'Employees', icon: Users, roles: HR_ROLES },
  { to: '/contracts', label: 'Contracts', icon: FileText, roles: HR_ROLES },
  { to: '/working-schedules', label: 'Working Schedules', icon: CalendarDays, roles: HR_ROLES },
  { to: '/attendance', label: 'Attendance', icon: Clock },
  { to: '/time-off', label: 'Time Off', icon: CalendarClock },
  { to: '/payroll', label: 'Payroll', icon: Wallet, roles: PAYROLL_ROLES },
  { to: '/salary-config', label: 'Salary Config', icon: Settings, roles: PAYROLL_ROLES },
  { to: '/user-management', label: 'User Management', icon: ShieldCheck, roles: [ROLES.ADMIN] },
];

export function Layout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  const handleLogout = async () => {
    try {
      await apiLogout();
    } finally {
      clearAuth();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col bg-surface-dark text-surface-dark-foreground">
        <div className="flex h-[72px] items-center gap-12 px-24">
          <div className="flex h-[36px] w-[36px] items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent font-mono text-sm font-bold text-white shadow-tinted">
            P
          </div>
          <span className="text-base font-bold tracking-tight">PeoplePay360</span>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-12 py-8">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-12 rounded-full px-16 py-12 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-tinted'
                    : 'text-surface-dark-foreground/60 hover:bg-white/5 hover:text-surface-dark-foreground'
                )
              }
            >
              <Icon className="h-16 w-16" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mx-12 mb-16 rounded-lg bg-white/5 p-12">
          <div className="mb-8 flex items-center gap-8 px-4">
            <Avatar seed={user?.email || 'user'} size="sm" />
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold">{user?.email}</div>
              <div className="text-[11px] capitalize text-surface-dark-foreground/50">{user?.role.replace(/_/g, ' ')}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-8 rounded-full px-8 py-8 text-xs font-medium text-surface-dark-foreground/60 transition-colors hover:bg-white/10 hover:text-danger"
          >
            <LogOut className="h-[14px] w-[14px]" />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden p-24 lg:p-32">
        <Outlet />
      </main>
    </div>
  );
}
