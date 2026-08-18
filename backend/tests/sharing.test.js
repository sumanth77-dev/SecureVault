import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('Document Sharing API Tests', () => {
  let userToken = '';
  let documentId = '';
  let shareToken = '';
  let shareId = '';
  let unlockToken = '';

  test('Setup: Create user & document', async () => {
    const user = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Share Owner', email: `share_${Date.now()}@test.com`, password: 'password123' });
    assert.equal(user.status, 201);
    userToken = user.body.data.accessToken;

    const docRes = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', Buffer.from('Shared confidential document contents'), 'contract.pdf')
      .field('name', 'NDA_Agreement.pdf');
    assert.equal(docRes.status, 201);
    documentId = docRes.body.data.id;
  });

  test('POST /api/shares - Should create password-protected share link', async () => {
    const res = await request(app)
      .post('/api/shares')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        documentId,
        sharedWith: 'External Auditor',
        hasPassword: true,
        password: 'passcode-for-audit',
        expiryOption: '24 hours',
        allowDownload: true,
        maxDownloads: 3
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.hasPassword, true);
    shareToken = res.body.data.token;
    shareId = res.body.data.id;
  });

  test('GET /api/public/share/:token - Should retrieve public metadata with password required', async () => {
    const res = await request(app)
      .get(`/api/public/share/${shareToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.hasPassword, true);
    assert.equal(res.body.data.isUnlocked, false);
    assert.equal(res.body.data.documentName, 'NDA_Agreement.pdf');
  });

  test('POST /api/public/share/:token/unlock - Should reject wrong passcode', async () => {
    const res = await request(app)
      .post(`/api/public/share/${shareToken}/unlock`)
      .send({ password: 'wrong-passcode' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('POST /api/public/share/:token/unlock - Should unlock with correct passcode', async () => {
    const res = await request(app)
      .post(`/api/public/share/${shareToken}/unlock`)
      .send({ password: 'passcode-for-audit' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.unlockToken);
    unlockToken = res.body.data.unlockToken;
  });

  test('GET /api/public/share/:token/download - Should return download URL when unlocked', async () => {
    const res = await request(app)
      .get(`/api/public/share/${shareToken}/download`)
      .set('x-unlock-token', unlockToken);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.downloadUrl);
  });

  test('POST /api/shares/:id/revoke - Should revoke share link and block subsequent access', async () => {
    const revokeRes = await request(app)
      .post(`/api/shares/${shareId}/revoke`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(revokeRes.status, 200);
    assert.equal(revokeRes.body.data.status, 'revoked');

    const checkRes = await request(app)
      .get(`/api/public/share/${shareToken}`);

    assert.equal(checkRes.status, 410);
  });
});
