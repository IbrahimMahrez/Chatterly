import api from './axios';

export const getReminders = () => api.get('/reminders');
export const createReminder = (payload) => api.post('/reminders', payload);
export const updateReminder = (id, payload) => api.patch(`/reminders/${id}`, payload);
export const deleteReminder = (id) => api.delete(`/reminders/${id}`);
