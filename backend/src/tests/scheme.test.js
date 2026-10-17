import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../app.js';
import envConfig from '../config/env.js';
import User from '../models/User.model.js';
import Scheme from '../models/Scheme.model.js';
import SavedScheme from '../models/SavedScheme.model.js';
import { generateToken } from '../utils/token.js';

test('Schemes & Bookmarking Integration Tests', async (t) => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(envConfig.MONGODB_URI);
  }

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  let testUser;
  let userToken;

  t.before(async () => {
    // Seed schemes if empty
    await fetch(`${baseUrl}/schemes/seed`, { method: 'POST' });

    // Create a temporary test citizen
    testUser = await User.create({
      name: 'Bookmark Tester',
      email: `bookmark.tester.${Date.now()}@example.com`,
      password: 'StrongPassword123!',
      state: 'Karnataka',
    });
    userToken = generateToken({ id: testUser._id, role: testUser.role });
  });

  t.after(async () => {
    if (testUser) {
      await User.findByIdAndDelete(testUser._id);
      await SavedScheme.deleteMany({ user: testUser._id });
    }
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  });

  await t.test('GET /api/schemes - Retrieves scheme list with metadata', async () => {
    const res = await fetch(`${baseUrl}/schemes`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.total >= 6, 'Must contain at least 6 initial seeded schemes');
    assert.ok(Array.isArray(data.data));
  });

  await t.test('GET /api/schemes?q=Kisan - Searches schemes by keyword', async () => {
    const res = await fetch(`${baseUrl}/schemes?q=Kisan`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.count > 0);
    assert.ok(data.data.some((s) => s.slug === 'pm-kisan'));
  });

  await t.test('GET /api/schemes?type=State - Filters schemes by government level', async () => {
    const res = await fetch(`${baseUrl}/schemes?type=State`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.every((s) => s.type === 'State'));
  });

  await t.test('GET /api/schemes/:slug - Retrieves single scheme by slug', async () => {
    const res = await fetch(`${baseUrl}/schemes/pm-kisan`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.slug, 'pm-kisan');
    assert.ok(data.data.benefits.length > 0);
    assert.ok(data.data.eligibilityCriteria.length > 0);
    assert.ok(data.data.requiredDocuments.length > 0);
    assert.ok(data.data.officialLink.startsWith('http'));
  });

  await t.test('GET /api/schemes/:slug - Returns 404 for invalid scheme slug', async () => {
    const res = await fetch(`${baseUrl}/schemes/non-existent-welfare-scheme-slug`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'SCHEME_NOT_FOUND');
  });

  await t.test('POST /api/saved-schemes - Bookmarks a scheme for citizen', async () => {
    const res = await fetch(`${baseUrl}/saved-schemes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ schemeSlug: 'pm-kisan', notes: 'Need to upload Pahani record' }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.schemeSlug, 'pm-kisan');
  });

  await t.test('GET /api/saved-schemes/check/pm-kisan - Confirms saved status is true', async () => {
    const res = await fetch(`${baseUrl}/saved-schemes/check/pm-kisan`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.isSaved, true);
  });

  await t.test('GET /api/saved-schemes - Retrieves populated saved list', async () => {
    const res = await fetch(`${baseUrl}/saved-schemes`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.count, 1);
    assert.equal(data.data[0].scheme.slug, 'pm-kisan');
  });

  await t.test('DELETE /api/saved-schemes/pm-kisan - Unsaves scheme', async () => {
    const res = await fetch(`${baseUrl}/saved-schemes/pm-kisan`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);

    // Verify status is now false
    const checkRes = await fetch(`${baseUrl}/saved-schemes/check/pm-kisan`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const checkData = await checkRes.json();
    assert.equal(checkData.isSaved, false);
  });
});
