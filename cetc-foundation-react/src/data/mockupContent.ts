export type NavItem = {
  label: string;
  to: string;
};

export type StatItem = {
  value: string;
  suffix?: string;
  label: string;
};

export type TrustBadge = {
  icon: string;
  label: string;
  tone: 'gold' | 'blue' | 'green' | 'teal';
};

export type StepItem = {
  number: string;
  title: string;
  description: string;
};

export type TradeItem = {
  icon: string;
  name: string;
  fee: string;
  badge?: string;
  details?: string;
};

export type PartnerCard = {
  type: string;
  title: string;
  earn: string;
  earnLabel: string;
  features: string[];
  highlight?: boolean;
  highlightLabel?: string;
};

export type FooterColumn = {
  title: string;
  links: string[];
};

export type ExamOption = {
  label: string;
  text: string;
  selected?: boolean;
};

export type AdminMetric = {
  label: string;
  value: string;
  change: string;
};

export type ChartBar = {
  month: string;
  height: number;
  highlight?: boolean;
};

export type CertificateFeature = {
  icon: string;
  text: string;
};

export const navItems: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Certifications', to: '/certifications' },
  { label: 'Take Exam', to: '/exam' },
  { label: 'Verify Certificate', to: '/verify' },
  { label: 'Become Partner', to: '/partner' },
  { label: 'Admin \u2197', to: '/admin' },
];

export const heroContent = {
  badge: "\u{1F3C6} India's Trusted Skill Assessment Body",
  title: 'Apni Skills ko Official Certificate dein',
  highlight: 'Skills',
  description:
    'ISO 9001:2015 Certified \u2022 Section 8 Company \u2022 NITI Aayog Registered\nOnline assessment lekar nationally recognized certificate payein sirf \u20B91,000 mein',
  primaryCta: 'Certification Dekhein \u2192',
  secondaryCta: 'Certificate Verify Karein',
};

export const stats: StatItem[] = [
  { value: '10', suffix: 'K+', label: 'Students Trained' },
  { value: '3', suffix: 'K+', label: 'Candidates Placed' },
  { value: '8', suffix: '+', label: 'Trade Certifications' },
  { value: '500', suffix: '+', label: 'Partner Centers' },
];

export const trustBadges: TrustBadge[] = [
  { icon: '\u{1F3DB}\uFE0F', label: 'NITI Aayog', tone: 'gold' },
  { icon: '\u{1F4CB}', label: 'ISO 9001:2015', tone: 'blue' },
  { icon: '\u{1F3E2}', label: 'Section 8 MCA', tone: 'green' },
  { icon: '\u26A1', label: 'MSME Udyam', tone: 'teal' },
];

export const steps: StepItem[] = [
  {
    number: '1',
    title: 'Register karein',
    description:
      'Mobile number se register karein, apna trade chunein aur \u20B91,000 fee pay karein \u2014 UPI, card, netbanking accepted',
  },
  {
    number: '2',
    title: 'Online Assessment dein',
    description: '60 MCQ questions, 60 minute mein. Apne phone ya laptop se ghar se ya nearest center se dein',
  },
  {
    number: '3',
    title: 'Certificate downloadkarein',
    description: 'Pass hone ke baad instant digital certificate milega \u2014 QR code verified, employer verified, lifetime valid',
  },
];

export const homeTrades: TradeItem[] = [
  { icon: '\u{1F487}', name: 'Beautician & Beauty Therapy', fee: '\u20B91,000 \u2022 60 Questions', badge: 'Popular' },
  { icon: '\u26A1', name: 'Electrician', fee: '\u20B91,000 \u2022 60 Questions' },
  { icon: '\u{1F4F1}', name: 'Mobile Repair Tech', fee: '\u20B91,000 \u2022 60 Questions', badge: 'New' },
  { icon: '\u{1F527}', name: 'Plumber', fee: '\u20B91,000 \u2022 60 Questions' },
  { icon: '\u2744\uFE0F', name: 'AC & Refrigeration', fee: '\u20B91,000 \u2022 60 Questions' },
  { icon: '\u{1F4BB}', name: 'Computer Operator', fee: '\u20B91,000 \u2022 60 Questions' },
  { icon: '\u{1F528}', name: 'Welder', fee: '\u20B91,000 \u2022 60 Questions' },
  { icon: '\u{1F6D2}', name: 'Retail Sales Associate', fee: '\u20B91,000 \u2022 60 Questions' },
];

export const certificateFeatures: CertificateFeature[] = [
  { icon: '\u{1F512}', text: 'Unique certificate number \u2014 CETC/2025/BEAUTY/000123' },
  { icon: '\u{1F4F1}', text: 'QR code scan karke instantly verify' },
  { icon: '\u2B07\uFE0F', text: 'High-resolution PDF download' },
  { icon: '\u{1F517}', text: 'LinkedIn par share karo directly' },
  { icon: '\u267E\uFE0F', text: 'Lifetime validity, cloud mein stored' },
];

export const certificateCard = {
  logo: 'CETC FOUNDATION',
  seal: '\u{1F3C6}',
  titleLabel: 'CERTIFICATE OF COMPETENCY',
  title: 'Beautician & Beauty Therapy',
  nameLabel: 'THIS IS TO CERTIFY THAT',
  name: 'Priya Sharma',
  description: 'has successfully completed the assessment and is hereby certified',
  meta: 'Grade: A \u2022 Score: 82% \u2022 Issued: Jan 2025',
  footerLeft: 'CETC/2025/BEAUTY/001247\nISO 9001:2015 Certified Body',
  footerRight: '\u2B1B',
};

export const partnerCards: PartnerCard[] = [
  {
    type: 'BEAUTY ACADEMIES',
    title: 'Beauty Academy Partner',
    earn: '\u20B9300',
    earnLabel: 'per certified student',
    features: ['Bulk enrollment portal', 'CETC branding materials', 'Monthly commission payout', 'Partner certificate'],
  },
  {
    type: 'MOST POPULAR',
    title: 'ITI / Polytechnic Partner',
    earn: '\u20B9250',
    earnLabel: 'per certified student',
    features: ['Excel bulk upload', 'Dedicated account manager', 'Batch result reports', 'MoU with CETC Foundation'],
    highlight: true,
    highlightLabel: 'MOST POPULAR',
  },
  {
    type: 'NGO / SKILL CENTERS',
    title: 'NGO Partner',
    earn: '\u20B9200',
    earnLabel: 'per certified student',
    features: ['CSR funding eligible', 'Government scheme access', 'Free trainer materials', 'Impact reports'],
  },
];

export const footerColumns: FooterColumn[] = [
  { title: 'Certifications', links: ['Beautician', 'Electrician', 'Mobile Repair', 'Plumber', 'AC Technician'] },
  { title: 'Quick Links', links: ['Verify Certificate', 'Become Partner', 'Take Exam', 'Download Brochure'] },
  {
    title: 'Contact',
    links: [
      '\u{1F4CD} Bhiwandi, Maharashtra',
      '\u{1F4F1} WhatsApp us',
      '\u2709\uFE0F info@cetcfoundation.org',
      '\u{1F550} Mon\u2013Sat 9am\u20136pm',
    ],
  },
];

export const footerBadges = ['NGO Darpan \u2713', 'ISO 9001 \u2713', 'MSME \u2713'];

export const coursesTabs = ['All Trades', 'Technical', 'Beauty & Wellness', 'IT & Digital', 'Retail & Service'];

export const courseTrades: TradeItem[] = [
  {
    icon: '\u{1F487}',
    name: 'Beautician & Beauty Therapy',
    fee: '\u20B91,000 \u2022 60 MCQ \u2022 60 Minutes',
    details: 'Covers: Skincare, Hair styling, Makeup, Nail art, Salon management',
  },
  {
    icon: '\u26A1',
    name: 'Electrician',
    fee: '\u20B91,000 \u2022 60 MCQ \u2022 60 Minutes',
    details: 'Covers: Wiring, Safety, Motors, Panels, Domestic & Industrial',
  },
  {
    icon: '\u{1F4F1}',
    name: 'Mobile Repair Technician',
    fee: '\u20B91,000 \u2022 60 MCQ \u2022 60 Minutes',
    details: 'Covers: Hardware, Software, Tools, Diagnostics, Customer service',
  },
  {
    icon: '\u2744\uFE0F',
    name: 'AC & Refrigeration Tech',
    fee: '\u20B91,000 \u2022 60 MCQ \u2022 60 Minutes',
    details: 'Covers: Installation, Gas charging, Maintenance, Fault diagnosis',
  },
  {
    icon: '\u{1F4BB}',
    name: 'Computer Operator',
    fee: '\u20B91,000 \u2022 60 MCQ \u2022 60 Minutes',
    details: 'Covers: MS Office, Internet, Typing, Basic accounting, Data entry',
  },
  {
    icon: '\u{1F527}',
    name: 'Plumber',
    fee: '\u20B91,000 \u2022 60 MCQ \u2022 60 Minutes',
    details: 'Covers: Pipe fitting, Sanitation, Tools, Drawing reading, Safety',
  },
];

export const examData = {
  title: 'Beautician & Beauty Therapy',
  meta: '60 Questions \u2022 60 Minutes \u2022 Passing marks: 40/60',
  timer: '47:23',
  questionNumber: 'Question 6 of 60',
  questionText:
    'Which skin type is characterized by excessive sebum production, enlarged pores, and a shiny appearance, particularly in the T-zone area?',
  options: [
    { label: 'A', text: 'Dry skin \u2014 lacks moisture and feels tight' },
    { label: 'B', text: 'Oily skin \u2014 excess sebum, enlarged pores, T-zone shine', selected: true },
    { label: 'C', text: 'Normal skin \u2014 balanced moisture and sebum levels' },
    { label: 'D', text: 'Sensitive skin \u2014 easily irritated, prone to redness' },
  ] as ExamOption[],
  qDots: [
    { number: '1', state: 'answered' },
    { number: '2', state: 'answered' },
    { number: '3', state: 'answered' },
    { number: '4', state: 'skipped' },
    { number: '5', state: 'answered' },
    { number: '6', state: 'current' },
    { number: '7', state: 'default' },
    { number: '8', state: 'default' },
    { number: '9', state: 'default' },
    { number: '10', state: 'default' },
    { number: '11', state: 'default' },
    { number: '12', state: 'default' },
  ],
};

export const verifyContent = {
  title: 'Certificate Verification',
  subtitle: 'Enter certificate number or scan QR code to verify authenticity',
  description: 'Certificate number enter karein (e.g. CETC/2025/BEAUTY/001247) ya QR code scan karein',
  inputPlaceholder: 'CETC/2025/BEAUTY/001247',
  verifyButton: 'Verify \u2192',
  scanButton: '\u{1F4F7} Scan QR Code',
  result: {
    name: 'Priya Sharma',
    trade: 'Beautician & Beauty Therapy \u2014 Grade A',
    fields: [
      ['Certificate No.', 'CETC/2025/BEAUTY/001247'],
      ['Issue Date', '15 January 2025'],
      ['Score', '82% (49/60)'],
      ['Validity', 'Lifetime'],
      ['Assessment Center', 'Pureshe Training Center, Bhiwandi'],
      ['Certified By', 'CETC Foundation (ISO 9001:2015)'],
    ],
  },
};

export const partnerForm = {
  title: 'Partner (AAC) Registration',
  subtitle:
    'Authorized Assessment Center ban kar apne students ko certify karwayein aur commission kamayein',
  fields: [
    { label: 'Institute / Center Name *', placeholder: 'e.g. ABC Beauty Academy, Pune', type: 'text' },
    { label: 'Contact Person *', placeholder: 'Full Name', type: 'text' },
    { label: 'Mobile Number *', placeholder: '10-digit number', type: 'text' },
    {
      label: 'Institute Type *',
      type: 'select',
      options: [
        'Beauty Academy / Salon Training',
        'ITI / Polytechnic',
        'NGO / Skill Development Center',
        'Coaching Institute',
        'Individual Trainer',
        'Corporate Training Dept.',
      ],
    },
    { label: 'Expected Monthly Students', placeholder: 'e.g. 50', type: 'number' },
  ],
  trades: ['Beautician', 'Electrician', 'Mobile Repair', 'Plumber', 'Computer'],
  submitLabel: 'Submit Application \u2192',
  note: 'Team 24 ghante mein WhatsApp pe contact karegi',
  benefits: [
    {
      icon: '\u{1F4B0}',
      title: '\u20B9200\u2013\u20B9300 per student',
      detail: 'Monthly payout on 1st of every month directly to bank account',
    },
    {
      icon: '\u{1F3C6}',
      title: 'CETC Authorized Partner Certificate',
      detail: 'ISO certified body ka authorized center \u2014 institute ki credibility badhegi',
    },
    {
      icon: '\u{1F4CA}',
      title: 'Partner Dashboard',
      detail: 'Real-time results, batch management, earnings tracker \u2014 sabkuch ek jagah',
    },
    {
      icon: '\u{1F4E6}',
      title: 'Free Branding Kit',
      detail: 'CETC logo, banners, brochures \u2014 print karo aur institute mein lagao',
    },
  ],
};

export const adminMenu = [
  '\u{1F4CA} Dashboard',
  '\u{1F465} Candidates',
  '\u{1F3EB} Partners (AAC)',
  '\u{1F4DD} Question Bank',
  '\u{1F4DC} Certificates',
  '\u{1F4B3} Payments',
  '\u{1F514} Notifications',
  '\u{1F4C8} Reports',
  '\u2699\uFE0F Settings',
];

export const adminMetrics: AdminMetric[] = [
  { label: 'Total Certifications', value: '12,847', change: '\u2191 234 this month' },
  { label: 'Revenue (This Month)', value: '\u20B92.3L', change: '\u2191 18% vs last month' },
  { label: 'Active Partners', value: '487', change: '\u2191 23 new this month' },
  { label: 'Pass Rate (Avg)', value: '74%', change: '\u2191 3% vs last month' },
];

export const adminChartBars: ChartBar[] = [
  { month: 'Jan', height: 40 },
  { month: 'Feb', height: 56 },
  { month: 'Mar', height: 72 },
  { month: 'Apr', height: 60 },
  { month: 'May', height: 90 },
  { month: 'Jun', height: 80 },
  { month: 'Jul', height: 100 },
  { month: 'Aug', height: 110 },
  { month: 'Sep', height: 95 },
  { month: 'Oct', height: 120 },
  { month: 'Nov', height: 130 },
  { month: 'Dec', height: 140, highlight: true },
];
