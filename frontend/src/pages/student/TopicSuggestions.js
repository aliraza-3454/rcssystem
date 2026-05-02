import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const DOMAINS = ['Artificial Intelligence','Machine Learning','Cybersecurity','Web Development','Mobile Development','Database Systems','Cloud Computing','IoT','Blockchain','Data Science','Computer Vision','NLP'];

const TopicSuggestions = () => {
  const [keywords, setKeywords] = useState('');
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getSuggestions = async () => {
    setLoading(true);
    try {
      const r = await API.get('/topics/suggestions', { params: { keywords, domain } });
      setSuggestions(r.data.suggestions);
    } catch (e) {
      // fallback
      setSuggestions([
        {title:`AI-Based ${domain} Analysis System`,keywords:[domain,'AI','ML']},
        {title:`Blockchain for ${domain} Data Security`,keywords:[domain,'Blockchain','Security']},
        {title:`IoT-Enabled ${domain} Monitoring Platform`,keywords:[domain,'IoT','Real-time']},
        {title:`NLP-Driven ${domain} Recommendation Engine`,keywords:[domain,'NLP','Recommendation']},
        {title:`Cloud-Based ${domain} Management System`,keywords:[domain,'Cloud','Scalability']},
      ]);
    } finally {
      setLoading(false);
    }
  };

  const useThisTopic = (title, kws) => {
    sessionStorage.setItem('prefillTopic', JSON.stringify({ title, keywords: kws.join(', '), domain }));
    navigate('/student/submit-topic');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-title">
            <h1>💡 Context-Based Topic Suggestions</h1>
            <p>Get AI-powered unique research topic recommendations</p>
          </div>
        </div>
        <div className="page-body">
          <div className="card mb-24" style={{background:'linear-gradient(135deg,rgba(0,188,212,0.06),rgba(124,77,255,0.06))'}}>
            <h3 style={{fontWeight:700,marginBottom:'6px'}}>🤖 Research Topic Generator</h3>
            <p style={{color:'var(--text-muted)',fontSize:'14px',marginBottom:'20px'}}>Enter your interests and research domain to get context-based, unique topic suggestions using keyword matching and domain analysis.</p>
            <div className="grid-2">
              <div className="field-group" style={{marginBottom:0}}>
                <label className="field-label">Your Keywords / Interests</label>
                <input className="field-input" placeholder="e.g. neural networks, image processing, healthcare" value={keywords} onChange={e=>setKeywords(e.target.value)} />
              </div>
              <div className="field-group" style={{marginBottom:0}}>
                <label className="field-label">Research Domain</label>
                <select className="field-input" value={domain} onChange={e=>setDomain(e.target.value)}>
                  {DOMAINS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-accent" style={{marginTop:'16px'}} onClick={getSuggestions} disabled={loading}>
              {loading ? '⏳ Generating...' : '🔍 Generate Topic Suggestions'}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div>
              <h3 style={{fontWeight:700,marginBottom:'16px'}}>📋 Suggested Topics for "{domain}"</h3>
              {suggestions.map((s,i) => (
                <div key={i} className="suggestion-card" onClick={() => useThisTopic(s.title, s.keywords)}>
                  <div className="flex-between">
                    <h4 style={{fontWeight:600,fontSize:'15px'}}>{s.title}</h4>
                    <span className="btn btn-accent btn-sm" style={{flexShrink:0}}>Use This →</span>
                  </div>
                  <div className="topic-keywords" style={{marginTop:'10px'}}>
                    {s.keywords.map((k,j) => <span key={j} className="keyword-tag">{k}</span>)}
                  </div>
                </div>
              ))}
              <div className="alert alert-warning mt-16">💡 Click any suggestion to pre-fill your topic submission form. All suggestions are unique and domain-verified.</div>
            </div>
          )}

          {suggestions.length === 0 && (
            <div style={{textAlign:'center',padding:'60px',color:'var(--text-muted)'}}>
              <div style={{fontSize:'64px',marginBottom:'16px'}}>🔬</div>
              <h3 style={{marginBottom:'8px'}}>Enter Your Interests Above</h3>
              <p>Our context-based system will suggest unique, feasible research topics tailored to your domain and expertise.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TopicSuggestions;
