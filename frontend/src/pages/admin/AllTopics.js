import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const AllTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadTopics = () => {
    API.get('/topics/all').then(r => { setTopics(r.data.topics); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { loadTopics(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put('/topics/'+id+'/status', { status, feedback });
      toast.success('Topic updated!');
      setSelected(null); setFeedback('');
      loadTopics();
    } catch { toast.error('Update failed'); }
  };

  const filtered = topics.filter(t => {
    const matchStatus = filter === 'all' || t.status === filter;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.student?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-title">
            <h1>📊 All Research Topics</h1>
            <p>Monitor and manage all submitted topics</p>
          </div>
          <div style={{background:'rgba(0,188,212,0.1)',padding:'8px 16px',borderRadius:'10px',fontSize:'14px',color:'var(--accent)'}}>
            {topics.length} Total Topics
          </div>
        </div>
        <div className="page-body">
          <div className="card">
            <div style={{display:'flex',gap:'12px',marginBottom:'20px',flexWrap:'wrap',alignItems:'center'}}>
              <input className="field-input" style={{flex:'1',minWidth:'200px',marginBottom:0}} placeholder="🔍 Search by title or student..." value={search} onChange={e=>setSearch(e.target.value)} />
              {['all','pending','approved','rejected','revision'].map(s => (
                <button key={s} className={`btn ${filter===s?'btn-accent':'btn-outline'} btn-sm`} onClick={()=>setFilter(s)}>
                  {s.charAt(0).toUpperCase()+s.slice(1)} ({s==='all'?topics.length:topics.filter(t=>t.status===s).length})
                </button>
              ))}
            </div>

            {loading ? <div className="spinner" /> : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Title</th><th>Student</th><th>Supervisor</th><th>Domain</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                  <tbody>
                    {filtered.map(t => (
                      <React.Fragment key={t._id}>
                        <tr>
                          <td style={{fontWeight:500,maxWidth:'180px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</td>
                          <td>
                            <div style={{fontSize:'14px'}}>{t.student?.name}</div>
                            <div style={{fontSize:'11px',color:'var(--text-muted)'}}>{t.student?.regNo}</div>
                          </td>
                          <td style={{fontSize:'13px',color:'var(--text-muted)'}}>{t.supervisor?.name || '—'}</td>
                          <td style={{fontSize:'13px',color:'var(--text-muted)'}}>{t.domain}</td>
                          <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                          <td style={{fontSize:'13px',color:'var(--text-muted)'}}>{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-outline btn-sm" onClick={()=>setSelected(selected?._id===t._id?null:t)}>
                              {selected?._id===t._id ? 'Close' : 'Manage'}
                            </button>
                          </td>
                        </tr>
                        {selected?._id === t._id && (
                          <tr>
                            <td colSpan={7}>
                              <div style={{padding:'16px',background:'rgba(255,255,255,0.03)',borderRadius:'12px',margin:'8px 0'}}>
                                <p style={{fontSize:'14px',color:'var(--text-muted)',marginBottom:'12px'}}>{t.description}</p>
                                <label className="field-label">Admin Notes</label>
                                <textarea className="field-input" rows={2} placeholder="Add admin notes..." value={feedback} onChange={e=>setFeedback(e.target.value)} style={{marginBottom:'12px'}} />
                                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                                  <button className="btn btn-success btn-sm" onClick={()=>updateStatus(t._id,'approved')}>✅ Approve</button>
                                  <button className="btn btn-warning btn-sm" onClick={()=>updateStatus(t._id,'revision')}>🔄 Revision</button>
                                  <button className="btn btn-danger btn-sm" onClick={()=>updateStatus(t._id,'rejected')}>❌ Reject</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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

export default AllTopics;
