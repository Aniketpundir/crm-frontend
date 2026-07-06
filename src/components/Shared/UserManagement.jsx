import { useState, useEffect } from 'react';
import { getUsersAPI, createUserAPI, updateUserAPI } from '../../services/api';
import '../Clients/Clients.css';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', department: '', phone: '' });

    const fetch = () => getUsersAPI().then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
    useEffect(() => { fetch(); }, []);

    const openForm = (user = null) => {
        setEditUser(user);
        setForm(user ? { name: user.name, email: user.email, password: '', role: user.role, department: user.department || '', phone: user.phone || '' } : { name: '', email: '', password: '', role: 'employee', department: '', phone: '' });
        setShowForm(true); setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError('');
        try {
            if (editUser) await updateUserAPI(editUser._id, form);
            else await createUserAPI(form);
            setShowForm(false); fetch();
        } catch (err) { setError(err.response?.data?.message || 'Error'); }
    };

    const handleToggle = async (u) => {
        await updateUserAPI(u._id, { isActive: !u.isActive });
        fetch();
    };

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Team Management</h1>
                <button className="btn btn-primary" onClick={() => openForm()}>+ Add Member</button>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id}>
                                <td><div className="client-name-cell"><div className="avatar">{u.name?.charAt(0).toUpperCase()}</div>{u.name}</div></td>
                                <td>{u.email}</td>
                                <td><span className={`badge badge-${u.role === 'admin' ? 'urgent' : u.role === 'employee' ? 'medium' : 'low'}`}>{u.role}</span></td>
                                <td>{u.department || '—'}</td>
                                <td><span className={`badge ${u.isActive ? 'badge-active' : 'badge-on-hold'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => openForm(u)}>Edit</button>
                                        <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggle(u)}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>{editUser ? 'Edit Member' : 'Add Member'}</h2><button className="btn-icon" onClick={() => setShowForm(false)}>×</button></div>
                        <div className="modal-body">
                            {error && <div className="alert alert-error">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="grid-2">
                                    <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                                    <div className="form-group"><label>Email *</label><input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
                                    <div className="form-group"><label>Password {editUser ? '(leave blank to keep)' : '*'}</label><input className="form-control" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={!editUser} /></div>
                                    <div className="form-group"><label>Role</label>
                                        <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                            <option value="employee">Employee</option>
                                            <option value="admin">Admin</option>
                                            <option value="client">Client</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Department</label><input className="form-control" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
                                    <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                                </div>
                                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editUser ? 'Save' : 'Create'}</button></div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
