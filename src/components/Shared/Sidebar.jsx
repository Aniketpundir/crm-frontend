import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const menuItems = [
    { path: '/dashboard', icon: '◈', label: 'Dashboard', roles: ['admin', 'employee', 'client'] },
    { path: '/projects', icon: '⬡', label: 'Projects', roles: ['admin', 'employee', 'client'] },
    { path: '/tasks', icon: '◻', label: 'My Tasks', roles: ['admin', 'employee'] },
    { path: '/clients', icon: '◎', label: 'Clients', roles: ['admin'] },
    { path: '/users', icon: '◉', label: 'Team', roles: ['admin'] },
    { path: '/reports', icon: '▦', label: 'Reports', roles: ['admin'] },
    { path: '/logs', icon: '≡', label: 'Activity Log', roles: ['admin'] },
];

export default function Sidebar() {
    const { user } = useAuth();
    const filtered = menuItems.filter(item => item.roles.includes(user?.role));
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">C</div>
                <span>CRM</span>
            </div>
            <nav className="sidebar-nav">
                {filtered.map(item => (
                    <NavLink key={item.path} to={item.path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <span className="sidebar-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-user">
                <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                <div className="sidebar-user-info">
                    <div className="sidebar-user-name">{user?.name}</div>
                    <div className="sidebar-user-role">{user?.role}</div>
                </div>
            </div>
        </aside>
    );
}
