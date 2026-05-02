import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    API.get('/topics/supervisor').then(r => setTopics(r.data.topics)).catch(() => {});
  }, []);

  const pending = topics.filter(t => t.status === 'pending').length;
  const approved = topics.filter(t => t.status === 'approved').length;
  const students = [...new Set(topics.map(t => t.student?._id))].length;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-title">
            <h1>👨‍🏫 Supervisor Dashboard</h1>
            <p>Welcome, Dr. {user?.name}</p>
          </div>
        </div>
        <div className="page-body">
          <div className="stats-grid">
            {[
              {icon:'📋',label:'Total Assigned',value:topics.length,cls:'blue'},
              {icon:'⏳',label:'Awaiting Review',value:pending,cls:'orange'},
              {icon:'✅',label:'Approved',value:approved,cls:'green'},
              {icon:'🎓',label:'Active Students',value:students,cls:'purple'},
            ].map((s,i) => (
              <div key={i} className="stat-card">
                <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                <div className="stat-info">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {pending > 0 && (
            <div style={{background:'rgba(255,214,0,0.06)',border:'1px solid rgba(255,214,0,0.3)',borderRadius:'14px',padding:'18px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'16px'}}>
              <span style={{fontSize:'32px'}}>⚠️</span>
              <div style={{flex:1}}>
                <strong>Action Required:</strong> You have {pending} topic{pending>1?'s':''} awaiting your review.
              </div>
              <a href="/supervisor/review-topics" className="btn btn-accent">Review Now →</a>
            </div>
          )}

          <div className="card">
            <h3 style={{fontWeight:700,marginBottom:'20px'}}>📋 Recent Submissions</h3>
            {topics.length === 0 ? (
              <p style={{textAlign:'center',padding:'30px',color:'var(--text-muted)'}}>No topics assigned yet.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Title</th><th>Student</th><th>Domain</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {topics.slice(0,8).map(t => (
                      <tr key={t._id}>
                        <td style={{fontWeight:500,maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</td>
                        <td>
                          <div style={{fontSize:'14px'}}>{t.student?.name}</div>
                          <div style={{fontSize:'11px',color:'var(--text-muted)'}}>{t.student?.regNo}</div>
                        </td>
                        <td style={{color:'var(--text-muted)',fontSize:'13px'}}>{t.domain}</td>
                        <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                        <td style={{fontSize:'13px',color:'var(--text-muted)'}}>{new Date(t.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupervisorDashboard;
