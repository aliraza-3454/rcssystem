import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const ReviewTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState('all');

  const loadTopics = () => {
    API.get('/topics/supervisor').then(r => { setTopics(r.data.topics); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { loadTopics(); }, []);

  const handleStatus = async (topicId, status) => {
    try {
      await API.put('/topics/'+topicId+'/status', { status, feedback });
      toast.success('Topic ' + status + ' successfully!');
      setSelected(null);
      setFeedback('');
      loadTopics();
    } catch { toast.error('Action failed'); }
  };

  const filtered = filter === 'all' ? topics : topics.filter(t => t.status === filter);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-title">
            <h1>🔍 Review Student Topics</h1>
            <p>Approve, reject, or request revisions for submitted topics</p>
          </div>
        </div>
        <div className="page-body">
          <div style={{display:'flex',gap:'8px',marginBottom:'20px',flexWrap:'wrap'}}>
            {['all','pending','approved','rejected','revision'].map(s => (
              <button key={s} className={`btn ${filter===s?'btn-accent':'btn-outline'} btn-sm`} onClick={()=>setFilter(s)}>
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>

          {loading ? <div className="spinner" /> : filtered.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px',color:'var(--text-muted)'}}>
              <div style={{fontSize:'64px',marginBottom:'16px'}}>✅</div>
              <p>No topics for this filter</p>
            </div>
          ) : filtered.map(t => (
            <div key={t._id} className="topic-card">
              <div className="flex-between" style={{marginBottom:'10px'}}>
                <h3 style={{fontSize:'16px'}}>{t.title}</h3>
                <span className={`badge badge-${t.status}`}>{t.status.toUpperCase()}</span>
              </div>
              <div style={{display:'flex',gap:'16px',marginBottom:'12px',flexWrap:'wrap'}}>
                <span className="text-muted text-sm">🎓 {t.student?.name} ({t.student?.regNo})</span>
                <span className="text-muted text-sm">📂 {t.domain}</span>
                <span className="text-muted text-sm">📅 {new Date(t.createdAt).toLocaleDateString()}</span>
                {t.similarityScore > 0 && <span style={{fontSize:'12px',color:t.similarityScore>50?'#ff1744':'#00c853'}}>🔍 {t.similarityScore}% similarity</span>}
              </div>
              <p style={{fontSize:'14px',color:'var(--text-muted)',marginBottom:'12px'}}>{t.description}</p>
              {t.keywords && t.keywords.length > 0 && (
                <div className="topic-keywords mb-16">
                  {t.keywords.map((k,i) => <span key={i} className="keyword-tag">{k}</span>)}
                </div>
              )}

              {t.status === 'pending' && (
                selected?._id === t._id ? (
                  <div style={{marginTop:'12px',padding:'16px',background:'rgba(255,255,255,0.04)',borderRadius:'12px',border:'1px solid var(--border)'}}>
                    <label className="field-label">Feedback / Comments</label>
                    <textarea className="field-input" rows={3} placeholder="Provide feedback to the student..." value={feedback} onChange={e=>setFeedback(e.target.value)} style={{marginBottom:'12px'}} />
                    <div style={{display:'flex',gap:'8px'}}>
                      <button className="btn btn-success" onClick={()=>handleStatus(t._id,'approved')}>✅ Approve</button>
                      <button className="btn btn-warning" onClick={()=>handleStatus(t._id,'revision')}>🔄 Request Revision</button>
                      <button className="btn btn-danger" onClick={()=>handleStatus(t._id,'rejected')}>❌ Reject</button>
                      <button className="btn btn-outline btn-sm" onClick={()=>{setSelected(null);setFeedback('');}}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-accent" onClick={()=>setSelected(t)}>Review This Topic →</button>
                )
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ReviewTopics;
