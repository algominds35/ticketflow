# Setup Guide - Local Development

Step-by-step guide to get TicketFlow running on your local machine.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git
- A Supabase account (free)
- A Google Cloud account (free)
- A Slack workspace for testing

---

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/ticketflow.git
cd ticketflow

# Install dependencies
npm install
```

---

## Step 2: Set Up Supabase

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Name: `ticketflow-dev`
   - Database Password: (generate a strong one)
   - Region: Choose closest to you
4. Click "Create Project"
5. Wait ~2 minutes for provisioning

### 2.2 Run Database Migration

1. Once project is ready, go to **SQL Editor**
2. Open `supabase/migrations/001_initial_schema.sql` in your code editor
3. Copy the entire file contents
4. Paste into Supabase SQL Editor
5. Click **"Run"**
6. You should see "Success. No rows returned"

### 2.3 Verify Tables

Go to **Table Editor** and verify these tables exist:
- ✅ organizations
- ✅ users
- ✅ tickets
- ✅ comments

### 2.4 Get API Keys

1. Go to **Settings → API**
2. Copy these three values (you'll need them next):
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

---

## Step 3: Configure Environment Variables

### 3.1 Create .env.local file

```bash
cp .env.example .env.local
```

### 3.2 Add Supabase Keys

Open `.env.local` and fill in:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App URL (for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Slack (we'll add these later)
# SLACK_BOT_TOKEN=
# SLACK_SIGNING_SECRET=
```

---

## Step 4: Set Up Google OAuth

### 4.1 Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to **APIs & Services → Credentials**
4. Click **"Create Credentials" → "OAuth 2.0 Client ID"**

### 4.2 Configure OAuth Consent Screen (First Time)

If prompted, configure consent screen:
1. User Type: **External**
2. App name: `TicketFlow`
3. User support email: Your email
4. Developer contact: Your email
5. Click **"Save and Continue"**
6. Scopes: No need to add any (click "Save and Continue")
7. Test users: Add your email
8. Click **"Save and Continue"**

### 4.3 Create OAuth Client

1. Application type: **Web application**
2. Name: `TicketFlow Dev`
3. Authorized redirect URIs - Add these:
   ```
   http://localhost:3000/auth/callback
   https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback
   ```
   (Replace `xxxxxxxxxxxxx` with your Supabase project ID)
4. Click **"Create"**
5. **Copy the Client ID and Client Secret** (you'll need them next)

### 4.4 Configure in Supabase

1. Go to Supabase Dashboard
2. Navigate to **Authentication → Providers**
3. Find **Google** and click to expand
4. Toggle **"Enable Sign in with Google"**
5. Paste your:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
6. Click **"Save"**

---

## Step 5: Test the App

### 5.1 Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5.2 Test Authentication

1. Click "Get Started" or go to `/login`
2. Click "Sign in with Google"
3. Choose your Google account
4. You should be redirected to `/dashboard`

### 5.3 Create a Test Ticket

1. Click "Create Ticket"
2. Fill in:
   - Title: `Test ticket`
   - Description: `This is a test`
   - Priority: `Medium`
3. Click "Create Ticket"
4. You should see the ticket detail page

### 5.4 Verify in Database

1. Go to Supabase Dashboard → **Table Editor → tickets**
2. You should see your test ticket
3. Check the **users** table - you should see your user record

---

## Step 6: Set Up Slack Integration (Optional for Now)

You can skip this for local development and add it later when deploying.

### 6.1 Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. App Name: `TicketFlow Dev`
4. Choose your development workspace
5. Click "Create App"

### 6.2 Add Bot Scopes

1. Go to **OAuth & Permissions**
2. Scroll to **"Bot Token Scopes"**
3. Click **"Add an OAuth Scope"** and add:
   - `chat:write`
   - `chat:write.public`
   - `commands`
   - `users:read`
   - `channels:read`

### 6.3 Install App to Workspace

1. Scroll up to **"OAuth Tokens for Your Workspace"**
2. Click **"Install to Workspace"**
3. Click **"Allow"**
4. **Copy the "Bot User OAuth Token"** (starts with `xoxb-`)

### 6.4 Get Signing Secret

1. Go to **"Basic Information"**
2. Scroll to **"App Credentials"**
3. **Copy the "Signing Secret"**

### 6.5 Add to .env.local

```env
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_SIGNING_SECRET=your-secret-here
```

### 6.6 Set Up ngrok (For Local Testing)

Slack needs a public URL to send webhooks. Use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# In a new terminal, start ngrok
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### 6.7 Configure Slash Command

1. In Slack app dashboard, go to **"Slash Commands"**
2. Click **"Create New Command"**
3. Fill in:
   - Command: `/ticket`
   - Request URL: `https://abc123.ngrok.io/api/slack/commands` (your ngrok URL)
   - Short Description: `Create a support ticket`
   - Usage Hint: `[priority] Title | Description`
4. Click **"Save"**

### 6.8 Test Slack Integration

1. Make sure your Next.js app is running (`npm run dev`)
2. Make sure ngrok is running
3. In Slack, type: `/ticket Test from Slack`
4. You should see a success message
5. Check your dashboard - the ticket should appear!

---

## Common Issues & Solutions

### Issue: "Invalid Refresh Token" Error

**Solution:**
1. Go to Supabase → Authentication → Users
2. Delete your test user
3. Try logging in again with Google

### Issue: Can't see tickets in dashboard

**Solution:**
1. Check browser console for errors
2. Verify RLS policies in Supabase
3. Check that your user has an `org_id` in the users table

### Issue: Google OAuth redirects but doesn't log in

**Solution:**
1. Verify redirect URIs in Google Cloud Console match exactly
2. Check Supabase logs: Logs → Postgres Logs
3. Ensure Google provider is enabled in Supabase

### Issue: Slack command returns error

**Solution:**
1. Check your ngrok URL is correct in Slack command settings
2. Verify `SLACK_SIGNING_SECRET` in `.env.local`
3. Check Next.js terminal for error logs
4. Make sure ngrok is still running

---

## Project Structure

```
ticketflow/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/              # Auth pages
│   │   ├── login/           # Login page
│   │   └── auth/            # Auth callbacks
│   ├── dashboard/           # Main dashboard
│   │   ├── page.tsx         # Dashboard home
│   │   └── tickets/         # Ticket pages
│   │       ├── page.tsx     # Ticket list
│   │       ├── new/         # Create ticket
│   │       └── [id]/        # Ticket detail
│   ├── api/                 # API routes
│   │   └── slack/           # Slack webhooks
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard-nav.tsx    # Dashboard navigation
│   ├── status-badge.tsx     # Status badge component
│   └── priority-badge.tsx   # Priority badge component
├── lib/
│   ├── supabase/            # Supabase clients
│   ├── tickets.ts           # Ticket CRUD functions
│   ├── slack.ts             # Slack utilities
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # General utilities
├── supabase/
│   └── migrations/          # Database migrations
├── .env.local               # Environment variables (not in git)
├── .env.example             # Example env file
└── README.md                # This file
```

---

## Next Steps

Once everything is working locally:

1. ✅ Create some test tickets
2. ✅ Test filtering and search
3. ✅ Test adding comments
4. ✅ Test updating ticket status
5. ✅ Test Slack integration (if configured)
6. 📝 Read `DEPLOYMENT.md` to deploy to production
7. 🚀 Launch to users!

---

## Development Tips

### Hot Reload

Next.js will auto-reload when you save files. If it doesn't:
```bash
# Restart the dev server
# Press Ctrl+C to stop, then:
npm run dev
```

### View Database

Use Supabase Table Editor to see data in real-time:
- Supabase Dashboard → Table Editor → Select table

### Debug API Routes

Check terminal logs where `npm run dev` is running.

### Reset Database

If you need to start fresh:
1. Go to Supabase SQL Editor
2. Run:
```sql
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
```
3. Re-run the migration from `supabase/migrations/001_initial_schema.sql`

---

## Need Help?

- Check `README.md` for project overview
- Check `DEPLOYMENT.md` for production deployment
- Review Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Review Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)

Happy coding! 🚀

