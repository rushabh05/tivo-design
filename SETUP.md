# Tivo Design CRM — Complete Setup Guide

## 1. Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **anon public key**

### Run Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy-paste the entire contents of `SUPABASE_SCHEMA.sql`
3. Click **Run**
4. **Important:** Edit the `is_approved_user()` function and replace the email addresses with your actual team emails

### Enable Google Auth
1. Go to **Authentication → Providers → Google**
2. Enable it and enter your Google Client ID and Secret
3. Add this redirect URL to Google Console:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

## 2. Google OAuth + Calendar Setup

### Google Cloud Console
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project: "Tivo Design CRM"
3. Enable **Google Calendar API** and **Google Identity API**

### OAuth Credentials
1. Create **OAuth 2.0 Client ID** (Web application)
2. Add Authorized Origins:
   - `http://localhost:5173` (development)
   - `https://your-netlify-domain.netlify.app` (production)
3. Add Redirect URIs:
   - `https://<your-supabase-project>.supabase.co/auth/v1/callback`
   - `http://localhost:5173`
4. Save Client ID and Client Secret

### Calendar API Key
1. Go to **Credentials → Create Credentials → API Key**
2. Restrict it to **Google Calendar API**
3. Note the API Key
4. In the app, open **Settings → Google Calendar** once to grant Calendar permission

## 3. Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_CALENDAR_API_KEY=your-google-calendar-api-key
VITE_APPROVED_EMAILS=founder@tivodesign.com,partner@tivodesign.com
```

> **Security Note:** The `VITE_APPROVED_EMAILS` is client-side only. For production security, the real access control is handled by Supabase RLS policies. Update the `is_approved_user()` function in your database.

## 4. Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 5. Netlify Deployment

### Option A: Netlify CLI
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Option B: Netlify Dashboard
1. Push code to GitHub
2. Connect repo in Netlify dashboard
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add all environment variables in **Site settings → Environment variables**
5. Deploy!

### netlify.toml (already included)
The `netlify.toml` handles SPA routing automatically.

## 6. PWA Setup

The app is PWA-ready and includes installable SVG icons in `public/`. To install on phones:
- **iOS:** Safari → Share → "Add to Home Screen"
- **Android:** Chrome → "Add to Home Screen" popup

For the best iOS home-screen icon rendering, you can optionally add a PNG `apple-touch-icon.png` later, but the current manifest is deployable as-is.

## 7. Post-Deployment Checklist

- [ ] Supabase schema deployed
- [ ] Approved emails added to `is_approved_user()` function
- [ ] Google Auth enabled in Supabase
- [ ] Environment variables added to Netlify
- [ ] Test login with founder email
- [ ] Test login with partner email
- [ ] Test adding a lead
- [ ] Test scheduling a follow-up
- [ ] Connect Google Calendar in Settings
- [ ] Test WhatsApp templates
- [ ] Install PWA on phone

## 8. Folder Structure

```
tivo-design/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── ui/               # Badge, Modal, Spinner, EmptyState
│   │   ├── layout/           # AppLayout, Sidebar, BottomNav
│   │   ├── leads/            # LeadCard, LeadForm, LeadFilters
│   │   ├── dashboard/        # StatCard
│   │   ├── followups/        # FollowupCard
│   │   └── whatsapp/         # WhatsAppTemplates
│   ├── hooks/                # useAuth, useNotifications
│   ├── lib/                  # supabase.js, constants.js, googleCalendar.js
│   ├── pages/                # All page components
│   ├── store/                # Zustand global store
│   └── styles/               # index.css (Tailwind)
├── SUPABASE_SCHEMA.sql       # Database schema
├── SETUP.md                  # This file
├── netlify.toml              # Netlify config
└── .env.example              # Environment variables template
```
