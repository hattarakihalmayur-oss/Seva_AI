import apiClient from './client';

/**
 * Fetch DigiLocker connection status, configuration guide, and documents
 */
export async function fetchDigiLockerStatus() {
  const response = await apiClient.get('/digilocker/status');
  return response.data;
}

/**
 * Generate official DigiLocker OAuth 2.0 Authorization URL with CSRF state
 */
export async function fetchDigiLockerAuthUrl() {
  const response = await apiClient.get('/digilocker/auth-url');
  return response.data;
}

/**
 * Citizen voluntarily selects and authorizes documents to share for scheme eligibility
 */
export async function selectDigiLockerDocuments(documentIds, consentDeclaration) {
  const response = await apiClient.post('/digilocker/select-documents', {
    documentIds,
    consentDeclaration,
  });
  return response.data;
}

/**
 * Fetch details or verify an authorized document
 */
export async function fetchDigiLockerDocument(docId) {
  const response = await apiClient.post('/digilocker/fetch-document', { docId });
  return response.data;
}

/**
 * Disconnect DigiLocker vault and revoke access tokens
 */
export async function disconnectDigiLocker() {
  const response = await apiClient.post('/digilocker/disconnect');
  return response.data;
}

/**
 * Synchronize or refresh DigiLocker status and available documents
 */
export async function syncDigiLockerDocuments() {
  const status = await fetchDigiLockerStatus();
  return {
    success: true,
    documents: status?.account?.documents || status?.account?.availableFiles || [],
    account: status?.account || null,
  };
}

/**
 * Legacy linking helper (maintained for test compatibility)
 */
export async function linkDigiLockerAccount(payload) {
  const response = await apiClient.post('/digilocker/connect', payload);
  return response.data;
}

export default {
  fetchDigiLockerStatus,
  fetchDigiLockerAuthUrl,
  selectDigiLockerDocuments,
  fetchDigiLockerDocument,
  disconnectDigiLocker,
  syncDigiLockerDocuments,
  linkDigiLockerAccount,
};
