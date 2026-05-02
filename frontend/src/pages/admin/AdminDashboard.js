import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topicStats, setTopicStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [recentTopics, setRecentTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/topics/stats/overview'),
      axios.get('/api/users/stats'),
      axios.get('/api/topics'),
    ]).then(([statsRes, userRes, topicsRes]) => {
      setTopicStats(statsRes.data.stats || {});
      setUserStats(userRes.data.stats || {});
      setRecentTopics((topicsRes.data.topics || []).slice(0, 8));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const map = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', under_review: 'badge-review', completed: 'badge-completed' };
    return <span className={`badge-status ${map[status] || 'badge-pending'}`}>{status.replace('_', ' ')}</span>;
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="welcome-banner">
        <h2>System Overview — <span className="banner-accent">Research Coordination System</span></h2>
        <p>PMAS Arid Agriculture University, Rawalpindi — Complete administrative control panel.</p>
        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
          <i className="fas fa-user-shield" style={{ marginRight: 6 }}></i>Logged in as: <strong style={{ color: '#e8c84a' }}>{user?.name}</strong>
        </div>
      </div>

      {/* System Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Students', value: userStats.totalStudents, icon: 'fas fa-user-graduate', cls: 'blue' },
          { label: 'Total Supervisors', value: userStats.totalSupervisors, icon: 'fas fa-chalkboard-teacher', cls: 'purple' },
          { label: 'Total Topics', value: topicStats.total, icon: 'fas fa-database', cls: 'teal' },
          { label: 'Pending Review', value: topicStats.pending, icon: 'fas fa-clock', cls: 'yellow' },
          { label: 'Approved Topics', value: topicStats.approved, icon: 'fas fa-check-circle', cls: 'green' },
          { label: 'Duplicate Flags', value: topicStats.duplicates, icon: 'fas fa-copy', cls: 'red' },
        ].map((s, i) => (
          <div key={i} className="col-6 col-lg-2">
            <div className="stat-card">
              <div className={`stat-icon ${s.cls}`}><i className={s.icon}></i></div>
              <div className="stat-value">{loading ? '—' : (s.value ?? 0)}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Admin Actions */}
      <div className="row g-4 mb-4">
        {[
          { title: 'Manage Users', desc: 'Add, remove, or manage student/supervisor accounts', icon: 'fas fa-users-cog', path: '/admin/users', color: '#4f9cf9', bg: '#dbeafe' },
          { title: 'All Research Topics', desc: 'Browse and manage all submitted research topics', icon: 'fas fa-database', path: '/admin/topics', color: '#22c55e', bg: '#dcfce7' },
          { title: 'Analytics & Reports', desc: 'View detailed charts and system performance', icon: 'fas fa-chart-bar', path: '/admin/analytics', color: '#e8c84a', bg: '#fef9c3' },
        ].map((a, i) => (
          <div key={i} className="col-md-4">
            <div className="content-card" style={{ cursor: 'pointer', transition: 'all 0.3s' }}
              onClick={() => navigate(a.path)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,31,94,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}>
              <div className="card-body-custom" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={a.icon} style={{ fontSize: '1.4rem', color: a.color }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1a1f5e', marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{a.desc}</div>
                </div>
                <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', color: '#d1d5db' }}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Topics */}
      <div className="content-card">
        <div className="card-header-custom">
          <h5><i className="fas fa-history" style={{ marginRight: 8 }}></i>Recent Research Submissions</h5>
          <button className="btn-outline-custom" onClick={() => navigate('/admin/topics')}>View All</button>
        </div>
        <div className="card-body-custom" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div></div>
          ) : recentTopics.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <h6>No topics submitted yet</h6>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Student</th>
                  <th>Supervisor</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Similarity</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTopics.map(t => (
                  <tr key={t._id}>
                    <td><div style={{ fontWeight: 600, color: '#1a1f5e', fontSize: '0.875rem', maxWidth: 180 }}>{t.title}</div></td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{t.student?.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{t.student?.regNo}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{t.supervisor?.name || <span style={{ color: '#d1d5db' }}>Unassigned</span>}</td>
                    <td><span style={{ background: '#f0f3ff', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', color: '#1a1f5e' }}>{t.domain}</span></td>
                    <td>{statusBadge(t.status)}</td>
                    <td><span style={{ fontWeight: 700, fontSize: '0.875rem', color: t.similarityScore > 70 ? '#dc2626' : '#16a34a' }}>{t.similarityScore}%</span></td>
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
