import api from './api';

export const register = (data) => api.post('/auth/register', data).then((r) => r.data);
export const login = (data) => api.post('/auth/login', data).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data.user);
export const updateProfile = (data) => api.put('/auth/profile', data).then((r) => r.data.user);
export const changePassword = (data) => api.put('/auth/change-password', data).then((r) => r.data);
export const deleteAccount = (password) => api.delete('/auth/me', { data: { password } }).then((r) => r.data);
