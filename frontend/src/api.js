import axios from 'axios';

const API = axios.create({ baseURL: 'http://127.0.0.1:5000/api' });

API.interceptors.request.use((request) => {
  const token = localStorage.getItem('token');
  if (token) request.headers.Authorization = `Bearer ${token}`;
  console.log('🚀 Starting Request', request.method?.toUpperCase(), request.url, request.data || '');
  return request;
});

export const register = (formData) => API.post('/auth/register', formData);
export const login = (formData) => API.post('/auth/login', formData);
export const getMe = () => API.get('/auth/me');

export const getBuses = () => API.get('/buses');
export const createBus = (data) => API.post('/buses', data);
export const updateBus = (id, data) => API.patch(`/buses/${id}`, data);
export const deleteBus = (id) => API.delete(`/buses/${id}`);

export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = () => API.get('/admin/users');
export const updateAdminUser = (id, data) => API.patch(`/admin/users/${id}`, data);
export const deleteAdminUser = (id) => API.delete(`/admin/users/${id}`);
export const getNotifications = () => API.get('/admin/notifications');
export const createNotification = (data) => API.post('/admin/notifications', data);
export const updateAdminProfile = (data) => API.patch('/admin/profile', data);

export const getReports = () => API.get('/reports');
export const updateReport = (id, data) => API.patch(`/reports/${id}`, data);
export const createReport = (data) => API.post('/reports', data);

export default API;
