# CETCF Backend Production Ready Checklist

## 1) Fill Environment
Use .env.production.example as base and create server/.env on server.

Mandatory third-party credentials:
- Razorpay: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
- MSG91: MSG91_AUTH_KEY, MSG91_TEMPLATE_ID, MSG91_SENDER_ID
- SendGrid: SENDGRID_API_KEY, SENDGRID_FROM_EMAIL
- AWS S3: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET

Mandatory internal values:
- NODE_ENV=production
- DEV_MODE=false
- DB_* PostgreSQL credentials
- JWT_SECRET (32+ chars)
- FRONTEND_URL, CERT_BASE_URL

## 2) Database Setup
Run once on production shell:
- npm ci
- npm run db:migrate
- npm run db:seed (optional for initial sample data)

## 3) Start Process
Recommended with PM2:
- npm i -g pm2
- pm2 start index.js --name cetcf-api
- pm2 save

## 4) Reverse Proxy (Nginx)
- Terminate HTTPS at Nginx
- Proxy pass to http://127.0.0.1:5000
- Forward X-Forwarded-For and X-Forwarded-Proto headers

## 5) Webhooks
Razorpay webhook URL:
- https://api.yourdomain.com/api/payments/webhook
Use same secret as RAZORPAY_WEBHOOK_SECRET.

## 6) Smoke Tests
- GET /api/health returns database: connected
- GET /api/trades returns list
- POST /api/auth/send-otp sends real OTP (no devOtp in response)
- POST /api/payments/create-order creates non-mock order

## 7) Security Gate Before Go-Live
- Do not keep placeholder keys
- Rotate any exposed secrets immediately
- Restrict DB and server ports via firewall/security group
- Enable regular backups for PostgreSQL
- Enable log monitoring and error alerts
