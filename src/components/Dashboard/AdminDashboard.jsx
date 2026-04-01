import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardAPI } from '../../services/api';
import './Dashboard.css';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = localStorage.getItem("user");

        console.log(user)
    }, [])

    useEffect(() => {
        getDashboardAPI().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    const stats = [
        { label: 'Total Projects', value: data?.totalProjects || 0, icon: '⬡', color: 'purple' },
        { label: 'Active Projects', value: data?.activeProjects || 0, icon: '◉', color: 'blue' },
        { label: 'Total Tasks', value: data?.totalTasks || 0, icon: '◻', color: 'teal' },
        { label: 'Overdue Tasks', value: data?.overdueTasks || 0, icon: '⚠', color: 'red' },
        { label: 'Completed', value: data?.completedProjects || 0, icon: '✓', color: 'green' },
        { label: 'Team Members', value: data?.totalEmployees || 0, icon: '◎', color: 'amber' },
    ];

    return (
        <div className="dashboard">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <Link to="/projects/new" className="btn btn-primary">+ New Project</Link>
            </div>

            <div className="stats-grid">
                {stats.map(s => (
                    <div key={s.label} className={`stat-card stat-${s.color}`}>
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="dashboard-bottom">
                <div className="card">
                    <div className="card-header-row">
                        <h2 className="section-title">Recent Projects</h2>
                        <Link to="/projects" className="btn btn-secondary btn-sm">View All</Link>
                    </div>
                    <div className="project-list">
                        {data?.recentProjects?.length === 0 && <p className="empty-text">No projects yet. Create one!</p>}
                        {data?.recentProjects?.map(p => (
                            <Link to={`/projects/${p._id}`} key={p._id} className="project-row">
                                <div className="project-row-left">
                                    <div className="project-row-title">{p.title}</div>
                                    <div className="project-row-client">{p.clientId?.name || 'No client'}</div>
                                </div>
                                <div className="project-row-right">
                                    <div className="progress-bar" style={{ width: 120 }}>
                                        <div className="progress-fill" style={{
                                            width: `${p.progress}%`,
                                            background: p.progress === 100 ? 'var(--success)' : p.progress > 50 ? '#EF9F27' : 'var(--primary)'
                                        }} />
                                    </div>
                                    <span className="progress-text">{p.progress}%</span>
                                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
