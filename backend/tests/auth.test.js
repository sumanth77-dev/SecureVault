import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { db } from '../src/config/database.js';

describe('Authentication API Tests', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';
  let accessToken = '';

  test('POST /api/auth/register - Should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Agent',
        email: testEmail,
        password: testPassword
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.user.id);
    assert.equal(res.body.data.user.email, testEmail.toLowerCase());
    assert.ok(res.body.data.accessToken);
    assert.ok(res.body.data.refreshToken);
    accessToken = res.body.data.accessToken;
  });

  test('POST /api/auth/register - Should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Agent',
        email: testEmail,
        password: testPassword
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/login - Should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.accessToken);
  });

  test('POST /api/auth/login - Should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword456'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('GET /api/auth/me - Should return current user when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testEmail.toLowerCase());
  });

  test('GET /api/auth/google - Should initiate Google OAuth with 302 redirect & CSRF cookie', async () => {
    const res = await request(app)
      .get('/api/auth/google');

    assert.equal(res.status, 302);
    assert.ok(res.headers.location);
    assert.ok(res.headers.location.includes('accounts.google.com/o/oauth2/v2/auth'));
    assert.ok(res.headers.location.includes('client_id='));
    assert.ok(res.headers.location.includes('scope=openid+email+profile') || res.headers.location.includes('scope=openid%20email%20profile'));
    assert.ok(res.headers.location.includes('state='));
    
    // Ensure state cookie was set
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    const hasStateCookie = cookies.some(c => c.startsWith('sv_oauth_state='));
    assert.ok(hasStateCookie);
  });

  test('GET /api/auth/google/callback - Should redirect with error when user cancels', async () => {
    const res = await request(app)
      .get('/api/auth/google/callback?error=access_denied&error_description=User%20denied%20access');

    assert.equal(res.status, 302);
    assert.ok(res.headers.location);
    assert.ok(res.headers.location.includes('error=cancelled') || res.headers.location.includes('error='));
  });

  test('GET /api/auth/google/callback - Should reject callback with missing code or mismatched state', async () => {
    const res = await request(app)
      .get('/api/auth/google/callback?code=fake_code&state=fake_state')
      .set('Cookie', ['sv_oauth_state=different_state']);

    assert.equal(res.status, 302);
    assert.ok(res.headers.location);
    assert.ok(res.headers.location.includes('error='));
  });
});
