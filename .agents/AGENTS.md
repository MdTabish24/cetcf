
# Deployment Rules for CETCF VPS (Nginx + PM2)
When deploying code to the VPS, follow this exact sequence:
1. Nginx is configured to serve the frontend from /var/www/cetcf/html. 
2. The React build outputs to dist/, so you MUST copy the built files to the Nginx root.

Full Deployment Command to run on VPS:
cd /var/www/cetcf/cetc-foundation-react && git pull && npm install --legacy-peer-deps && npm run build && rm -rf /var/www/cetcf/html/* && cp -r /var/www/cetcf/cetc-foundation-react/dist/* /var/www/cetcf/html/ && cd server && npm install && pm2 restart cetcf-api

