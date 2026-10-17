import Scheme from '../models/Scheme.model.js';
import logger from './logger.js';
import { ALL_59_SCHEMES } from './stateSchemesData.js';

// Specific deadlines for key schemes
const SCHEME_DEADLINE_OVERRIDES = {
  'pm-kisan': { deadline: '31 March 2027 (Open for FY 2026-27 / 17th Installment)', date: '2027-03-31T23:59:59.000Z', status: 'OPEN' },
  'ayushman-bharat-pmjay': { deadline: 'Continuous Enrollment (Open 365 Days)', date: '2027-12-31T23:59:59.000Z', status: 'ONGOING' },
  'gruha-lakshmi-karnataka': { deadline: 'Continuous Enrollment (Seva Sindhu)', date: '2027-12-31T23:59:59.000Z', status: 'ONGOING' },
  'pm-svanidhi': { deadline: '31 December 2026 (Extended Lending Phase)', date: '2026-12-31T23:59:59.000Z', status: 'OPEN' },
  'pm-awas-yojana-gramin': { deadline: '31 March 2027 (PMAY 2.0 Target Allocation)', date: '2027-03-31T23:59:59.000Z', status: 'OPEN' },
  'vidyasiri-karnataka': { deadline: '31 January 2027 (Annual Academic Cycle)', date: '2027-01-31T23:59:59.000Z', status: 'CLOSING_SOON' },
  'yuva-nidhi-karnataka': { deadline: '31 March 2027 (Rolling Graduate Window)', date: '2027-03-31T23:59:59.000Z', status: 'OPEN' },
  'gruha-jyothi-karnataka': { deadline: 'Continuous Zero-Bill Registration', date: '2027-12-31T23:59:59.000Z', status: 'ONGOING' },
  'shakti-smart-card-karnataka': { deadline: 'Continuous Smart Card Issuance', date: '2027-12-31T23:59:59.000Z', status: 'ONGOING' },
  'sukanya-samriddhi-yojana': { deadline: 'Open Throughout Year (Up to Child Age 10)', date: '2027-12-31T23:59:59.000Z', status: 'ONGOING' },
  'pradhan-mantri-matru-vandana-yojana': { deadline: 'Within 270 Days of LMP Date', date: '2027-06-30T23:59:59.000Z', status: 'OPEN' },
  'atal-pension-yojana': { deadline: 'Continuous Enrollment (Ages 18-40)', date: '2027-12-31T23:59:59.000Z', status: 'ONGOING' },
  'pradhan-mantri-mudra-yojana': { deadline: 'Continuous Lending Window (FY 2026-27)', date: '2027-03-31T23:59:59.000Z', status: 'OPEN' },
};

export const INITIAL_SCHEMES = ALL_59_SCHEMES.map((scheme) => {
  const override = SCHEME_DEADLINE_OVERRIDES[scheme.slug] || {
    deadline: '31 March 2027 (Open for FY 2026-27 Enrollment)',
    date: '2027-03-31T23:59:59.000Z',
    status: 'OPEN',
  };

  return {
    ...scheme,
    applicationDeadline: scheme.applicationDeadline || override.deadline,
    deadlineDate: scheme.deadlineDate || new Date(override.date),
    deadlineStatus: scheme.deadlineStatus || override.status,
  };
});

/**
 * Seed or update schemes in the database
 */
export async function seedSchemesIfEmpty() {
  try {
    for (const schemeData of INITIAL_SCHEMES) {
      await Scheme.findOneAndUpdate(
        { slug: schemeData.slug },
        { $set: schemeData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    const count = await Scheme.countDocuments();
    logger.info(`Successfully synchronized ${count} government welfare schemes with deadlines in database.`);
  } catch (error) {
    logger.error('Failed to seed schemes into database', error);
  }
}

export default {
  INITIAL_SCHEMES,
  seedSchemesIfEmpty,
};
