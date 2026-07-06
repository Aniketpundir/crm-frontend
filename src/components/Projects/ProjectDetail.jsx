import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectAPI, addPhaseAPI, deletePhaseAPI, updateProjectAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TaskBoard from '../Tasks/TaskBoard';
import TaskForm from '../Tasks/TaskForm';
import './Projects.css';

const PHASE_COLORS = ['#534AB7', '#0F6E56', '#854F0B', '#185FA5', '#A32D2D', '#3B6D11'];

export default function ProjectDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePhase, setActivePhase] = useState(null);
    const [showPhaseForm, setShowPhaseForm] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [newPhaseName, setNewPhaseName] = useState('');
    const [phaseColor, setPhaseColor] = useState(PHASE_COLORS[0]);

    const fetchProject = useCallback(() => {
        getProjectAPI(id).then(r => {
            setProject(r.data.project);
            setTasks(r.data.tasks);
            setActivePhase(current => current || r.data.project.phases?.[0]?._id || null);
        }).catch(console.error).finally(() => setLoading(false));
    }, [id]);

    useEffect(() => { fetchProject(); }, [fetchProject]);

    const handleAddPhase = async (e) => {
        e.preventDefault();
        if (!newPhaseName.trim()) return;
        await addPhaseAPI(id, { name: newPhaseName, color: phaseColor });
        setNewPhaseName(''); setShowPhaseForm(false);
        fetchProject();
    };

    const handleDeletePhase = async (phaseId) => {
        if (!window.confirm('Delete this phase? Tasks in it will still exist.')) return;
        await deletePhaseAPI(id, phaseId);
        fetchProject();
    };

    const handleStatusChange = async (newStatus) => {
        await updateProjectAPI(id, { status: newStatus });
        fetchProject();
    };

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
    if (!project) return <div>Project not found</div>;

    const phaseTasks = tasks.filter(t => t.phaseId?.toString() === activePhase);

    const getProgressColor = (pct) => pct === 100 ? 'var(--success)' : pct >= 60 ? '#EF9F27' : 'var(--primary)';

    return (
        <div className="project-detail">
            {/* Header */}
            <div className="project-detail-header">
                <div>
                    <div className="breadcrumb"><Link to="/projects">Projects</Link> / {project.title}</div>
                    <h1 className="project-detail-title">{project.title}</h1>
                    <div className="project-detail-meta">
                        <span>Client: <strong>{project.clientId?.name || 'N/A'}</strong></span>
                        <span>•</span>
                        <span>Deadline: <strong>{new Date(project.deadline).toLocaleDateString()}</strong></span>
                        <span>•</span>
                        <span className={`badge badge-${project.priority}`}>{project.priority}</span>
                    </div>
                </div>
                <div className="project-detail-actions">
                    {user.role === 'admin' && (
                        <>
                            <select className={`form-control badge badge-${project.status}`} value={project.status}
                                onChange={e => handleStatusChange(e.target.value)} style={{ width: 'auto', padding: '4px 28px 4px 10px' }}>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="on-hold">On Hold</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <Link to={`/projects/${id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Overall progress */}
            <div className="card project-progress-card">
                <div className="progress-header">
                    <div>
                        <span className="progress-label">Overall Progress</span>
                        <span className="progress-value">{project.progress}%</span>
                    </div>
                    <div className="progress-stats">
                        <span>{tasks.filter(t => t.status === 'done').length} / {tasks.length} tasks done</span>
                    </div>
                </div>
                <div className="progress-bar" style={{ height: 12 }}>
                    <div className="progress-fill" style={{ width: `${project.progress}%`, background: getProgressColor(project.progress) }} />
                </div>
                {/* Per phase mini progress */}
                <div className="phase-progress-row">
                    {project.phases?.map(ph => {
                        const phTasks = tasks.filter(t => t.phaseId?.toString() === ph._id.toString());
                        const phDone = phTasks.filter(t => t.status === 'done').length;
                        const phPct = phTasks.length ? Math.round((phDone / phTasks.length) * 100) : 0;
                        return (
                            <div key={ph._id} className="phase-mini">
                                <div className="phase-mini-name" style={{ color: ph.color }}>{ph.name}</div>
                                <div className="progress-bar" style={{ height: 6 }}>
                                    <div className="progress-fill" style={{ width: `${phPct}%`, background: ph.color }} />
                                </div>
                                <div className="phase-mini-pct">{phPct}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Phases tabs */}
            <div className="phases-section">
                <div className="phases-header">
                    <div className="phases-tabs">
                        {project.phases?.map(ph => (
                            <div key={ph._id} className={`phase-tab ${activePhase === ph._id ? 'active' : ''}`}
                                style={{ '--phase-color': ph.color }} onClick={() => setActivePhase(ph._id)}>
                                <span className="phase-tab-dot" style={{ background: ph.color }} />
                                {ph.name}
                                {user.role === 'admin' && (
                                    <button className="phase-tab-del" onClick={(e) => { e.stopPropagation(); handleDeletePhase(ph._id); }}>×</button>
                                )}
                            </div>
                        ))}
                        {user.role === 'admin' && (
                            <button className="phase-tab phase-add-btn" onClick={() => setShowPhaseForm(!showPhaseForm)}>+ Phase</button>
                        )}
                    </div>
                    {activePhase && user.role === 'admin' && (
                        <button className="btn btn-primary btn-sm" onClick={() => setShowTaskForm(true)}>+ Add Task</button>
                    )}
                </div>

                {/* Add phase form */}
                {showPhaseForm && (
                    <form onSubmit={handleAddPhase} className="add-phase-form card">
                        <input className="form-control" placeholder="Phase name e.g. Design, Development..." value={newPhaseName} onChange={e => setNewPhaseName(e.target.value)} style={{ flex: 1 }} />
                        <div className="color-swatches">
                            {PHASE_COLORS.map(c => (
                                <button type="button" key={c} className={`color-swatch ${phaseColor === c ? 'selected' : ''}`}
                                    style={{ background: c }} onClick={() => setPhaseColor(c)} />
                            ))}
                        </div>
                        <button className="btn btn-primary btn-sm" type="submit">Add</button>
                        <button className="btn btn-secondary btn-sm" type="button" onClick={() => setShowPhaseForm(false)}>Cancel</button>
                    </form>
                )}

                {/* Tasks for active phase */}
                {activePhase ? (
                    <TaskBoard
                        projectId={id}
                        phaseId={activePhase}
                        tasks={phaseTasks}
                        onUpdate={fetchProject}
                        members={project.members}
                        phases={project.phases}
                    />
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">⬡</div>
                        <p>Add a phase to start organizing tasks.</p>
                    </div>
                )}
            </div>

            {/* Task form modal */}
            {showTaskForm && (
                <TaskForm
                    projectId={id}
                    phaseId={activePhase}
                    members={project.members}
                    onClose={() => setShowTaskForm(false)}
                    onSaved={() => { setShowTaskForm(false); fetchProject(); }}
                />
            )}
        </div>
    );
}
