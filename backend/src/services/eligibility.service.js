/**
 * Deterministic Eligibility Evaluation Engine
 * Evaluates citizen profile against structured scheme rules.
 * 
 * Categories (Mandatory 4 tiers):
 * 1. Appears Eligible: All mandatory conditions are satisfied.
 * 2. Possibly Eligible: Core conditions met, but some conditions unknown or conditional.
 * 3. Not Enough Information: Primary mandatory conditions are missing/unknown.
 * 4. Appears Ineligible: One or more mandatory conditions are explicitly unmet.
 */

export function evaluateSchemeEligibility(scheme, citizenProfile = {}) {
  const criteria = scheme.eligibilityCriteria || [];

  const satisfied = [];
  const unmet = [];
  const unknown = [];

  // 1. Age condition check (if scheme defines minAge/maxAge)
  if (scheme.minAge !== undefined || scheme.maxAge !== undefined) {
    const citizenAge = citizenProfile.age !== undefined && citizenProfile.age !== null ? Number(citizenProfile.age) : null;
    if (citizenAge === null) {
      unknown.push({
        id: 'age_check',
        label: `Age requirement: ${scheme.minAge || 0} to ${scheme.maxAge || 100} years`,
        reason: 'Citizen age not specified in profile.',
        mandatory: true,
      });
    } else {
      const minPass = scheme.minAge === undefined || citizenAge >= scheme.minAge;
      const maxPass = scheme.maxAge === undefined || citizenAge <= scheme.maxAge;
      if (minPass && maxPass) {
        satisfied.push({
          id: 'age_check',
          label: `Age: ${citizenAge} years (Meets range ${scheme.minAge || 0}-${scheme.maxAge || 100})`,
          mandatory: true,
        });
      } else {
        unmet.push({
          id: 'age_check',
          label: `Age requirement: ${scheme.minAge || 0} to ${scheme.maxAge || 100} years`,
          reason: `Citizen age (${citizenAge}) falls outside required range.`,
          mandatory: true,
        });
      }
    }
  }

  // 2. State residency check
  if (scheme.state && scheme.state !== 'All India') {
    const citizenState = citizenProfile.state ? citizenProfile.state.trim().toLowerCase() : null;
    const requiredState = scheme.state.trim().toLowerCase();

    if (!citizenState) {
      unknown.push({
        id: 'state_residency',
        label: `Must be a resident of ${scheme.state}`,
        reason: 'Citizen state of residence is not specified.',
        mandatory: true,
      });
    } else if (citizenState === requiredState) {
      satisfied.push({
        id: 'state_residency',
        label: `Resident of ${scheme.state}`,
        mandatory: true,
      });
    } else {
      unmet.push({
        id: 'state_residency',
        label: `Must be a resident of ${scheme.state}`,
        reason: `Citizen resides in ${citizenProfile.state}, but scheme is restricted to ${scheme.state}.`,
        mandatory: true,
      });
    }
  }

  // 3. Occupation matching check
  if (scheme.occupations && scheme.occupations.length > 0) {
    const citizenOcc = citizenProfile.occupation ? citizenProfile.occupation.trim().toLowerCase() : null;
    if (!citizenOcc) {
      unknown.push({
        id: 'occupation_check',
        label: `Targeted for: ${scheme.occupations.join(', ')}`,
        reason: 'Citizen occupation is not specified in profile.',
        mandatory: false,
      });
    } else {
      const matches = scheme.occupations.some((occ) => {
        const o = occ.toLowerCase();
        return citizenOcc.includes(o) || o.includes(citizenOcc) || occ === 'Any';
      });
      if (matches) {
        satisfied.push({
          id: 'occupation_check',
          label: `Occupation matches target group (${citizenProfile.occupation})`,
          mandatory: false,
        });
      } else {
        unknown.push({
          id: 'occupation_check',
          label: `Targeted primarily for: ${scheme.occupations.join(', ')}`,
          reason: `Citizen occupation is ${citizenProfile.occupation}. May require verification by scheme authority.`,
          mandatory: false,
        });
      }
    }
  }

  // 4. Custom structured rules evaluation
  for (const rule of criteria) {
    const userVal = citizenProfile[rule.field];

    if (userVal === undefined || userVal === null) {
      unknown.push({
        id: rule.id,
        label: rule.label,
        reason: 'Information not provided in profile.',
        mandatory: rule.mandatory,
      });
      continue;
    }

    let pass = false;
    switch (rule.operator) {
      case 'eq':
        pass = userVal === rule.value;
        break;
      case 'ne':
        pass = userVal !== rule.value;
        break;
      case 'gt':
        pass = Number(userVal) > Number(rule.value);
        break;
      case 'gte':
        pass = Number(userVal) >= Number(rule.value);
        break;
      case 'lt':
        pass = Number(userVal) < Number(rule.value);
        break;
      case 'lte':
        pass = Number(userVal) <= Number(rule.value);
        break;
      case 'in':
        pass = Array.isArray(rule.value) && rule.value.includes(userVal);
        break;
      default:
        pass = Boolean(userVal);
    }

    if (pass) {
      satisfied.push({
        id: rule.id,
        label: rule.label,
        mandatory: rule.mandatory,
      });
    } else {
      if (rule.mandatory) {
        unmet.push({
          id: rule.id,
          label: rule.label,
          reason: 'Requirement does not appear to be satisfied.',
          mandatory: true,
        });
      } else {
        unknown.push({
          id: rule.id,
          label: rule.label,
          reason: 'Conditional requirement requires official documentation.',
          mandatory: false,
        });
      }
    }
  }

  // 5. Determine Overall Assessment Category (Exact 4 tiers)
  let category = 'Not Enough Information';
  let summary = '';

  const hasMandatoryUnmet = unmet.some((u) => u.mandatory);
  const totalConditions = satisfied.length + unmet.length + unknown.length;

  if (hasMandatoryUnmet) {
    category = 'Appears Ineligible';
    summary = 'Based on your profile, one or more mandatory eligibility requirements do not appear to be met.';
  } else if (unknown.length === 0 && satisfied.length > 0) {
    category = 'Appears Eligible';
    summary = 'Based on your profile, you appear to satisfy all known statutory requirements.';
  } else if (satisfied.length >= Math.ceil(totalConditions * 0.4) && satisfied.length > 0) {
    category = 'Possibly Eligible';
    summary = 'You satisfy several key criteria, but additional verification records are needed to confirm.';
  } else {
    category = 'Not Enough Information';
    summary = 'Not enough demographic or household information was provided to determine eligibility.';
  }

  return {
    schemeId: scheme._id || scheme.id,
    schemeSlug: scheme.slug,
    schemeName: scheme.name,
    category,
    summary,
    satisfied,
    unknown,
    unmet,
    verificationProvenance: {
      sourceAuthority: scheme.sourceAuthority,
      lastVerifiedDate: scheme.lastVerifiedDate,
      dataClassification: scheme.dataClassification,
      disclaimer: 'This evaluation is informational only. Final eligibility decisions are made solely by the respective government authority.',
    },
  };
}

export default {
  evaluateSchemeEligibility,
};
