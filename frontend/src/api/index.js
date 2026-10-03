import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  refresh:  (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout:   (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me:       () => api.get('/auth/me'),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  createUser:   (data) => api.post('/admin/users', data),
  listUsers:    (params) => api.get('/admin/users', { params }),
  getUserDetail:(id) => api.get(`/admin/users/${id}`),
  createStore:  (data) => api.post('/admin/stores', data),
  listStores:   (params) => api.get('/admin/stores', { params }),
};

export const userAPI = {
  listStores:   (params) => api.get('/user/stores', { params }),
  submitRating: (storeId, rating) => api.post(`/user/stores/${storeId}/ratings`, { rating }),
};

export const ownerAPI = {
  getDashboard: (params) => api.get('/owner/dashboard', { params }),
};
