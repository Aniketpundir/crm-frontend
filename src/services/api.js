import axios from 'axios';

const API = axios.create({ baseURL: 'https://187.127.135.158.sslip.io/api' });
// const API = axios.create({ baseURL: 'http://localhost:5000/api' });


API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// Auth
export const loginAPI = (data) => API.post('/auth/login', data);
export const registerAPI = (data) => API.post('/auth/register', data);
export const getMeAPI = () => API.get('/auth/me');

// Users
export const getUsersAPI = (role) => API.get(`/users${role ? `?role=${role}` : ''}`);
export const createUserAPI = (data) => API.post('/users', data);
export const updateUserAPI = (id, data) => API.put(`/users/${id}`, data);
export const deleteUserAPI = (id) => API.delete(`/users/${id}`);

// Clients
export const getClientsAPI = () => API.get('/clients');
export const getClientAPI = (id) => API.get(`/clients/${id}`);
export const createClientAPI = (data) => API.post('/clients', data);
export const updateClientAPI = (id, data) => API.put(`/clients/${id}`, data);
export const deleteClientAPI = (id) => API.delete(`/clients/${id}`);

// Projects
export const getProjectsAPI = () => API.get('/projects');
export const getProjectAPI = (id) => API.get(`/projects/${id}`);
export const createProjectAPI = (data) => API.post('/projects', data);
export const updateProjectAPI = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProjectAPI = (id) => API.delete(`/projects/${id}`);
export const addPhaseAPI = (id, data) => API.post(`/projects/${id}/phases`, data);
export const deletePhaseAPI = (projectId, phaseId) => API.delete(`/projects/${projectId}/phases/${phaseId}`);

// Tasks
export const getTasksAPI = (params) => API.get('/tasks', { params });
export const getTaskAPI = (id) => API.get(`/tasks/${id}`);
export const createTaskAPI = (data) => API.post('/tasks', data);
export const updateTaskAPI = (id, data) => API.put(`/tasks/${id}`, data);
export const updateTaskStatusAPI = (id, status) => API.put(`/tasks/${id}/status`, { status });
export const deleteTaskAPI = (id) => API.delete(`/tasks/${id}`);
export const addCommentAPI = (id, text) => API.post(`/tasks/${id}/comments`, { text });
export const uploadFileAPI = (id, formData) => API.post(`/tasks/${id}/upload`, formData);

// Reports
export const getDashboardAPI = () => API.get('/reports/dashboard');
export const getPerformanceAPI = () => API.get('/reports/performance');
export const getProjectReportAPI = (id) => API.get(`/reports/project/${id}`);

// Logs
export const getLogsAPI = (page = 1) => API.get(`/logs?page=${page}`);

export default API;
