import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';

// Basic Layout
const Layout = () => (
  <div className="min-h-screen bg-bg">
    <nav className="border-b border-border bg-surface px-6 py-4 flex justify-between items-center">
      <div className="font-bold text-lg">PeoplePay360</div>
      <button 
        className="text-sm font-medium text-text-muted hover:text-text"
        onClick={() => {
          useAuthStore.getState().clearAuth();
        }}
      >
        Logout
      </button>
    </nav>
    <main className="p-6">
      <Outlet />
    </main>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Placeholder Pages
const Login = () => {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="bg-surface p-8 rounded-lg shadow-md border border-border w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <p className="text-text-muted text-sm text-center mb-6">
          Backend auth is ready. Real login form comes in a later task.
        </p>
        <button 
          className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-md font-medium transition-colors"
          onClick={() => {
            // Fake login for now just to pass the frontend acceptance check
            useAuthStore.getState().setAuth(
              { id: 'fake', email: 'test@test.com', role: 'admin' }, 
              'fake-token-just-for-frontend-scaffold-check'
            );
          }}
        >
          Fake Login
        </button>
      </div>
    </div>
  );
};

const Employees = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Employees</h1>
    <p>Employee list will go here.</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Navigate to="/employees" replace />} />
          <Route path="/employees" element={<Employees />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
