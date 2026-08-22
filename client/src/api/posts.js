import api from './axios';

export const getPosts = (page = 1, limit = 10) =>
  api.get('/posts', { params: { page, limit } });

export const getPostById = (id) => api.get(`/posts/${id}`);

export const createPost = (data) => api.post('/posts', data);

export const deletePost = (id) => api.delete(`/posts/${id}`);

export const likePost = (id) => api.post(`/posts/${id}/like`);
