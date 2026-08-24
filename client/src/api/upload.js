import api from './axios';

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadAudio = (file) => {
  const formData = new FormData();
  formData.append('audio', file, 'voice-message.webm');
  return api.post('/upload/audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadAttachment = (file) => {
  const formData = new FormData();
  formData.append('attachment', file);
  return api.post('/upload/attachment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
