#!/bin/bash

echo "🚀 Starting NIMS Backend Deployment..."

# Go to backend directory
cd /var/www/nims/backend || exit

# Pull latest changes (assuming git)
# git pull origin main

echo "📦 Installing dependencies..."
npm ci

echo "🛠️ Generating Prisma Client..."
npx prisma generate

echo "🗄️ Applying database migrations..."
npx prisma migrate deploy

echo "🔨 Building the application..."
npm run build

echo "🔄 Restarting PM2 process..."
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

echo "✅ Deployment successful!"
