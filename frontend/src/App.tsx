import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, homeFor, HR_ROLES, PAYROLL_ROLES, ROLES } from './store/auth.store';
import { apiClient } from './api/client';
import { me as apiMe } from './api/auth.api';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { MySpace } from './pages/MySpace';
import { UserManagement } from './pages/UserManagement';
import { EmployeeList } from './pages/EmployeeList';
import { EmployeeDetail } from './pages/EmployeeDetail';
import { ContractList } from './pages/ContractList';
import { AttendanceList } from './pages/AttendanceList';
import { TimeOffPage } from './pages/TimeOffPage';
import { PayrollPage } from './pages/PayrollPage';
import { PayrunDetail } from './pages/PayrunDetail';
import { PayslipDetail } from './pages/PayslipDetail';
import { SalaryConfigPage } from './pages/SalaryConfigPage';
import { Dashboard } from './pages/Dashboard';

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.post('/api/auth/refresh', {}, { withCredentials: true });
        const accessToken = data.data.accessToken;
        if (cancelled) return;
        useAuthStore.getState().setAccessToken(accessToken);
        const user = await apiMe();
        if (cancelled) return;
        setAuth(user, accessToken);
      } catch {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
              path="/employees/:id"
              element={
                <ProtectedRoute roles={HR_ROLES}>
                  <EmployeeDetail />
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
          </Route>

          <Route path="*" element={<CatchAllRedirect />} />
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
