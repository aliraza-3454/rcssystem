import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'supervisor') navigate('/supervisor/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (r) => {
    setRole(r);
    if (r === 'student') { setEmail('student@rcs.edu'); setPassword('password123'); }
    else if (r === 'supervisor') { setEmail('supervisor@rcs.edu'); setPassword('password123'); }
    else { setEmail('admin@rcs.edu'); setPassword('password123'); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">🔬</div>
          <h1>Research Coordination System</h1>
          <p>PMAS-Arid Agriculture University, Rawalpindi</p>
        </div>

        <div className="role-selector">
          {['student', 'supervisor', 'admin'].map((r) => (
            <button
              key={r}
              className={`role-btn ${role === r ? 'active' : ''}`}
              onClick={() => fillDemo(r)}
            >
              <span className="role-icon">{r === 'student' ? '🎓' : r === 'supervisor' ? '👨‍🏫' : '⚙️'}</span>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              className="form-control"
              type="email"
              placeholder="Enter your university email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn-primary-main" type="submit" disabled={loading}>
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>

        <div style={{marginTop: '20px', padding: '12px', background: 'rgba(0,188,212,0.06)', borderRadius: '10px', border: '1px solid rgba(0,188,212,0.2)'}}>
          <p style={{fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'Space Mono, monospace'}}>
            University Institute of Information Technology
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
