import apiClient from './client';

/**
 * Fetch all applications submitted by citizen
 */
export async function fetchUserApplications() {
  const response = await apiClient.get('/applications');
  return response.data;
}

/**
 * Fetch single application details with agent audit log
 */
export async function fetchApplicationDetail(id) {
  const response = await apiClient.get(`/applications/${id}`);
  return response.data;
}

/**
 * Check citizen readiness and prerequisite matching for scheme
 */
export async function checkSchemeReadiness(schemeSlug) {
  const response = await apiClient.get(`/applications/check/${schemeSlug}`);
  return response.data;
}

/**
 * Auto-fill scheme application form parameters using DigiLocker data
 */
export async function prefillSchemeApplication(schemeSlug) {
  const response = await apiClient.post('/applications/prefill', { schemeSlug });
  return response.data;
}

/**
 * Submit scheme application on citizen's behalf via AI Agent
 */
export async function submitSchemeApplication(payload) {
  const response = await apiClient.post('/applications/apply', payload);
  return response.data;
}

export default {
  fetchUserApplications,
  fetchApplicationDetail,
  checkSchemeReadiness,
  prefillSchemeApplication,
  submitSchemeApplication,
};
