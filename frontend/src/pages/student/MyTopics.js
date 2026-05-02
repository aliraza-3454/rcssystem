import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../utils/api';

const MyTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    API.get('/topics/my').then(r => { setTopics(r.data.topics); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? topics : topics.filter(t => t.status === filter);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-title">
            <h1>📋 My Research Topics</h1>
            <p>Track status of all your submitted topics</p>
          </div>
          <a href="/student/submit-topic" className="btn btn-accent">+ Submit New Topic</a>
        </div>
        <div className="page-body">
          <div style={{display:'flex',gap:'8px',marginBottom:'20px',flexWrap:'wrap'}}>
            {['all','pending','approved','rejected','revision'].map(s => (
              <button key={s} className={`btn ${filter===s?'btn-accent':'btn-outline'} btn-sm`} onClick={()=>setFilter(s)}>
                {s.charAt(0).toUpperCase()+s.slice(1)} {s!=='all' && `(${topics.filter(t=>t.status===s).length})`}
              </button>
            ))}
          </div>

          {loading ? <div className="spinner" /> : filtered.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px',color:'var(--text-muted)'}}>
              <div style={{fontSize:'64px',marginBottom:'16px'}}>📭</div>
              <p>No topics found for this filter</p>
            </div>
          ) : filtered.map(t => (
            <div key={t._id} className="topic-card">
              <div className="flex-between" style={{marginBottom:'10px'}}>
                <h3>{t.title}</h3>
                <span className={`badge badge-${t.status}`}>{t.status.toUpperCase()}</span>
              </div>
              <div style={{display:'flex',gap:'16px',marginBottom:'10px',flexWrap:'wrap'}}>
                <span className="text-muted text-sm">📂 {t.domain}</span>
                {t.supervisor && <span className="text-muted text-sm">👨‍🏫 {t.supervisor.name}</span>}
                <span className="text-muted text-sm">📅 {new Date(t.createdAt).toLocaleDateString()}</span>
                {t.similarityScore > 0 && <span style={{fontSize:'12px',color:t.similarityScore>50?'#ff1744':'#00c853'}}>🔍 Similarity: {t.similarityScore}%</span>}
              </div>
              <p style={{fontSize:'13px',color:'var(--text-muted)',marginBottom:'10px'}}>{t.description?.substring(0,200)}...</p>
              {t.topic_keywords && t.topic_keywords.length > 0 && (
                <div className="topic-keywords">
                  {t.topic_keywords.map((k,i) => <span key={i} className="keyword-tag">{k}</span>)}
                </div>
              )}
              {t.supervisorFeedback && (
                <div style={{marginTop:'12px',padding:'10px 14px',background:'rgba(124,77,255,0.08)',border:'1px solid rgba(124,77,255,0.2)',borderRadius:'10px',fontSize:'13px'}}>
                  <strong style={{color:'#7c4dff'}}>Supervisor Feedback:</strong> {t.supervisorFeedback}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyTopics;
