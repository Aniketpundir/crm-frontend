import { useState, useEffect } from 'react';
import { createTaskAPI, updateTaskAPI, getUsersAPI } from '../../services/api';

export default function TaskForm({ projectId, phaseId, members, task, onClose, onSaved }) {
    const isEdit = !!task;
    const [employees, setEmployees] = useState(members || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: task?.title || '',
        description: task?.description || '',
        assignedTo: task?.assignedTo?.map(a => a._id || a) || [],
        deadline: task?.deadline?.split('T')[0] || '',
        startDate: task?.startDate?.split('T')[0] || '',
        priority: task?.priority || 'medium',
    });

    useEffect(() => {
        if (!members) getUsersAPI('employee').then(r => setEmployees(r.data));
    }, []);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const toggleAssignee = (empId) => {
        setForm(f => ({
            ...f,
            assignedTo: f.assignedTo.includes(empId)
                ? f.assignedTo.filter(id => id !== empId)
                : [...f.assignedTo, empId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.assignedTo.length) { setError('Please assign at least one person'); return; }
        setError(''); setLoading(true);
        try {
            if (isEdit) await updateTaskAPI(task._id, form);
            else await createTaskAPI({ ...form, projectId, phaseId });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving task');
        } finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEdit ? 'Edit Task' : 'Add New Task'}</h2>
                    <button className="btn-icon" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Task Title *</label>
                            <input className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="What needs to be done?" required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={2} placeholder="More details..." />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Start Date</label>
                                <input className="form-control" type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Deadline *</label>
                                <input className="form-control" type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
                            </div>
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
                            <label>Assign To ({form.assignedTo.length} selected)</label>
                            <div className="members-grid">
                                {employees.map(emp => {
                                    const empId = emp._id || emp;
                                    const empName = emp.name || empId;
                                    const selected = form.assignedTo.includes(empId);
                                    return (
                                        <div key={empId} className={`member-chip ${selected ? 'selected' : ''}`} onClick={() => toggleAssignee(empId)}>
                                            <div className="avatar" style={{ width: 26, height: 26, fontSize: 11 }}>{empName?.charAt(0).toUpperCase()}</div>
                                            <span>{empName}</span>
                                            {selected && <span className="check">✓</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: 0, marginTop: 16 }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Task'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
