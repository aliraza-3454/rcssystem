import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/topics').then(res => setTopics(res.data.topics || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pending = topics.filter(t => t.status === 'pending');
  const approved = topics.filter(t => t.status === 'approved');
  const underReview = topics.filter(t => t.status === 'under_review');

  return (
    <DashboardLayout title="Supervisor Dashboard">
      <div className="welcome-banner">
        <h2>Welcome, <span className="banner-accent">Dr. {user?.name?.split(' ').slice(-1)[0]}</span> 🎓</h2>
        <p>Review student research topics and guide their academic journey.</p>
        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
          <i className="fas fa-building" style={{ marginRight: 6 }}></i>{user?.department}
          {user?.expertise?.length > 0 && <> &nbsp;|&nbsp; <i className="fas fa-tags" style={{ marginRight: 6 }}></i>{user.expertise.join(', ')}</>}
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Assigned', value: topics.length, icon: 'fas fa-folder', cls: 'blue' },
          { label: 'Pending Review', value: pending.length, icon: 'fas fa-hourglass-half', cls: 'yellow' },
          { label: 'Under Review', value: underReview.length, icon: 'fas fa-eye', cls: 'purple' },
          { label: 'Approved', value: approved.length, icon: 'fas fa-check-double', cls: 'green' },
        ].map((s, i) => (
          <div key={i} className="col-6 col-lg-3">
            <div className="stat-card">
              <div className={`stat-icon ${s.cls}`}><i className={s.icon}></i></div>
              <div className="stat-value">{loading ? '—' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="content-card">
            <div className="card-header-custom">
              <h5><i className="fas fa-inbox" style={{ marginRight: 8, color: '#d97706' }}></i>Pending Reviews ({pending.length})</h5>
              <button className="btn-primary-custom" onClick={() => navigate('/supervisor/review-topics')}>
                Review All
              </button>
            </div>
            <div className="card-body-custom" style={{ padding: 0 }}>
              {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
              ) : pending.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-clipboard-check"></i>
                  <h6>No pending reviews!</h6>
                  <p style={{ fontSize: '0.875rem' }}>All caught up. Great work!</p>
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Topic</th>
                      <th>Domain</th>
                      <th>Similarity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.slice(0, 6).map(t => (
                      <tr key={t._id} style={{ cursor: 'pointer' }} onClick={() => navigate('/supervisor/review-topics')}>
                        <td><div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.student?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{t.student?.regNo}</div></td>
                        <td style={{ maxWidth: 200 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1a1f5e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                        </td>
                        <td><span style={{ background: '#f0f3ff', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', color: '#1a1f5e' }}>{t.domain}</span></td>
                        <td>
                          <span style={{ fontWeight: 700, color: t.similarityScore > 70 ? '#dc2626' : '#16a34a', fontSize: '0.875rem' }}>
                            {t.similarityScore}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="content-card h-100">
            <div className="card-header-custom">
              <h5><i className="fas fa-chart-pie" style={{ marginRight: 8 }}></i>Topic Status Overview</h5>
            </div>
            <div className="card-body-custom">
              {[
                { label: 'Pending', count: pending.length, total: topics.length, color: '#f59e0b' },
                { label: 'Approved', count: approved.length, total: topics.length, color: '#22c55e' },
                { label: 'Rejected', count: topics.filter(t => t.status === 'rejected').length, total: topics.length, color: '#ef4444' },
                { label: 'Completed', count: topics.filter(t => t.status === 'completed').length, total: topics.length, color: '#6d28d9' },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: item.color }}>{item.count}</span>
                  </div>
                  <div className="progress-bar-custom">
                    <div className="progress-fill" style={{
                      width: item.total ? `${(item.count / item.total) * 100}%` : '0%',
                      background: item.color
                    }}></div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '1rem', background: '#f0f3ff', borderRadius: 12 }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1f5e' }}>{topics.length}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Total Topics</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
