import api from './axios';
export const joinPulse = (choices) => api.post('/pulse/join', choices);
