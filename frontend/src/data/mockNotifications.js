export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Insurance Policy Expiry Reminder',
    message: 'Health_Insurance_Policy_2026.pdf will expire in 7 days (August 24, 2026). Initiate renewal to maintain continuous coverage.',
    type: 'expiry', // 'expiry' | 'security' | 'activity' | 'system'
    read: false,
    timestamp: '2026-08-17T08:30:00Z',
    documentId: 'doc-002',
    actionUrl: '/documents/doc-002'
  },
  {
    id: 'notif-2',
    title: 'New Device Login Detected',
    message: 'Login from Chrome on macOS (San Francisco, US, IP: 198.51.100.45) was verified via Authenticator 2FA.',
    type: 'security',
    read: false,
    timestamp: '2026-08-16T22:15:00Z',
    actionUrl: '/settings'
  },
  {
    id: 'notif-3',
    title: 'Shared Document Accessed',
    message: 'Someone with authorization viewed your shared document "Resume_Staff_Product_Engineer.pdf".',
    type: 'activity',
    read: false,
    timestamp: '2026-08-16T14:40:00Z',
    documentId: 'doc-009',
    actionUrl: '/shared'
  },
  {
    id: 'notif-4',
    title: 'Driving Licence Expiry Notice',
    message: 'Driving_Licence_Digital.pdf is scheduled to expire in 23 days (September 09, 2026).',
    type: 'expiry',
    read: false,
    timestamp: '2026-08-15T09:00:00Z',
    documentId: 'doc-003',
    actionUrl: '/documents/doc-003'
  },
  {
    id: 'notif-5',
    title: 'Secure Vault Backup Completed',
    message: 'Automated encrypted client-side metadata snapshot was created successfully. 22 documents validated.',
    type: 'system',
    read: true,
    timestamp: '2026-08-15T03:00:00Z',
    actionUrl: '/settings'
  },
  {
    id: 'notif-6',
    title: 'Vehicle Insurance Renewal Due',
    message: 'Vehicle_Insurance_Comprehensive.pdf expires in 41 days (September 27, 2026).',
    type: 'expiry',
    read: true,
    timestamp: '2026-08-14T11:00:00Z',
    documentId: 'doc-004',
    actionUrl: '/documents/doc-004'
  },
  {
    id: 'notif-7',
    title: 'Share Link Expired',
    message: 'Temporary share link for "Passport_International.pdf" shared with Travel Agency has automatically expired.',
    type: 'activity',
    read: true,
    timestamp: '2026-08-13T19:00:00Z',
    documentId: 'doc-001',
    actionUrl: '/shared'
  },
  {
    id: 'notif-8',
    title: 'Document Verified',
    message: 'BTech_Degree_Certificate.pdf digital apostille and QR cryptographic signature was marked valid.',
    type: 'security',
    read: true,
    timestamp: '2026-08-10T16:20:00Z',
    documentId: 'doc-005',
    actionUrl: '/documents/doc-005'
  },
  {
    id: 'notif-9',
    title: 'Two-Factor Authentication Enforced',
    message: 'Passkey & TOTP backup codes were updated for your security profile.',
    type: 'security',
    read: true,
    timestamp: '2026-08-05T12:00:00Z',
    actionUrl: '/settings'
  },
  {
    id: 'notif-10',
    title: 'Storage Optimization Insight',
    message: 'You have used 245 MB of your 1 GB encrypted personal storage allowance (24.5%).',
    type: 'system',
    read: true,
    timestamp: '2026-08-01T08:00:00Z',
    actionUrl: '/settings'
  }
];
