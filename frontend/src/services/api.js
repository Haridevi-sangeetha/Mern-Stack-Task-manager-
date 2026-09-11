import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Endpoints
export const loginApi = (credentials) => api.post('/auth/login', credentials);
export const getProfileApi = () => api.get('/auth/profile');

// User Endpoints (Admin)
export const getEmployeesApi = () => api.get('/users/employees');
export const createEmployeeApi = (employeeData) => api.post('/users/employees', employeeData);

// Task Endpoints
export const getTaskStatsApi = () => api.get('/tasks/stats');
export const getAdminTasksApi = (params) => api.get('/tasks/admin', { params });
export const getEmployeeTasksApi = (params) => api.get('/tasks/my-tasks', { params });
export const createTaskApi = (taskData) => api.post('/tasks', taskData);
export const updateTaskApi = (id, taskData) => api.put(`/tasks/${id}`, taskData);
export const updateTaskStatusApi = (id, status) => api.patch(`/tasks/${id}/status`, { status });
export const deleteTaskApi = (id) => api.delete(`/tasks/${id}`);

export default api;
