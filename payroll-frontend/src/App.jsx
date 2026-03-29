import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider, createTheme } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import HrDashboard from './pages/hr/HrDashboard';
import EmployeeManagement from './pages/hr/EmployeeManagement';
import PayrollManagement from './pages/hr/PayrollManagement';
import LeavePage from './pages/LeavePage';
import PayrollPage from './pages/PayrollPage';
import SignupPage from './pages/SignupPage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#667eea' },
    secondary: { main: '#764ba2' },
    background: { default: '#0d1117', paper: '#161b27' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.12)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.25)',
          },
        },
      },
    },
  },
});

const ProtectedRoute = ({ children, roles }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={darkTheme}>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1f2e',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Employee Routes */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute roles={['EMPLOYEE', 'HR', 'ADMIN']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="leaves" element={<LeavePage />} />
              <Route path="payroll" element={<PayrollPage />} />
            </Route>

            {/* HR Routes */}
            <Route
              path="/hr"
              element={
                <ProtectedRoute roles={['HR', 'ADMIN']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<HrDashboard />} />
              <Route path="employees" element={<EmployeeManagement />} />
              <Route path="leaves" element={<LeavePage />} />
              <Route path="payroll" element={<PayrollManagement />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
