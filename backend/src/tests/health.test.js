import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';
import envConfig, { getSafeConfigSummary } from '../config/env.js';
import { getSafeDatabaseUri } from '../config/db.js';

test('Environment Configuration - Secrets isolation & sanitization', () => {
  const summary = getSafeConfigSummary();

  // Ensure secrets are never present in config summary
  assert.equal(summary.JWT_SECRET, undefined, 'JWT_SECRET should never be in safe summary');
  assert.equal(summary.SARVAM_API_KEY, undefined, 'SARVAM_API_KEY should never be in safe summary');
  assert.equal(summary.MONGODB_URI, undefined, 'Raw MONGODB_URI should never be in safe summary');

  // Verify safe fields exist
  assert.ok(summary.nodeEnv, 'Node environment should be defined');
  assert.ok(Array.isArray(summary.allowedCorsOrigins), 'allowedCorsOrigins should be an array');
});

test('Database URI sanitization - Masks username and password', () => {
  const rawUri = 'mongodb+srv://adminUser:SuperSecretPass123@cluster0.abcde.mongodb.net/bharatseva?retryWrites=true&w=majority';
  const sanitized = getSafeDatabaseUri(rawUri);

  assert.ok(!sanitized.includes('SuperSecretPass123'), 'Sanitized URI must not leak password');
  assert.ok(!sanitized.includes('adminUser'), 'Sanitized URI must not leak username');
  assert.ok(sanitized.includes('cluster0.abcde.mongodb.net'), 'Sanitized URI preserves hostname');
});

test('API Health Route - Responds with valid status payload', async () => {
  // Use http server listener in test
  const server = app.listen(0);
  const address = server.address();
  const port = address.port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(response.status, 200, 'Health endpoint should return HTTP 200');

    const data = await response.json();
    assert.equal(data.status, 'ok', 'Status should be ok');
    assert.equal(data.service, 'BharatSeva AI Backend Service');
    assert.ok(data.database, 'Database status object must be present');
    assert.ok(data.timestamp, 'Timestamp must be present');
    assert.ok(typeof data.uptime === 'number', 'Uptime must be a number');
    assert.ok(data.configuration, 'Configuration telemetry must be present');

    // Confirm no secrets leaked in health endpoint
    const stringified = JSON.stringify(data);
    assert.ok(!stringified.includes('SuperSecret'), 'Health response must never include secret strings');
    assert.ok(!stringified.includes(envConfig.JWT_SECRET), 'Health response must never include JWT_SECRET');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('API 404 Handler - Handles non-existent routes cleanly', async () => {
  const server = app.listen(0);
  const address = server.address();
  const port = address.port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/non-existent-route`);
    assert.equal(response.status, 404, 'Non-existent route should return HTTP 404');

    const data = await response.json();
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'RESOURCE_NOT_FOUND');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
