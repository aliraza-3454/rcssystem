import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadUsers = () => {
    API.get('/users/all').then(r => { setUsers(r.data.users); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const toggleUser = async (id) => {
    try {
      await API.put('/users/'+id+'/toggle');
      toast.success('User status updated');
      loadUsers();
    } catch { toast.error('Failed to update'); }
  };

  const filtered = users.filter(u => {
    const matchRole = filter === 'all' || u.role === filter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-title">
            <h1>👥 Manage Users</h1>
            <p>View and manage all registered users</p>
          </div>
          <div style={{background:'rgba(0,188,212,0.1)',padding:'8px 16px',borderRadius:'10px',fontSize:'14px',color:'var(--accent)'}}>
            Total: {users.length} Users
          </div>
        </div>
        <div className="page-body">
          <div className="card">
            <div style={{display:'flex',gap:'12px',marginBottom:'20px',flexWrap:'wrap',alignItems:'center'}}>
              <input className="field-input" style={{flex:'1',minWidth:'200px',marginBottom:0}} placeholder="🔍 Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} />
              {['all','student','supervisor','admin'].map(r => (
                <button key={r} className={`btn ${filter===r?'btn-accent':'btn-outline'} btn-sm`} onClick={()=>setFilter(r)}>
                  {r.charAt(0).toUpperCase()+r.slice(1)}
                </button>
              ))}
            </div>

            {loading ? <div className="spinner" /> : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Reg/Dept</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                            <div style={{width:'36px',height:'36px',background:'linear-gradient(135deg,var(--accent),var(--accent2))',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,flexShrink:0}}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{fontWeight:500}}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{color:'var(--text-muted)',fontSize:'13px'}}>{u.email}</td>
                        <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                        <td style={{fontSize:'13px',color:'var(--text-muted)'}}>{u.regNo || u.department}</td>
                        <td>
                          <span className={`badge ${u.isActive?'badge-approved':'badge-rejected'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button className={`btn btn-sm ${u.isActive?'btn-danger':'btn-success'}`} onClick={()=>toggleUser(u._id)}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
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

export default ManageUsers;
