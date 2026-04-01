import { useState, useEffect } from 'react';
import { getLogsAPI } from '../../services/api';
import './Reports.css';

export default function ActivityLogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetch = (p) => {
        setLoading(true);
        getLogsAPI(p).then(r => {
            setLogs(r.data.logs);
            setTotalPages(r.data.pages);
        }).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { fetch(page); }, [page]);

    const actionIcon = (action) => {
        if (action.includes('Created')) return '➕';
        if (action.includes('Deleted')) return '🗑';
        if (action.includes('Updated')) return '✏';
        if (action.includes('logged in')) return '🔑';
        if (action.includes('done')) return '✓';
        return '◉';
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Activity Log</h1>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center' }}><div className="spinner" style={{ margin: 'auto' }} /></div>
                ) : (
                    <div className="log-list">
                        {logs.map(log => (
                            <div key={log._id} className="log-item">
                                <div className="log-icon">{actionIcon(log.action)}</div>
                                <div className="log-avatar avatar">{log.userId?.name?.charAt(0).toUpperCase() || '?'}</div>
                                <div className="log-content">
                                    <span className="log-user">{log.userId?.name || 'Unknown'}</span>
                                    <span className="log-action"> {log.action}</span>
                                    {log.targetName && <span className="log-target"> — <strong>{log.targetName}</strong></span>}
                                </div>
                                <div className="log-time">{new Date(log.createdAt).toLocaleString()}</div>
                            </div>
                        ))}
                        {logs.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>No activity yet</div>}
                    </div>
                )}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                        <span>Page {page} of {totalPages}</span>
                        <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                    </div>
                )}
            </div>
        </div>
    );
}
