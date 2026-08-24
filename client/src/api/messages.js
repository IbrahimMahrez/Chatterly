import api from './axios';

export const getSavedMessages = () => api.get('/messages/saved');

export const searchMessages = (query) => api.get('/messages/search', { params: { q: query } });

export const saveMessage = (id) => api.post(`/messages/${id}/save`);
