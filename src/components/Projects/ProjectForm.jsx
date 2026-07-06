import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProjectAPI, updateProjectAPI, getProjectAPI, getClientsAPI, getUsersAPI } from '../../services/api';
import './Projects.css';

export default function ProjectForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [clients, setClients] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '', description: '', clientId: '', projectManager: '',
        members: [], startDate: '', deadline: '', priority: 'medium',
        tags: '', status: 'active'
    });

    useEffect(() => {
        getClientsAPI()
            .then(r => setClients(r.data))
            .catch(err => {
                console.error('Client load error:', err.response?.data || err.message);
                setClients([]);
            });
        getUsersAPI('employee')
            .then(r => setEmployees(r.data))
            .catch(err => {
                console.error('Employee load error:', err.response?.data || err.message);
                setEmployees([]);
            });
        if (isEdit) {
            getProjectAPI(id).then(r => {
                const p = r.data.project;
                setForm({
                    title: p.title, description: p.description || '',
                    clientId: p.clientId?._id || '', projectManager: p.projectManager?._id || '',
                    members: p.members?.map(m => m._id) || [],
                    startDate: p.startDate?.split('T')[0] || '',
                    deadline: p.deadline?.split('T')[0] || '',
                    priority: p.priority, tags: p.tags?.join(', ') || '',
                    status: p.status
                });
            });
        }
    }, [id, isEdit]);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleMemberToggle = (empId) => {
        setForm(f => ({
            ...f,
            members: f.members.includes(empId) ? f.members.filter(m => m !== empId) : [...f.members, empId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const payload = {
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                clientId: form.clientId || undefined,
                projectManager: form.projectManager || undefined,
            };
            if (isEdit) await updateProjectAPI(id, payload);
            else await createProjectAPI(payload);
            navigate('/projects');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setLoading(false); }
    };

    return (
        <div className="project-form-page">
            <div className="page-header">
                <h1 className="page-title">{isEdit ? 'Edit Project' : 'New Project'}</h1>
            </div>
            <div className="card project-form-card">
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="grid-2">
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Project Title *</label>
                            <input className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Website Redesign for ABC Corp" required />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Description</label>
                            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="What is this project about?" />
                        </div>
                        <div className="form-group">
                            <label>Client</label>
                            <select className="form-control" name="clientId" value={form.clientId} onChange={handleChange}>
                                <option value="">Select Client</option>
                                {clients.map(c => <option key={c._id} value={c._id}>{c.name} — {c.company}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select className="form-control" name="priority" value={form.priority} onChange={handleChange}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Start Date *</label>
                            <input className="form-control" type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Deadline *</label>
                            <input className="form-control" type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Project Manager</label>
                            <select className="form-control" name="projectManager" value={form.projectManager} onChange={handleChange}>
                                <option value="">Select Manager</option>
                                {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tags (comma separated)</label>
                            <input className="form-control" name="tags" value={form.tags} onChange={handleChange} placeholder="web, design, marketing" />
                        </div>
                        {isEdit && (
                            <div className="form-group">
                                <label>Status</label>
                                <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="on-hold">On Hold</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Team Members ({form.members.length} selected)</label>
                        <div className="members-grid">
                            {employees.map(emp => (
                                <div key={emp._id} className={`member-chip ${form.members.includes(emp._id) ? 'selected' : ''}`}
                                    onClick={() => handleMemberToggle(emp._id)}>
                                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{emp.name?.charAt(0).toUpperCase()}</div>
                                    <span>{emp.name}</span>
                                    {form.members.includes(emp._id) && <span className="check">✓</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/projects')}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
