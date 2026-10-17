import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../app.js';
import envConfig from '../config/env.js';
import { evaluateSchemeEligibility } from '../services/eligibility.service.js';
import { extractIntentAndAttributes } from '../services/nlu.service.js';

test('AI & Deterministic Eligibility Engine Tests', async (t) => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(envConfig.MONGODB_URI);
  }

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/ai`;

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  });

  const dummyScheme = {
    slug: 'test-scheme',
    name: 'Test Welfare Scheme',
    sector: 'Agriculture',
    type: 'Central',
    state: 'All India',
    authority: 'Ministry of Agriculture',
    minAge: 18,
    maxAge: 70,
    occupations: ['Farmer'],
    sourceAuthority: 'Ministry of Agriculture',
    lastVerifiedDate: '2026-03-01',
    dataClassification: 'DEMO_VERIFIED',
    eligibilityCriteria: [
      { id: 'land', label: 'Must own cultivable land', mandatory: true, field: 'landholding', operator: 'gt', value: 0 },
      { id: 'tax', label: 'Must not pay income tax', mandatory: true, field: 'isTaxpayer', operator: 'eq', value: false },
    ],
  };

  await t.test('Eligibility Engine - Evaluates "Appears Eligible" when conditions met', () => {
    const profile = { age: 35, occupation: 'Farmer', landholding: 2, isTaxpayer: false };
    const result = evaluateSchemeEligibility(dummyScheme, profile);

    assert.equal(result.category, 'Appears Eligible');
    assert.equal(result.unmet.length, 0);
    assert.ok(result.satisfied.length >= 3);
  });

  await t.test('Eligibility Engine - Evaluates "Appears Ineligible" when mandatory condition fails', () => {
    const profile = { age: 35, occupation: 'Farmer', landholding: 2, isTaxpayer: true };
    const result = evaluateSchemeEligibility(dummyScheme, profile);

    assert.equal(result.category, 'Appears Ineligible');
    assert.ok(result.unmet.some((u) => u.id === 'tax'));
  });

  await t.test('Eligibility Engine - Evaluates "Not Enough Information" when profile is empty', () => {
    const profile = {};
    const result = evaluateSchemeEligibility(dummyScheme, profile);

    assert.equal(result.category, 'Not Enough Information');
    assert.ok(result.unknown.length >= 2);
  });

  await t.test('NLU Engine - Extracts intent and entities in Indian languages', async () => {
    const nluHindi = await extractIntentAndAttributes('मुझे पीएम किसान योजना के दस्तावेज चाहिए', 'hi');
    assert.ok(nluHindi.keywords.includes('PM-KISAN'));
    assert.equal(nluHindi.intent, 'REQUIRED_DOCUMENTS');

    const nluKannada = await extractIntentAndAttributes('ರೈತರಿಗೆ ಸರ್ಕಾರದ ಸಹಾಯಧನ ಯಾವುದು?', 'kn');
    assert.equal(nluKannada.extractedAttributes.occupation, 'Farmer');
  });

  await t.test('POST /api/ai/query - Responds with grounded recommendations and provenance', async () => {
    const res = await fetch(`${baseUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'What benefits does PM-KISAN offer?',
        language: 'en',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.explanation.includes('PM-KISAN'));
    assert.ok(data.data.recommendedSchemes.length > 0);
    assert.ok(data.data.disclaimer);
  });
});
