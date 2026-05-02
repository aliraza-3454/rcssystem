/* eslint-disable */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    regNo: '', department: 'Computer Science', expertise: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const userData = {
        name: form.name, email: form.email, password: form.password,
        role, regNo: form.regNo, department: form.department,
        expertise: form.expertise ? form.expertise.split(',').map(s => s.trim()) : []
      };
      await register(userData);
      toast.success('Account created! Please login to continue.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{maxWidth: '520px'}}>
        <div className="auth-logo">
          <div className="logo-icon">🔬</div>
          <h1>Create Account</h1>
          <p>Research Coordination System</p>
        </div>

        <div className="role-selector">
          {['student', 'supervisor', 'admin'].map((r) => (
            <button key={r} className={`role-btn ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>
              <span className="role-icon">{r === 'student' ? '🎓' : r === 'supervisor' ? '👨‍🏫' : '⚙️'}</span>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" name="name" placeholder="Your full name"
              value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" name="email" type="email" placeholder="University email"
              value={form.email} onChange={handleChange} required />
          </div>
          {role === 'student' && (
            <div className="form-group">
              <label>Registration Number</label>
              <input className="form-control" name="regNo" placeholder="e.g. 22-ARID-588"
                value={form.regNo} onChange={handleChange} />
            </div>
          )}
          <div className="form-group">
            <label>Department</label>
            <select className="form-control" name="department" value={form.department} onChange={handleChange}>
              <option>Computer Science</option>
              <option>Software Engineering</option>
              <option>Information Technology</option>
              <option>Data Science</option>
            </select>
          </div>
          {role === 'supervisor' && (
            <div className="form-group">
              <label>Areas of Expertise (comma-separated)</label>
              <input className="form-control" name="expertise" placeholder="AI, Machine Learning, NLP"
                value={form.expertise} onChange={handleChange} />
            </div>
          )}
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" name="password" type="password" placeholder="Min. 6 characters"
              value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input className="form-control" name="confirmPassword" type="password" placeholder="Repeat password"
              value={form.confirmPassword} onChange={handleChange} required />
          </div>
          <button className="btn-primary-main" type="submit" disabled={loading}>
            {loading ? '⏳ Creating...' : '✅ Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;