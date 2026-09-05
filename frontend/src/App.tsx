import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { apiClient } from './api/client';
import { me as apiMe } from './api/auth.api';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
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
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/employees" replace />;
  return <>{children}</>;
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
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/employees" replace />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/contracts" element={<ContractList />} />
            <Route path="/attendance" element={<AttendanceList />} />
            <Route path="/time-off" element={<TimeOffPage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/payroll/payruns/:id" element={<PayrunDetail />} />
            <Route path="/payroll/payslips/:id" element={<PayslipDetail />} />
            <Route path="/salary-config" element={<SalaryConfigPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/employees" replace />} />
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
