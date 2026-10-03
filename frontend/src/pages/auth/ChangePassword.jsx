import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const ChangePassword = () => {
  const { logout } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showFields, setShowFields] = useState({ current: false, new: false, confirm: false });

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Required';
    if (!form.newPassword) e.newPassword = 'Required';
    else if (!PASSWORD_REGEX.test(form.newPassword))
      e.newPassword = '8–16 chars, 1 uppercase, 1 special char';
    if (form.newPassword !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed. Please log in again.');
      await logout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (field) => setShowFields((s) => ({ ...s, [field]: !s[field] }));

  const PasswordField = ({ id, label, field, toggleKey, placeholder }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={showFields[toggleKey] ? 'text' : 'password'}
          className={`form-input ${errors[field] ? 'error' : ''}`}
          placeholder={placeholder}
          value={form[field]}
          onChange={(e) => { setForm({ ...form, [field]: e.target.value }); setErrors({ ...errors, [field]: '' }); }}
          style={{ paddingRight: '3rem' }}
        />
        <button
          type="button"
          onClick={() => toggle(toggleKey)}
          style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
        >
          {showFields[toggleKey] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[field] && <p className="form-error">⚠ {errors[field]}</p>}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Change Password</h1>
        <p className="page-subtitle">Update your account password</p>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="stat-icon purple"><KeyRound size={20} /></div>
          <div>
            <div className="font-semibold">Password Security</div>
            <div className="text-sm text-muted">You'll be logged out after changing</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <PasswordField id="cur-pw"  label="Current Password"  field="currentPassword" toggleKey="current" placeholder="Enter current password" />
          <PasswordField id="new-pw"  label="New Password"      field="newPassword"      toggleKey="new"     placeholder="8–16 chars, uppercase, special char" />
          <PasswordField id="conf-pw" label="Confirm Password"  field="confirm"          toggleKey="confirm" placeholder="Repeat new password" />

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <KeyRound size={16} />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
