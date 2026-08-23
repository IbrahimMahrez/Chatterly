import api from './axios';

export const forgotPassword = (email) =>
  api.post('/password/api/forgot', { email });

export const resetPassword = (userId, token, password) =>
  api.post(`/password/api/reset/${userId}/${token}`, { password });
