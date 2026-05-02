import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';

export default function SupervisorStudents() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/topics').then(res => setTopics(res.data.topics || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Group topics by student
  const studentMap = {};
  topics.forEach(t => {
    if (t.student) {
      const id = t.student._id;
      if (!studentMap[id]) studentMap[id] = { student: t.student, topics: [] };
      studentMap[id].topics.push(t);
    }
  });

  const students = Object.values(studentMap);

  return (
    <DashboardLayout title="My Students">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          <i className="fas fa-users" style={{ marginRight: 6 }}></i>
          {students.length} student{students.length !== 1 ? 's' : ''} assigned
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : students.length === 0 ? (
        <div className="content-card">
          <div className="empty-state">
            <i className="fas fa-users"></i>
            <h6>No students assigned yet</h6>
            <p style={{ fontSize: '0.875rem' }}>Students who submit topics with you as supervisor will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {students.map(({ student, topics: sTopics }) => {
            const approved = sTopics.filter(t => t.status === 'approved').length;
            const latestProgress = sTopics.reduce((acc, t) => {
              const last = t.progressReports?.slice(-1)[0];
              return last ? Math.max(acc, last.percentage) : acc;
            }, 0);

            return (
              <div key={student._id} className="col-md-6 col-xl-4">
                <div className="content-card h-100">
                  <div className="card-body-custom">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: 'linear-gradient(135deg, #1a1f5e, #4f9cf9)',
                        color: 'white', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0
                      }}>
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1a1f5e', fontSize: '0.95rem' }}>{student.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{student.email}</div>
                        {student.regNo && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{student.regNo}</div>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                      {[
                        { label: 'Topics', value: sTopics.length, color: '#1a1f5e', bg: '#f0f3ff' },
                        { label: 'Approved', value: approved, color: '#16a34a', bg: '#dcfce7' },
                        { label: 'Progress', value: `${latestProgress}%`, color: '#d97706', bg: '#fef9c3' },
                      ].map((s, i) => (
                        <div key={i} style={{
                          flex: 1, background: s.bg, borderRadius: 10,
                          padding: '0.6rem', textAlign: 'center'
                        }}>
                          <div style={{ fontWeight: 700, color: s.color, fontSize: '1rem' }}>{s.value}</div>
                          <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Recent Topics</div>
                      {sTopics.slice(0, 2).map(t => (
                        <div key={t._id} style={{
                          padding: '0.5rem 0.75rem', background: '#f8f9ff',
                          borderRadius: 8, marginBottom: '0.5rem',
                          fontSize: '0.8rem', display: 'flex',
                          alignItems: 'center', justifyContent: 'space-between'
                        }}>
                          <span style={{ color: '#1a1f5e', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {t.title}
                          </span>
                          <span className={`badge-status badge-${t.status === 'under_review' ? 'review' : t.status}`} style={{ marginLeft: 8, flexShrink: 0, fontSize: '0.65rem' }}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                      {sTopics.length > 2 && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
                          +{sTopics.length - 2} more topic{sTopics.length - 2 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
