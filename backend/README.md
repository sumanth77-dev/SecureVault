# 🛡️ SecureVault — Backend API Documentation

Production-ready backend API for **SecureVault**, built with **Node.js, Express, PostgreSQL, Prisma ORM, Supabase Storage, and JWT Authentication**.

---

## 🏗️ Architecture & Tech Stack

* **Runtime**: Node.js (ES Modules)
* **Web Framework**: Express.js
* **Database**: PostgreSQL (Local or Supabase PostgreSQL)
* **ORM**: Prisma ORM v6
* **Object Storage**: Supabase Storage (Private Encrypted Bucket)
* **Security & Auth**:
  * Dual-Token Authentication: Short-lived Access JWT + Refresh Token
  * Passwords: Salted bcrypt hashing (12 rounds)
  * Share Links: Cryptographic random tokens (`crypto.randomBytes`) with SHA-256 token hashing
  * Passcode Protection: bcrypt hashed passwords for shared links
  * Ownership Validation: Strict backend user validation on all resources
  * Security Headers: Helmet
  * Request Throttling: `express-rate-limit` (custom limits on Auth, Sharing, and Global API)
  * CORS: Restricted origin policies with credential support
  * Input Validation: Zod schemas
* **Background Jobs**: `node-cron` for automated document expiry notifications

---

## 📁 Backend Directory Structure

```text
backend/
├── prisma/
│   ├── schema.prisma       # Complete PostgreSQL database schema with indexes
│   └── seed.js             # Development database seed script
├── src/
│   ├── config/
│   │   ├── database.js     # PrismaClient singleton and connection helper
│   │   └── supabase.js     # Supabase Storage client with fallback
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── documentController.js
│   │   ├── folderController.js
│   │   ├── shareController.js
│   │   ├── notificationController.js
│   │   ├── auditController.js
│   │   ├── publicController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── rateLimitMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── folderRoutes.js
│   │   ├── shareRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── auditRoutes.js
│   │   ├── publicRoutes.js
│   │   └── dashboardRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── documentService.js
│   │   ├── storageService.js
│   │   ├── folderService.js
│   │   ├── shareService.js
│   │   ├── notificationService.js
│   │   ├── auditService.js
│   │   ├── dashboardService.js
│   │   └── cronService.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── hash.js
│   │   └── logger.js
│   ├── app.js              # Express application configuration
│   └── server.js           # Server entrypoint with DB & Cron boot
├── tests/
│   ├── auth.test.js
│   ├── security.test.js
│   └── sharing.test.js
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js v18+ or v20+
* PostgreSQL instance (local or hosted on [Supabase](https://supabase.com))

### 2. Installation
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# PostgreSQL / Supabase connection URL
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# JWT Secrets
JWT_ACCESS_SECRET="your_super_secret_access_key_64_characters_long"
JWT_REFRESH_SECRET="your_super_secret_refresh_key_64_characters_long"
JWT_ACCESS_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Supabase Storage Configuration (Private Bucket)
SUPABASE_URL="https://[project-id].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-secret-key"
SUPABASE_STORAGE_BUCKET="securevault"
```

### 4. Supabase Storage Setup
1. Log into your Supabase Dashboard.
2. Navigate to **Storage** > **New Bucket**.
3. Create a bucket named `securevault` and ensure **Public Bucket is set to OFF (Private)**.
4. Copy your project URL and `service_role` key from **Project Settings > API** into `.env`.

### 5. Database Migration & Seeding
```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed sample data (test user, folders, documents, shares, notifications)
npm run prisma:seed
```

> **Default Seed Credentials**:
> * **Email**: `sumanth@example.com`
> * **Password**: `password123`

### 6. Run the Server
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

The API will be live at `http://localhost:5000/api`.

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Log in with email & password | No |
| `POST` | `/api/auth/logout` | Invalidate cookies / logout | No |
| `POST` | `/api/auth/refresh` | Refresh access token | No |
| `GET` | `/api/auth/me` | Get current authenticated user | Yes |
| `POST` | `/api/auth/forgot-password` | Request password reset token | No |
| `POST` | `/api/auth/reset-password` | Reset password using token | No |

### 👤 Users (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users/me` | Get full user profile | Yes |
| `PUT` | `/api/users/me` | Update name, phone, avatar, 2FA | Yes |
| `PUT` | `/api/users/me/password` | Change master password | Yes |

### 📁 Folders (`/api/folders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/folders` | List user folders with counts & size | Yes |
| `POST` | `/api/folders` | Create new folder | Yes |
| `GET` | `/api/folders/:id` | Get folder details and documents | Yes |
| `PUT` | `/api/folders/:id` | Rename/update folder metadata | Yes |
| `DELETE` | `/api/folders/:id` | Delete folder (unassigns docs) | Yes |

### 📄 Documents (`/api/documents`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/documents` | List documents (supports `?search=`, `?category=`, `?folderId=`, `?sort=`, `?page=`, `?limit=`) | Yes |
| `POST` | `/api/documents` | Upload file (Multer memory + Supabase storage) | Yes |
| `GET` | `/api/documents/expiring` | Expired and expiring documents (<7d, <30d) | Yes |
| `GET` | `/api/documents/:id` | Document details with versions and activity | Yes |
| `PUT` | `/api/documents/:id` | Update metadata, rename, star toggle | Yes |
| `DELETE` | `/api/documents/:id` | Delete document and storage files | Yes |
| `GET` | `/api/documents/:id/download` | Generate signed Supabase download URL | Yes |
| `GET` | `/api/documents/:id/preview` | Generate signed Supabase preview URL | Yes |

### 🔗 Sharing (`/api/shares` & `/api/public`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/shares` | Generate secure share link with expiry & passcode | Yes |
| `GET` | `/api/shares` | List active share links created by owner | Yes |
| `POST` | `/api/shares/:id/revoke` | Revoke active share link | Yes |
| `DELETE` | `/api/shares/:id` | Delete share record | Yes |
| `GET` | `/api/public/share/:token` | Public recipient metadata lookup | No |
| `POST` | `/api/public/share/:token/unlock` | Verify passcode & get unlock token | No |
| `GET` | `/api/public/share/:token/download` | Recipient download original file | No |
| `GET` | `/api/public/share/:token/preview` | Recipient preview document canvas | No |

### 🔔 Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/notifications` | List user notifications | Yes |
| `PUT` | `/api/notifications/read-all` | Mark all as read | Yes |
| `PUT` | `/api/notifications/:id/read` | Mark single notification as read | Yes |
| `DELETE` | `/api/notifications/:id` | Delete notification | Yes |
| `DELETE` | `/api/notifications/clear-all` | Clear all notifications | Yes |

### 📊 Dashboard & Audit (`/api/dashboard` & `/api/audit-logs`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard` | Aggregated vault metrics and recent activity | Yes |
| `GET` | `/api/audit-logs` | List security & audit history logs | Yes |

---

## 🧪 Automated Testing
Run automated backend integration tests:
```bash
npm test
```

Tests cover:
* Authentication flow & duplicate email prevention
* Cross-user authorization isolation (User A cannot access User B resources)
* File upload validation (rejecting executable `.exe` or disallowed MIME types)
* Share link cryptographic generation, password protection, and revocation
* Token expiration & invalid token rejection
