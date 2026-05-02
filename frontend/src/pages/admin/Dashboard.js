import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentTopics, setRecentTopics] = useState([]);

  useEffect(() => {
    API.get('/topics/stats').then(r => setStats(r.data.stats)).catch(() => {});
    API.get('/topics/all').then(r => setRecentTopics(r.data.topics?.slice(0,5)||[])).catch(() => {});
  }, []);

  const approval = stats.totalTopics ? Math.round((stats.approved/stats.totalTopics)*100) : 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-title">
            <h1>⚙️ Admin Dashboard</h1>
            <p>Research Coordination System — Administrative Overview</p>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:'13px',color:'var(--accent)'}}>Logged in as</div>
            <div style={{fontWeight:600}}>{user?.name}</div>
          </div>
        </div>
        <div className="page-body">
          <div className="stats-grid">
            {[
              {icon:'📋',label:'Total Topics',value:stats.totalTopics||0,cls:'blue'},
              {icon:'⏳',label:'Pending',value:stats.pending||0,cls:'orange'},
              {icon:'✅',label:'Approved',value:stats.approved||0,cls:'green'},
              {icon:'❌',label:'Rejected',value:stats.rejected||0,cls:'red'},
              {icon:'🎓',label:'Students',value:stats.totalStudents||0,cls:'purple'},
              {icon:'👨‍🏫',label:'Supervisors',value:stats.totalSupervisors||0,cls:'blue'},
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
              <h3 style={{fontWeight:700,marginBottom:'20px'}}>📊 Research Overview</h3>
              {[
                {label:'Approved Topics', value:stats.approved||0, total:stats.totalTopics||1, color:'var(--success)'},
                {label:'Pending Review', value:stats.pending||0, total:stats.totalTopics||1, color:'var(--warning)'},
                {label:'Rejected Topics', value:stats.rejected||0, total:stats.totalTopics||1, color:'var(--danger)'},
              ].map((item,i) => (
                <div key={i} style={{marginBottom:'18px'}}>
                  <div className="flex-between mb-8">
                    <span style={{fontSize:'14px'}}>{item.label}</span>
                    <span style={{fontWeight:600,color:item.color}}>{item.value}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width:Math.round((item.value/item.total)*100)+'%',background:item.color}} />
                  </div>
                </div>
              ))}
              <div style={{marginTop:'20px',padding:'14px',background:'rgba(0,188,212,0.08)',borderRadius:'12px',textAlign:'center'}}>
                <div style={{fontSize:'32px',fontWeight:800,color:'var(--accent)'}}>{approval}%</div>
                <div style={{fontSize:'13px',color:'var(--text-muted)'}}>Overall Approval Rate</div>
              </div>
            </div>

            <div className="card">
              <div className="flex-between mb-16">
                <h3 style={{fontWeight:700}}>🕒 Recent Submissions</h3>
                <a href="/admin/topics" style={{fontSize:'13px',color:'var(--accent)',textDecoration:'none'}}>View All →</a>
              </div>
              {recentTopics.map(t => (
                <div key={t._id} style={{padding:'12px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:'12px'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'14px',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</div>
                    <div style={{fontSize:'12px',color:'var(--text-muted)'}}>{t.student?.name} • {t.domain}</div>
                  </div>
                  <span className={`badge badge-${t.status}`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
