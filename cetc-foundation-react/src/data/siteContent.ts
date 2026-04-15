export type TableSpec = {
  headers: string[];
  rows: string[][];
};

export type ModuleSpec = {
  id: string;
  title: string;
  points: string[];
};

export type NavItem = {
  label: string;
  to: string;
};

export const primaryNavigation: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Certifications', to: '/certifications' },
  { label: 'About', to: '/about' },
  { label: 'Verify', to: '/verify' },
  { label: 'Partner', to: '/partner' },
  { label: 'Admin', to: '/admin' },
  { label: 'Contact', to: '/contact' },
];

export const homeHighlights = [
  { label: 'Document Version', value: '1.0' },
  { label: 'Document Date', value: 'March 2026' },
  { label: 'Planned Go-Live', value: 'Week 20' },
  { label: 'Year 1 Revenue Target', value: 'Rs. 10 Crore' },
];

export const organizationFacts: string[][] = [
  ['Organization', 'Council for Education, Training and Certification Foundation'],
  ['Registration', 'Section 8 Company under MCA, Govt. of India'],
  ['Certification', 'ISO 9001:2015 Certified'],
  ['NITI Aayog', 'NGO Darpan Registered'],
  ['MSME', 'Udyam Registered'],
  ['Location', 'Bhiwandi, Maharashtra'],
  ['Website', 'cetcfoundation.org (proposed)'],
  ['Document Date', 'March 2026'],
];

export const projectOverview =
  'CETC Foundation ek ISO 9001:2015 certified, Section 8 company hai jo online skill assessment aur certification ke kaam ke liye register ki gayi hai. Is platform ka main maqsad ek complete digital system banana hai jisme candidates online assessment de sakein, certificate payein, aur partner institutes (Authorized Assessment Centers - AAC) apne students ko bulk mein enroll kar sakein.';

export const targetUsers: TableSpec = {
  headers: ['User Type', 'Description', 'Primary Actions'],
  rows: [
    ['Candidate', 'Koi bhi skilled worker jo certificate lena chahta ho', 'Register, Pay, Exam, Download Certificate'],
    ['Partner (AAC)', 'Institutes, NGOs, ITIs, Beauty Academies', 'Bulk upload, Commission track, Reports'],
    ['Admin', 'CETC Foundation ka internal team', 'All management functions'],
    ['Employer / Verifier', 'Companies jo certificate verify karein', 'Verify certificate via QR / number'],
  ],
};

export const publicPages: TableSpec = {
  headers: ['Page', 'URL', 'Main Purpose'],
  rows: [
    ['Homepage', '/', 'Hero, stats, trust badges, CTA, trades listing'],
    ['Certifications', '/certifications', 'All trades - details, fees, syllabus, enroll'],
    ['About Us', '/about', 'Section 8, ISO, NITI Aayog, team, mission'],
    ['Verify Certificate', '/verify', 'QR scan ya certificate number se verify'],
    ['Become a Partner', '/partner', 'AAC registration form + benefits'],
    ['Contact Us', '/contact', 'WhatsApp, email, address, enquiry form'],
    ['Blog / News', '/blog', 'Updates, success stories (optional Phase 2)'],
  ],
};

export const candidatePortal: TableSpec = {
  headers: ['Page', 'URL', 'Function'],
  rows: [
    ['Register / Login', '/candidate/login', 'OTP-based mobile login, new registration'],
    ['Dashboard', '/candidate/dashboard', 'Enrolled courses, exam status, certificates'],
    ['Fee Payment', '/candidate/pay', 'Razorpay gateway - UPI, card, netbanking'],
    ['Online Exam', '/candidate/exam/:id', 'MCQ assessment - timer, anti-cheat, auto-score'],
    ['My Certificates', '/candidate/certificates', 'Download, share, QR verify'],
    ['My Profile', '/candidate/profile', 'Personal details, photo, Aadhaar optional'],
  ],
};

export const partnerPortal: TableSpec = {
  headers: ['Page', 'URL', 'Function'],
  rows: [
    ['Partner Login', '/partner/login', 'Separate login from candidate'],
    ['Partner Dashboard', '/partner/dashboard', 'Overview - candidates, earnings, batches'],
    ['Register Candidates', '/partner/enroll', 'Single or Excel bulk upload'],
    ['Batch Management', '/partner/batches', 'Create batches, assign exam dates'],
    ['Commission Tracker', '/partner/earnings', 'Real-time earnings, payout history'],
    ['Reports', '/partner/reports', 'Pass rate, trade-wise analysis, Excel export'],
    ['Branding Kit', '/partner/branding', 'Download logos, banners, certificates'],
  ],
};

export const adminPanel: TableSpec = {
  headers: ['Module', 'URL', 'Function'],
  rows: [
    ['Dashboard', '/admin/dashboard', 'Live KPIs - revenue, certs, exams, partners'],
    ['Candidates', '/admin/candidates', 'All candidate records, search, filter'],
    ['Partners', '/admin/partners', 'AAC approval, management, performance'],
    ['Question Bank', '/admin/questions', 'Trade-wise MCQ - add, edit, approve'],
    ['Certificates', '/admin/certificates', 'Auto-generate, bulk issue, revoke'],
    ['Payments', '/admin/payments', 'All transactions, refunds, partner payouts'],
    ['Notifications', '/admin/notifications', 'WhatsApp, SMS, Email templates + send'],
    ['Reports', '/admin/reports', 'Analytics, state-wise heatmap, exports'],
    ['Settings', '/admin/settings', 'Trades, fees, passing marks, system config'],
  ],
};

export const techStack: TableSpec = {
  headers: ['Layer', 'Technology', 'Reason'],
  rows: [
    ['Frontend', 'Next.js 14 (React)', 'SEO friendly, fast, mobile responsive'],
    ['Styling', 'Tailwind CSS', 'Rapid development, consistent design'],
    ['Backend / API', 'Node.js + Express.js', 'Scalable REST API'],
    ['Database', 'PostgreSQL (primary)', 'Reliable relational data - candidates, certs'],
    ['Cache', 'Redis', 'Fast exam session, OTP storage'],
    ['Authentication', 'Firebase Auth + MSG91 OTP', 'Indian mobile OTP - reliable'],
    ['Payment Gateway', 'Razorpay', 'India ka #1 - UPI, card, netbanking, wallet'],
    ['File Storage', 'AWS S3 / Cloudflare R2', 'Certificate PDFs, profile photos'],
    ['Email', 'SendGrid', 'Transactional emails - receipts, results'],
    ['SMS / WhatsApp', 'MSG91 + Interakt/Wati', 'WhatsApp Business API automation'],
    ['PDF Generation', 'PDFKit (Node.js)', 'Certificate auto-generation'],
    ['QR Code', 'qrcode npm library', 'Certificate verification QR'],
    ['Hosting', 'DigitalOcean / AWS', 'Reliable, scalable, India region available'],
    ['Domain / SSL', "cetcfoundation.org + Let's Encrypt", 'HTTPS mandatory'],
  ],
};

export const architectureFlow = [
  'User (Browser/Mobile)',
  'Next.js Frontend - Static pages + dynamic portal',
  'Node.js API Server - REST APIs for all functions',
  'PostgreSQL DB + Redis Cache',
  'AWS S3 files + External APIs (Razorpay, MSG91, WhatsApp)',
];

export const databaseTables: TableSpec = {
  headers: ['Table Name', 'Key Fields'],
  rows: [
    ['users', 'id, name, mobile, email, aadhaar_optional, photo, created_at'],
    ['candidates', 'id, user_id, trade_id, enrollment_date, status'],
    ['trades', 'id, name, description, fee, passing_marks, question_count, duration_mins'],
    ['questions', 'id, trade_id, question_text, options(JSON), correct_answer, difficulty'],
    ['exams', 'id, candidate_id, trade_id, start_time, end_time, score, result, answers(JSON)'],
    ['certificates', 'id, candidate_id, cert_number, trade_id, issue_date, grade, qr_url, pdf_url'],
    ['partners', 'id, org_name, type, contact_name, mobile, state, district, status, commission_rate'],
    ['batches', 'id, partner_id, trade_id, candidates(JSON), exam_date, status'],
    ['payments', 'id, candidate_id, amount, razorpay_id, status, created_at'],
    ['commissions', 'id, partner_id, period, total_cands, rate, amount, paid_date'],
  ],
};

export const moduleSpecs: ModuleSpec[] = [
  {
    id: 'candidate-auth',
    title: '4.1 Candidate Registration & Login',
    points: [
      'Mobile number enter karo -> OTP via SMS (MSG91).',
      'OTP verify -> new user hai to profile form, returning user to dashboard.',
      'Profile fields: Full Name (required), Photo (required), DOB, Address, Education, Trade select.',
      'Aadhaar number optional field for future government scheme integration.',
      'Social login: Google OAuth (optional Phase 2).',
      'JWT token-based session - 30 days valid.',
    ],
  },
  {
    id: 'fee-payment',
    title: '4.2 Fee Payment System',
    points: [
      'Razorpay SDK integrate karein - server-side order create, client-side checkout.',
      'Accepted modes: UPI, Paytm, Google Pay, PhonePe, Debit/Credit Card, Net Banking.',
      'Amount: Rs. 1,000 per trade per candidate (configurable from admin).',
      'On success: auto-trigger enrollment, send WhatsApp confirmation.',
      'On failure: show error, allow retry - do not auto-debit again.',
      'Receipt: auto-generate PDF receipt with transaction ID and bulk payment support.',
    ],
  },
  {
    id: 'exam-engine',
    title: '4.3 Online Assessment Engine',
    points: [
      'Admin sets total questions (e.g. 60) and difficulty ratio (40% easy, 40% medium, 20% hard).',
      'System randomly picks questions from question bank on each attempt.',
      'Same candidate ko same question repeat nahi hogi (within 3 attempts).',
      'Full-screen mode, tab switch detection, right-click blocked, and auto-save every 30 seconds.',
      'Timer countdown with red warning in last 5 minutes and auto-submit on expiry.',
      'Instant result with pass/fail + percentage. Failed candidates get 3 attempts, then re-payment.',
    ],
  },
  {
    id: 'certificate-engine',
    title: '4.4 Certificate Generation Engine',
    points: [
      'Candidate pass karte hi certificate 60 seconds ke andar generate ho.',
      'Certificate number format: CETC/YYYY/TRADECODE/XXXXXX (example: CETC/2025/BEAUTY/001247).',
      'QR code verify link embed karo: verify.cetcfoundation.org?cert=<certificate-id>.',
      'Elements: candidate name, photo, trade, score, grade, date, cert number, QR, seal, signature.',
      'Grade system: A (85%+), B (70-84%), C (67-69%), Fail (<67%).',
      'PDF S3 me store karo aur WhatsApp, email, candidate portal se deliver karo.',
    ],
  },
  {
    id: 'verify-portal',
    title: '4.5 Certificate Verification Portal',
    points: [
      'Public page - koi bhi verify kar sake, login required nahi.',
      'Input by certificate number or QR scan (mobile camera).',
      'Valid certificate: candidate name, photo, trade, grade, date, issuing center display karo.',
      "Invalid certificate message: 'Certificate not found - This may be fake'.",
      "Employer feature: WhatsApp share button - 'This candidate is CETC Certified'.",
    ],
  },
  {
    id: 'partner-portal',
    title: '4.6 Partner (AAC) Portal',
    points: [
      'Separate login credentials from candidate portal.',
      'Single enrollment aur bulk enrollment via Excel flow.',
      'Validation: duplicate numbers highlight, missing fields flag, invalid format alert.',
      'Batch creation = group of candidates + trade + exam date.',
      'Commission tracker: Rs. 200-300 per passed candidate (trade-wise configurable).',
      'Monthly payout on 1st if balance > Rs. 500 and reports export available.',
    ],
  },
  {
    id: 'admin-control',
    title: '4.7 Admin Panel',
    points: [
      'Live metrics: certs today, exams in progress, revenue today, new partners.',
      'Charts: monthly certifications bar chart, trade-wise pie chart, state-wise heatmap.',
      'Question bank Excel import with workflow Draft -> Review -> Approved.',
      'Partner applications approve/reject with reason plus partner quality suspension controls.',
      'Notification center for templates, broadcast, and scheduled reminders.',
    ],
  },
];

export const phaseBreakdown = [
  'Phase 1: Homepage, Candidate registration, Payment, Basic exam engine, Certificate generation.',
  'Phase 2: Candidate dashboard, Certificate verify, WhatsApp automation, Email system.',
  'Phase 3: Partner portal, Bulk upload, Commission tracker, Partner reports.',
  'Phase 4: Admin dashboard, Question bank, Analytics, Notification center.',
  'Phase 5: Testing, bug fixes, security audit, go-live, training.',
  'Complete platform rollout.',
];

export const developerAllocation: TableSpec = {
  headers: ['Developer', 'Responsibility', 'Tech Skills Needed'],
  rows: [
    ['Dev 1 (Frontend)', 'Homepage, public pages, candidate portal UI, exam interface', 'React/Next.js, Tailwind CSS, HTML/CSS'],
    ['Dev 2 (Backend)', 'API development, database design, payment integration, certificate engine', 'Node.js, PostgreSQL, REST APIs, Razorpay'],
    ['Dev 3 (Full Stack)', 'Partner portal, admin panel, WhatsApp integration, notifications', 'React + Node.js, MSG91 API, Excel parsing'],
    ['Intern / Tester', 'Testing, content upload, question bank entry, documentation', 'Basic web, Excel, attention to detail'],
  ],
};

export const milestones: TableSpec = {
  headers: ['Milestone', 'Deadline', 'Deliverable'],
  rows: [
    ['M1 - Design Approval', 'Week 2', 'Figma/HTML mockup approved by Shoaib bhai'],
    ['M2 - Database Ready', 'Week 4', 'All tables created, API endpoints documented'],
    ['M3 - Payment Live', 'Week 6', 'Razorpay test mode working, receipt generating'],
    ['M4 - First Exam', 'Week 8', '1 trade (Beautician) exam engine live - internal test'],
    ['M5 - Certificate Live', 'Week 10', 'Auto-generate + QR verify working'],
    ['M6 - Partner Portal', 'Week 14', 'Partner can enroll students, see commission'],
    ['M7 - Admin Panel', 'Week 18', 'Full admin control panel working'],
    ['M8 - Go Live', 'Week 20', 'Domain live, SSL, first real candidate test'],
  ],
};

export const securityRequirements = [
  'HTTPS compulsory with SSL certificate on all pages.',
  'Passwords hashed with bcrypt, never store plain text.',
  'API authentication via JWT tokens with expiry.',
  'Exam anti-cheat enforced with server-side validation.',
  'Payment security: do not store card details, Razorpay handles PCI compliance.',
  'OTP requests rate limit: max 3 per hour per number.',
  'SQL injection protection with parameterized queries only.',
  'XSS protection by sanitizing all user inputs.',
  'Certificate tamper-proofing with unique hash in QR + database verification.',
  'Admin panel hardening with IP whitelist + 2FA.',
  'Daily automated database backup to S3.',
];

export const performanceTargets: TableSpec = {
  headers: ['Metric', 'Target'],
  rows: [
    ['Page load time', 'Under 3 seconds on mobile (4G)'],
    ['Exam concurrent users', '500 candidates simultaneously'],
    ['Certificate generation', 'Under 60 seconds after result'],
    ['Database query time', 'Under 500ms for all queries'],
    ['Uptime', '99.5% minimum - scheduled maintenance only'],
    ['Mobile responsive', '100% - all pages work on 320px+ screens'],
    ['Exam auto-save', 'Every 30 seconds'],
    ['Payment success rate', 'Webhook retry on failure - 3 attempts'],
  ],
};

export const integrations: TableSpec = {
  headers: ['Service', 'Provider', 'Purpose', 'Est. Monthly Cost'],
  rows: [
    ['Payment Gateway', 'Razorpay', 'All payments - UPI, card, netbanking', '2% per transaction'],
    ['SMS / OTP', 'MSG91', 'OTP login, exam alerts, result SMS', 'Rs. 0.18 per SMS (~Rs. 500-1000/month)'],
    ['WhatsApp Business', 'Interakt / Wati', 'Automated messages - confirm, result, certificate', 'Rs. 999-2,999/month'],
    ['Email', 'SendGrid', 'Receipts, results, certificates email', 'Free up to 100/day, then $20/month'],
    ['Cloud Storage', 'AWS S3 / Cloudflare R2', 'Certificate PDFs and profile photos', 'Rs. 500-2,000/month'],
    ['Hosting', 'DigitalOcean Droplet', 'Server hosting (4GB RAM recommended)', 'Rs. 2,000-4,000/month'],
    ['Domain', 'GoDaddy / Namecheap', 'cetcfoundation.org', 'Rs. 1,000/year'],
    ['SSL Certificate', "Let's Encrypt", 'HTTPS security', 'Free'],
    ['Maps', 'Google Maps API', 'Partner center locations', 'Free up to 28,000 loads/month'],
  ],
};

export const contentRequirements = [
  'Logo: CETC Foundation high-resolution PNG + SVG format (transparent background).',
  "Tagline confirm karo - e.g. 'India ka Skill Certification Hub'.",
  'About us text: mission, vision, history (200-300 words).',
  'Trade list: final 8-10 trades with name, description, syllabus topics.',
  'Certificate template design approval by Shoaib bhai before development.',
  'Question bank: minimum 150 questions per trade before go-live.',
  'Partner agreement text: terms and conditions with legal review recommended.',
  'Privacy Policy + Terms of Use pages mandatory for payment gateway approval.',
  'Trust badges: ISO certificate scan, NITI Aayog Darpan screenshot, Section 8 certificate.',
];

export const budgetSummary: TableSpec = {
  headers: ['Item', 'One-time Cost', 'Monthly Cost'],
  rows: [
    ['Development (Phase 1-5)', 'Rs. 2,50,000', '-'],
    ['Domain (.org)', 'Rs. 1,000/year', '-'],
    ['Server Hosting', '-', 'Rs. 2,000-4,000'],
    ['WhatsApp API', '-', 'Rs. 999-2,999'],
    ['SMS (MSG91)', '-', 'Rs. 500-1,000'],
    ['Email (SendGrid)', '-', 'Free / Rs. 1,600'],
    ['Cloud Storage (S3)', '-', 'Rs. 500-2,000'],
    ['Razorpay fee', '-', '2% of revenue'],
    ['TOTAL (First Year)', 'Rs. 2,51,000', 'Rs. 5,000-12,000/month'],
    ['Year 1 Revenue Target', '-', 'Rs. 10 Crore (1L certifications)'],
  ],
};

export const complianceTags = ['ISO 9001:2015', 'Section 8 Company', 'NGO Darpan', 'MSME Udyam'];

export const contactDetails = [
  ['Office', 'Bhiwandi, Maharashtra'],
  ['Email', 'info@cetcfoundation.org'],
  ['Support Window', 'Mon-Sat, 9 AM to 6 PM'],
  ['Domain', 'cetcfoundation.org (proposed)'],
];
