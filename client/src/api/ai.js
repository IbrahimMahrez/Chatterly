import api from './axios';

export const askAI = (message) => api.post('/ai/chat', { message });

export const suggestPost = (topic) => api.post('/ai/suggest-post', { topic });
