import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import RoxilerLogo from '../../components/ui/RoxilerLogo';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Name is required';
    else if (form.name.length < 20) e.name = 'Name must be at least 20 characters';
    else if (form.name.length > 60) e.name = 'Name must be at most 60 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (form.address.length > 400) e.address = 'Address must be at most 400 characters';
    if (!form.password) e.password = 'Password is required';
    else if (!PASSWORD_REGEX.test(form.password))
      e.password = 'Password must be 8–16 chars with uppercase and special character';
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: '' });
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      const errs = err.response?.data?.errors;
      if (errs) {
        const fieldErrors = {};
        errs.forEach((er) => { if (er.path) fieldErrors[er.path] = er.msg; });
        setErrors(fieldErrors);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-card" style={{ maxWidth: 500 }}>
          {/* Logo */}
          <div className="auth-logo">
            <RoxilerLogo width={130} height={40} />
          </div>

          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the platform and discover great stores</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Min 20 characters"
                value={form.name}
                onChange={handleChange('name')}
              />
              {errors.name && <p className="form-error">⚠ {errors.name}</p>}
              <p className="text-xs text-muted mt-1">{form.name.length}/60 characters</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange('email')}
              />
              {errors.email && <p className="form-error">⚠ {errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">Address</label>
              <textarea
                id="address"
                className={`form-input ${errors.address ? 'error' : ''}`}
                placeholder="Your address (max 400 chars)"
                value={form.address}
                onChange={handleChange('address')}
                rows={2}
                style={{ resize: 'vertical' }}
              />
              {errors.address && <p className="form-error">⚠ {errors.address}</p>}
              <p className="text-xs text-muted mt-1">{form.address.length}/400 characters</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="8–16 chars, uppercase, special char"
                  value={form.password}
                  onChange={handleChange('password')}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">⚠ {errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-full mt-2" disabled={loading}>
              {loading
                ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                : <UserPlus size={16} />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="divider" />
          <p className="text-sm text-muted" style={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" className="link-text">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
