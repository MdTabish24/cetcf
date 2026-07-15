'use strict';
/**
 * ============================================================
 * CETCF FOUNDATION — BACKEND API SERVER
 * ============================================================
 * Node.js + Express REST API
 * Serves all APIs for: auth, candidates, trades, payments,
 * exams, certificates, partners, and admin panel.
 * ============================================================
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const { validateEnv, parseBool } = require('./config/env');

const { generalLimiter } = require('./middleware/rateLimiter');
const { testConnection } = require('./db');

// Routes
const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const tradeRoutes = require('./routes/trades');
const paymentRoutes = require('./routes/payments');
const examRoutes = require('./routes/exams');
const certificateRoutes = require('./routes/certificates');
const partnerRoutes = require('./routes/partners');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;
const frontendDistDir = path.resolve(__dirname, '..', 'dist');
const frontendIndexFile = path.join(frontendDistDir, 'index.html');
const hasFrontendBuild = fs.existsSync(frontendIndexFile);

const envCheck = validateEnv();
if (envCheck.warnings.length) {
  envCheck.warnings.forEach((warning) => console.warn(`[ENV Warning] ${warning}`));
}
if (envCheck.errors.length) {
  envCheck.errors.forEach((error) => console.error(`[ENV Error] ${error}`));
  process.exit(1);
}

if (envCheck.isProduction) {
  const trustProxyEnabled = parseBool(process.env.TRUST_PROXY || 'true');
  if (trustProxyEnabled) {
    app.set('trust proxy', 1);
  }
}

// ── Security Headers (Helmet) ─────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving PDFs/images cross-origin
    contentSecurityPolicy: false, // Let frontend handle its own CSP
  })
);

// ── CORS ──────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',   // Vite dev server
  'http://localhost:4173',   // Vite preview
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

const normalizedAllowedOrigins = new Set(
  allowedOrigins.map((origin) => {
    try {
      return new URL(origin).origin;
    } catch {
      return origin;
    }
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-origin (Postman, mobile, webhook) or allowed origins
      if (!origin) {
        callback(null, true);
        return;
      }

      // Hardcode live domain variations to prevent CORS issues caused by .env protocol mismatch
      if (origin.includes('cetcf.org')) {
        callback(null, true);
        return;
      }

      let normalizedOrigin = origin;
      try {
        normalizedOrigin = new URL(origin).origin;
      } catch {
        normalizedOrigin = origin;
      }

      if (normalizedAllowedOrigins.has(normalizedOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Razorpay-Signature'],
  })
);

// ── Razorpay Webhook (needs raw body — must be before JSON parser) ────
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// ── Body Parsers ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate Limiting ─────────────────────────────────────────────────────
app.use('/api/', generalLimiter);

// ── Static Files (uploads) ────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/api/uploads', express.static(uploadsDir));

// ── API Routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend build from the same service when dist is available.
if (hasFrontendBuild) {
  app.use(express.static(frontendDistDir));
  app.get(/^\/(?!api(?:\/|$)|uploads(?:\/|$)).*/, (req, res) => {
    return res.sendFile(frontendIndexFile);
  });
}

// ── Health Check ──────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const dbOk = await testConnection().catch(() => false);
  return res.json({
    status: 'ok',
    server: 'CETCF Foundation API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ── API Info ──────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  return res.json({
    name: 'CETCF Foundation Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth — OTP login, partner/admin login',
      candidates: '/api/candidates — Profile, dashboard, enrollment',
      trades: '/api/trades — List certifications',
      payments: '/api/payments — Razorpay payment flow',
      exams: '/api/exams — Online assessment engine',
      certificates: '/api/certificates — Generation, verification, download',
      partners: '/api/partners — AAC portal (enrollment, batches, commissions)',
      admin: '/api/admin — Admin panel (KPIs, questions, settings)',
    },
    docs: 'See README.md for full API documentation',
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────
app.use((req, res) => {
  if (hasFrontendBuild && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    return res.sendFile(frontendIndexFile);
  }

  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// ── Global Error Handler ──────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err.message);

  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ success: false, message: 'CORS error: origin not allowed.' });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: `File upload error: ${err.message}` });
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({ success: false, message: 'Duplicate entry — this record already exists.' });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({ success: false, message: 'Referenced record does not exist.' });
  }

  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
});

// ── Start Server ──────────────────────────────────────────────────────
async function startServer() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║     CETCF FOUNDATION — BACKEND API SERVER            ║');
  console.log('║     Council for Education, Training & Certification  ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // Test DB connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('⚠️  Starting server WITHOUT database connection.');
    console.warn('   Run "npm run db:migrate" to setup the database.\n');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📋 API root: http://localhost:${PORT}/api`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
    console.log(`🔧 Mode: ${process.env.NODE_ENV || 'development'}${process.env.DEV_MODE === 'true' ? ' (DEV_MODE — OTPs visible)' : ''}`);
    console.log(`\n✅ Ready to accept requests!\n`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
