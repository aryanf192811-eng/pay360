import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, LogOut, Building2 } from 'lucide-react';
import { useAuthStore, ROLES, HR_ROLES, PAYROLL_ROLES, homeFor } from '../store/auth.store';
import { cn } from '../lib/utils';
import { logout as apiLogout } from '../api/auth.api';
import { Avatar } from './Avatar';
import { Footer } from './Footer';

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
      { to: '/payroll/simulator', label: 'What-If Simulator' },
    ],
  },
  { label: 'Insights', to: '/insights', roles: HR_ROLES },
  { label: 'Audit Log', to: '/audit-logs', roles: [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN] },
];

function NavDropdown({ item, highlighted, onHover }: { item: NavItem; highlighted: boolean; onHover: (label: string | null) => void }) {
  // `clicked` is a fallback for devices with no hover (touch) — hovering alone opens the menu
  // on desktop, so a click-then-hover conflict never fights over the same `open` flag.
  const [clicked, setClicked] = useState(false);
  const open = highlighted || clicked;
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setClicked(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const isActiveRoute = item.children
    ? item.children.some((leaf) => location.pathname.startsWith(leaf.to))
    : location.pathname.startsWith(item.to!);
  const showPill = highlighted || (!highlighted && isActiveRoute);

  if (!item.children) {
    return (
      <NavLink
        to={item.to!}
        onMouseEnter={() => onHover(item.label)}
        onMouseLeave={() => onHover(null)}
        className="relative flex items-center gap-4 rounded-full px-12 py-8 text-sm font-medium text-text-muted transition-colors hover:text-text data-[active=true]:text-primary"
        data-active={isActiveRoute}
      >
        {showPill && (
          <motion.span
            layoutId="navPill"
            className="absolute inset-0 rounded-full bg-primary-light"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <span className="relative z-10">{item.label}</span>
      </NavLink>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => onHover(item.label)}
      onMouseLeave={() => onHover(null)}
    >
      <button
        onClick={() => setClicked((v) => !v)}
        className={cn(
          'relative flex items-center gap-4 rounded-full px-12 py-8 text-sm font-medium transition-colors',
          open || isActiveRoute ? 'text-primary' : 'text-text-muted hover:text-text'
        )}
      >
        {showPill && (
          <motion.span
            layoutId="navPill"
            className="absolute inset-0 rounded-full bg-primary-light"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-4">
          {item.label}
          <ChevronDown className={cn('h-[14px] w-[14px] transition-transform', open && 'rotate-180')} />
        </span>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 top-full z-40 mt-4 min-w-[200px] rounded-md border border-border bg-surface py-4 shadow-tinted-lg"
        >
          {item.children.map((leaf) => (
            <NavLink
              key={leaf.to}
              to={leaf.to}
              onClick={() => setClicked(false)}
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
        </motion.div>
      )}
    </div>
  );
}

export function Layout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

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
          <NavLink to={homeFor(user?.role)} className="flex items-center gap-8">
            <div className="flex h-32 w-32 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent font-mono text-xs font-bold text-white shadow-tinted">
              P
            </div>
            <span className="hidden text-sm font-bold tracking-tight text-text sm:inline">PeoplePay360</span>
          </NavLink>
          <nav className="flex items-center gap-4 rounded-full bg-bg p-4" onMouseLeave={() => setHoveredLabel(null)}>
            {user?.role === ROLES.EMPLOYEE && (
              <NavDropdown item={{ label: 'My Space', to: '/my-space' }} highlighted={hoveredLabel === 'My Space'} onHover={setHoveredLabel} />
            )}
            {visibleItems.map((item) => (
              <NavDropdown key={item.label} item={item} highlighted={hoveredLabel === item.label} onHover={setHoveredLabel} />
            ))}
            {user?.role === ROLES.ADMIN && (
              <NavDropdown item={{ label: 'User Management', to: '/user-management' }} highlighted={hoveredLabel === 'User Management'} onHover={setHoveredLabel} />
            )}
          </nav>
        </div>

        <div className="flex items-center gap-16">
          <div className="hidden items-center gap-8 sm:flex">
            <Avatar seed={user?.email || 'user'} size="sm" />
            <div className="leading-tight">
              <div className="text-xs font-semibold text-text">{user?.email}</div>
              <div className="flex items-center gap-4 text-[11px] capitalize text-text-muted">
                <Building2 className="h-[10px] w-[10px]" /> {user?.role.replace(/_/g, ' ')}
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
      <Footer />
    </div>
  );
}
