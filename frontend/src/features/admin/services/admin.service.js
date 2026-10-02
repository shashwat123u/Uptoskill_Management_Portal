import axios from 'axios';

export const adminApi = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const request = async (method, url, payload) => {
  try {
    const response = await adminApi({ method, url, data: payload });
    return response.data;
  } catch (error) {
    const data = error.response?.data;
    const validationMessage = data?.errors?.map(({ msg }) => msg).join(' ');
    throw new Error(
      validationMessage || data?.message || (error.response?.status === 500 ? 'Internal server error.' : 'Request failed.'),
      { cause: error }
    );
  }
};

export const createIntern = (payload) => request('post', '/api/admin/create-intern', payload);
export const createTeamLeader = (payload) => request('post', '/api/admin/create-tl', payload);
export const getAllTeamLeaders = () => request('get', '/api/admin/teamleaders');
export const getInternsByTeamLeader = (id) => request('get', `/api/admin/teamleaders/${id}/interns`);
export const getForwardedRequests = () => request('get', '/api/admin/forwarded-requests');
export const finalizeRequest = (id, action, rejectionReason) => request(
  'patch',
  `/api/admin/requests/${id}/finalize`,
  action === 'reject' ? { action, rejectionReason } : { action }
);
export const getCertificateDraft = (id) => request('get', `/api/admin/certificates/${id}`);
export const updateCertificateDraft = (id, htmlContent) => request('patch', `/api/admin/certificates/${id}`, { htmlContent });
export const finalizeCertificate = (id) => request('post', `/api/admin/certificates/${id}/finalize`);

export const createTemplate = (payload) => request('post', '/api/admin/templates', payload);
export const getAllTemplates = (params) => {
  const queryString = params
    ? '?' + new URLSearchParams(params).toString()
    : '';
  return request('get', `/api/admin/templates${queryString}`);
};
export const updateTemplate = (id, payload) => request('patch', `/api/admin/templates/${id}`, payload);
export const toggleTemplateActive = (id) => request('patch', `/api/admin/templates/${id}/toggle`);
export const generateCertificateDraft = (id) => request('post', `/api/admin/requests/${id}/generate-draft`);

export const getAdminAnalyticsOverview = (params) => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  return request('get', `/api/admin/analytics/overview${queryString}`);
};
export const getAdminAnalyticsRequestsTrend = (params) => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  return request('get', `/api/admin/analytics/requests-trend${queryString}`);
};
export const getAdminAnalyticsCertificateTypes = (params) => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  return request('get', `/api/admin/analytics/certificate-types${queryString}`);
};
export const getAdminAnalyticsTurnaround = (params) => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  return request('get', `/api/admin/analytics/turnaround${queryString}`);
};
export const getAdminAnalyticsTeamLeaders = (params) => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  return request('get', `/api/admin/analytics/team-leaders${queryString}`);
};
export const getAdminAnalyticsDomains = (params) => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  return request('get', `/api/admin/analytics/domains${queryString}`);
};
export const getAdminAnalyticsPipeline = (params) => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  return request('get', `/api/admin/analytics/pipeline${queryString}`);
};
export const getAdminAnalyticsUpcomingCompletions = (params) => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  return request('get', `/api/admin/analytics/upcoming-completions${queryString}`);
};
export const getAdminAnalyticsStuckRequests = (params) => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  return request('get', `/api/admin/analytics/stuck-requests${queryString}`);
};
export const exportAdminAnalytics = (params) => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  return adminApi.get(`/api/admin/analytics/export${queryString}`, { responseType: 'blob' });
};