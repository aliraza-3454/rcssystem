import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [activeRole, setActiveRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    regNo: '', department: 'Computer Science', expertise: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: activeRole,
        department: formData.department,
        regNo: formData.regNo,
        expertise: formData.expertise ? formData.expertise.split(',').map(s => s.trim()) : []
      };
      const user = await register(payload);
      toast.success('Registration successful! Welcome!');
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'supervisor') navigate('/supervisor/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="logo-icon">
            <i className="fas fa-microscope"></i>
          </div>
          <h2>Create Account</h2>
          <p>Research Coordination System — PMAS Arid Agriculture University</p>
        </div>

        <div className="role-tabs">
          {[
            { id: 'student', icon: 'fas fa-user-graduate', label: 'Student' },
            { id: 'supervisor', icon: 'fas fa-chalkboard-teacher', label: 'Supervisor' },
            { id: 'admin', icon: 'fas fa-user-shield', label: 'Admin' }
          ].map(r => (
            <button
              key={r.id}
              type="button"
              className={`role-tab ${activeRole === r.id ? 'active' : ''}`}
              onClick={() => setActiveRole(r.id)}
            >
              <i className={r.icon}></i>{r.label}
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
            <label className="form-label">Full Name</label>
            <div className="input-icon-wrapper">
              <i className="fas fa-user input-icon"></i>
              <input name="name" type="text" className="form-control" placeholder="Enter your full name"
                value={formData.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <i className="fas fa-envelope input-icon"></i>
              <input name="email" type="email" className="form-control" placeholder="your@email.com"
                value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          {activeRole === 'student' && (
            <div className="form-group">
              <label className="form-label">Registration Number</label>
              <div className="input-icon-wrapper">
                <i className="fas fa-id-card input-icon"></i>
                <input name="regNo" type="text" className="form-control" placeholder="e.g., 22-ARID-588"
                  value={formData.regNo} onChange={handleChange} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Department</label>
            <select name="department" className="form-select" value={formData.department} onChange={handleChange}>
              <option>Computer Science</option>
              <option>Software Engineering</option>
              <option>Information Technology</option>
              <option>Data Science</option>
              <option>Artificial Intelligence</option>
            </select>
          </div>

          {activeRole === 'supervisor' && (
            <div className="form-group">
              <label className="form-label">Research Expertise (comma-separated)</label>
              <div className="input-icon-wrapper">
                <i className="fas fa-tags input-icon"></i>
                <input name="expertise" type="text" className="form-control"
                  placeholder="e.g., Machine Learning, NLP, Computer Vision"
                  value={formData.expertise} onChange={handleChange} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <i className="fas fa-lock input-icon"></i>
              <input name="password" type="password" className="form-control" placeholder="Min. 6 characters"
                value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-icon-wrapper">
              <i className="fas fa-lock input-icon"></i>
              <input name="confirmPassword" type="password" className="form-control" placeholder="Repeat password"
                value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Creating Account...' : <><i className="fas fa-user-plus" style={{ marginRight: 8 }}></i>Create Account</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1a1f5e', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
