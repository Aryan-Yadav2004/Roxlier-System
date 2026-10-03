import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects routes by requiring authentication and optionally a specific role.
 * @param {string|string[]} roles - Required role(s). If empty, just checks auth.
 */
const ProtectedRoute = ({ roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles.length && !roles.includes(user.role)) {
    // Redirect to the user's correct dashboard
    const dashboardMap = { admin: '/admin', user: '/dashboard', store_owner: '/owner' };
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
