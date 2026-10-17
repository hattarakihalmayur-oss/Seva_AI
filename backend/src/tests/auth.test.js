import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../app.js';
import envConfig from '../config/env.js';
import User from '../models/User.model.js';

test('Authentication API Integration Tests', async (t) => {
  // Connect Mongoose for test run
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(envConfig.MONGODB_URI);
  }

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/auth`;

  const testEmail = `test.citizen.${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let authToken = null;

  t.after(async () => {
    // Cleanup created test user
    await User.deleteMany({ email: testEmail });
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  });

  await t.test('POST /api/auth/register - Successfully registers citizen', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Suresh Patil',
        email: testEmail,
        password: testPassword,
        state: 'Karnataka',
        occupation: 'Farmer',
        age: 38,
        preferredLanguage: 'kn',
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token, 'Token must be returned');
    assert.equal(data.user.email, testEmail);
    assert.equal(data.user.name, 'Suresh Patil');
    assert.equal(data.user.password, undefined, 'Password must not be returned in response');
    authToken = data.token;
  });

  await t.test('POST /api/auth/register - Rejects duplicate email with 409', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another Name',
        email: testEmail,
        password: testPassword,
      }),
    });

    assert.equal(res.status, 409);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'EMAIL_ALREADY_EXISTS');
  });

  await t.test('POST /api/auth/register - Rejects password under 6 characters', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Pass',
        email: `short.${Date.now()}@example.com`,
        password: '123',
      }),
    });

    assert.ok(res.status === 400 || res.status === 422, 'Should reject invalid password with 400 or 422');
    const data = await res.json();
    assert.equal(data.success, false);
  });

  await t.test('POST /api/auth/login - Authenticates with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.email, testEmail);
  });

  await t.test('POST /api/auth/login - Rejects incorrect password with 401', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword456',
      }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'INVALID_CREDENTIALS');
  });

  await t.test('GET /api/auth/me - Accesses protected user profile with Bearer token', async () => {
    const res = await fetch(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.email, testEmail);
  });

  await t.test('GET /api/auth/me - Rejects unauthorized access without token', async () => {
    const res = await fetch(`${baseUrl}/me`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'UNAUTHORIZED_NO_TOKEN');
  });

  await t.test('PUT /api/auth/profile - Updates citizen demographics and language', async () => {
    const res = await fetch(`${baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        occupation: 'Senior Agriculturist',
        preferredLanguage: 'hi',
        phone: '+91 9988776655',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.occupation, 'Senior Agriculturist');
    assert.equal(data.user.preferredLanguage, 'hi');
    assert.equal(data.user.phone, '+91 9988776655');
  });

  const testMobile = '9876543210';
  let generatedOtp = null;

  await t.test('POST /api/auth/otp/generate - Generates 6-digit OTP for 10-digit mobile', async () => {
    const res = await fetch(`${baseUrl}/otp/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: testMobile }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.otp, 'Must return generated OTP in test/dev');
    assert.equal(data.otp.length, 6);
    assert.equal(data.mobile, testMobile);
    generatedOtp = data.otp;
  });

  await t.test('POST /api/auth/otp/generate - Rejects invalid mobile number', async () => {
    const res = await fetch(`${baseUrl}/otp/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '123' }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'INVALID_MOBILE');
  });

  await t.test('POST /api/auth/otp/verify - Successfully authenticates via OTP', async () => {
    const res = await fetch(`${baseUrl}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: testMobile, otp: generatedOtp }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token, 'Must return JWT token');
    assert.equal(data.user.phone, testMobile);
  });

  await t.test('POST /api/auth/otp/verify - Rejects invalid OTP', async () => {
    const res = await fetch(`${baseUrl}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: testMobile, otp: '000000' }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'INVALID_OR_EXPIRED_OTP');
  });
});
