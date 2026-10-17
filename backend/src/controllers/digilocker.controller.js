import digilockerService from '../services/digilocker.service.js';
import envConfig from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * GET /api/digilocker/status
 * Get citizen DigiLocker connection status, configuration guide, and available documents
 */
export async function getStatus(req, res, next) {
  try {
    const statusData = await digilockerService.getDigiLockerStatus(req.user._id);
    res.status(200).json({
      success: true,
      ...statusData,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/digilocker/auth-url
 * Generate official DigiLocker OAuth 2.0 authorization URL with CSRF state
 */
export async function getAuthUrl(req, res, next) {
  try {
    const authData = await digilockerService.getAuthUrl(req.user._id);
    res.status(200).json({
      success: true,
      ...authData,
    });
  } catch (error) {
    if (error.isConfigError) {
      return res.status(503).json({
        success: false,
        isConfigured: false,
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * GET /api/digilocker/callback
 * Official OAuth 2.0 callback endpoint invoked by DigiLocker redirect
 */
export async function handleCallback(req, res) {
  const { code, state, error: oauthError, error_description } = req.query;
  const frontendUrl = envConfig.FRONTEND_URL || 'http://localhost:3000';

  // Handle user cancellation or denial
  if (oauthError) {
    logger.warn(`DigiLocker OAuth authorization denied: ${oauthError} - ${error_description}`);
    const reason = encodeURIComponent(error_description || oauthError || 'Authorization was denied by user');
    return res.redirect(`${frontendUrl}/dashboard?digilocker=denied&message=${reason}`);
  }

  if (!code || !state) {
    return res.redirect(
      `${frontendUrl}/dashboard?digilocker=error&message=${encodeURIComponent('Missing authorization code or state parameter.')}`
    );
  }

  try {
    await digilockerService.handleOAuthCallback(code, state);
    logger.info('DigiLocker OAuth flow completed successfully. Redirecting citizen to dashboard.');
    return res.redirect(`${frontendUrl}/dashboard?digilocker=success`);
  } catch (err) {
    logger.error('DigiLocker OAuth callback processing failed:', err.message);
    return res.redirect(
      `${frontendUrl}/dashboard?digilocker=error&message=${encodeURIComponent(err.message || 'Authorization failed')}`
    );
  }
}

/**
 * POST /api/digilocker/select-documents
 * Citizen voluntarily selects and authorizes specific documents to share for scheme matching
 */
export async function selectDocuments(req, res, next) {
  try {
    const { documentIds = [], consentDeclaration } = req.body;
    const result = await digilockerService.selectDocuments(req.user._id, documentIds, consentDeclaration);
    res.status(200).json({
      success: true,
      message: `${result.selectedDocuments.length} document(s) authorized and verified for scheme eligibility.`,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/digilocker/fetch-document
 * Fetch details / metadata of an authorized document
 */
export async function fetchDocument(req, res, next) {
  try {
    const { docId } = req.body;
    if (!docId) {
      return res.status(400).json({ success: false, message: 'Document ID is required.' });
    }
    const result = await digilockerService.fetchDocument(req.user._id, docId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/digilocker/disconnect
 * Unlink citizen DigiLocker account and purge tokens
 */
export async function disconnect(req, res, next) {
  try {
    await digilockerService.unlinkDigiLockerAccount(req.user._id);
    res.status(200).json({
      success: true,
      message: 'DigiLocker vault disconnected and tokens revoked successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/digilocker/connect (Legacy test-support endpoint)
 */
export async function connect(req, res, next) {
  try {
    const { simulatedOtp } = req.body;
    const account = await digilockerService.linkDigiLockerAccount(req.user, { simulatedOtp });
    res.status(200).json({
      success: true,
      message: 'DigiLocker connected.',
      account,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getStatus,
  getAuthUrl,
  handleCallback,
  selectDocuments,
  fetchDocument,
  disconnect,
  connect,
};
