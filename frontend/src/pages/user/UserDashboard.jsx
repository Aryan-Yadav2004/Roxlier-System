import { useEffect, useState, useCallback } from 'react';
import { userAPI } from '../../api';
import { Search, MapPin, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import StarRating from '../../components/ui/StarRating';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';

const UserDashboard = () => {
  const [data, setData]       = useState({ stores: [], total: 0 });
  const [loading, setLoading]   = useState(false);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [sortBy, setSortBy]     = useState('s.name');
  const [order]                 = useState('ASC');
  const [ratingModal, setRatingModal] = useState(null); // { store, tempRating }
  const [submittingRating, setSubmittingRating] = useState(false);
  const LIMIT = 9;

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await userAPI.listStores({ page, limit: LIMIT, search, sortBy, order });
      setData(d.data);
    } catch { toast.error('Failed to load stores'); }
    finally { setLoading(false); }
  }, [page, search, sortBy, order]);

  useEffect(() => { fetchStores(); }, [fetchStores]);
  useEffect(() => { setPage(1); }, [search]);

  const handleSubmitRating = async () => {
    if (!ratingModal.tempRating) { toast.error('Please select a rating'); return; }
    setSubmittingRating(true);
    try {
      await userAPI.submitRating(ratingModal.store.id, ratingModal.tempRating);
      toast.success('Rating submitted!');
      setRatingModal(null);
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally { setSubmittingRating(false); }
  };

  const totalPages = Math.ceil(data.total / LIMIT);

  return (
    <div style={{ animation: 'slideUp 0.4s ease' }}>
      <div className="page-header">
        <h1 className="page-title">Discover Stores</h1>
        <p className="page-subtitle">Browse and rate stores on the platform</p>
      </div>

      <div className="toolbar">
        <div className="search-wrapper">
          <span className="search-icon"><Search size={15} /></span>
          <input
            className="search-input"
            placeholder="Search by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="s.name">Sort by Name</option>
          <option value="avg_rating">Sort by Rating</option>
          <option value="s.address">Sort by Address</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /><span>Loading stores...</span></div>
      ) : data.stores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <p className="empty-state-text">No stores found</p>
        </div>
      ) : (
        <div className="store-grid">
          {data.stores.map((store) => (
            <div className="store-card" key={store.id}>
              <div className="store-name">{store.name}</div>
              <div className="store-address">
                <MapPin size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                {store.address}
              </div>

              <div className="store-rating-row">
                <div className="avg-rating">
                  <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
                  <span style={{ color: '#f59e0b' }}>{store.avg_rating ? parseFloat(store.avg_rating).toFixed(1) : 'No ratings'}</span>
                  <span className="text-muted text-xs">({store.total_ratings} reviews)</span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div className="your-rating-label">Your rating</div>
                <StarRating value={store.user_rating || 0} readOnly />
              </div>

              <button
                className="btn btn-primary btn-full btn-sm"
                onClick={() => setRatingModal({ store, tempRating: store.user_rating || 0 })}
              >
                <Star size={14} />
                {store.user_rating ? 'Modify Rating' : 'Rate Store'}
              </button>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={data.total} limit={LIMIT} />

      {ratingModal && (
        <Modal title={ratingModal.store.user_rating ? 'Modify Your Rating' : 'Rate This Store'} onClose={() => setRatingModal(null)}>
          <p className="text-muted text-sm mb-2">
            You are rating: <strong style={{ color: 'var(--color-text)' }}>{ratingModal.store.name}</strong>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem 0' }}>
            <div className="text-muted text-sm">Select your rating</div>
            <StarRating
              value={ratingModal.tempRating}
              onChange={(r) => setRatingModal({ ...ratingModal, tempRating: r })}
              size={2.5}
            />
            <div className="font-semibold" style={{ fontSize: '1.1rem', color: 'var(--color-warning)' }}>
              {ratingModal.tempRating > 0 ? `${ratingModal.tempRating} / 5` : 'Click a star to rate'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRatingModal(null)}>Cancel</button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleSubmitRating}
              disabled={submittingRating || !ratingModal.tempRating}
            >
              {submittingRating ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserDashboard;
