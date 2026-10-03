import { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import { Users, Store, Star } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users',   value: stats?.totalUsers,   icon: <Users size={22} />,  cls: 'purple' },
    { label: 'Total Stores',  value: stats?.totalStores,  icon: <Store size={22} />,  cls: 'blue' },
    { label: 'Total Ratings', value: stats?.totalRatings, icon: <Star size={22} />,   cls: 'amber' },
  ];

  return (
    <div style={{ animation: 'slideUp 0.4s ease' }}>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and statistics</p>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /><span>Loading stats...</span></div>
      ) : (
        <div className="stats-grid">
          {cards.map((c) => (
            <div className="stat-card" key={c.label}>
              <div className={`stat-icon ${c.cls}`}>{c.icon}</div>
              <div>
                <div className="stat-label">{c.label}</div>
                <div className="stat-value">{c.value?.toLocaleString() ?? '—'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Quick Actions</h2>
        <p className="text-sm text-muted">Use the sidebar to manage users and stores.</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a href="/admin/users" className="btn btn-secondary btn-sm"><Users size={14} /> Manage Users</a>
          <a href="/admin/stores" className="btn btn-secondary btn-sm"><Store size={14} /> Manage Stores</a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
