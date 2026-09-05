import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, CalendarClock, Clock, Wallet, Settings, LogOut } from 'lucide-react';
import { useAuthStore, HR_ROLES, PAYROLL_ROLES } from '../store/auth.store';
import { cn } from '../lib/utils';
import { logout as apiLogout } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Users;
  roles?: string[]; // undefined = every authenticated role
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: PAYROLL_ROLES },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/contracts', label: 'Contracts', icon: FileText, roles: HR_ROLES },
  { to: '/attendance', label: 'Attendance', icon: Clock },
  { to: '/time-off', label: 'Time Off', icon: CalendarClock },
  { to: '/payroll', label: 'Payroll', icon: Wallet, roles: PAYROLL_ROLES },
  { to: '/salary-config', label: 'Salary Config', icon: Settings, roles: PAYROLL_ROLES },
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
    <div className="flex min-h-screen bg-bg">
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex h-64 items-center gap-8 border-b border-border px-24">
          <div className="flex h-32 w-32 items-center justify-center rounded-md bg-primary font-mono text-sm font-bold text-white">
            P360
          </div>
          <span className="text-sm font-semibold text-text">PeoplePay360</span>
        </div>

        <nav className="flex-1 space-y-4 px-12 py-16">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-12 rounded-md px-12 py-8 text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-white' : 'text-text-muted hover:bg-bg hover:text-text'
                )
              }
            >
              <Icon className="h-16 w-16" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border px-12 py-16">
          <div className="mb-8 px-12">
            <div className="truncate text-sm font-medium text-text">{user?.email}</div>
            <div className="text-xs capitalize text-text-muted">{user?.role.replace(/_/g, ' ')}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-12 rounded-md px-12 py-8 text-sm font-medium text-text-muted transition-colors hover:bg-bg hover:text-danger"
          >
            <LogOut className="h-16 w-16" />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden p-24">
        <Outlet />
      </main>
    </div>
  );
}
