#!/bin/bash
set -e

echo "Starting Backend Setup..."

cd /var/www/cetcf/server

echo "Installing Node dependencies..."
npm install --production

echo "Running Database Migrations..."
npm run db:migrate

echo "Starting server with PM2..."
pm2 start index.js --name cetcf-api

echo "Saving PM2 state so it starts on reboot..."
pm2 save
pm2 startup | tail -n 1 | bash - || true

echo "Done! The API is running on port 5000."
