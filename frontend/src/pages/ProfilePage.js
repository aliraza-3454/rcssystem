import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    regNo: user?.regNo || '',
    expertise: user?.expertise?.join(', ') || '',
  });

  const handleSave = () => {
    toast.success('Profile updated! (Connect to PUT /api/auth/profile for real update)');
    setEditing(false);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const roleColors = { student: '#4f9cf9', supervisor: '#22c55e', admin: '#e8c84a' };
  const roleBg = { student: '#dbeafe', supervisor: '#dcfce7', admin: '#fef9c3' };

  return (
    <DashboardLayout title="My Profile">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="content-card mb-4">
          <div style={{
            background: 'linear-gradient(135deg, #0f1238, #1a1f5e)',
            padding: '2.5rem 2rem',
            borderRadius: '16px 16px 0 0',
            display: 'flex', alignItems: 'center', gap: '1.5rem'
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: `linear-gradient(135deg, ${roleColors[user?.role]}, #1a1f5e)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 700, color: 'white',
              border: '3px solid rgba(255,255,255,0.2)', flexShrink: 0
            }}>
              {initials}
            </div>
            <div>
              <h3 style={{ color: 'white', marginBottom: 8 }}>{user?.name}</h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{
                  background: roleBg[user?.role], color: roleColors[user?.role],
                  padding: '0.3rem 0.85rem', borderRadius: 100,
                  fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize'
                }}>
                  <i className="fas fa-shield-alt" style={{ marginRight: 4 }}></i>{user?.role}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="fas fa-envelope"></i>{user?.email}
                </span>
              </div>
            </div>
            <button
              className="btn-outline-custom"
              style={{ marginLeft: 'auto', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
              onClick={() => setEditing(!editing)}
            >
              <i className={`fas fa-${editing ? 'times' : 'edit'}`}></i>
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="card-body-custom">
            {editing ? (
              <div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={formData.email} disabled style={{ opacity: 0.6 }} />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select className="form-select" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                        <option>Computer Science</option>
                        <option>Software Engineering</option>
                        <option>Information Technology</option>
                        <option>Data Science</option>
                      </select>
                    </div>
                  </div>
                  {user?.role === 'student' && (
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Registration Number</label>
                        <input type="text" className="form-control" value={formData.regNo} onChange={e => setFormData({ ...formData, regNo: e.target.value })} />
                      </div>
                    </div>
                  )}
                  {user?.role === 'supervisor' && (
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Research Expertise</label>
                        <input type="text" className="form-control" value={formData.expertise} onChange={e => setFormData({ ...formData, expertise: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button className="btn-primary-custom" onClick={handleSave}><i className="fas fa-save"></i> Save Changes</button>
                  <button className="btn-outline-custom" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="info-row"><span className="info-label">Full Name</span><span className="info-value">{user?.name}</span></div>
                <div className="info-row"><span className="info-label">Email Address</span><span className="info-value">{user?.email}</span></div>
                <div className="info-row"><span className="info-label">Role</span>
                  <span className="info-value" style={{ textTransform: 'capitalize', color: roleColors[user?.role], fontWeight: 700 }}>{user?.role}</span>
                </div>
                <div className="info-row"><span className="info-label">Department</span><span className="info-value">{user?.department}</span></div>
                {user?.regNo && <div className="info-row"><span className="info-label">Registration No.</span><span className="info-value">{user.regNo}</span></div>}
                {user?.expertise?.length > 0 && (
                  <div className="info-row">
                    <span className="info-label">Research Expertise</span>
                    <div className="tags-container">{user.expertise.map(e => <span key={e} className="tag">{e}</span>)}</div>
                  </div>
                )}
                <div className="info-row"><span className="info-label">Account Status</span>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}><i className="fas fa-circle" style={{ fontSize: '0.5rem', marginRight: 6 }}></i>Active</span>
                </div>
                <div className="info-row"><span className="info-label">Member Since</span>
                  <span className="info-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Security */}
        <div className="content-card">
          <div className="card-header-custom">
            <h5><i className="fas fa-shield-alt" style={{ marginRight: 8 }}></i>Account Security</h5>
          </div>
          <div className="card-body-custom">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f0f3ff', borderRadius: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1f5e', marginBottom: 4 }}>Password</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Change your account password</div>
              </div>
              <button className="btn-outline-custom" onClick={() => toast.info('Password change: Connect to PUT /api/auth/change-password')}>
                <i className="fas fa-key"></i> Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
