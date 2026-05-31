#!/bin/bash
# ============================================
# TIVO DESIGN CRM - ONE-COMMAND DEPLOY SCRIPT
# Run this on YOUR computer after unzipping
# ============================================

echo ""
echo "🏠 Tivo Design CRM — Deploy Script"
echo "==================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check .env file
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  No .env file found! Creating from template..."
    cp .env.example .env
    echo ""
    echo "🔑 IMPORTANT: Edit the .env file with your credentials:"
    echo "   VITE_SUPABASE_URL=your_url"
    echo "   VITE_SUPABASE_ANON_KEY=your_key"
    echo "   VITE_APPROVED_EMAILS=yourname@gmail.com,partner@gmail.com"
    echo ""
    read -p "Press Enter after editing .env to continue..."
fi

# Build
echo ""
echo "🔨 Building production app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Check errors above."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Netlify
echo ""
echo "🚀 Deploying to Netlify..."

if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

netlify deploy --prod --dir=dist --site=d9b0dea9-9435-45bb-bc47-153402593d8d

echo ""
echo "✅ DONE! Your app is live at:"
echo "   https://tivo-design-crm.netlify.app"
echo ""
echo "📋 NEXT STEPS:"
echo "   1. Go to Supabase → SQL Editor → Run SUPABASE_SCHEMA.sql"
echo "   2. Enable Google Auth in Supabase → Authentication → Providers"
echo "   3. Add env vars to Netlify → Site Settings → Environment Variables"
echo "   4. Open the app and login with Google!"
