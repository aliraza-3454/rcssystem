import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/topics').then(res => {
      setTopics(res.data.topics || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: topics.length,
    pending: topics.filter(t => t.status === 'pending').length,
    approved: topics.filter(t => t.status === 'approved').length,
    rejected: topics.filter(t => t.status === 'rejected').length,
  };

  const quickActions = [
    { icon: 'fas fa-lightbulb', label: 'Get Topic Suggestions', desc: 'AI-powered context-based topic ideas', path: '/student/suggestions', color: '#e8c84a', bg: '#fef9c3' },
    { icon: 'fas fa-paper-plane', label: 'Submit New Topic', desc: 'Propose a research topic for review', path: '/student/submit-topic', color: '#1a1f5e', bg: '#dbeafe' },
    { icon: 'fas fa-tasks', label: 'Update Progress', desc: 'Submit your research progress report', path: '/student/progress', color: '#22c55e', bg: '#dcfce7' },
  ];

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="welcome-banner">
        <h2>Welcome back, <span className="banner-accent">{user?.name?.split(' ')[0]}</span>! 👋</h2>
        <p>Track your research progress and manage your topics from here.</p>
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
          <i className="fas fa-id-badge" style={{ marginRight: 6 }}></i>
          Reg No: {user?.regNo || 'N/A'} &nbsp;|&nbsp;
          <i className="fas fa-building" style={{ marginRight: 6 }}></i>
          {user?.department}
        </div>
      </div>

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Submissions', value: stats.total, icon: 'fas fa-folder-open', cls: 'blue' },
          { label: 'Pending Review', value: stats.pending, icon: 'fas fa-clock', cls: 'yellow' },
          { label: 'Approved Topics', value: stats.approved, icon: 'fas fa-check-circle', cls: 'green' },
          { label: 'Rejected Topics', value: stats.rejected, icon: 'fas fa-times-circle', cls: 'red' },
        ].map((s, i) => (
          <div className="col-6 col-lg-3" key={i}>
            <div className="stat-card">
              <div className={`stat-icon ${s.cls}`}><i className={s.icon}></i></div>
              <div className="stat-value">{loading ? '—' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="content-card mb-4">
        <div className="card-header-custom">
          <h5><i className="fas fa-rocket" style={{ marginRight: 8, color: '#e8c84a' }}></i>Quick Actions</h5>
        </div>
        <div className="card-body-custom">
          <div className="row g-3">
            {quickActions.map((a, i) => (
              <div className="col-md-4" key={i}>
                <div
                  onClick={() => navigate(a.path)}
                  style={{
                    border: '2px solid #e5e7eb', borderRadius: 14, padding: '1.25rem',
                    cursor: 'pointer', transition: 'all 0.3s', display: 'flex', gap: '1rem',
                    alignItems: 'flex-start'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = a.bg; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={a.icon} style={{ color: a.color, fontSize: '1.1rem' }}></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1f5e', marginBottom: 4 }}>{a.label}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{a.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Topics */}
      <div className="content-card">
        <div className="card-header-custom">
          <h5><i className="fas fa-history" style={{ marginRight: 8 }}></i>Recent Topic Submissions</h5>
          <button className="btn-outline-custom" onClick={() => navigate('/student/my-topics')}>
            View All <i className="fas fa-arrow-right"></i>
          </button>
        </div>
        <div className="card-body-custom" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div></div>
          ) : topics.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-folder-open"></i>
              <h6>No topics submitted yet</h6>
              <p style={{ fontSize: '0.875rem' }}>Start by getting topic suggestions or submitting a new topic.</p>
              <button className="btn-primary-custom mt-3" onClick={() => navigate('/student/submit-topic')}>
                <i className="fas fa-plus"></i> Submit First Topic
              </button>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Similarity</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {topics.slice(0, 5).map(t => (
                  <tr key={t._id}>
                    <td><div style={{ fontWeight: 600, color: '#1a1f5e' }}>{t.title}</div></td>
                    <td><span style={{ background: '#f0f3ff', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', color: '#1a1f5e' }}>{t.domain}</span></td>
                    <td>
                      <span className={`badge-status badge-${t.status === 'under_review' ? 'review' : t.status}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar-custom" style={{ width: 60 }}>
                          <div className="progress-fill" style={{ width: `${t.similarityScore}%`, background: t.similarityScore > 70 ? '#ef4444' : '#22c55e' }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem' }}>{t.similarityScore}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>{new Date(t.submittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
