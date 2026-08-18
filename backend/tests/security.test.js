import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('Authorization & Security Tests', () => {
  let userAToken = '';
  let userBToken = '';
  let userAFolderId = '';
  let userADocId = '';

  test('Setup: Create User A and User B', async () => {
    const userA = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User A', email: `userA_${Date.now()}@test.com`, password: 'password123' });
    assert.equal(userA.status, 201);
    userAToken = userA.body.data.accessToken;

    const userB = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User B', email: `userB_${Date.now()}@test.com`, password: 'password123' });
    assert.equal(userB.status, 201);
    userBToken = userB.body.data.accessToken;

    // User A creates a folder
    const folderRes = await request(app)
      .post('/api/folders')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ name: 'Secret Folder A', color: 'red' });
    assert.equal(folderRes.status, 201);
    userAFolderId = folderRes.body.data.id;

    // User A uploads a document
    const docRes = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${userAToken}`)
      .attach('file', Buffer.from('Confidential content for user A'), 'userA_secret.pdf')
      .field('name', 'User A Secret.pdf')
      .field('folderId', userAFolderId);
    assert.equal(docRes.status, 201);
    userADocId = docRes.body.data.id;
  });

  test('User B CANNOT access User A document (GET /:id)', async () => {
    const res = await request(app)
      .get(`/api/documents/${userADocId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  test('User B CANNOT modify User A folder', async () => {
    const res = await request(app)
      .put(`/api/folders/${userAFolderId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ name: 'Hacked Folder Name' });

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  test('User B CANNOT preview User A document', async () => {
    const res = await request(app)
      .get(`/api/documents/${userADocId}/preview`)
      .set('Authorization', `Bearer ${userBToken}`);

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  test('User B CANNOT download User A document', async () => {
    const res = await request(app)
      .get(`/api/documents/${userADocId}/download`)
      .set('Authorization', `Bearer ${userBToken}`);

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  test('User B CANNOT delete User A document', async () => {
    const res = await request(app)
      .delete(`/api/documents/${userADocId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  test('User A can upload a new version to existing document', async () => {
    const res = await request(app)
      .post(`/api/documents/${userADocId}/versions`)
      .set('Authorization', `Bearer ${userAToken}`)
      .attach('file', Buffer.from('Updated version 2 content'), 'userA_secret_v2.pdf')
      .field('notes', 'Revised passport scan');

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.version, 'v2.0');
  });

  test('Should accept valid PNG / JPG image upload', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${userAToken}`)
      .attach('file', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'id_card.png')
      .field('name', 'ID Card.png')
      .field('category', 'Identity');

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'ID Card.png');
  });

  test('Should reject malicious executable file upload', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${userAToken}`)
      .attach('file', Buffer.from('malicious binary'), 'malware.exe');

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('GET /api/dashboard - Should return live calculated storage metrics', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.totalDocuments >= 2);
    assert.ok(res.body.data.storageUsed > 0);
    assert.ok(res.body.data.storageLimit > 0);
  });

  test('Should reject invalid or forged JWT token', async () => {
    const res = await request(app)
      .get('/api/documents')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.forged.payload');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });
});
