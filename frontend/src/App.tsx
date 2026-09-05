import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, homeFor, HR_ROLES, PAYROLL_ROLES, ROLES } from './store/auth.store';
import { apiClient } from './api/client';
import { me as apiMe } from './api/auth.api';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MySpace } from './pages/MySpace';
import { UserManagement } from './pages/UserManagement';
import { EmployeeList } from './pages/EmployeeList';
import { EmployeeDetail } from './pages/EmployeeDetail';
import { EmployeeForm } from './pages/EmployeeForm';
import { ContractList } from './pages/ContractList';
import { WorkingSchedules } from './pages/WorkingSchedules';
import { AttendanceList } from './pages/AttendanceList';
import { TimeOffPage } from './pages/TimeOffPage';
import { PayrollPage } from './pages/PayrollPage';
import { PayrunDetail } from './pages/PayrunDetail';
import { PayslipDetail } from './pages/PayslipDetail';
import { SalaryConfigPage } from './pages/SalaryConfigPage';
import { Dashboard } from './pages/Dashboard';
import { WhatIfSimulator } from './pages/WhatIfSimulator';
import { AuditTimeline } from './pages/AuditTimeline';
import { InsightsPage } from './pages/InsightsPage';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  const location = useLocation();

  if (isInitializing) return <FullScreenSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return <>{children}</>;
}

function CatchAllRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <Navigate to={homeFor(user?.role)} replace />;
}

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="h-32 w-32 animate-spin rounded-full border-4 border-border border-t-primary" />
    </div>
  );
}

// Bootstrap: attempt silent re-auth via the httpOnly refresh cookie on first load, so a page
// refresh doesn't force a fresh login as long as the cookie is still valid.
function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { setAuth, setInitializing, isInitializing } = useAuthStore();
  // React.StrictMode (dev only) intentionally mounts this effect twice per page load. Without
  // this guard, both invocations independently POST /api/auth/refresh with the same httpOnly
  // cookie; since refresh tokens rotate on use (one-time-use), whichever request loses the race
  // gets a 401 "invalid refresh token" and silently logs a perfectly valid session out. The ref
  // survives StrictMode's synthetic double-invoke (only the effect callback re-runs, not the
  // component instance), so this makes the real network call fire exactly once. AuthBootstrap
  // wraps the whole app and is only ever mounted once for the session's real lifetime, so there's
  // no genuine "component actually unmounted mid-flight" case to guard against here — the old
  // `cancelled` flag was fighting this guard, not complementing it: it belonged to the discarded
  // first invocation's closure, so it silently swallowed the one real network response and left
  // the app stuck on the loading spinner forever.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    (async () => {
      try {
        const { data } = await apiClient.post('/api/auth/refresh', {}, { withCredentials: true });
        const accessToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(accessToken);
        const user = await apiMe();
        setAuth(user, accessToken);
      } catch {
        setInitializing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isInitializing) return <FullScreenSpinner />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/my-space" element={<MySpace />} />
            <Route
              path="/user-management"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute roles={HR_ROLES}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/new"
              element={
                <ProtectedRoute roles={HR_ROLES}>
                  <EmployeeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <ProtectedRoute roles={HR_ROLES}>
                  <EmployeeDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/:id/edit"
              element={
                <ProtectedRoute roles={HR_ROLES}>
                  <EmployeeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts"
              element={
                <ProtectedRoute roles={HR_ROLES}>
                  <ContractList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/working-schedules"
              element={
                <ProtectedRoute roles={HR_ROLES}>
                  <WorkingSchedules />
                </ProtectedRoute>
              }
            />
            <Route path="/attendance" element={<AttendanceList />} />
            <Route path="/time-off" element={<TimeOffPage />} />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute roles={PAYROLL_ROLES}>
                  <PayrollPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/payruns/:id"
              element={
                <ProtectedRoute roles={PAYROLL_ROLES}>
                  <PayrunDetail />
                </ProtectedRoute>
              }
            />
            {/* Payslip detail stays open to `employee` too — MySpace links here for the
                employee's own payslip; ownership is enforced server-side (payslips.controller.js
                assertOwnRecordOrPayroll), this route-level check just keeps out roles that have
                no business here at all (there is no HR_MANAGER-shaped reason to view a payslip). */}
            <Route
              path="/payroll/payslips/:id"
              element={
                <ProtectedRoute roles={[ROLES.EMPLOYEE, ...PAYROLL_ROLES]}>
                  <PayslipDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salary-config"
              element={
                <ProtectedRoute roles={PAYROLL_ROLES}>
                  <SalaryConfigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={PAYROLL_ROLES}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/simulator"
              element={
                <ProtectedRoute roles={PAYROLL_ROLES}>
                  <WhatIfSimulator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute roles={[ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]}>
                  <AuditTimeline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedRoute roles={HR_ROLES}>
                  <InsightsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<CatchAllRedirect />} />
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
