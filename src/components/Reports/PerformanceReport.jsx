import { useState, useEffect } from 'react';
import { getPerformanceAPI } from '../../services/api';
import './Reports.css';

export default function PerformanceReport() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState('completionRate');

    useEffect(() => {
        getPerformanceAPI().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    const sorted = [...data].sort((a, b) => b[sort] - a[sort]);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Employee Performance Report</h1>
                <select className="form-control" style={{ width: 'auto' }} value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="completionRate">Sort by Completion Rate</option>
                    <option value="onTimeRate">Sort by On-Time Rate</option>
                    <option value="totalTasks">Sort by Total Tasks</option>
                    <option value="completedTasks">Sort by Completed Tasks</option>
                </select>
            </div>

            <div className="report-grid">
                {sorted.map((emp, i) => (
                    <div key={emp._id} className="report-card card">
                        <div className="report-card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div className="rank-badge">{i + 1}</div>
                                <div className="avatar" style={{ width: 40, height: 40, fontSize: 16 }}>{emp.name?.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div className="report-name">{emp.name}</div>
                                    <div className="report-dept">{emp.department || 'General'}</div>
                                </div>
                            </div>
                            <div className="report-completion">
                                <div className="completion-circle" style={{ '--pct': emp.completionRate }}>
                                    <span>{emp.completionRate}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="report-stats">
                            <div className="report-stat">
                                <span className="rs-value">{emp.totalTasks}</span>
                                <span className="rs-label">Total</span>
                            </div>
                            <div className="report-stat">
                                <span className="rs-value" style={{ color: 'var(--success)' }}>{emp.completedTasks}</span>
                                <span className="rs-label">Done</span>
                            </div>
                            <div className="report-stat">
                                <span className="rs-value" style={{ color: '#0F6E56' }}>{emp.earlyTasks}</span>
                                <span className="rs-label">Early</span>
                            </div>
                            <div className="report-stat">
                                <span className="rs-value" style={{ color: 'var(--danger)' }}>{emp.lateTasks}</span>
                                <span className="rs-label">Late</span>
                            </div>
                            <div className="report-stat">
                                <span className="rs-value" style={{ color: 'var(--warning)' }}>{emp.overdueTasks}</span>
                                <span className="rs-label">Overdue</span>
                            </div>
                        </div>

                        <div className="report-bars">
                            <div className="rbar-row">
                                <span className="rbar-label">Completion</span>
                                <div className="progress-bar" style={{ flex: 1 }}>
                                    <div className="progress-fill" style={{ width: `${emp.completionRate}%`, background: emp.completionRate > 70 ? 'var(--success)' : emp.completionRate > 40 ? '#EF9F27' : 'var(--danger)' }} />
                                </div>
                                <span className="rbar-pct">{emp.completionRate}%</span>
                            </div>
                            <div className="rbar-row">
                                <span className="rbar-label">On-Time</span>
                                <div className="progress-bar" style={{ flex: 1 }}>
                                    <div className="progress-fill" style={{ width: `${emp.onTimeRate}%`, background: emp.onTimeRate > 80 ? 'var(--success)' : emp.onTimeRate > 50 ? '#EF9F27' : 'var(--danger)' }} />
                                </div>
                                <span className="rbar-pct">{emp.onTimeRate}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {data.length === 0 && (
                <div className="empty-state"><div className="empty-icon">▦</div><p>No employee data yet.</p></div>
            )}
        </div>
    );
}
