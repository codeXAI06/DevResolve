import api from './axios';

export const tagsApi = {
  getAll: () => api.get('/tags'),
  getTrending: (limit = 10) => api.get('/tags/trending', { params: { limit } }),
  search: (q) => api.get('/tags/search', { params: { q } }),
};

export const rewardsApi = {
  getAvailable: () => api.get('/users/me/rewards'),
  redeem: (rewardId) => api.post('/users/me/rewards/redeem', { rewardId }),
};

export const collabApi = {
  createRoom: (data) => api.post('/collab/room', data),
  getRoom: (id) => api.get(`/collab/room/${id}`),
  getActiveRooms: () => api.get('/collab/rooms/active'),
  getMyRooms: () => api.get('/collab/rooms/my'),
  joinRoom: (id) => api.post(`/collab/room/${id}/join`),
  closeRoom: (id) => api.delete(`/collab/room/${id}`),
  saveCode: (id, code) => api.put(`/collab/room/${id}/code`, { code }),
};

export const usersApi = {
  getDashboard: (id) => api.get(`/users/${id}/dashboard`),
  getProfile: (username) => api.get(`/users/profile/${username}`),
  getTop: (page = 0, size = 10) => api.get('/users/top', { params: { page, size } }),
};
