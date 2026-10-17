import Scheme from '../models/Scheme.model.js';
import { INITIAL_SCHEMES } from '../utils/seedData.js';
import logger from '../utils/logger.js';
import { autoDiscoverAndSaveScheme } from '../services/schemeDiscovery.service.js';

/**
 * GET /api/schemes
 * Search & discover schemes with filtering & pagination
 */
export async function getSchemes(req, res, next) {
  try {
    const {
      q,
      type,
      sector,
      state,
      assessmentCategory,
      page = 1,
      limit = 20,
    } = req.query;

    const queryFilter = {};

    // Search query
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      queryFilter.$or = [
        { name: regex },
        { shortName: regex },
        { description: regex },
        { authority: regex },
        { sector: regex },
        { targetBeneficiaries: regex },
      ];
    }

    // Type filter (Central / State)
    if (type && type !== 'All') {
      queryFilter.type = type;
    }

    // Sector filter
    if (sector && sector !== 'All') {
      queryFilter.sector = new RegExp(sector, 'i');
    }

    // State filter
    if (state && state !== 'All') {
      if (state === 'All India') {
        queryFilter.state = 'All India';
      } else {
        queryFilter.state = { $in: ['All India', state] };
      }
    }

    // Assessment category filter
    if (assessmentCategory && assessmentCategory !== 'All') {
      queryFilter.assessmentCategory = assessmentCategory;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    let [schemes, total] = await Promise.all([
      Scheme.find(queryFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Scheme.countDocuments(queryFilter),
    ]);

    // Autonomous auto-discovery if query yielded zero results
    let newlyDiscovered = false;
    if (schemes.length === 0 && q && q.trim().length >= 3) {
      try {
        const discovered = await autoDiscoverAndSaveScheme(q.trim());
        if (discovered) {
          schemes = [discovered];
          total = 1;
          newlyDiscovered = true;
        }
      } catch (discErr) {
        logger.warn(`Auto-discovery check failed: ${discErr.message}`);
      }
    }

    res.status(200).json({
      success: true,
      count: schemes.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      newlyDiscovered,
      data: schemes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/schemes/:identifier
 * Retrieve a single scheme by slug or MongoDB ObjectId
 */
export async function getSchemeByIdentifier(req, res, next) {
  try {
    const { identifier } = req.params;

    let scheme = null;

    // Check if identifier is a valid MongoDB ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      scheme = await Scheme.findById(identifier).lean();
    }

    // Fall back to slug lookup
    if (!scheme) {
      scheme = await Scheme.findOne({ slug: identifier.toLowerCase().trim() }).lean();
    }

    // Autonomous auto-discovery if scheme was not found by slug
    if (!scheme && identifier && identifier.trim().length >= 3) {
      try {
        scheme = await autoDiscoverAndSaveScheme(identifier.trim());
      } catch (discErr) {
        logger.warn(`Auto-discovery for identifier '${identifier}' failed: ${discErr.message}`);
      }
    }

    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Scheme with identifier '${identifier}' was not found.`,
          code: 'SCHEME_NOT_FOUND',
          statusCode: 404,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/schemes/seed
 * Seed or re-seed the verified schemes into the database
 */
export async function seedSchemes(req, res, next) {
  try {
    await Scheme.deleteMany({ slug: /non-existent/ });
    for (const schemeData of INITIAL_SCHEMES) {
      await Scheme.findOneAndUpdate(
        { slug: schemeData.slug },
        schemeData,
        { upsert: true, new: true }
      );
    }

    const count = await Scheme.countDocuments();
    res.status(200).json({
      success: true,
      message: `Database successfully seeded with ${count} government welfare schemes.`,
      count,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getSchemes,
  getSchemeByIdentifier,
  seedSchemes,
};
