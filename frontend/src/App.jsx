import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { EmployeeDashboard } from './pages/EmployeeDashboard';

const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return <Navigate to="/employee-dashboard" replace />;
  return children;
};

const EmployeeRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === 'Admin') return <Navigate to="/admin-dashboard" replace />;
  return children;
};

const RootRedirect = () => {
  const { user, token, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!token || !user) return <Navigate to="/login" replace />;
  return user.role === 'Admin' ? (
    <Navigate to="/admin-dashboard" replace />
  ) : (
    <Navigate to="/employee-dashboard" replace />
  );
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-slate-400 text-sm">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p>Loading Task Portal...</p>
    </div>
  </div>
);

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin-dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/employee-dashboard"
              element={
                <EmployeeRoute>
                  <EmployeeDashboard />
                </EmployeeRoute>
              }
            />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
