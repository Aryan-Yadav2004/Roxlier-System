import { useEffect, useState, useCallback } from 'react';
import { ownerAPI } from '../../api';
import { Star, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import StarRating from '../../components/ui/StarRating';
import SortableHeader from '../../components/ui/SortableHeader';
import Pagination from '../../components/ui/Pagination';

const OwnerDashboard = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(1);
  const [sortBy, setSortBy] = useState('r.updated_at');
  const [order, setOrder]   = useState('DESC');
  const LIMIT = 10;

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await ownerAPI.getDashboard({ page, limit: LIMIT, sortBy, order });
      setData(d.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load dashboard');
    } finally { setLoading(false); }
  }, [page, sortBy, order]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    else { setSortBy(field); setOrder('ASC'); }
  };

  const totalPages = data ? Math.ceil(data.store.total_ratings / LIMIT) : 1;

  return (
    <div style={{ animation: 'slideUp 0.4s ease' }}>
      <div className="page-header">
        <h1 className="page-title">Store Dashboard</h1>
        <p className="page-subtitle">Manage your store and see who rated it</p>
      </div>

      {loading && !data ? (
        <div className="loading-container"><div className="spinner" /><span>Loading...</span></div>
      ) : data ? (
        <>
          {/* Store Stats */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-icon amber"><Star size={22} /></div>
              <div>
                <div className="stat-label">Average Rating</div>
                <div className="stat-value">{data.store.avg_rating ? parseFloat(data.store.avg_rating).toFixed(1) : '—'}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><Users size={22} /></div>
              <div>
                <div className="stat-label">Total Ratings</div>
                <div className="stat-value">{data.store.total_ratings}</div>
              </div>
            </div>
          </div>

          <div className="card mb-2" style={{ marginBottom: '1.5rem' }}>
            <div className="font-semibold" style={{ marginBottom: '0.25rem' }}>{data.store.name}</div>
            <div className="text-muted text-sm">{data.store.address}</div>
            <div style={{ marginTop: '0.75rem' }}>
              <StarRating value={Math.round(data.store.avg_rating || 0)} readOnly />
            </div>
          </div>

          {/* Raters Table */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
              Users Who Rated Your Store
            </h2>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <SortableHeader label="User Name" field="u.name"       sortBy={sortBy} order={order} onSort={handleSort} />
                    <th>Email</th>
                    <SortableHeader label="Rating"    field="r.rating"     sortBy={sortBy} order={order} onSort={handleSort} />
                    <SortableHeader label="Rated On"  field="r.updated_at" sortBy={sortBy} order={order} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                  ) : data.raters.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state">
                          <div className="empty-state-icon">⭐</div>
                          <p className="empty-state-text">No ratings yet</p>
                        </div>
                      </td>
                    </tr>
                  ) : data.raters.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="user-chip">
                          <div className="user-avatar">{r.user_name?.slice(0, 2).toUpperCase()}</div>
                          <span>{r.user_name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{r.user_email}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <StarRating value={r.rating} readOnly size={0.9} />
                          <span className="text-warning font-semibold text-sm">{r.rating}</span>
                        </div>
                      </td>
                      <td className="text-muted text-sm">{new Date(r.updated_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={data.store.total_ratings} limit={LIMIT} />
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <p>No store found for your account.</p>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
