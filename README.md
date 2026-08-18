# 🔐 SecureVault — Full-Stack Document Security Platform

SecureVault is an end-to-end encrypted document management and secure sharing platform.

## 🚀 Quick Start Guide

### 1. Start the Backend API
```bash
cd backend
npm install
cp .env.example .env
npx prisma db push
npx prisma generate
npm run prisma:seed
npm run dev
```
API runs on `http://localhost:5000/api`.

### 2. Start the Frontend App
```bash
cd frontend
npm install
npm run dev
```
Client runs on `http://localhost:5173`.

---

## 🌟 Key Features

* **Zero-Knowledge Architecture**: Client files are verified and stored securely in private Supabase Storage buckets.
* **Granular Folder & Document Management**: Organize documents by categories (Identity, Finance, Work, Education, Legal, etc.) and custom color-coded folders.
* **Document Expiry System & Background Cron**: Automated alerts 30 days, 7 days, 1 day before document expiration, and when expired.
* **Secure Ephemeral Sharing**:
  * Cryptographically random share tokens
  * SHA-256 token hashing in the database
  * Passcode protection (bcrypt salted hash)
  * Configurable expiration (1 hour, 24 hours, 7 days, 30 days)
  * Download limits & access revocations
  * Public recipient viewer page
* **Complete Audit Trail**: Every login, upload, view, download, rename, and revocation is recorded with IP and timestamp.
* **Modern High-Security UI**: Dark/Light mode, animations, responsive design, interactive metrics, and canvas previews.

---

## 🔒 Security Highlights

* **No Plaintext Passwords**: Master passwords and share passcodes are hashed with `bcrypt` (12 salt rounds).
* **JWT Access & Refresh Token Flow**: Minimal-claim short-lived access tokens with secure refresh handling.
* **Backend Authorization**: Strict ownership validation on all document and folder queries.
* **Rate Limiting**: Throttling on authentication attempts, public sharing unlocks, and global API routes.
* **Storage Protection**: Private Supabase buckets with ephemeral signed URLs for previews and downloads.
