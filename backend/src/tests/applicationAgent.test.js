import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../app.js';
import envConfig from '../config/env.js';
import User from '../models/User.model.js';
import Scheme from '../models/Scheme.model.js';
import DigiLocker from '../models/DigiLocker.model.js';
import SchemeApplication from '../models/SchemeApplication.model.js';

test('DigiLocker & AI Scheme Application Agent Integration Tests', async (t) => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(envConfig.MONGODB_URI);
  }

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const testEmail = `agent.test.${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let authToken = null;
  let testUserId = null;
  let createdAppId = null;
  let testSchemeSlug = 'pm-kisan';

  t.after(async () => {
    if (testUserId) {
      await User.findByIdAndDelete(testUserId);
      await DigiLocker.deleteMany({ user: testUserId });
      await SchemeApplication.deleteMany({ user: testUserId });
    }
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  });

  // Step 1: Register test user
  await t.test('POST /api/auth/register - Register test citizen for agent', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ramesh Gowda',
        email: testEmail,
        password: testPassword,
        phone: '9845012345',
        state: 'Karnataka',
        occupation: 'Farmer',
        age: 42,
        annualIncome: 'Below ₹2,50,000',
        preferredLanguage: 'kn',
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    authToken = data.token;
    testUserId = data.user.id;
  });

  // Step 2: Ensure PM-Kisan scheme exists
  await t.test('Ensure test scheme exists in DB', async () => {
    let scheme = await Scheme.findOne({ slug: testSchemeSlug });
    if (!scheme) {
      scheme = await Scheme.create({
        slug: testSchemeSlug,
        name: 'PM Kisan Samman Nidhi',
        sector: 'Agriculture',
        type: 'Central',
        state: 'All India',
        authority: 'Ministry of Agriculture & Farmers Welfare',
        description: 'Direct income support of ₹6,000 per year for farmer families.',
        targetBeneficiaries: ['Small and marginal landholder farmer families'],
        benefits: ['₹6,000 per year in 3 equal installments via DBT'],
        requiredDocuments: [
          'Aadhaar Card',
          'Bank Account Details',
          'Land Ownership Documents (RoR / Patta)',
        ],
        applicationMode: 'Online & CSC',
        officialLink: 'https://pmkisan.gov.in',
        sourceAuthority: 'Ministry of Agriculture',
      });
    }
    assert.ok(scheme);
  });

  // Step 3: Check DigiLocker status before linking
  await t.test('GET /api/digilocker/status - Initially unlinked', async () => {
    const res = await fetch(`${baseUrl}/digilocker/status`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.linked, false);
  });

  // Step 4: Link DigiLocker
  await t.test('POST /api/digilocker/connect - Successfully link DigiLocker with verified credentials', async () => {
    const res = await fetch(`${baseUrl}/digilocker/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ simulatedOtp: '123456' }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.account.digilockerId);
    assert.ok(data.account.documents.length >= 6);

    const docTypes = data.account.documents.map((d) => d.docType);
    assert.ok(docTypes.includes('AADHAAR'));
    assert.ok(docTypes.includes('BANK_PASSBOOK'));
    assert.ok(docTypes.includes('LAND_RECORD'));
  });

  // Step 5: Check Readiness via AI Agent
  await t.test('GET /api/applications/check/:schemeSlug - Readiness 100% with DigiLocker verified', async () => {
    const res = await fetch(`${baseUrl}/applications/check/${testSchemeSlug}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.isReady, true);
    assert.equal(body.data.digiLockerConnected, true);
    assert.equal(body.data.readinessScore, 100);
    assert.ok(body.data.matchedDocuments.length >= 3);
  });

  // Step 6: Agent pre-fills application form
  await t.test('POST /api/applications/prefill - Auto-populates application payload', async () => {
    const res = await fetch(`${baseUrl}/applications/prefill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ schemeSlug: testSchemeSlug }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.applicantDetails.name, 'Ramesh Gowda');
    assert.ok(body.data.customFields.landSurveyNumber);
    assert.ok(body.data.customFields.maskedAccountNumber);
    assert.equal(body.data.customFields.dbtEnabled, true);
  });

  // Step 7: Apply for scheme on citizen behalf
  await t.test('POST /api/applications/apply - Agent submits application autonomously', async () => {
    const res = await fetch(`${baseUrl}/applications/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        schemeSlug: testSchemeSlug,
        formData: {
          applicantDetails: { name: 'Ramesh Gowda' },
          customFields: { landSurveyNumber: '142/2A', dbtEnabled: true },
        },
        consentData: { agreed: true, method: 'AADHAAR_OTP_ESIGN' },
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.application.applicationNumber.startsWith('ARN-2026-'));
    assert.equal(body.application.status, 'SUBMITTED');
    assert.ok(body.application.agentAuditLog.length >= 5);
    createdAppId = body.application._id;
  });

  // Step 8: Duplicate submission prevention
  await t.test('POST /api/applications/apply - Rejects duplicate submission with 409', async () => {
    const res = await fetch(`${baseUrl}/applications/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        schemeSlug: testSchemeSlug,
      }),
    });

    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.isDuplicate, true);
  });

  // Step 9: List applications
  await t.test('GET /api/applications - Lists submitted application', async () => {
    const res = await fetch(`${baseUrl}/applications`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.count, 1);
    assert.equal(body.data[0].schemeSlug, testSchemeSlug);
  });

  // Step 10: Get single application details with audit log
  await t.test('GET /api/applications/:id - Retrieves single application with agent audit trail', async () => {
    const res = await fetch(`${baseUrl}/applications/${createdAppId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.acknowledgmentReceipt.arn);
    assert.ok(body.data.agentAuditLog.length >= 5);
  });
});
