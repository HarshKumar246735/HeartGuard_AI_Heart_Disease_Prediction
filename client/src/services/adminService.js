import api from './api';

export const getStatistics = () => api.get('/admin/statistics').then((r) => r.data);
export const listUsers = (params) => api.get('/admin/users', { params }).then((r) => r.data.users);
export const getUser = (id) => api.get(`/admin/users/${id}`).then((r) => r.data);
export const setUserStatus = (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }).then((r) => r.data.user);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`).then((r) => r.data);
export const listAllAssessments = (params) => api.get('/admin/assessments', { params }).then((r) => r.data.assessments);
export const getAdminAssessment = (id) => api.get(`/admin/assessments/${id}`).then((r) => r.data.assessment);
export const deleteAdminAssessment = (id) => api.delete(`/admin/assessments/${id}`).then((r) => r.data);
