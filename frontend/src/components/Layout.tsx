import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Building2 } from 'lucide-react';
import { useAuthStore, ROLES, HR_ROLES, PAYROLL_ROLES } from '../store/auth.store';
import { cn } from '../lib/utils';
import { logout as apiLogout } from '../api/auth.api';
import { Avatar } from './Avatar';

interface NavLeaf {
  to: string;
  label: string;
}
interface NavItem {
  label: string;
  to?: string; // plain link when there's nothing to drop down
  children?: NavLeaf[];
  roles?: string[]; // undefined = every authenticated role
}

// Matches the PS's own required top navigation (§B1: "Top navigation exposes Employees,
// Contracts, Attendance, Time Off, Payroll, and Reports") and the Excalidraw reference mockup's
// nav bar structure — this is a real spec requirement, not a styling preference. Visibility here
// is a UX courtesy only; the actual security boundary is the ProtectedRoute `roles` guard on each
// route in App.tsx plus API-level authorization.
const NAV_ITEMS: NavItem[] = [
  {
    label: 'Employees',
    roles: HR_ROLES,
    children: [
      { to: '/employees', label: 'Employees' },
      { to: '/contracts', label: 'Contracts' },
      { to: '/working-schedules', label: 'Working Schedules' },
    ],
  },
  { label: 'Attendance', to: '/attendance' },
  { label: 'Time Off', to: '/time-off' },
  {
    label: 'Payroll',
    roles: PAYROLL_ROLES,
    children: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/payroll', label: 'Payruns' },
      { to: '/salary-config', label: 'Structures & Rules' },
    ],
  },
];

function NavDropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!item.children) {
    return (
      <NavLink
        to={item.to!}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-4 rounded-md px-12 py-8 text-sm font-medium transition-colors',
            isActive ? 'text-primary' : 'text-text-muted hover:text-text'
          )
        }
      >
        {item.label}
      </NavLink>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-4 rounded-md px-12 py-8 text-sm font-medium transition-colors',
          open ? 'text-primary' : 'text-text-muted hover:text-text'
        )}
      >
        {item.label}
        <ChevronDown className={cn('h-14 w-14 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-4 min-w-[200px] rounded-md border border-border bg-surface py-4 shadow-tinted-lg">
          {item.children.map((leaf) => (
            <NavLink
              key={leaf.to}
              to={leaf.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block px-16 py-8 text-sm transition-colors',
                  isActive ? 'bg-primary-light text-primary font-medium' : 'text-text hover:bg-bg'
                )
              }
            >
              {leaf.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

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
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex h-64 items-center justify-between border-b border-border bg-surface/95 px-24 backdrop-blur-md lg:px-32">
        <div className="flex items-center gap-32">
          <NavLink to={user?.role === ROLES.EMPLOYEE ? '/my-space' : '/dashboard'} className="flex items-center gap-8">
            <div className="flex h-32 w-32 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent font-mono text-xs font-bold text-white shadow-tinted">
              P
            </div>
            <span className="hidden text-sm font-bold tracking-tight text-text sm:inline">PeoplePay360</span>
          </NavLink>
          <nav className="flex items-center gap-4">
            {user?.role === ROLES.EMPLOYEE && (
              <NavDropdown item={{ label: 'My Space', to: '/my-space' }} />
            )}
            {visibleItems.map((item) => (
              <NavDropdown key={item.label} item={item} />
            ))}
            {user?.role === ROLES.ADMIN && (
              <NavDropdown item={{ label: 'User Management', to: '/user-management' }} />
            )}
          </nav>
        </div>

        <div className="flex items-center gap-16">
          <div className="hidden items-center gap-8 sm:flex">
            <Avatar seed={user?.email || 'user'} size="sm" />
            <div className="leading-tight">
              <div className="text-xs font-semibold text-text">{user?.email}</div>
              <div className="flex items-center gap-4 text-[11px] capitalize text-text-muted">
                <Building2 className="h-10 w-10" /> {user?.role.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-8 rounded-full px-12 py-8 text-sm font-medium text-text-muted transition-colors hover:bg-primary-light hover:text-danger"
          >
            <LogOut className="h-16 w-16" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      <main className="p-24 lg:p-32">
        <Outlet />
      </main>
    </div>
  );
}
