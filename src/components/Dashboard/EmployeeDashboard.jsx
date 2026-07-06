import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTasksAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [now] = useState(() => Date.now());

    useEffect(() => {
        getTasksAPI({ assignedTo: user._id })
            .then(r => setTasks(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user._id]);

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    const myTasks = tasks;
    const dueSoon = myTasks.filter(t => t.status !== 'done' && new Date(t.deadline) <= new Date(now + 2 * 86400000));
    const doneTasks = myTasks.filter(t => t.status === 'done');
    const inProgress = myTasks.filter(t => t.status === 'in-progress');

    return (
        <div className="dashboard">
            <div className="page-header">
                <h1 className="page-title">My Dashboard</h1>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="stat-card stat-purple"><div className="stat-icon">◻</div><div className="stat-value">{myTasks.length}</div><div className="stat-label">Total Tasks</div></div>
                <div className="stat-card stat-blue"><div className="stat-icon">◉</div><div className="stat-value">{inProgress.length}</div><div className="stat-label">In Progress</div></div>
                <div className="stat-card stat-green"><div className="stat-icon">✓</div><div className="stat-value">{doneTasks.length}</div><div className="stat-label">Completed</div></div>
                <div className="stat-card stat-red"><div className="stat-icon">⚠</div><div className="stat-value">{dueSoon.length}</div><div className="stat-label">Due Soon</div></div>
            </div>

            <div className="dashboard-bottom">
                <div className="card">
                    <div className="card-header-row">
                        <h2 className="section-title">My Pending Tasks</h2>
                        <Link to="/tasks" className="btn btn-secondary btn-sm">View All</Link>
                    </div>
                    {myTasks.filter(t => t.status !== 'done').length === 0
                        ? <p className="empty-text">No pending tasks!</p>
                        : myTasks.filter(t => t.status !== 'done').slice(0, 8).map(task => (
                            <div key={task._id} className="task-row">
                                <div className="task-row-left">
                                    <span className={`badge badge-${task.status === 'in-progress' ? 'progress' : 'todo'}`}>
                                        {task.status === 'in-progress' ? 'In Progress' : 'Todo'}
                                    </span>
                                    <div className="task-row-title">{task.title}</div>
                                </div>
                                <div className="task-row-right">
                                    <span className={`badge ${new Date(task.deadline) < new Date() ? 'badge-late' : 'badge-medium'}`}>
                                        {new Date(task.deadline) < new Date() ? 'OVERDUE' : new Date(task.deadline).toLocaleDateString()}
                                    </span>
                                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
