import { useState } from 'react';
import { addCommentAPI, uploadFileAPI, updateTaskStatusAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TaskDetail({ task: initialTask, onClose, onUpdate }) {
    const { user } = useAuth();
    const [task, setTask] = useState(initialTask);
    const [comment, setComment] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        const res = await addCommentAPI(task._id, comment);
        setTask(t => ({ ...t, comments: res.data }));
        setComment('');
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const res = await uploadFileAPI(task._id, formData);
        setTask(t => ({ ...t, attachments: res.data }));
        setUploading(false);
    };

    const handleStatusChange = async (status) => {
        const res = await updateTaskStatusAPI(task._id, status);
        setTask(t => ({ ...t, ...res.data.task }));
        if (onUpdate) onUpdate();
    };

    const isOverdue = task.status !== 'done' && new Date(task.deadline) < new Date();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                            <span className={`badge badge-${task.status === 'in-progress' ? 'progress' : task.status === 'done' ? 'done' : 'todo'}`}>
                                {task.status === 'in-progress' ? 'In Progress' : task.status === 'done' ? 'Done' : 'To Do'}
                            </span>
                            <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                            {task.status === 'done' && (
                                <span className={`badge ${task.isEarly ? 'badge-early' : task.isLate ? 'badge-late' : 'badge-done'}`}>
                                    {task.isEarly ? '⚡ Completed Early' : task.isLate ? '⚠ Completed Late' : '✓ On Time'}
                                </span>
                            )}
                            {isOverdue && <span className="badge badge-late">⚠ Overdue</span>}
                        </div>
                        <h2>{task.title}</h2>
                    </div>
                    <button className="btn-icon" onClick={onClose}>×</button>
                </div>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                    {task.description && (
                        <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{task.description}</div>
                    )}

                    <div className="task-detail-meta">
                        <div className="meta-item">
                            <span className="meta-label">Assigned To</span>
                            <div className="avatar-group" style={{ marginTop: 4 }}>
                                {task.assignedTo?.map(u => (
                                    <div key={u._id} className="avatar" title={u.name}>{u.name?.charAt(0).toUpperCase()}</div>
                                ))}
                            </div>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Deadline</span>
                            <span className={`meta-value ${isOverdue ? 'text-danger' : ''}`}>{new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                        {task.completedAt && (
                            <div className="meta-item">
                                <span className="meta-label">Completed At</span>
                                <span className="meta-value">{new Date(task.completedAt).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Status buttons */}
                    {user.role !== 'client' && task.status !== 'done' && (
                        <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
                            {task.status === 'todo' && <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange('in-progress')}>▶ Start Task</button>}
                            {task.status === 'in-progress' && <button className="btn btn-success btn-sm" onClick={() => handleStatusChange('done')}>✓ Mark as Done</button>}
                        </div>
                    )}

                    {/* Attachments */}
                    <div className="detail-section">
                        <div className="detail-section-header">
                            <span>Attachments ({task.attachments?.length || 0})</span>
                            {user.role !== 'client' && (
                                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                                    {uploading ? 'Uploading...' : '+ Upload'}
                                    <input type="file" hidden onChange={handleUpload} />
                                </label>
                            )}
                        </div>
                        {task.attachments?.map((f, i) => (
                            <a key={i} href={f.url} target="_blank" rel="noreferrer" className="attachment-item">
                                📎 {f.name}
                            </a>
                        ))}
                    </div>

                    {/* Comments */}
                    <div className="detail-section">
                        <div className="detail-section-header"><span>Comments ({task.comments?.length || 0})</span></div>
                        <div className="comments-list">
                            {task.comments?.map((c, i) => (
                                <div key={i} className="comment">
                                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                                        {c.userId?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="comment-body">
                                        <div className="comment-meta">{c.userId?.name || 'User'} • {new Date(c.createdAt).toLocaleString()}</div>
                                        <div className="comment-text">{c.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {user.role !== 'client' && (
                            <form onSubmit={handleAddComment} className="comment-form">
                                <input className="form-control" value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." />
                                <button className="btn btn-primary btn-sm" type="submit">Post</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
