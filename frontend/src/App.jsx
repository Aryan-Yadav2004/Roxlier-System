import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import ChangePassword from './pages/auth/ChangePassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminStores    from './pages/admin/AdminStores';

// User Pages
import UserDashboard  from './pages/user/UserDashboard';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const map = { admin: '/admin', user: '/dashboard', store_owner: '/owner' };
  return <Navigate to={map[user.role] || '/login'} replace />;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#1A202C',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(43,108,176,0.1)',
            fontSize: '0.875rem',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#38A169', secondary: '#F0FFF4' } },
          error:   { iconTheme: { primary: '#E53E3E', secondary: '#FFF5F5' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<RootRedirect />} />

            {/* Admin */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin"          element={<AdminDashboard />} />
              <Route path="/admin/users"    element={<AdminUsers />} />
              <Route path="/admin/stores"   element={<AdminStores />} />
            </Route>

            {/* Normal User */}
            <Route element={<ProtectedRoute roles={['user']} />}>
              <Route path="/dashboard" element={<UserDashboard />} />
            </Route>

            {/* Store Owner */}
            <Route element={<ProtectedRoute roles={['store_owner']} />}>
              <Route path="/owner" element={<OwnerDashboard />} />
            </Route>

            {/* Shared (any authenticated role) */}
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
