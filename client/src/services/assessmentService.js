import api from './api';

export const createAssessment = (data) => api.post('/assessments', data).then((r) => r.data.assessment);
export const listAssessments = (params) => api.get('/assessments', { params }).then((r) => r.data.assessments);
export const getAssessment = (id) => api.get(`/assessments/${id}`).then((r) => r.data.assessment);
export const deleteAssessment = (id) => api.delete(`/assessments/${id}`).then((r) => r.data);
export const getDashboard = () => api.get('/analytics/dashboard').then((r) => r.data);

export async function downloadReport(id) {
  const res = await api.get(`/assessments/${id}/pdf`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `heartguard-assessment-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
