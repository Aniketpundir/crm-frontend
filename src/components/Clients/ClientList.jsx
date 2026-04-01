import { useState, useEffect } from 'react';
import { getClientsAPI, createClientAPI, updateClientAPI, deleteClientAPI } from '../../services/api';
import './Clients.css';

export default function ClientList() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editClient, setEditClient] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '' });
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    const fetch = () => getClientsAPI().then(r => setClients(r.data)).catch(console.error).finally(() => setLoading(false));
    useEffect(() => { fetch(); }, []);

    const openForm = (client = null) => {
        setEditClient(client);
        setForm(client ? { name: client.name, email: client.email, phone: client.phone || '', company: client.company || '', address: client.address || '' } : { name: '', email: '', phone: '', company: '', address: '' });
        setShowForm(true);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editClient) await updateClientAPI(editClient._id, form);
            else await createClientAPI(form);
            setShowForm(false);
            fetch();
        } catch (err) { setError(err.response?.data?.message || 'Error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this client?')) return;
        await deleteClientAPI(id);
        setClients(prev => prev.filter(c => c._id !== id));
    };

    const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Clients</h1>
                <button className="btn btn-primary" onClick={() => openForm()}>+ Add Client</button>
            </div>
            <div className="filters-bar" style={{ marginBottom: 20 }}>
                <input className="form-control search-input" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="clients-table card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>No clients found</td></tr>}
                        {filtered.map(c => (
                            <tr key={c._id}>
                                <td><div className="client-name-cell"><div className="avatar">{c.name?.charAt(0).toUpperCase()}</div>{c.name}</div></td>
                                <td>{c.company || '—'}</td>
                                <td>{c.email}</td>
                                <td>{c.phone || '—'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => openForm(c)}>Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
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
                        <div className="modal-header"><h2>{editClient ? 'Edit Client' : 'New Client'}</h2><button className="btn-icon" onClick={() => setShowForm(false)}>×</button></div>
                        <div className="modal-body">
                            {error && <div className="alert alert-error">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="grid-2">
                                    <div className="form-group"><label>Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                                    <div className="form-group"><label>Company</label><input className="form-control" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
                                    <div className="form-group"><label>Email *</label><input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
                                    <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                                    <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Address</label><input className="form-control" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
                                </div>
                                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editClient ? 'Save' : 'Create'}</button></div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
