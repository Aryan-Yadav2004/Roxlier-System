import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Store, Users, LogOut, KeyRound, ShoppingBag
} from 'lucide-react';
import RoxilerLogo from '../ui/RoxilerLogo';

const roleNavMap = {
  admin: [
    { to: '/admin',        label: 'Dashboard',  icon: <LayoutDashboard size={16} /> },
    { to: '/admin/users',  label: 'Users',      icon: <Users size={16} /> },
    { to: '/admin/stores', label: 'Stores',     icon: <Store size={16} /> },
  ],
  user: [
    { to: '/dashboard',   label: 'Stores',     icon: <ShoppingBag size={16} /> },
  ],
  store_owner: [
    { to: '/owner',       label: 'Dashboard',  icon: <LayoutDashboard size={16} /> },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = roleNavMap[user?.role] || [];
  const initials = user?.name?.slice(0, 2).toUpperCase() || 'U';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Roxiler Logo */}
      <div className="sidebar-logo">
        <RoxilerLogo width={110} height={33} />
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin' || item.to === '/owner'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <NavLink
          to="/change-password"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <KeyRound size={16} />
          Change Password
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip" style={{ marginBottom: '0.6rem', padding: '0 0.5rem' }}>
          <div className="user-avatar">{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div className="text-sm font-semibold truncate">{user?.name}</div>
            <div className="text-xs text-muted truncate">{user?.email}</div>
          </div>
        </div>
        <button className="nav-item" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
