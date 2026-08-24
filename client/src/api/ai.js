import api from './axios';

export const askAI = (message) => api.post('/ai/chat', { message });

export const suggestPost = (topic) => api.post('/ai/suggest-post', { topic });

export const summarizeConversation = (messages) => api.post('/ai/summarize-conversation', { messages });

export const suggestReplies = (messages) => api.post('/ai/suggest-replies', { messages });
