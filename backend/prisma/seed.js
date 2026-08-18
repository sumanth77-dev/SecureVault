import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SecureVault database seed...');

  // Clean existing data
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.shareLink.deleteMany({});
  await prisma.documentVersion.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.folder.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing tables.');

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      name: 'Sumanth',
      email: 'sumanth@example.com',
      passwordHash,
      phone: '+1 (555) 234-5678',
      twoFactorEnabled: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  });

  console.log(`👤 Created user: ${user.name} (${user.email})`);

  // Create folders
  const folderPersonal = await prisma.folder.create({
    data: {
      userId: user.id,
      name: 'Personal',
      color: 'blue',
      description: 'Personal identification and credentials'
    }
  });

  const folderFinancial = await prisma.folder.create({
    data: {
      userId: user.id,
      name: 'Financial',
      color: 'emerald',
      description: 'Tax records, statements and banking documents'
    }
  });

  const folderLegal = await prisma.folder.create({
    data: {
      userId: user.id,
      name: 'Legal & Contracts',
      color: 'purple',
      description: 'Legal agreements and property records'
    }
  });

  const folderWork = await prisma.folder.create({
    data: {
      userId: user.id,
      name: 'Career & Work',
      color: 'amber',
      description: 'Employment agreements, certifications, NDAs'
    }
  });

  console.log('📁 Created 4 user folders.');

  // Documents
  const now = new Date();
  const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const doc1 = await prisma.document.create({
    data: {
      userId: user.id,
      folderId: folderPersonal.id,
      name: 'Passport_Scan_Official.pdf',
      originalFilename: 'Passport_Scan_Official.pdf',
      category: 'Identity',
      description: 'High resolution passport biometric scan for visa applications.',
      storageKey: `${user.id}/doc-1/passport.pdf`,
      mimeType: 'application/pdf',
      fileSize: 4200000,
      expiryDate: daysFromNow(450),
      isStarred: true,
      previewType: 'passport',
      versions: {
        create: [
          { storageKey: `${user.id}/doc-1/passport.pdf`, versionNumber: 'v1.0', fileSize: 4200000, notes: 'Initial scan upload' }
        ]
      }
    }
  });

  const doc2 = await prisma.document.create({
    data: {
      userId: user.id,
      folderId: folderFinancial.id,
      name: 'Annual_Tax_Return_2025.pdf',
      originalFilename: 'Annual_Tax_Return_2025.pdf',
      category: 'Finance',
      description: 'Federal and State tax filings filed with IRS.',
      storageKey: `${user.id}/doc-2/tax_2025.pdf`,
      mimeType: 'application/pdf',
      fileSize: 2800000,
      expiryDate: daysFromNow(20), // Expiring in 20 days
      isStarred: false,
      previewType: 'finance',
      versions: {
        create: [
          { storageKey: `${user.id}/doc-2/tax_2025.pdf`, versionNumber: 'v1.0', fileSize: 2800000, notes: 'Filed with CPA' }
        ]
      }
    }
  });

  const doc3 = await prisma.document.create({
    data: {
      userId: user.id,
      folderId: folderLegal.id,
      name: 'Apartment_Lease_Agreement_2026.pdf',
      originalFilename: 'Apartment_Lease_Agreement_2026.pdf',
      category: 'Work',
      description: 'Residential lease agreement with landlord countersignature.',
      storageKey: `${user.id}/doc-3/lease_2026.pdf`,
      mimeType: 'application/pdf',
      fileSize: 1950000,
      expiryDate: daysFromNow(180),
      isStarred: true,
      previewType: 'contract',
      versions: {
        create: [
          { storageKey: `${user.id}/doc-3/lease_2026.pdf`, versionNumber: 'v1.0', fileSize: 1950000, notes: 'Signed copy' }
        ]
      }
    }
  });

  const doc4 = await prisma.document.create({
    data: {
      userId: user.id,
      folderId: folderPersonal.id,
      name: 'Driver_License_State_ID.jpg',
      originalFilename: 'Driver_License_State_ID.jpg',
      category: 'Identity',
      description: 'State issued driver identification card front & back.',
      storageKey: `${user.id}/doc-4/driver_license.jpg`,
      mimeType: 'image/jpeg',
      fileSize: 3100000,
      expiryDate: daysFromNow(5), // Expiring in 5 days
      isStarred: true,
      previewType: 'id_card',
      versions: {
        create: [
          { storageKey: `${user.id}/doc-4/driver_license.jpg`, versionNumber: 'v1.0', fileSize: 3100000, notes: 'Front & Back Photo' }
        ]
      }
    }
  });

  const doc5 = await prisma.document.create({
    data: {
      userId: user.id,
      folderId: folderWork.id,
      name: 'Senior_Engineer_Employment_NDA.pdf',
      originalFilename: 'Senior_Engineer_Employment_NDA.pdf',
      category: 'Work',
      description: 'Confidentiality and non-disclosure agreement.',
      storageKey: `${user.id}/doc-5/employment_nda.pdf`,
      mimeType: 'application/pdf',
      fileSize: 1400000,
      expiryDate: null,
      isStarred: false,
      previewType: 'contract',
      versions: {
        create: [
          { storageKey: `${user.id}/doc-5/employment_nda.pdf`, versionNumber: 'v1.0', fileSize: 1400000, notes: 'Countersigned PDF' }
        ]
      }
    }
  });

  console.log('📄 Created 5 initial vault documents.');

  // Create Share Link
  const sampleRawToken = 'sv_demo_token_2026';
  const tokenHash = crypto.createHash('sha256').update(sampleRawToken).digest('hex');
  const sharePassHash = await bcrypt.hash('vault-pass-2026', 12);

  await prisma.shareLink.create({
    data: {
      documentId: doc1.id,
      tokenHash,
      passwordHash: sharePassHash,
      expiresAt: daysFromNow(1),
      allowDownload: true,
      maxDownloads: 5,
      downloadCount: 1,
      sharedWith: 'Legal Counsel (Sarah Jenkins)',
      recipientEmail: 'sarah.jenkins@lawfirm.com'
    }
  });

  console.log(`🔗 Created sample share link: token="${sampleRawToken}", passcode="vault-pass-2026"`);

  // Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        documentId: doc4.id,
        title: 'Document Expiring in 5 Days',
        message: 'Your Driver License State ID is set to expire on ' + doc4.expiryDate.toLocaleDateString() + '.',
        type: 'EXPIRY',
        isRead: false
      },
      {
        userId: user.id,
        documentId: doc2.id,
        title: 'Upcoming Tax Document Expiry',
        message: 'Annual Tax Return 2025 will require review within 20 days.',
        type: 'EXPIRY',
        isRead: false
      },
      {
        userId: user.id,
        documentId: doc1.id,
        title: 'Document Accessed via Share Link',
        message: 'Sarah Jenkins viewed "Passport_Scan_Official.pdf" from an external IP.',
        type: 'SHARING',
        isRead: true
      },
      {
        userId: user.id,
        title: 'Security Alert: Two-Factor Enabled',
        message: 'Two-Factor Authentication (TOTP) was verified for your account.',
        type: 'SECURITY',
        isRead: true
      }
    ]
  });

  console.log('🔔 Created 4 sample notifications.');

  // Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: user.id,
        action: 'LOGIN',
        ipAddress: '198.51.100.45',
        userAgent: 'Chrome 128.0 / macOS',
        details: 'User authenticated with 2FA'
      },
      {
        userId: user.id,
        documentId: doc1.id,
        action: 'UPLOAD',
        ipAddress: '198.51.100.45',
        userAgent: 'Chrome 128.0 / macOS',
        details: 'Uploaded Passport_Scan_Official.pdf (4.2 MB)'
      },
      {
        userId: user.id,
        documentId: doc1.id,
        action: 'SHARE',
        ipAddress: '198.51.100.45',
        userAgent: 'Chrome 128.0 / macOS',
        details: 'Generated password-protected link for Sarah Jenkins'
      },
      {
        userId: user.id,
        documentId: doc4.id,
        action: 'VIEW',
        ipAddress: '198.51.100.45',
        userAgent: 'Chrome 128.0 / macOS',
        details: 'Decrypted and previewed Driver_License_State_ID.jpg'
      }
    ]
  });

  console.log('📜 Created 4 audit activity logs.');
  console.log('✅ Database seed completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
