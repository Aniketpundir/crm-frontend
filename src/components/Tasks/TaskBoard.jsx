import { useState, useEffect } from 'react';
import { getTasksAPI, updateTaskStatusAPI, deleteTaskAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import './Tasks.css';

const COLUMNS = [
    { key: 'todo', label: 'To Do', color: '#888' },
    { key: 'in-progress', label: 'In Progress', color: '#185FA5' },
    { key: 'done', label: 'Done', color: '#3B6D11' },
];

export default function TaskBoard({ projectId, phaseId, tasks: propTasks, onUpdate, members, phases }) {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(!propTasks);
    const [editTask, setEditTask] = useState(null);
    const [viewTask, setViewTask] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (propTasks) { setTasks(propTasks); return; }
        const params = {};
        if (projectId) params.projectId = projectId;
        if (user.role === 'employee') params.assignedTo = user._id;
        getTasksAPI(params).then(r => setTasks(r.data)).catch(console.error).finally(() => setLoading(false));
    }, [propTasks, projectId]);

    const handleStatusChange = async (taskId, newStatus) => {
        const res = await updateTaskStatusAPI(taskId, newStatus);
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, ...res.data.task } : t));
        if (onUpdate) onUpdate();
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Delete this task?')) return;
        await deleteTaskAPI(taskId);
        setTasks(prev => prev.filter(t => t._id !== taskId));
        if (onUpdate) onUpdate();
    };

    const handleSaved = () => {
        setShowForm(false); setEditTask(null);
        if (onUpdate) onUpdate();
        if (!propTasks) {
            const params = {};
            if (projectId) params.projectId = projectId;
            getTasksAPI(params).then(r => setTasks(r.data));
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    return (
        <div className="task-board">
            {!propTasks && (
                <div className="page-header">
                    <h1 className="page-title">My Tasks</h1>
                </div>
            )}
            <div className="kanban-board">
                {COLUMNS.map(col => {
                    const colTasks = tasks.filter(t => t.status === col.key);
                    return (
                        <div key={col.key} className="kanban-col">
                            <div className="kanban-col-header" style={{ '--col-color': col.color }}>
                                <span className="kanban-col-dot" style={{ background: col.color }} />
                                <span className="kanban-col-title">{col.label}</span>
                                <span className="kanban-col-count">{colTasks.length}</span>
                            </div>
                            <div className="kanban-cards">
                                {colTasks.map(task => (
                                    <TaskCard key={task._id} task={task} user={user}
                                        onStatusChange={handleStatusChange}
                                        onDelete={handleDelete}
                                        onEdit={() => { setEditTask(task); setShowForm(true); }}
                                        onClick={() => setViewTask(task)}
                                    />
                                ))}
                                {colTasks.length === 0 && (
                                    <div className="kanban-empty">No tasks</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {showForm && (
                <TaskForm
                    projectId={projectId}
                    phaseId={phaseId}
                    members={members}
                    task={editTask}
                    onClose={() => { setShowForm(false); setEditTask(null); }}
                    onSaved={handleSaved}
                />
            )}
            {viewTask && (
                <TaskDetail
                    task={viewTask}
                    onClose={() => setViewTask(null)}
                    onUpdate={() => { setViewTask(null); handleSaved(); }}
                />
            )}
        </div>
    );
}

function TaskCard({ task, user, onStatusChange, onDelete, onEdit, onClick }) {
    const isOverdue = task.status !== 'done' && new Date(task.deadline) < new Date();
    const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / 86400000);

    return (
        <div className="kanban-card" onClick={onClick}>
            <div className="kanban-card-header">
                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                {user.role !== 'client' && (
                    <div className="kanban-card-actions" onClick={e => e.stopPropagation()}>
                        {user.role === 'admin' || task.assignedTo?.some(a => a._id === user._id) ? (
                            <>
                                <button className="btn-icon" style={{ fontSize: 12 }} onClick={onEdit} title="Edit">✏</button>
                                {user.role === 'admin' && <button className="btn-icon" style={{ fontSize: 12 }} onClick={() => onDelete(task._id)} title="Delete">🗑</button>}
                            </>
                        ) : null}
                    </div>
                )}
            </div>

            <div className="kanban-card-title">{task.title}</div>
            {task.description && <div className="kanban-card-desc">{task.description.substring(0, 60)}{task.description.length > 60 ? '...' : ''}</div>}

            <div className="kanban-card-footer">
                <div className="avatar-group">
                    {task.assignedTo?.slice(0, 3).map(u => (
                        <div key={u._id} className="avatar" style={{ width: 24, height: 24, fontSize: 10 }} title={u.name}>{u.name?.charAt(0).toUpperCase()}</div>
                    ))}
                </div>
                <div className="kanban-card-deadline-wrap">
                    {task.status === 'done' ? (
                        <span className={`badge ${task.isEarly ? 'badge-early' : task.isLate ? 'badge-late' : 'badge-done'}`}>
                            {task.isEarly ? '⚡ Early' : task.isLate ? '⚠ Late' : '✓ On time'}
                        </span>
                    ) : (
                        <span className={`badge ${isOverdue ? 'badge-late' : daysLeft <= 2 ? 'badge-high' : 'badge-todo'}`}>
                            {isOverdue ? 'Overdue' : `${daysLeft}d left`}
                        </span>
                    )}
                </div>
            </div>

            {task.status !== 'done' && user.role !== 'client' && (
                <div className="kanban-card-status-row" onClick={e => e.stopPropagation()}>
                    {task.status === 'todo' && <button className="status-btn start" onClick={() => onStatusChange(task._id, 'in-progress')}>▶ Start</button>}
                    {task.status === 'in-progress' && <button className="status-btn done" onClick={() => onStatusChange(task._id, 'done')}>✓ Mark Done</button>}
                </div>
            )}
        </div>
    );
}
