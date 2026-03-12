import api from './axios';

export const adminApi = {
  getUsers: (page = 0, size = 20) => api.get('/admin/users', { params: { page, size } }),
  banUser: (id) => api.put(`/admin/users/${id}/ban`),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
  getDoubts: (page = 0, size = 20) => api.get('/admin/doubts', { params: { page, size } }),
  deleteDoubt: (id) => api.delete(`/admin/doubts/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
};
