import { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../api';
import { Search, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import SortableHeader from '../../components/ui/SortableHeader';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const EMPTY_FORM = { name: '', email: '', address: '', password: '', role: 'user' };

const roleBadge = (role) => {
  const map = { admin: 'badge-admin', user: 'badge-user', store_owner: 'badge-owner' };
  const label = { admin: 'Admin', user: 'User', store_owner: 'Store Owner' };
  return <span className={`badge ${map[role]}`}>{label[role]}</span>;
};

const AdminUsers = () => {
  const [data, setData]     = useState({ users: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('u.created_at');
  const [order, setOrder]   = useState('DESC');
  const [modal, setModal]   = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const LIMIT = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await adminAPI.listUsers({ page, limit: LIMIT, search, role: roleFilter, sortBy, order });
      setData(d.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter, sortBy, order]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [search, roleFilter, sortBy]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    else { setSortBy(field); setOrder('ASC'); }
  };

  const validateForm = () => {
    const e = {};
    if (!form.name) e.name = 'Required';
    else if (form.name.length < 20) e.name = 'Min 20 characters';
    else if (form.name.length > 60) e.name = 'Max 60 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.address.length > 400) e.address = 'Max 400 characters';
    if (!form.password || !PASSWORD_REGEX.test(form.password))
      e.password = '8–16 chars, uppercase, special char';
    return e;
  };

  const handleCreateUser = async (ev) => {
    ev.preventDefault();
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setSubmitting(true);
    try {
      await adminAPI.createUser(form);
      toast.success('User created!');
      setModal(false);
      setForm(EMPTY_FORM);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally { setSubmitting(false); }
  };

  const handleViewDetail = async (id) => {
    try {
      const { data: d } = await adminAPI.getUserDetail(id);
      setDetail(d.data);
    } catch { toast.error('Failed to fetch user detail'); }
  };

  const totalPages = Math.ceil(data.total / LIMIT);

  return (
    <div style={{ animation: 'slideUp 0.4s ease' }}>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{data.total} total users</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setModal(true); setFormErrors({}); setForm(EMPTY_FORM); }}>
          <UserPlus size={16} /> Add User
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-wrapper">
            <span className="search-icon"><Search size={15} /></span>
            <input
              className="search-input"
              placeholder="Search by name, email, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="store_owner">Store Owner</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <SortableHeader label="Name"    field="u.name"       sortBy={sortBy} order={order} onSort={handleSort} />
                <SortableHeader label="Email"   field="u.email"      sortBy={sortBy} order={order} onSort={handleSort} />
                <SortableHeader label="Address" field="u.address"    sortBy={sortBy} order={order} onSort={handleSort} />
                <SortableHeader label="Role"    field="u.role"       sortBy={sortBy} order={order} onSort={handleSort} />
                <th>Avg Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : data.users.length === 0 ? (
                <tr><td colSpan={6} className="empty-state"><div className="empty-state-icon">👤</div><div className="empty-state-text">No users found</div></td></tr>
              ) : data.users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-chip">
                      <div className="user-avatar">{u.name.slice(0, 2).toUpperCase()}</div>
                      <span className="truncate" style={{ maxWidth: 180 }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td className="text-muted truncate" style={{ maxWidth: 200 }}>{u.address || '—'}</td>
                  <td>{roleBadge(u.role)}</td>
                  <td>{u.avg_store_rating ? <span className="text-warning font-semibold">★ {u.avg_store_rating}</span> : '—'}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleViewDetail(u.id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={data.total} limit={LIMIT} />
      </div>

      {/* Create User Modal */}
      {modal && (
        <Modal title="Add New User" onClose={() => setModal(false)}>
          <form onSubmit={handleCreateUser}>
            {[
              { id: 'u-name', label: 'Full Name', field: 'name', type: 'text', ph: 'Min 20 characters' },
              { id: 'u-email', label: 'Email', field: 'email', type: 'email', ph: 'user@example.com' },
              { id: 'u-pw', label: 'Password', field: 'password', type: 'password', ph: '8–16 chars' },
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
              <label className="form-label" htmlFor="u-addr">Address</label>
              <textarea
                id="u-addr"
                className={`form-input ${formErrors.address ? 'error' : ''}`}
                rows={2}
                placeholder="Max 400 characters"
                value={form.address}
                onChange={(e) => { setForm({ ...form, address: e.target.value }); setFormErrors({ ...formErrors, address: '' }); }}
                style={{ resize: 'vertical' }}
              />
              {formErrors.address && <p className="form-error">⚠ {formErrors.address}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="u-role">Role</label>
              <select
                id="u-role"
                className="form-input filter-select"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* User Detail Modal */}
      {detail && (
        <Modal title="User Detail" onClose={() => setDetail(null)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="user-avatar lg">{detail.name?.slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="font-bold" style={{ fontSize: '1.1rem' }}>{detail.name}</div>
              <div className="text-muted text-sm">{detail.email}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { l: 'Role', v: roleBadge(detail.role) },
              { l: 'Avg Store Rating', v: detail.avg_store_rating ? <span className="text-warning">★ {detail.avg_store_rating}</span> : '—' },
              { l: 'Address', v: detail.address || '—' },
              { l: 'Joined', v: new Date(detail.created_at).toLocaleDateString() },
            ].map(({ l, v }) => (
              <div key={l}>
                <div className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{l}</div>
                <div>{v}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsers;
