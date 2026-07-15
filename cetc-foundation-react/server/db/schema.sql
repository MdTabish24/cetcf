-- ============================================================
-- CETCF FOUNDATION — FULL DATABASE SCHEMA (PostgreSQL)
-- ============================================================

-- Users table (all user types)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  mobile VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  photo_url TEXT,
  dob DATE,
  address TEXT,
  education VARCHAR(255),
  aadhaar_optional VARCHAR(20),
  role VARCHAR(20) DEFAULT 'candidate' CHECK (role IN ('candidate', 'partner', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin accounts (separate from candidate users)
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Certification trades
CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,        -- e.g. BEAUTY, PLUMB, ELEC
  name VARCHAR(255) NOT NULL,
  description TEXT,
  syllabus_topics TEXT[],
  fee INTEGER NOT NULL DEFAULT 1000,        -- in INR
  passing_marks INTEGER NOT NULL DEFAULT 40,
  question_count INTEGER NOT NULL DEFAULT 20,
  duration_mins INTEGER NOT NULL DEFAULT 90,
  difficulty_easy_pct INTEGER DEFAULT 50,
  difficulty_medium_pct INTEGER DEFAULT 25,
  difficulty_hard_pct INTEGER DEFAULT 25,
  commission_rate INTEGER DEFAULT 200,      -- per passed candidate
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- MCQ Question Bank
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  trade_id INTEGER REFERENCES trades(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  explanation TEXT,
  times_used INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','review','approved')),
  created_by INTEGER REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Candidate enrollments (per trade)
CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  trade_id INTEGER REFERENCES trades(id) ON DELETE RESTRICT,
  pathway VARCHAR(20) DEFAULT 'rpl' CHECK (pathway IN ('video', 'rpl')),
  enrollment_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled','exam_ready','passed','failed','expired')),
  attempts_used INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  UNIQUE(user_id, trade_id)
);

-- Course videos (for the Video Pathway)
CREATE TABLE IF NOT EXISTS course_videos (
  id SERIAL PRIMARY KEY,
  trade_id INTEGER REFERENCES trades(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  duration_mins INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Exam sessions
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  trade_id INTEGER REFERENCES trades(id),
  question_ids INTEGER[],                  -- ordered list of question IDs for this session
  answers JSONB DEFAULT '{}',             -- { "question_id": "A|B|C|D" }
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  score INTEGER,
  total_questions INTEGER,
  result VARCHAR(10) CHECK (result IN ('pass','fail','ongoing','abandoned')),
  tab_switches INTEGER DEFAULT 0,
  last_saved_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Issued certificates
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id),
  exam_id INTEGER REFERENCES exams(id),
  cert_number VARCHAR(50) UNIQUE NOT NULL,  -- CETC/YYYY/TRADECODE/XXXXXX
  trade_id INTEGER REFERENCES trades(id),
  issue_date TIMESTAMP DEFAULT NOW(),
  grade CHAR(1) CHECK (grade IN ('A','B','C','D')),
  score INTEGER,
  percentage DECIMAL(5,2),
  qr_url TEXT,
  pdf_url TEXT,
  verification_hash VARCHAR(64),
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Partner organizations (AAC)
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  org_name VARCHAR(255) NOT NULL,
  org_type VARCHAR(50),                    -- ITI, Beauty Academy, NGO, etc.
  contact_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  email VARCHAR(255),
  state VARCHAR(100),
  district VARCHAR(100),
  address TEXT,
  password_hash VARCHAR(255),             -- partners login with password
  interested_trades INTEGER[],            -- array of trade IDs
  expected_monthly_students INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended')),
  rejection_reason TEXT,
  commission_rate INTEGER DEFAULT 200,    -- per passed candidate
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Exam batches (created by partners)
CREATE TABLE IF NOT EXISTS batches (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER REFERENCES partners(id),
  trade_id INTEGER REFERENCES trades(id),
  batch_name VARCHAR(255),
  candidate_ids INTEGER[],               -- array of candidate IDs enrolled
  exam_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payment records
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  candidate_id INTEGER REFERENCES candidates(id),
  partner_id INTEGER REFERENCES partners(id),  -- if partner paid
  amount INTEGER NOT NULL,               -- in INR paisa (multiply by 100 for Razorpay)
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','success','failed','refunded')),
  payment_mode VARCHAR(50),
  receipt_pdf_url TEXT,
  is_bulk BOOLEAN DEFAULT FALSE,
  bulk_candidate_ids INTEGER[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Partner commissions
CREATE TABLE IF NOT EXISTS commissions (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER REFERENCES partners(id),
  period VARCHAR(20),                    -- e.g. 2025-07
  total_candidates INTEGER DEFAULT 0,
  passed_candidates INTEGER DEFAULT 0,
  rate INTEGER NOT NULL,                 -- per passed candidate
  amount INTEGER NOT NULL,               -- total commission in INR
  is_paid BOOLEAN DEFAULT FALSE,
  paid_date DATE,
  bank_ref VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- OTP store (in-DB fallback; Redis preferred)
CREATE TABLE IF NOT EXISTS otps (
  id SERIAL PRIMARY KEY,
  mobile VARCHAR(15) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  attempt_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notification logs
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) CHECK (type IN ('sms','whatsapp','email')),
  recipient VARCHAR(255) NOT NULL,
  template VARCHAR(100),
  message TEXT,
  status VARCHAR(20) DEFAULT 'sent',
  error_msg TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_trade_id ON candidates(trade_id);
CREATE INDEX IF NOT EXISTS idx_questions_trade_id ON questions(trade_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_exams_candidate_id ON exams(candidate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_number ON certificates(cert_number);
CREATE INDEX IF NOT EXISTS idx_certificates_candidate_id ON certificates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_otps_mobile ON otps(mobile);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
