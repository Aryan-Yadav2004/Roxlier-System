import { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../api';
import { Search, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import SortableHeader from '../../components/ui/SortableHeader';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import StarRating from '../../components/ui/StarRating';

const EMPTY_FORM = { name: '', email: '', address: '', owner_id: '' };

const AdminStores = () => {
  const [data, setData]       = useState({ stores: [], total: 0 });
  const [loading, setLoading]   = useState(false);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [sortBy, setSortBy]     = useState('s.name');
  const [order, setOrder]       = useState('ASC');
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const LIMIT = 10;

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await adminAPI.listStores({ page, limit: LIMIT, search, sortBy, order });
      setData(d.data);
    } catch { toast.error('Failed to load stores'); }
    finally { setLoading(false); }
  }, [page, search, sortBy, order]);

  useEffect(() => { fetchStores(); }, [fetchStores]);
  useEffect(() => { setPage(1); }, [search, sortBy]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    else { setSortBy(field); setOrder('ASC'); }
  };

  const validateForm = () => {
    const e = {};
    if (!form.name || form.name.length < 20) e.name = 'Store name must be at least 20 chars';
    if (form.name.length > 60) e.name = 'Store name must be max 60 chars';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.address.length > 400) e.address = 'Max 400 characters';
    if (!form.owner_id) e.owner_id = 'Owner ID is required';
    return e;
  };

  const handleCreate = async (ev) => {
    ev.preventDefault();
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setSubmitting(true);
    try {
      await adminAPI.createStore(form);
      toast.success('Store created!');
      setModal(false);
      setForm(EMPTY_FORM);
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create store');
    } finally { setSubmitting(false); }
  };

  const totalPages = Math.ceil(data.total / LIMIT);

  return (
    <div style={{ animation: 'slideUp 0.4s ease' }}>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Stores</h1>
          <p className="page-subtitle">{data.total} total stores</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setModal(true); setFormErrors({}); setForm(EMPTY_FORM); }}>
          <PlusCircle size={16} /> Add Store
        </button>
      </div>

      <div className="card">
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
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <SortableHeader label="Store Name" field="s.name"       sortBy={sortBy} order={order} onSort={handleSort} />
                <SortableHeader label="Email"       field="s.email"      sortBy={sortBy} order={order} onSort={handleSort} />
                <SortableHeader label="Address"     field="s.address"    sortBy={sortBy} order={order} onSort={handleSort} />
                <SortableHeader label="Avg Rating"  field="avg_rating"   sortBy={sortBy} order={order} onSort={handleSort} />
                <th>Ratings</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : data.stores.length === 0 ? (
                <tr><td colSpan={5} className="empty-state"><div className="empty-state-icon">🏪</div><div className="empty-state-text">No stores found</div></td></tr>
              ) : data.stores.map((s) => (
                <tr key={s.id}>
                  <td className="font-semibold">{s.name}</td>
                  <td className="text-muted">{s.email}</td>
                  <td className="text-muted truncate" style={{ maxWidth: 200 }}>{s.address}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <StarRating value={Math.round(s.avg_rating || 0)} readOnly size={0.9} />
                      <span className="text-sm text-muted">{s.avg_rating ? parseFloat(s.avg_rating).toFixed(1) : '—'}</span>
                    </div>
                  </td>
                  <td className="text-muted">{s.total_ratings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={data.total} limit={LIMIT} />
      </div>

      {modal && (
        <Modal title="Add New Store" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate}>
            {[
              { id: 's-name',  label: 'Store Name', field: 'name',     type: 'text',  ph: 'Min 20 characters' },
              { id: 's-email', label: 'Email',       field: 'email',    type: 'email', ph: 'store@example.com' },
              { id: 's-oid',   label: 'Owner ID (UUID)', field: 'owner_id', type: 'text', ph: 'Paste owner user UUID' },
            ].map(({ id, label, field, type, ph }) => (
              <div className="form-group" key={field}>
                <label className="form-label" htmlFor={id}>{label}</label>
                <input
                  id={id}
                  type={type}
                  className={`form-input ${formErrors[field] ? 'error' : ''}`}
                  placeholder={ph}
                  value={form[field]}
                  onChange={(e) => { setForm({ ...form, [field]: e.target.value }); setFormErrors({ ...formErrors, [field]: '' }); }}
                />
                {formErrors[field] && <p className="form-error">⚠ {formErrors[field]}</p>}
              </div>
            ))}

            <div className="form-group">
              <label className="form-label" htmlFor="s-addr">Address</label>
              <textarea
                id="s-addr"
                className={`form-input ${formErrors.address ? 'error' : ''}`}
                rows={2}
                placeholder="Max 400 characters"
                value={form.address}
                onChange={(e) => { setForm({ ...form, address: e.target.value }); setFormErrors({ ...formErrors, address: '' }); }}
                style={{ resize: 'vertical' }}
              />
              {formErrors.address && <p className="form-error">⚠ {formErrors.address}</p>}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Store'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminStores;
