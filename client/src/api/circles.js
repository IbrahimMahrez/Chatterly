import api from './axios';

export const getCircles = () => api.get('/circles');
export const createCircle = (payload) => api.post('/circles', payload);
export const joinCircle = (id) => api.post(`/circles/${id}/join`);
export const addCircleCheckIn = (id, text) => api.post(`/circles/${id}/check-in`, { text });
