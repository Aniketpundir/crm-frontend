import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        API.get('/logs?limit=5').catch(() => { });
        // Fetch notifications (simplified - in production use a dedicated endpoint)
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <header className="navbar">
            <div className="navbar-left">
                <span className="navbar-greeting">Good {getGreeting()}, <strong>{user?.name?.split(' ')[0]}</strong></span>
            </div>
            <div className="navbar-right">
                <button className="btn-icon notif-btn" onClick={() => setShowNotif(!showNotif)}>
                    🔔
                    {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
                </button>
                <div className="navbar-avatar-wrap" onClick={() => setShowMenu(!showMenu)}>
                    <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                    {showMenu && (
                        <div className="navbar-dropdown">
                            <div className="dropdown-info">
                                <div className="dropdown-name">{user?.name}</div>
                                <div className="dropdown-role">{user?.role}</div>
                            </div>
                            <hr />
                            <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}
