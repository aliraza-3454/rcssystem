import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DOMAINS = [
  'Artificial Intelligence', 'Machine Learning', 'Cybersecurity',
  'Web Development', 'Mobile Development', 'Database Systems',
  'Cloud Computing', 'IoT', 'Blockchain', 'Data Science',
  'Computer Vision', 'Natural Language Processing'
];

const SubmitTopic = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    keywords: '',
    domain: DOMAINS[0],
    supervisorId: ''
  });
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // Pre-fill from suggestions page if available
  useEffect(() => {
    const prefill = sessionStorage.getItem('prefillTopic');
    if (prefill) {
      try {
        const data = JSON.parse(prefill);
        setForm(prev => ({
          ...prev,
          title:    data.title    || prev.title,
          keywords: data.keywords || prev.keywords,
          domain:   data.domain   || prev.domain,
        }));
        sessionStorage.removeItem('prefillTopic');
        toast.info('Topic pre-filled from suggestions!');
      } catch {}
    }
    // Load supervisors
    API.get('/users/supervisors')
      .then(r => setSupervisors(r.data.supervisors || []))
      .catch(() => setSupervisors([]));
  }, []);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (form.title.trim().length < 10)
      return setError('Title must be at least 10 characters.');
    if (form.description.trim().length < 50)
      return setError('Description must be at least 50 characters.');

    setLoading(true);
    try {
      const payload = {
        title:        form.title.trim(),
        description:  form.description.trim(),
        keywords:     form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        domain:       form.domain,
        supervisorId: form.supervisorId || null,
      };
      await API.post('/topics', payload);
      toast.success('Topic submitted successfully!');
      setSuccess('Your research topic has been submitted for review!');
      setForm({ title: '', description: '', keywords: '', domain: DOMAINS[0], supervisorId: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-title">
            <h1>📝 Submit Research Topic</h1>
            <p>Fill in the details for your research proposal</p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/student/suggestions')}>
            💡 Get Suggestions
          </button>
        </div>

        <div className="page-body">
          <div style={{ maxWidth: '720px' }}>
            {error   && <div className="alert alert-error">⚠️ {error}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}

            <div className="card">
              <form onSubmit={handleSubmit}>
                <div className="field-group">
                  <label className="field-label">Research Topic Title *</label>
                  <input
                    className="field-input"
                    name="title"
                    placeholder="Enter a clear, concise title (min. 10 chars)"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Research Domain *</label>
                  <select className="field-input" name="domain" value={form.domain} onChange={handleChange}>
                    {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="field-group">
                  <label className="field-label">Keywords (comma-separated)</label>
                  <input
                    className="field-input"
                    name="keywords"
                    placeholder="e.g. deep learning, image classification, CNN"
                    value={form.keywords}
                    onChange={handleChange}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Description / Abstract * (min. 50 chars)</label>
                  <textarea
                    className="field-input"
                    name="description"
                    placeholder="Provide a detailed description of your research topic..."
                    value={form.description}
                    onChange={handleChange}
                    rows={6}
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Assign Supervisor (Optional)</label>
                  <select className="field-input" name="supervisorId" value={form.supervisorId} onChange={handleChange}>
                    <option value="">-- Select a Supervisor --</option>
                    {supervisors.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {Array.isArray(s.expertise) ? s.expertise.join(', ') : s.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ background:'rgba(255,214,0,0.06)', border:'1px solid rgba(255,214,0,0.2)', borderRadius:'12px', padding:'14px', marginBottom:'20px' }}>
                  <p style={{ fontSize:'13px', color:'#ffd600' }}>
                    ⚠️ Originality Check: Topics with more than 70% similarity to existing submissions will be automatically rejected.
                  </p>
                </div>

                <button className="btn btn-accent" type="submit" disabled={loading} style={{ width:'100%', padding:'14px' }}>
                  {loading ? '⏳ Checking originality & submitting...' : '📤 Submit Research Topic'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubmitTopic;
