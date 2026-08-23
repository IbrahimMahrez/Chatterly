import api from './axios';

export const getStories = () => api.get('/stories');

export const createStory = (image) => api.post('/stories', { image });

export const deleteStory = (id) => api.delete(`/stories/${id}`);