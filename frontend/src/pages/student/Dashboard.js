import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    API.get('/topics/my').then(r => setTopics(r.data.topics)).catch(() => {});
    API.get('/users/notifications').then(r => setNotifications(r.data.notifications)).catch(() => {});
  }, []);

  const approved = topics.filter(t => t.status === 'approved').length;
  const pending = topics.filter(t => t.status === 'pending').length;
  const rejected = topics.filter(t => t.status === 'rejected').length;
  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-title">
            <h1>🎓 Student Dashboard</h1>
            <p>Welcome back, {user?.name} — {user?.regNo && `Reg# ${user.regNo}`}</p>
          </div>
          <div style={{background:'rgba(0,188,212,0.1)',border:'1px solid rgba(0,188,212,0.3)',borderRadius:'10px',padding:'8px 16px',fontSize:'13px',color:'var(--accent)'}}>
            {new Date().toLocaleDateString('en-PK', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          </div>
        </div>

        <div className="page-body">
          <div className="stats-grid">
            {[
              {icon:'📋',label:'Total Submissions',value:topics.length,cls:'blue'},
              {icon:'⏳',label:'Pending Review',value:pending,cls:'orange'},
              {icon:'✅',label:'Approved Topics',value:approved,cls:'green'},
              {icon:'🔔',label:'Notifications',value:unread,cls:'purple'},
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

          <div className="grid-2">
            <div className="card">
              <div className="flex-between mb-16">
                <h3 style={{fontWeight:700}}>📋 Recent Topics</h3>
                <a href="/student/my-topics" style={{fontSize:'13px',color:'var(--accent)',textDecoration:'none'}}>View All →</a>
              </div>
              {topics.length === 0 ? (
                <div style={{textAlign:'center',padding:'30px',color:'var(--text-muted)'}}>
                  <div style={{fontSize:'48px',marginBottom:'12px'}}>📝</div>
                  <p>No topics submitted yet</p>
                  <a href="/student/submit-topic" className="btn btn-accent" style={{display:'inline-flex',marginTop:'12px'}}>Submit Your First Topic</a>
                </div>
              ) : topics.slice(0,4).map(t => (
                <div key={t._id} className="topic-card" style={{marginBottom:'10px',padding:'16px'}}>
                  <div className="flex-between">
                    <span style={{fontWeight:600,fontSize:'14px'}}>{t.title}</span>
                    <span className={`badge badge-${t.status}`}>{t.status}</span>
                  </div>
                  <p style={{fontSize:'12px',color:'var(--text-muted)',marginTop:'6px'}}>{t.domain}</p>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="flex-between mb-16">
                <h3 style={{fontWeight:700}}>🔔 Notifications</h3>
              </div>
              {notifications.length === 0 ? (
                <div style={{textAlign:'center',padding:'30px',color:'var(--text-muted)'}}>
                  <div style={{fontSize:'48px',marginBottom:'12px'}}>🔕</div>
                  <p>No notifications yet</p>
                </div>
              ) : notifications.slice(0,5).map(n => (
                <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                  {!n.isRead && <div className="notif-dot" />}
                  <div>
                    <p style={{fontSize:'13px'}}>{n.message}</p>
                    <p style={{fontSize:'11px',color:'var(--text-muted)',marginTop:'4px'}}>{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card mt-24" style={{background:'linear-gradient(135deg,rgba(0,188,212,0.08),rgba(124,77,255,0.08))',border:'1px solid rgba(0,188,212,0.2)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
              <div style={{fontSize:'48px'}}>💡</div>
              <div style={{flex:1}}>
                <h3 style={{fontWeight:700,marginBottom:'6px'}}>Need Help Choosing a Topic?</h3>
                <p style={{color:'var(--text-muted)',fontSize:'14px'}}>Our AI-powered context-based topic suggestion engine can help you find unique and relevant research ideas tailored to your interests.</p>
              </div>
              <a href="/student/suggestions" className="btn btn-accent">Get Suggestions →</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
