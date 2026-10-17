import SavedScheme from '../models/SavedScheme.model.js';
import Scheme from '../models/Scheme.model.js';
import logger from '../utils/logger.js';

/**
 * GET /api/saved-schemes
 * Retrieve all schemes saved/bookmarked by the authenticated user
 */
export async function getSavedSchemes(req, res, next) {
  try {
    const saved = await SavedScheme.find({ user: req.user._id })
      .populate('scheme')
      .sort({ createdAt: -1 })
      .lean();

    // Map out populated scheme records
    const schemes = saved.map((item) => ({
      savedId: item._id,
      notes: item.notes,
      savedAt: item.savedAt,
      scheme: item.scheme,
    }));

    res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/saved-schemes
 * Bookmark a scheme for the authenticated user
 */
export async function saveScheme(req, res, next) {
  try {
    const { schemeSlug, notes } = req.body;

    if (!schemeSlug) {
      return res.status(400).json({
        success: false,
        error: { message: 'schemeSlug is required to save a scheme.', code: 'MISSING_SLUG' },
      });
    }

    // Lookup scheme by slug or ObjectId
    let scheme = null;
    if (schemeSlug.match(/^[0-9a-fA-F]{24}$/)) {
      scheme = await Scheme.findById(schemeSlug);
    }
    if (!scheme) {
      scheme = await Scheme.findOne({ slug: schemeSlug.toLowerCase().trim() });
    }

    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: { message: 'Scheme record not found.', code: 'SCHEME_NOT_FOUND' },
      });
    }

    // Check if already saved
    const existing = await SavedScheme.findOne({
      user: req.user._id,
      schemeSlug: scheme.slug,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Scheme is already in your saved bookmarks.',
        data: existing,
      });
    }

    const saved = await SavedScheme.create({
      user: req.user._id,
      scheme: scheme._id,
      schemeSlug: scheme.slug,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Scheme saved successfully to citizen dashboard.',
      data: saved,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Scheme already bookmarked.',
      });
    }
    next(error);
  }
}

/**
 * DELETE /api/saved-schemes/:schemeSlug
 * Remove a scheme from citizen's bookmarks
 */
export async function removeSavedScheme(req, res, next) {
  try {
    const { schemeSlug } = req.params;

    const result = await SavedScheme.findOneAndDelete({
      user: req.user._id,
      schemeSlug: schemeSlug.toLowerCase().trim(),
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Saved bookmark not found in your account.',
          code: 'BOOKMARK_NOT_FOUND',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Scheme removed from saved bookmarks.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/saved-schemes/check/:schemeSlug
 * Check if a specific scheme is saved by the current user
 */
export async function checkSavedStatus(req, res, next) {
  try {
    const { schemeSlug } = req.params;

    const existing = await SavedScheme.findOne({
      user: req.user._id,
      schemeSlug: schemeSlug.toLowerCase().trim(),
    });

    res.status(200).json({
      success: true,
      isSaved: Boolean(existing),
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getSavedSchemes,
  saveScheme,
  removeSavedScheme,
  checkSavedStatus,
};
