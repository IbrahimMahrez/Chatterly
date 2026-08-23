import api from './axios';

export const getComments = (postId) =>
  api.get(`/comments/posts/${postId}/comments`);

export const createComment = (postId, content) =>
  api.post(`/comments/posts/${postId}/comments`, { content });

export const deleteComment = (id) => api.delete(`/comments/${id}`);

export const likeComment = (id) => api.post(`/comments/${id}/like`);
