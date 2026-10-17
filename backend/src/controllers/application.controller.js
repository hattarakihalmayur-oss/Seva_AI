import applicationAgentService from '../services/applicationAgent.service.js';
import logger from '../utils/logger.js';

/**
 * GET /api/applications
 * List all applications submitted by citizen
 */
export async function listApplications(req, res, next) {
  try {
    const applications = await applicationAgentService.getCitizenApplications(req.user._id);
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/applications/:id
 * Get single application details with audit log and receipt
 */
export async function getApplication(req, res, next) {
  try {
    const application = await applicationAgentService.getApplicationDetails(req.user._id, req.params.id);
    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/applications/check/:schemeSlug
 * Check readiness and status of citizen for a specific scheme
 */
export async function checkReadiness(req, res, next) {
  try {
    const { schemeSlug } = req.params;
    const readiness = await applicationAgentService.assessSchemeReadiness(req.user._id, schemeSlug);
    res.status(200).json({
      success: true,
      data: readiness,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/applications/prefill
 * Generate prefilled application parameters using DigiLocker
 */
export async function prefill(req, res, next) {
  try {
    const { schemeSlug } = req.body;
    if (!schemeSlug) {
      return res.status(400).json({
        success: false,
        error: { message: 'Scheme slug is required.', code: 'MISSING_PARAM' },
      });
    }

    const prefilledData = await applicationAgentService.prefillApplication(req.user._id, schemeSlug);
    res.status(200).json({
      success: true,
      data: prefilledData,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/applications/apply
 * Execute autonomous application submission on citizen's behalf
 */
export async function apply(req, res, next) {
  try {
    const { schemeSlug, formData, consentData } = req.body;
    if (!schemeSlug) {
      return res.status(400).json({
        success: false,
        error: { message: 'Scheme slug is required.', code: 'MISSING_PARAM' },
      });
    }

    const result = await applicationAgentService.executeApplicationSubmission(
      req.user._id,
      schemeSlug,
      formData || {},
      consentData || {}
    );

    if (!result.success && result.isDuplicate) {
      return res.status(409).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export default {
  listApplications,
  getApplication,
  checkReadiness,
  prefill,
  apply,
};
