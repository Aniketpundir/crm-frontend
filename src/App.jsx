import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';
import ProjectList from './components/Projects/ProjectList';
import ProjectDetail from './components/Projects/ProjectDetail';
import ProjectForm from './components/Projects/ProjectForm';
import TaskBoard from './components/Tasks/TaskBoard';
import ClientList from './components/Clients/ClientList';
import PerformanceReport from './components/Reports/PerformanceReport';
import ActivityLogPage from './components/Reports/ActivityLogPage';
import UserManagement from './components/Shared/UserManagement';
import Layout from './components/Shared/Layout';
import './App.css';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
    return children;
};

const DashboardRedirect = () => {
    const { user } = useAuth();
    if (user?.role === 'admin') return <AdminDashboard />;
    return <EmployeeDashboard />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/dashboard" />} />
                        <Route path="dashboard" element={<DashboardRedirect />} />
                        <Route path="projects" element={<ProjectList />} />
                        <Route path="projects/new" element={<ProtectedRoute roles={['admin']}><ProjectForm /></ProtectedRoute>} />
                        <Route path="projects/:id" element={<ProjectDetail />} />
                        <Route path="projects/:id/edit" element={<ProtectedRoute roles={['admin']}><ProjectForm /></ProtectedRoute>} />
                        <Route path="tasks" element={<TaskBoard />} />
                        <Route path="clients" element={<ProtectedRoute roles={['admin']}><ClientList /></ProtectedRoute>} />
                        <Route path="reports" element={<ProtectedRoute roles={['admin']}><PerformanceReport /></ProtectedRoute>} />
                        <Route path="logs" element={<ProtectedRoute roles={['admin']}><ActivityLogPage /></ProtectedRoute>} />
                        <Route path="users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
