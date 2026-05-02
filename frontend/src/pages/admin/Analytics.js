import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function Analytics() {
  const [topics, setTopics] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([axios.get('/api/topics'), axios.get('/api/users')])
      .then(([t, u]) => { setTopics(t.data.topics || []); setUsers(u.data.users || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Domain breakdown
  const domainMap = {};
  topics.forEach(t => { domainMap[t.domain] = (domainMap[t.domain] || 0) + 1; });

  // Status breakdown
  const statusMap = { pending: 0, approved: 0, rejected: 0, under_review: 0, completed: 0 };
  topics.forEach(t => { if (statusMap[t.status] !== undefined) statusMap[t.status]++; });

  // Monthly submissions (last 6 months)
  const monthlyData = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    monthlyData[key] = 0;
  }
  topics.forEach(t => {
    const d = new Date(t.submittedAt);
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (monthlyData[key] !== undefined) monthlyData[key]++;
  });

  const chartColors = {
    primary: '#1a1f5e', accent: '#e8c84a', secondary: '#4f9cf9',
    green: '#22c55e', red: '#ef4444', purple: '#8b5cf6', orange: '#f59e0b'
  };

  const domainChart = {
    labels: Object.keys(domainMap),
    datasets: [{
      label: 'Topics',
      data: Object.values(domainMap),
      backgroundColor: [chartColors.primary, chartColors.accent, chartColors.secondary, chartColors.green, chartColors.red, chartColors.purple, chartColors.orange],
      borderWidth: 0, borderRadius: 8
    }]
  };

  const statusChart = {
    labels: ['Pending', 'Approved', 'Rejected', 'Under Review', 'Completed'],
    datasets: [{
      data: Object.values(statusMap),
      backgroundColor: [chartColors.orange, chartColors.green, chartColors.red, chartColors.secondary, chartColors.purple],
      borderWidth: 3, borderColor: 'white'
    }]
  };

  const monthlyChart = {
    labels: Object.keys(monthlyData),
    datasets: [{
      label: 'Topic Submissions',
      data: Object.values(monthlyData),
      borderColor: chartColors.primary,
      backgroundColor: 'rgba(26,31,94,0.08)',
      borderWidth: 2, fill: true,
      tension: 0.4, pointBackgroundColor: chartColors.primary, pointRadius: 5
    }]
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  const kpis = [
    { label: 'Total Topics', value: topics.length, icon: 'fas fa-folder', color: '#4f9cf9', bg: '#dbeafe' },
    { label: 'Approval Rate', value: topics.length ? `${Math.round((statusMap.approved / topics.length) * 100)}%` : '0%', icon: 'fas fa-check-circle', color: '#22c55e', bg: '#dcfce7' },
    { label: 'Duplicate Rate', value: topics.length ? `${Math.round((topics.filter(t => t.isDuplicate).length / topics.length) * 100)}%` : '0%', icon: 'fas fa-copy', color: '#ef4444', bg: '#fee2e2' },
    { label: 'Avg Similarity', value: topics.length ? `${Math.round(topics.reduce((s, t) => s + t.similarityScore, 0) / topics.length)}%` : '0%', icon: 'fas fa-percentage', color: '#f59e0b', bg: '#fef9c3' },
    { label: 'Total Students', value: users.filter(u => u.role === 'student').length, icon: 'fas fa-user-graduate', color: '#1a1f5e', bg: '#f0f3ff' },
    { label: 'Total Supervisors', value: users.filter(u => u.role === 'supervisor').length, icon: 'fas fa-chalkboard-teacher', color: '#8b5cf6', bg: '#ede9fe' },
  ];

  if (loading) return <DashboardLayout title="Analytics"><div className="loading-spinner"><div className="spinner"></div></div></DashboardLayout>;

  return (
    <DashboardLayout title="Analytics & Reports">
      {/* KPI Row */}
      <div className="row g-3 mb-4">
        {kpis.map((k, i) => (
          <div key={i} className="col-6 col-lg-2">
            <div className="stat-card">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <i className={k.icon} style={{ color: k.color, fontSize: '1.1rem' }}></i>
              </div>
              <div className="stat-value" style={{ fontSize: '1.5rem' }}>{k.value}</div>
              <div className="stat-label">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* Monthly Trend */}
        <div className="col-lg-8">
          <div className="content-card h-100">
            <div className="card-header-custom">
              <h5><i className="fas fa-chart-line" style={{ marginRight: 8 }}></i>Monthly Topic Submissions</h5>
            </div>
            <div className="chart-wrapper">
              <Line data={monthlyChart} options={{ ...chartOptions, plugins: { legend: { display: true } } }} />
            </div>
          </div>
        </div>

        {/* Status Doughnut */}
        <div className="col-lg-4">
          <div className="content-card h-100">
            <div className="card-header-custom">
              <h5><i className="fas fa-chart-pie" style={{ marginRight: 8 }}></i>Status Distribution</h5>
            </div>
            <div className="chart-wrapper" style={{ height: 240 }}>
              <Doughnut data={statusChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }} />
            </div>
          </div>
        </div>
      </div>

      {/* Domain Bar Chart */}
      <div className="content-card mb-4">
        <div className="card-header-custom">
          <h5><i className="fas fa-chart-bar" style={{ marginRight: 8 }}></i>Topics by Research Domain</h5>
        </div>
        <div className="chart-wrapper">
          <Bar data={domainChart} options={{ ...chartOptions, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
        </div>
      </div>

      {/* Summary Table */}
      <div className="content-card">
        <div className="card-header-custom">
          <h5><i className="fas fa-table" style={{ marginRight: 8 }}></i>Domain-wise Summary</h5>
        </div>
        <div className="card-body-custom" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr><th>Domain</th><th>Total</th><th>Approved</th><th>Pending</th><th>Rejected</th><th>Approval Rate</th></tr>
            </thead>
            <tbody>
              {Object.entries(domainMap).map(([domain, count]) => {
                const domainTopics = topics.filter(t => t.domain === domain);
                const app = domainTopics.filter(t => t.status === 'approved').length;
                const pen = domainTopics.filter(t => t.status === 'pending').length;
                const rej = domainTopics.filter(t => t.status === 'rejected').length;
                const rate = count ? Math.round((app / count) * 100) : 0;
                return (
                  <tr key={domain}>
                    <td style={{ fontWeight: 600 }}>{domain}</td>
                    <td><strong>{count}</strong></td>
                    <td><span style={{ color: '#16a34a', fontWeight: 600 }}>{app}</span></td>
                    <td><span style={{ color: '#d97706', fontWeight: 600 }}>{pen}</span></td>
                    <td><span style={{ color: '#dc2626', fontWeight: 600 }}>{rej}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar-custom" style={{ width: 80 }}>
                          <div className="progress-fill" style={{ width: `${rate}%` }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
