import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState('student');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoCredentials = {
    student: { email: 'student@arid.edu.pk', password: 'student123' },
    supervisor: { email: 'supervisor@arid.edu.pk', password: 'super123' },
    admin: { email: 'admin@arid.edu.pk', password: 'admin123' },
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setFormData(demoCredentials[role]);
    setError('');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'supervisor') navigate('/supervisor/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = { student: 'fas fa-user-graduate', supervisor: 'fas fa-chalkboard-teacher', admin: 'fas fa-user-shield' };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">
            <i className="fas fa-microscope"></i>
          </div>
          <h2>Research Coordination</h2>
          <p>PMAS Arid Agriculture University, Rawalpindi</p>
        </div>

        <div className="role-tabs">
          {['student', 'supervisor', 'admin'].map(role => (
            <button
              key={role}
              className={`role-tab ${activeRole === role ? 'active' : ''}`}
              onClick={() => handleRoleChange(role)}
              type="button"
            >
              <i className={roleIcons[role]}></i>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="alert-custom alert-danger">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper" style={{ position: 'relative' }}>
              <i className="fas fa-lock input-icon"></i>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingRight: '3rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '1rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#6b7280'
                }}
              >
                <i className={showPass ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, display: 'inline-block', marginRight: 8 }}></span>Signing in...</>
            ) : (
              <><i className="fas fa-sign-in-alt" style={{ marginRight: 8 }}></i>Sign In</>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#1a1f5e', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>

        <div style={{
          marginTop: '1.5rem', padding: '1rem',
          background: '#f0f3ff', borderRadius: 12,
          fontSize: '0.75rem', color: '#6b7280'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1a1f5e' }}>
            <i className="fas fa-info-circle" style={{ marginRight: 6 }}></i>Demo Credentials
          </div>
          <div>Student: student@arid.edu.pk / student123</div>
          <div>Supervisor: supervisor@arid.edu.pk / super123</div>
          <div>Admin: admin@arid.edu.pk / admin123</div>
        </div>
      </div>
    </div>
  );
}
