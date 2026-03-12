import api from './axios';

export const doubtsApi = {
  getAll: (page = 0, size = 10) => api.get('/doubts', { params: { page, size } }),
  getById: (id) => api.get(`/doubts/${id}`),
  search: (query, page = 0, size = 10) => api.get('/doubts/search', { params: { q: query, page, size } }),
  getByStatus: (status, page = 0, size = 10) => api.get(`/doubts/status/${status}`, { params: { page, size } }),
  getByUser: (userId, page = 0, size = 10) => api.get(`/doubts/user/${userId}`, { params: { page, size } }),
  create: (data) => api.post('/doubts', data),
  update: (id, data) => api.put(`/doubts/${id}`, data),
  delete: (id) => api.delete(`/doubts/${id}`),
  findSimilar: (title) => api.post('/doubts/similar', { title }),

};
