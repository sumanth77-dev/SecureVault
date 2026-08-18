export const INITIAL_SHARED_DOCUMENTS = [
  {
    id: 'share-001',
    token: 'sv_token_88921a',
    documentId: 'doc-001',
    documentName: 'Passport_International.pdf',
    sharedWith: 'VFS Visa Processing & Embassy Team',
    recipientEmail: 'applications@embassy-partner.org',
    createdAt: '2026-08-16T10:00:00Z',
    expiresAt: '2026-08-18T10:00:00Z', // 24 hours left
    expiryOption: '24 hours',
    hasPassword: true,
    password: 'vault-pass-2026',
    allowDownload: true,
    accessCount: 4,
    status: 'active', // 'active' | 'revoked' | 'expired'
    views: [
      { ip: '192.0.2.14', accessedAt: '2026-08-16T14:22:00Z', downloaded: true },
      { ip: '192.0.2.14', accessedAt: '2026-08-17T09:15:00Z', downloaded: false }
    ]
  },
  {
    id: 'share-002',
    token: 'sv_token_33499f',
    documentId: 'doc-009',
    documentName: 'Resume_Staff_Product_Engineer.pdf',
    sharedWith: 'Stripe Engineering Recruiter',
    recipientEmail: 'recruiting-team@stripe.com',
    createdAt: '2026-08-11T16:00:00Z',
    expiresAt: '2026-08-18T16:00:00Z',
    expiryOption: '7 days',
    hasPassword: false,
    password: '',
    allowDownload: true,
    accessCount: 12,
    status: 'active',
    views: [
      { ip: '198.51.100.22', accessedAt: '2026-08-12T11:00:00Z', downloaded: true },
      { ip: '198.51.100.89', accessedAt: '2026-08-14T17:30:00Z', downloaded: false }
    ]
  },
  {
    id: 'share-003',
    token: 'sv_token_77124c',
    documentId: 'doc-005',
    documentName: 'BTech_Degree_Certificate.pdf',
    sharedWith: 'Background Verification Agency (AuthBridge)',
    recipientEmail: 'bgv-ops@authbridge.com',
    createdAt: '2026-08-14T09:30:00Z',
    expiresAt: '2026-08-21T09:30:00Z',
    expiryOption: '7 days',
    hasPassword: true,
    password: 'degree-verify-secure',
    allowDownload: false,
    accessCount: 2,
    status: 'active',
    views: [
      { ip: '203.0.113.55', accessedAt: '2026-08-15T11:45:00Z', downloaded: false }
    ]
  },
  {
    id: 'share-004',
    token: 'sv_token_11902b',
    documentId: 'doc-008',
    documentName: 'Residential_Lease_Agreement.pdf',
    sharedWith: 'Property Tax Consultant',
    recipientEmail: 'taxconsult@apexadvisors.com',
    createdAt: '2026-07-20T10:00:00Z',
    expiresAt: '2026-07-27T10:00:00Z',
    expiryOption: '7 days',
    hasPassword: false,
    password: '',
    allowDownload: true,
    accessCount: 5,
    status: 'expired',
    views: []
  },
  {
    id: 'share-005',
    token: 'sv_token_99014e',
    documentId: 'doc-006',
    documentName: 'Tax_Return_FY25_26.pdf',
    sharedWith: 'Mortgage Loan Officer (HDFC)',
    recipientEmail: 'loans-underwriting@hdfcbank.com',
    createdAt: '2026-08-10T14:00:00Z',
    expiresAt: '2026-09-10T14:00:00Z',
    expiryOption: '30 days',
    hasPassword: true,
    password: 'mortgage-income-2026',
    allowDownload: true,
    accessCount: 3,
    status: 'revoked',
    views: []
  }
];
