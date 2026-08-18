export const INITIAL_DOCUMENTS = [
  {
    id: 'doc-001',
    name: 'Passport_International.pdf',
    title: 'Republic Passport',
    folderId: 'folder-identity',
    category: 'Identity',
    fileType: 'pdf',
    sizeBytes: 2516582, // 2.4 MB
    sizeFormatted: '2.4 MB',
    uploadedAt: '2026-06-10T11:20:00Z',
    expiryDate: '2034-08-15',
    status: 'valid', // 'valid' | 'expiring' | 'expired'
    description: 'Official biometric passport copy with visa stamps page 1-12.',
    tags: ['Travel', 'Government ID', 'Biometric'],
    isStarred: true,
    previewType: 'passport',
    versions: [
      { version: 'v1.1', date: '2026-06-10', notes: 'Added stamped visa renewal page', size: '2.4 MB' },
      { version: 'v1.0', date: '2025-01-05', notes: 'Initial scan uploaded', size: '2.1 MB' }
    ],
    activityLog: [
      { id: 'act-1', action: 'Created Share Link', timestamp: '2026-08-14T09:30:00Z', user: 'Sumanth' },
      { id: 'act-2', action: 'Downloaded', timestamp: '2026-07-20T14:12:00Z', user: 'Sumanth' },
      { id: 'act-3', action: 'Updated Version v1.1', timestamp: '2026-06-10T11:20:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-002',
    name: 'Health_Insurance_Policy_2026.pdf',
    title: 'Star Health Comprehensive Policy',
    folderId: 'folder-insurance',
    category: 'Insurance',
    fileType: 'pdf',
    sizeBytes: 1887436,
    sizeFormatted: '1.8 MB',
    uploadedAt: '2025-08-24T14:40:00Z',
    expiryDate: '2026-08-24', // Expiring in 7 days!
    status: 'expiring',
    description: 'Annual family floater health insurance policy bond and cashless card details.',
    tags: ['Health', 'Insurance', 'Urgent Renewal'],
    isStarred: true,
    previewType: 'insurance',
    versions: [
      { version: 'v1.0', date: '2025-08-24', notes: 'Policy schedule 2025-2026', size: '1.8 MB' }
    ],
    activityLog: [
      { id: 'act-4', action: 'Expiry Alert Sent', timestamp: '2026-08-15T08:00:00Z', user: 'System' },
      { id: 'act-5', action: 'Viewed Preview', timestamp: '2026-08-16T17:45:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-003',
    name: 'Driving_Licence_Digital.pdf',
    title: 'Driver Licence Card (Class LMV+MCWG)',
    folderId: 'folder-identity',
    category: 'Identity',
    fileType: 'pdf',
    sizeBytes: 1258291,
    sizeFormatted: '1.2 MB',
    uploadedAt: '2026-01-12T16:15:00Z',
    expiryDate: '2026-09-09', // Expiring in ~23 days
    status: 'expiring',
    description: 'Smart chip driver licence card high-resolution scan front and back.',
    tags: ['Transport', 'ID', 'KYC'],
    isStarred: false,
    previewType: 'id_card',
    versions: [
      { version: 'v1.0', date: '2026-01-12', notes: 'Official scanned copy', size: '1.2 MB' }
    ],
    activityLog: [
      { id: 'act-6', action: 'Shared with Car Rental', timestamp: '2026-07-02T10:10:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-004',
    name: 'Vehicle_Insurance_Comprehensive.pdf',
    title: 'HDFC ERGO Auto Insurance Bond',
    folderId: 'folder-insurance',
    category: 'Insurance',
    fileType: 'pdf',
    sizeBytes: 3145728,
    sizeFormatted: '3.0 MB',
    uploadedAt: '2025-09-27T10:00:00Z',
    expiryDate: '2026-09-27', // Expiring in ~41 days
    status: 'expiring',
    description: 'Zero-depreciation motor insurance policy schedule for Honda City.',
    tags: ['Automobile', 'Policy', 'Vehicle'],
    isStarred: false,
    previewType: 'insurance',
    versions: [
      { version: 'v1.0', date: '2025-09-27', notes: 'Policy bond 2025-2026', size: '3.0 MB' }
    ],
    activityLog: [
      { id: 'act-7', action: 'Uploaded Document', timestamp: '2025-09-27T10:00:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-005',
    name: 'BTech_Degree_Certificate.pdf',
    title: 'Bachelor of Technology in Computer Science',
    folderId: 'folder-education',
    category: 'Education',
    fileType: 'pdf',
    sizeBytes: 5242880,
    sizeFormatted: '5.0 MB',
    uploadedAt: '2026-02-14T09:00:00Z',
    expiryDate: null,
    status: 'valid',
    description: 'Original university degree certificate with dean seal and verified QR code.',
    tags: ['Degree', 'Academic', 'Verified'],
    isStarred: true,
    previewType: 'certificate',
    versions: [
      { version: 'v1.0', date: '2026-02-14', notes: 'Digital original scan with apostille', size: '5.0 MB' }
    ],
    activityLog: [
      { id: 'act-8', action: 'Shared with Recruiter', timestamp: '2026-08-01T12:00:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-006',
    name: 'Tax_Return_FY25_26.pdf',
    title: 'Income Tax Acknowledgment ITR-V',
    folderId: 'folder-finance',
    category: 'Finance',
    fileType: 'pdf',
    sizeBytes: 943718,
    sizeFormatted: '920 KB',
    uploadedAt: '2026-07-28T18:10:00Z',
    expiryDate: null,
    status: 'valid',
    description: 'E-verified assessment year 2026-2027 tax filing acknowledgment.',
    tags: ['Tax', 'Finance', 'Compliance'],
    isStarred: false,
    previewType: 'finance',
    versions: [
      { version: 'v1.0', date: '2026-07-28', notes: 'ITR-V official acknowledgment', size: '920 KB' }
    ],
    activityLog: [
      { id: 'act-9', action: 'Uploaded Document', timestamp: '2026-07-28T18:10:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-007',
    name: 'Employment_Contract_Senior_Engineer.pdf',
    title: 'Offer Letter & Executive Employment Contract',
    folderId: 'folder-work',
    category: 'Work',
    fileType: 'pdf',
    sizeBytes: 4194304,
    sizeFormatted: '4.0 MB',
    uploadedAt: '2026-03-01T11:00:00Z',
    expiryDate: null,
    status: 'valid',
    description: 'Signed full-time employment agreement, stock option agreement and IP assignment.',
    tags: ['Employment', 'Legal', 'Confidential'],
    isStarred: true,
    previewType: 'contract',
    versions: [
      { version: 'v1.0', date: '2026-03-01', notes: 'Signed final copy', size: '4.0 MB' }
    ],
    activityLog: [
      { id: 'act-10', action: 'Security Scan Completed', timestamp: '2026-03-01T11:01:00Z', user: 'System' }
    ]
  },
  {
    id: 'doc-008',
    name: 'Residential_Lease_Agreement.pdf',
    title: 'Apartment Lease Agreement 2025-2026',
    folderId: 'folder-personal',
    category: 'Personal',
    fileType: 'pdf',
    sizeBytes: 3670016,
    sizeFormatted: '3.5 MB',
    uploadedAt: '2025-08-01T10:00:00Z',
    expiryDate: '2026-07-31', // Already expired!
    status: 'expired',
    description: '11-month registered rental agreement with property landlord.',
    tags: ['Housing', 'Rental', 'Expired'],
    isStarred: false,
    previewType: 'contract',
    versions: [
      { version: 'v1.0', date: '2025-08-01', notes: 'Notarized lease copy', size: '3.5 MB' }
    ],
    activityLog: [
      { id: 'act-11', action: 'Marked as Expired', timestamp: '2026-08-01T00:00:00Z', user: 'System' }
    ]
  },
  {
    id: 'doc-009',
    name: 'Resume_Staff_Product_Engineer.pdf',
    title: 'Curriculum Vitae - Engineering Leadership',
    folderId: 'folder-work',
    category: 'Work',
    fileType: 'pdf',
    sizeBytes: 734003,
    sizeFormatted: '716 KB',
    uploadedAt: '2026-08-10T14:30:00Z',
    expiryDate: null,
    status: 'valid',
    description: 'Updated tech resume with latest system architecture & AI projects.',
    tags: ['Career', 'CV', 'Public'],
    isStarred: true,
    previewType: 'resume',
    versions: [
      { version: 'v2.0', date: '2026-08-10', notes: 'Added 2026 milestones', size: '716 KB' },
      { version: 'v1.0', date: '2025-11-20', notes: 'Initial version', size: '680 KB' }
    ],
    activityLog: [
      { id: 'act-12', action: 'Shared with Recruiter via Secure Link', timestamp: '2026-08-11T16:00:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-010',
    name: 'National_ID_Card_Front_Back.png',
    title: 'Aadhaar / National Identity Card',
    folderId: 'folder-identity',
    category: 'Identity',
    fileType: 'png',
    sizeBytes: 4718592,
    sizeFormatted: '4.5 MB',
    uploadedAt: '2026-04-18T15:20:00Z',
    expiryDate: null,
    status: 'valid',
    description: 'Masked national identity card copy with QR validation code.',
    tags: ['Identity', 'Government ID', 'Masked'],
    isStarred: true,
    previewType: 'id_card',
    versions: [
      { version: 'v1.0', date: '2026-04-18', notes: 'High resolution digital copy', size: '4.5 MB' }
    ],
    activityLog: [
      { id: 'act-13', action: 'Downloaded', timestamp: '2026-06-15T09:20:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-011',
    name: 'University_Consolidated_Transcripts.pdf',
    title: 'Official Academic Transcript (Sem 1-8)',
    folderId: 'folder-education',
    category: 'Education',
    fileType: 'pdf',
    sizeBytes: 6291456,
    sizeFormatted: '6.0 MB',
    uploadedAt: '2026-02-14T09:15:00Z',
    expiryDate: null,
    status: 'valid',
    description: 'Controller of examinations stamped consolidated grade sheets.',
    tags: ['Grades', 'Academic', 'Official'],
    isStarred: false,
    previewType: 'certificate',
    versions: [
      { version: 'v1.0', date: '2026-02-14', notes: 'Certified true copy', size: '6.0 MB' }
    ],
    activityLog: [
      { id: 'act-14', action: 'Uploaded Document', timestamp: '2026-02-14T09:15:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-012',
    name: 'AWS_Solutions_Architect_Certificate.pdf',
    title: 'AWS Certified Solutions Architect - Professional',
    folderId: 'folder-education',
    category: 'Education',
    fileType: 'pdf',
    sizeBytes: 1572864,
    sizeFormatted: '1.5 MB',
    uploadedAt: '2025-05-10T12:00:00Z',
    expiryDate: '2028-05-10',
    status: 'valid',
    description: 'Digital certification badge verification code: AWS-PSA-994821.',
    tags: ['Certification', 'Cloud', 'AWS'],
    isStarred: true,
    previewType: 'certificate',
    versions: [
      { version: 'v1.0', date: '2025-05-10', notes: 'Digital certificate issued by Amazon', size: '1.5 MB' }
    ],
    activityLog: [
      { id: 'act-15', action: 'Viewed Preview', timestamp: '2026-05-10T10:00:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-013',
    name: 'HDFC_Bank_6Month_Statement.pdf',
    title: 'Salary Account Statement (Jan 2026 - Jun 2026)',
    folderId: 'folder-finance',
    category: 'Finance',
    fileType: 'pdf',
    sizeBytes: 5767168,
    sizeFormatted: '5.5 MB',
    uploadedAt: '2026-07-05T13:45:00Z',
    expiryDate: null,
    status: 'valid',
    description: 'Digitally signed bank statement for visa and loan applications.',
    tags: ['Banking', 'Statements', 'Confidential'],
    isStarred: false,
    previewType: 'finance',
    versions: [
      { version: 'v1.0', date: '2026-07-05', notes: 'E-statement download', size: '5.5 MB' }
    ],
    activityLog: [
      { id: 'act-16', action: 'Downloaded', timestamp: '2026-07-06T11:00:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-014',
    name: 'Form_16_TDS_Certificate_2026.pdf',
    title: 'Form 16 Part A & B (Employer Tax Proof)',
    folderId: 'folder-finance',
    category: 'Finance',
    fileType: 'pdf',
    sizeBytes: 2097152,
    sizeFormatted: '2.0 MB',
    uploadedAt: '2026-06-20T10:10:00Z',
    expiryDate: null,
    status: 'valid',
    description: 'Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source.',
    tags: ['Tax', 'Form 16', 'Salary'],
    isStarred: false,
    previewType: 'finance',
    versions: [
      { version: 'v1.0', date: '2026-06-20', notes: 'Signed Form 16', size: '2.0 MB' }
    ],
    activityLog: [
      { id: 'act-17', action: 'Uploaded Document', timestamp: '2026-06-20T10:10:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-015',
    name: 'Stock_Option_Grant_Agreement.pdf',
    title: 'Equity Incentive Plan - Stock Option Notice',
    folderId: 'folder-work',
    category: 'Work',
    fileType: 'pdf',
    sizeBytes: 2621440,
    sizeFormatted: '2.5 MB',
    uploadedAt: '2026-03-15T15:00:00Z',
    expiryDate: '2036-03-15',
    status: 'valid',
    description: 'Vesting schedule, option grant notice and exercise terms.',
    tags: ['Equity', 'ESOP', 'Legal'],
    isStarred: true,
    previewType: 'contract',
    versions: [
      { version: 'v1.0', date: '2026-03-15', notes: 'Carta countersigned copy', size: '2.5 MB' }
    ],
    activityLog: [
      { id: 'act-18', action: 'Uploaded Document', timestamp: '2026-03-15T15:00:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-016',
    name: 'Term_Life_Insurance_Bond.pdf',
    title: 'Max Life Term Insurance Policy Document',
    folderId: 'folder-insurance',
    category: 'Insurance',
    fileType: 'pdf',
    sizeBytes: 8388608,
    sizeFormatted: '8.0 MB',
    uploadedAt: '2026-01-05T14:20:00Z',
    expiryDate: '2060-01-05',
    status: 'valid',
    description: '1 Crore pure term insurance policy schedule with nominee nomination registered.',
    tags: ['Life Insurance', 'Protection', 'Family'],
    isStarred: false,
    previewType: 'insurance',
    versions: [
      { version: 'v1.0', date: '2026-01-05', notes: 'Original policy schedule', size: '8.0 MB' }
    ],
    activityLog: [
      { id: 'act-19', action: 'Uploaded Document', timestamp: '2026-01-05T14:20:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-017',
    name: 'Dental_Vision_Supplemental_Care.pdf',
    title: 'Care Health Supplemental Benefits Card',
    folderId: 'folder-insurance',
    category: 'Insurance',
    fileType: 'pdf',
    sizeBytes: 1048576,
    sizeFormatted: '1.0 MB',
    uploadedAt: '2026-02-01T16:00:00Z',
    expiryDate: '2027-02-01',
    status: 'valid',
    description: 'Outpatient dental and ophthalmology coverage card with network clinics list.',
    tags: ['Health', 'OPD', 'Card'],
    isStarred: false,
    previewType: 'insurance',
    versions: [
      { version: 'v1.0', date: '2026-02-01', notes: 'Issued digital card', size: '1.0 MB' }
    ],
    activityLog: [
      { id: 'act-20', action: 'Viewed Preview', timestamp: '2026-04-10T11:00:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-018',
    name: 'Apartment_Sale_Deed_Registry.pdf',
    title: 'Property Registered Sale Deed & Title',
    folderId: 'folder-personal',
    category: 'Personal',
    fileType: 'pdf',
    sizeBytes: 10485760,
    sizeFormatted: '10.0 MB',
    uploadedAt: '2025-10-10T12:00:00Z',
    expiryDate: null,
    status: 'valid',
    description: 'Sub-registrar stamped ownership deed, encumbrance certificate and possession letter.',
    tags: ['Real Estate', 'Title Deed', 'High Value'],
    isStarred: true,
    previewType: 'contract',
    versions: [
      { version: 'v1.0', date: '2025-10-10', notes: 'Scanned 42-page deed', size: '10.0 MB' }
    ],
    activityLog: [
      { id: 'act-21', action: 'High Security Pin Protection Added', timestamp: '2025-10-10T12:05:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-019',
    name: 'MacBook_Pro_Invoice_AppleCare.jpg',
    title: 'Apple Store Receipt & AppleCare+ Bond',
    folderId: 'folder-personal',
    category: 'Personal',
    fileType: 'jpg',
    sizeBytes: 2306867,
    sizeFormatted: '2.2 MB',
    uploadedAt: '2026-05-04T18:30:00Z',
    expiryDate: '2028-05-04',
    status: 'valid',
    description: 'Original purchase receipt for MacBook Pro M3 Max with serial number and 3-year warranty.',
    tags: ['Receipt', 'Warranty', 'Hardware'],
    isStarred: false,
    previewType: 'receipt',
    versions: [
      { version: 'v1.0', date: '2026-05-04', notes: 'Scanned bill', size: '2.2 MB' }
    ],
    activityLog: [
      { id: 'act-22', action: 'Uploaded Document', timestamp: '2026-05-04T18:30:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-020',
    name: 'PAN_Permanent_Account_Number.jpg',
    title: 'Income Tax Department PAN Card',
    folderId: 'folder-identity',
    category: 'Identity',
    fileType: 'jpg',
    sizeBytes: 1572864,
    sizeFormatted: '1.5 MB',
    uploadedAt: '2026-01-10T11:00:00Z',
    expiryDate: null,
    status: 'valid',
    description: 'Official tax identification card with photo and holographic security mark.',
    tags: ['PAN', 'Tax ID', 'Government'],
    isStarred: false,
    previewType: 'id_card',
    versions: [
      { version: 'v1.0', date: '2026-01-10', notes: 'High quality color scan', size: '1.5 MB' }
    ],
    activityLog: [
      { id: 'act-23', action: 'Downloaded', timestamp: '2026-03-20T08:15:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-021',
    name: 'High_School_Diploma_CBSE.pdf',
    title: 'Central Board Grade 12 Certificate',
    folderId: 'folder-education',
    category: 'Education',
    fileType: 'pdf',
    sizeBytes: 3145728,
    sizeFormatted: '3.0 MB',
    uploadedAt: '2026-02-14T09:30:00Z',
    expiryDate: null,
    status: 'valid',
    description: 'Secondary education board certificate with subject-wise percentages.',
    tags: ['School', 'Certificate', 'CBSE'],
    isStarred: false,
    previewType: 'certificate',
    versions: [
      { version: 'v1.0', date: '2026-02-14', notes: 'DigiLocker verified certificate', size: '3.0 MB' }
    ],
    activityLog: [
      { id: 'act-24', action: 'Uploaded Document', timestamp: '2026-02-14T09:30:00Z', user: 'Sumanth' }
    ]
  },
  {
    id: 'doc-022',
    name: 'Mutual_Fund_Portfolio_Statement.pdf',
    title: 'CAMS Consolidated Account Statement (CAS)',
    folderId: 'folder-finance',
    category: 'Finance',
    fileType: 'pdf',
    sizeBytes: 4194304,
    sizeFormatted: '4.0 MB',
    uploadedAt: '2026-08-05T09:00:00Z',
    expiryDate: null,
    status: 'valid',
    description: 'Monthly valuation statement covering mutual funds, stocks, and NPS holdings.',
    tags: ['Investments', 'CAMS', 'Portfolio'],
    isStarred: false,
    previewType: 'finance',
    versions: [
      { version: 'v1.0', date: '2026-08-05', notes: 'Monthly summary', size: '4.0 MB' }
    ],
    activityLog: [
      { id: 'act-25', action: 'Uploaded Document', timestamp: '2026-08-05T09:00:00Z', user: 'Sumanth' }
    ]
  }
];
