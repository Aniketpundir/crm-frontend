import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjectsAPI, deleteProjectAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Projects.css';

export default function ProjectList() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        getProjectsAPI().then(r => setProjects(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id, e) => {
        e.preventDefault();
        if (!window.confirm('Delete this project and all its tasks?')) return;
        await deleteProjectAPI(id);
        setProjects(prev => prev.filter(p => p._id !== id));
    };

    const filtered = projects.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.clientId?.name?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus ? p.status === filterStatus : true;
        return matchSearch && matchStatus;
    });

    const getProgressColor = (pct) => pct === 100 ? 'var(--success)' : pct >= 60 ? '#EF9F27' : 'var(--primary)';

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Projects</h1>
                {user.role === 'admin' && <Link to="/projects/new" className="btn btn-primary">+ New Project</Link>}
            </div>

            <div className="filters-bar">
                <input className="form-control search-input" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
                <select className="form-control filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">⬡</div>
                    <p>No projects found.</p>
                    {user.role === 'admin' && <Link to="/projects/new" className="btn btn-primary" style={{ marginTop: 12 }}>Create First Project</Link>}
                </div>
            ) : (
                <div className="projects-grid">
                    {filtered.map(project => (
                        <Link to={`/projects/${project._id}`} key={project._id} className="project-card">
                            <div className="project-card-header">
                                <div>
                                    <div className="project-card-title">{project.title}</div>
                                    <div className="project-card-client">{project.clientId?.name || 'No client'} • {project.clientId?.company || ''}</div>
                                </div>
                                <span className={`badge badge-${project.priority}`}>{project.priority}</span>
                            </div>

                            {project.description && (
                                <p className="project-card-desc">{project.description.substring(0, 80)}{project.description.length > 80 ? '...' : ''}</p>
                            )}

                            <div className="project-phases-preview">
                                {project.phases?.map(ph => (
                                    <span key={ph._id} className="phase-chip" style={{ background: ph.color + '22', color: ph.color, borderColor: ph.color + '44' }}>{ph.name}</span>
                                ))}
                            </div>

                            <div className="project-card-progress">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${project.progress}%`, background: getProgressColor(project.progress) }} />
                                </div>
                                <span className="progress-pct">{project.progress}%</span>
                            </div>

                            <div className="project-card-footer">
                                <div className="avatar-group">
                                    {project.members?.slice(0, 4).map(m => (
                                        <div key={m._id} className="avatar" title={m.name}>{m.name?.charAt(0).toUpperCase()}</div>
                                    ))}
                                    {project.members?.length > 4 && <div className="avatar" style={{ background: '#f1efe8', color: '#5F5E5A' }}>+{project.members.length - 4}</div>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="project-deadline">📅 {new Date(project.deadline).toLocaleDateString()}</span>
                                    <span className={`badge badge-${project.status}`}>{project.status}</span>
                                    {user.role === 'admin' && (
                                        <button className="btn-icon btn-sm" onClick={(e) => handleDelete(project._id, e)} title="Delete">🗑</button>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
