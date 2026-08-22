import api from './axios';

export const getUserProfile = (id) => api.get(`/users/${id}`);

export const updateUserProfile = (id, data) => api.put(`/users/${id}`, data);

export const followUser = (id) => api.post(`/users/${id}/follow`);

export const getFollowingFeed = (page = 1, limit = 10) =>
  api.get('/users/feed', { params: { page, limit } });
