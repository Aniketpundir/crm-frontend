import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardAPI } from '../../services/api';
import './Dashboard.css';

const formatDate = (date) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getInitials = (name = '') => name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'U';

const riskTone = (level) => {
    if (level === 'critical') return 'danger';
    if (level === 'high') return 'warning';
    if (level === 'watch') return 'info';
    return 'success';
};

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardAPI().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    const summary = data?.executiveSummary || {};
    const atRiskProjects = data?.projectHealth?.atRiskProjects || [];
    const recommendations = data?.smartRecommendations || [];
    const upcomingTasks = data?.taskInsights?.upcomingTasks || [];
    const priorityBreakdown = data?.taskInsights?.priorityBreakdown || [];
    const weeklyActivity = data?.taskInsights?.weeklyActivity || [];
    const maxActivity = Math.max(1, ...weeklyActivity.map(day => Math.max(day.created, day.completed)));

    const stats = [
        { label: 'Active Projects', value: data?.activeProjects || 0, icon: 'A', color: 'blue', meta: `${summary.healthyProjects || 0} healthy` },
        { label: 'Completion Rate', value: `${summary.completionRate || 0}%`, icon: '%', color: 'green', meta: `${data?.doneTasks || 0}/${data?.totalTasks || 0} tasks done` },
        { label: 'At Risk', value: summary.atRiskCount || 0, icon: '!', color: 'red', meta: `${data?.overdueTasks || 0} overdue tasks` },
        { label: 'Due Today', value: summary.dueToday || 0, icon: 'D', color: 'amber', meta: `${summary.upcomingThisWeek || 0} due this week` },
        { label: 'New This Month', value: summary.createdThisMonth || 0, icon: '+', color: 'teal', meta: `${summary.completedThisWeek || 0} completed this week` },
        { label: 'Clients', value: data?.totalClients || 0, icon: 'C', color: 'purple', meta: `${data?.totalEmployees || 0} team members` },
    ];

    return (
        <div className="dashboard">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Executive Command Center</h1>
                    <p className="page-subtitle">Live delivery health, workload signals, and next-best actions.</p>
                </div>
                <div className="header-actions">
                    <Link to="/tasks" className="btn btn-secondary">Task Board</Link>
                    <Link to="/projects/new" className="btn btn-primary">+ New Project</Link>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map(s => (
                    <div key={s.label} className={`stat-card stat-${s.color}`}>
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-meta">{s.meta}</div>
                    </div>
                ))}
            </div>

            <div className="insight-grid">
                <div className="card insight-card">
                    <div className="card-header-row">
                        <h2 className="section-title">Smart Recommendations</h2>
                        <span className="pill">AI-ready rules</span>
                    </div>
                    <div className="recommendation-list">
                        {recommendations.map(item => (
                            <Link to={item.link} key={`${item.type}-${item.title}`} className={`recommendation recommendation-${item.type}`}>
                                <div className="recommendation-icon">{item.type === 'risk' ? '!' : item.type === 'project' ? 'P' : item.type === 'follow-up' ? 'F' : 'OK'}</div>
                                <div>
                                    <div className="recommendation-title">{item.title}</div>
                                    <div className="recommendation-copy">{item.description}</div>
                                    <div className="recommendation-action">{item.action}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header-row">
                        <h2 className="section-title">7-Day Activity</h2>
                        <span className="pill">Created vs completed</span>
                    </div>
                    <div className="activity-chart" aria-label="Seven day task activity">
                        {weeklyActivity.map(day => (
                            <div className="activity-day" key={day.date}>
                                <div className="activity-bars">
                                    <span className="activity-bar activity-created" style={{ height: `${Math.max(8, (day.created / maxActivity) * 100)}%` }} title={`${day.created} created`} />
                                    <span className="activity-bar activity-completed" style={{ height: `${Math.max(8, (day.completed / maxActivity) * 100)}%` }} title={`${day.completed} completed`} />
                                </div>
                                <div className="activity-label">{formatDate(day.date)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="dashboard-bottom">
                <div className="dashboard-columns">
                    <div className="card">
                        <div className="card-header-row">
                            <h2 className="section-title">Delivery Risk Queue</h2>
                            <Link to="/projects" className="btn btn-secondary btn-sm">All Projects</Link>
                        </div>
                        {atRiskProjects.length === 0 && <p className="empty-text">No delivery risks detected right now.</p>}
                        {atRiskProjects.map(project => (
                            <Link to={`/projects/${project._id}`} key={project._id} className="risk-row">
                                <div className="risk-row-main">
                                    <div className="risk-title">{project.title}</div>
                                    <div className="risk-meta">
                                        {project.client?.name || project.client?.company || 'No client'} - {project.openTasks} open - {project.overdueTasks} overdue
                                    </div>
                                </div>
                                <div className="risk-row-side">
                                    <span className={`badge badge-${riskTone(project.riskLevel)}`}>{project.riskLevel}</span>
                                    <span className="risk-score">{project.riskScore}%</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="card">
                        <div className="card-header-row">
                            <h2 className="section-title">Upcoming Follow-ups</h2>
                            <Link to="/tasks" className="btn btn-secondary btn-sm">View Tasks</Link>
                        </div>
                        {upcomingTasks.length === 0 && <p className="empty-text">No tasks due in the next 7 days.</p>}
                        {upcomingTasks.slice(0, 6).map(task => (
                            <Link to="/tasks" key={task._id} className="task-row task-row-link">
                                <div className="task-row-left">
                                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                                    <div>
                                        <div className="task-row-title">{task.title}</div>
                                        <div className="task-row-subtitle">{task.projectId?.title || 'Unlinked project'}</div>
                                    </div>
                                </div>
                                <div className="task-row-right">
                                    <span className="date-chip">{formatDate(task.deadline)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="dashboard-columns">
                    <div className="card">
                        <div className="card-header-row">
                            <h2 className="section-title">Team Workload</h2>
                            <Link to="/reports" className="btn btn-secondary btn-sm">Performance</Link>
                        </div>
                        {(data?.workload || []).length === 0 && <p className="empty-text">No active employees found.</p>}
                        {(data?.workload || []).map(member => (
                            <div key={member._id} className="workload-row">
                                <div className="workload-person">
                                    <div className="avatar">{member.avatar ? <img src={member.avatar} alt="" /> : getInitials(member.name)}</div>
                                    <div>
                                        <div className="workload-name">{member.name}</div>
                                        <div className="workload-meta">{member.openTasks} open - {member.completedTasks} done</div>
                                    </div>
                                </div>
                                <div className="workload-score">
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${member.focusScore}%` }} />
                                    </div>
                                    <span>{member.focusScore}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <div className="card-header-row">
                            <h2 className="section-title">Open Task Priority</h2>
                            <span className="pill">Work mix</span>
                        </div>
                        <div className="priority-list">
                            {priorityBreakdown.map(item => (
                                <div className="priority-row" key={item.priority}>
                                    <span className={`badge badge-${item.priority}`}>{item.priority}</span>
                                    <div className="priority-track">
                                        <div className={`priority-fill priority-${item.priority}`} style={{ width: `${Math.min(100, item.count * 12)}%` }} />
                                    </div>
                                    <strong>{item.count}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header-row">
                        <h2 className="section-title">Recent Projects</h2>
                        <Link to="/projects" className="btn btn-secondary btn-sm">View All</Link>
                    </div>
                    <div className="project-list">
                        {data?.recentProjects?.length === 0 && <p className="empty-text">No projects yet. Create one.</p>}
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

                <div className="card">
                    <div className="card-header-row">
                        <h2 className="section-title">Recent Activity Timeline</h2>
                        <Link to="/logs" className="btn btn-secondary btn-sm">Audit Logs</Link>
                    </div>
                    <div className="timeline-list">
                        {(data?.recentActivities || []).length === 0 && <p className="empty-text">No recent activity yet.</p>}
                        {(data?.recentActivities || []).map(activity => (
                            <div key={activity._id} className="timeline-item">
                                <div className="timeline-dot" />
                                <div>
                                    <div className="timeline-title">{activity.action} {activity.targetName ? <strong>{activity.targetName}</strong> : null}</div>
                                    <div className="timeline-meta">
                                        {activity.userId?.name || 'System'} - {formatDate(activity.createdAt)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
