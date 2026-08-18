import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const STATEMENTS = [
  // Enums
  `DO $$ BEGIN CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "NotificationType" AS ENUM ('EXPIRY', 'SECURITY', 'SHARING', 'SYSTEM'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'UPLOAD', 'DOWNLOAD', 'VIEW', 'DELETE', 'RENAME', 'SHARE', 'REVOKE_SHARE', 'PASSWORD_CHANGE', 'PROFILE_UPDATE'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  // User
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "avatarUrl" TEXT,
    "phone" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");`,

  // Folder
  `CREATE TABLE IF NOT EXISTS "Folder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "Folder_userId_idx" ON "Folder"("userId");`,

  // Document
  `CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "name" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Personal',
    "description" TEXT,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "expiryDate" TIMESTAMP(3),
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "previewType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "Document_userId_idx" ON "Document"("userId");`,
  `CREATE INDEX IF NOT EXISTS "Document_folderId_idx" ON "Document"("folderId");`,
  `CREATE INDEX IF NOT EXISTS "Document_category_idx" ON "Document"("category");`,
  `CREATE INDEX IF NOT EXISTS "Document_expiryDate_idx" ON "Document"("expiryDate");`,

  // DocumentVersion
  `CREATE TABLE IF NOT EXISTS "DocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "versionNumber" TEXT NOT NULL DEFAULT 'v1.0',
    "originalFilename" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "DocumentVersion_documentId_idx" ON "DocumentVersion"("documentId");`,

  // ShareLink
  `CREATE TABLE IF NOT EXISTS "ShareLink" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "passwordHash" TEXT,
    "expiresAt" TIMESTAMP(3),
    "allowDownload" BOOLEAN NOT NULL DEFAULT true,
    "maxDownloads" INTEGER,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "sharedWith" TEXT,
    "recipientEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ShareLink_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ShareLink_tokenHash_key" ON "ShareLink"("tokenHash");`,
  `CREATE INDEX IF NOT EXISTS "ShareLink_documentId_idx" ON "ShareLink"("documentId");`,

  // Notification
  `CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");`,
  `CREATE INDEX IF NOT EXISTS "Notification_isRead_idx" ON "Notification"("isRead");`,

  // AuditLog
  `CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT,
    "action" "AuditAction" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_documentId_idx" ON "AuditLog"("documentId");`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");`
];

async function init() {
  console.log('Connecting to PostgreSQL database...');
  try {
    await prisma.$connect();
    console.log('Connected! Creating tables and indexes in Supabase...');
    for (const stmt of STATEMENTS) {
      await prisma.$executeRawUnsafe(stmt);
    }
    console.log('SUCCESS: All PostgreSQL tables, enums, relations, and indexes are live in Supabase!');
  } catch (error) {
    console.error('Error executing DDL:', error);
  } finally {
    await prisma.$disconnect();
  }
}

init();
