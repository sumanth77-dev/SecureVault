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
    assert.ok(!res.headers.location.includes('token='));
  });

  test('GET /api/auth/google/callback - Should reject callback with invalid or mismatched state', async () => {
    const res = await request(app)
      .get('/api/auth/google/callback?code=fake_code&state=fake_state')
      .set('Cookie', ['sv_oauth_state=different_state']);

    assert.equal(res.status, 302);
    assert.ok(res.headers.location);
    assert.ok(res.headers.location.includes('error='));
    assert.ok(!res.headers.location.includes('token='));
  });

  test('GET /api/auth/google/callback - Should reject callback with expired/missing state cookie', async () => {
    const res = await request(app)
      .get('/api/auth/google/callback?code=fake_code&state=fake_state');

    assert.equal(res.status, 302);
    assert.ok(res.headers.location);
    assert.ok(res.headers.location.includes('error='));
    assert.ok(!res.headers.location.includes('token='));
  });

  test('GET /api/auth/google/callback - Success flow sets cookies, redirects to ?auth=success WITHOUT token in URL', async () => {
    const originalFetch = global.fetch;
    const originalClientId = process.env.GOOGLE_CLIENT_ID;
    const originalClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

    const testState = 'valid_oauth_state_12345';
    const testGoogleId = `google_${Date.now()}`;
    const testGoogleEmail = `google_${Date.now()}@example.com`;

    // Mock Google endpoints
    global.fetch = async (url) => {
      if (url === 'https://oauth2.googleapis.com/token') {
        return {
          ok: true,
          json: async () => ({
            access_token: 'mock_google_access_token',
            token_type: 'Bearer',
            expires_in: 3600
          })
        };
      }
      if (url === 'https://www.googleapis.com/oauth2/v3/userinfo') {
        return {
          ok: true,
          json: async () => ({
            sub: testGoogleId,
            email: testGoogleEmail,
            email_verified: true,
            name: 'Google OAuth User',
            picture: 'https://example.com/photo.jpg'
          })
        };
      }
      return originalFetch(url);
    };

    try {
      const res = await request(app)
        .get(`/api/auth/google/callback?code=mock_auth_code&state=${testState}`)
        .set('Cookie', [`sv_oauth_state=${testState}`]);

      assert.equal(res.status, 302);
      assert.ok(res.headers.location);
      // Verify redirect target is strictly ?auth=success and NO token exists in URL
      assert.ok(res.headers.location.endsWith('/login?auth=success'));
      assert.ok(!res.headers.location.includes('token='));

      // Verify HTTP-only authentication cookies are set
      const cookies = res.headers['set-cookie'] || [];
      const hasAccessTokenCookie = cookies.some(c => c.startsWith('sv_access_token='));
      const hasRefreshTokenCookie = cookies.some(c => c.startsWith('sv_refresh_token='));
      assert.ok(hasAccessTokenCookie, 'sv_access_token cookie should be set');
      assert.ok(hasRefreshTokenCookie, 'sv_refresh_token cookie should be set');

      // Extract cookie for testing /api/auth/me
      const accessTokenCookie = cookies.find(c => c.startsWith('sv_access_token=')).split(';')[0];

      // Test /api/auth/me using ONLY the cookie (no Authorization header)
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [accessTokenCookie]);

      assert.equal(meRes.status, 200);
      assert.equal(meRes.body.success, true);
      assert.equal(meRes.body.data.user.email, testGoogleEmail.toLowerCase());

      // Test protected API route (e.g. /api/documents) using ONLY the cookie
      const docRes = await request(app)
        .get('/api/documents')
        .set('Cookie', [accessTokenCookie]);

      assert.equal(docRes.status, 200);
      assert.equal(docRes.body.success, true);

      // Test POST /api/auth/logout clears cookies
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [accessTokenCookie]);

      assert.equal(logoutRes.status, 200);
      const logoutCookies = logoutRes.headers['set-cookie'] || [];
      assert.ok(logoutCookies.some(c => c.includes('sv_access_token=;')));
    } finally {
      global.fetch = originalFetch;
      process.env.GOOGLE_CLIENT_ID = originalClientId;
      process.env.GOOGLE_CLIENT_SECRET = originalClientSecret;
    }
  });
});
