import api from './axios';

export const getUserDashboard = () => api.get('/users/dashboard');

export const getAdminDashboard = () => api.get('/admin/dashboard');
