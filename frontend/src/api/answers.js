import api from './axios';

export const answersApi = {
  getByDoubt: (doubtId) => api.get(`/doubts/${doubtId}/answers`),
  create: (doubtId, data) => api.post(`/doubts/${doubtId}/answers`, data),
  accept: (answerId) => api.put(`/answers/${answerId}/accept`),
};
