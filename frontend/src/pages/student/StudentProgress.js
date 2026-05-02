import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { toast } from 'react-toastify';

export default function StudentProgress() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [report, setReport] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchTopics = () => {
    setLoading(true);
    axios.get('/api/topics').then(res => {
      const approved = (res.data.topics || []).filter(t => t.status === 'approved');
      setTopics(approved);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTopics(); }, []);

  const handleSubmitReport = async () => {
    if (!report.trim()) { toast.error('Please write a progress report'); return; }
    setSubmitting(true);
    try {
      await axios.put(`/api/topics/${selectedTopic._id}/progress`, { report, percentage });
      toast.success('Progress report submitted!');
      setShowModal(false);
      setReport('');
      setPercentage(0);
      fetchTopics();
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const latestProgress = (topic) => {
    if (!topic.progressReports?.length) return 0;
    return topic.progressReports[topic.progressReports.length - 1].percentage;
  };

  return (
    <DashboardLayout title="Research Progress">
      <div className="row g-4">
        <div className="col-12">
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div></div>
          ) : topics.length === 0 ? (
            <div className="content-card">
              <div className="empty-state">
                <i className="fas fa-tasks"></i>
                <h6>No approved topics yet</h6>
                <p style={{ fontSize: '0.875rem' }}>Once your topic is approved by a supervisor, you can submit progress reports here.</p>
              </div>
            </div>
          ) : (
            topics.map(topic => (
              <div key={topic._id} className="content-card mb-4">
                <div className="card-header-custom">
                  <div>
                    <h5 style={{ marginBottom: 4 }}>{topic.title}</h5>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      <i className="fas fa-tag" style={{ marginRight: 4 }}></i>{topic.domain}
                    </span>
                  </div>
                  <button className="btn-primary-custom" onClick={() => { setSelectedTopic(topic); setShowModal(true); }}>
                    <i className="fas fa-plus"></i> Add Report
                  </button>
                </div>
                <div className="card-body-custom">
                  {/* Overall Progress */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Overall Progress</span>
                      <span style={{ fontWeight: 700, color: '#1a1f5e', fontSize: '1.1rem' }}>{latestProgress(topic)}%</span>
                    </div>
                    <div className="progress-bar-custom" style={{ height: 12 }}>
                      <div className="progress-fill" style={{ width: `${latestProgress(topic)}%` }}></div>
                    </div>
                  </div>

                  {/* Reports List */}
                  {topic.progressReports?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      <i className="fas fa-clipboard" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }}></i>
                      No progress reports submitted yet.
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      {topic.progressReports.map((r, i) => (
                        <div key={i} style={{
                          display: 'flex', gap: '1rem', marginBottom: '1.5rem',
                          paddingBottom: '1.5rem',
                          borderBottom: i < topic.progressReports.length - 1 ? '1px solid #e5e7eb' : 'none'
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1a1f5e, #2d3494)',
                            color: 'white', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
                          }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Report #{i + 1}</span>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(r.date).toLocaleDateString()}</span>
                                <span style={{ fontWeight: 700, color: '#1a1f5e', fontSize: '0.875rem' }}>{r.percentage}%</span>
                              </div>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>{r.report}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Progress Report Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5><i className="fas fa-clipboard-check" style={{ marginRight: 8 }}></i>Submit Progress Report</h5>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f0f3ff', borderRadius: 10, fontSize: '0.8rem', color: '#1a1f5e' }}>
                <strong>Topic:</strong> {selectedTopic?.title}
              </div>

              <div className="form-group">
                <label className="form-label">Completion Percentage: <strong style={{ color: '#1a1f5e' }}>{percentage}%</strong></label>
                <input type="range" min={0} max={100} value={percentage}
                  onChange={e => setPercentage(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#1a1f5e' }} />
                <div className="progress-bar-custom" style={{ marginTop: 8 }}>
                  <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Progress Report</label>
                <textarea className="form-control" rows={5}
                  placeholder="Describe your progress in detail: what you've completed, challenges faced, and next steps..."
                  value={report} onChange={e => setReport(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-custom" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary-custom" onClick={handleSubmitReport} disabled={submitting}>
                {submitting ? 'Submitting...' : <><i className="fas fa-check"></i> Submit Report</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
