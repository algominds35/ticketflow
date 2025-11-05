# Deployment Guide

Complete guide to deploy TicketFlow to production.

## Prerequisites

- [x] Supabase project created
- [x] Google OAuth configured
- [ ] Slack app created
- [ ] Vercel account

---

## Step 1: Set Up Supabase (Production)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Set project name: `ticketflow-prod`
5. Generate a secure database password (save it!)
6. Choose your region (closest to users)
7. Click "Create Project" (takes ~2 minutes)

### 1.2 Run Database Migration

1. Once project is ready, go to SQL Editor
2. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Paste into SQL Editor
4. Click "Run" to execute
5. Verify tables are created: Go to Table Editor and check for:
   - organizations
   - users
   - tickets
   - comments

### 1.3 Get API Keys

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJ...`
   - **service_role key**: `eyJhbGciOiJ...` (keep this secret!)

### 1.4 Configure Google OAuth

1. In Supabase dashboard: Authentication → Providers → Google
2. Enable Google provider
3. Add your Google Client ID and Secret (from Google Cloud Console)
4. Note the callback URL: `https://xxxxx.supabase.co/auth/v1/callback`
5. Add this URL to your Google OAuth app's authorized redirect URIs

---

## Step 2: Deploy to Vercel

### 2.1 Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit - TicketFlow MVP"
git branch -M main
git remote add origin https://github.com/yourusername/ticketflow.git
git push -u origin main
```

### 2.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2.3 Add Environment Variables

In Vercel project settings → Environment Variables, add:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ... (secret!)

# App URL
NEXT_PUBLIC_APP_URL=https://ticketflow.vercel.app

# Slack (add after configuring Slack app)
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
```

**Important:** Make sure to add variables for:
- ✅ Production
- ✅ Preview
- ✅ Development

### 2.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (~2 minutes)
3. Visit your deployed app: `https://ticketflow.vercel.app`

---

## Step 3: Set Up Slack App

### 3.1 Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. App Name: `TicketFlow`
4. Choose your workspace
5. Click "Create App"

### 3.2 Configure OAuth & Permissions

1. Go to "OAuth & Permissions"
2. Scroll to "Scopes" → "Bot Token Scopes"
3. Add these scopes:
   ```
   chat:write          - Send messages
   chat:write.public   - Send messages to channels without joining
   commands            - Add slash commands
   users:read          - View user information
   channels:read       - View channel information
   ```
4. Scroll up and click "Install to Workspace"
5. Click "Allow"
6. **Copy the "Bot User OAuth Token"** (starts with `xoxb-`)

### 3.3 Get Signing Secret

1. Go to "Basic Information"
2. Scroll to "App Credentials"
3. **Copy the "Signing Secret"**

### 3.4 Add Keys to Vercel

1. Go to Vercel project → Settings → Environment Variables
2. Add/update:
   ```
   SLACK_BOT_TOKEN=xoxb-1234567890-1234567890-xxxxxxxxxxxx
   SLACK_SIGNING_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```
3. Redeploy your app (Settings → Deployments → ⋯ → Redeploy)

### 3.5 Configure Slash Command

1. In Slack app dashboard, go to "Slash Commands"
2. Click "Create New Command"
3. Fill in:
   - **Command**: `/ticket`
   - **Request URL**: `https://ticketflow.vercel.app/api/slack/commands`
   - **Short Description**: `Create a support ticket`
   - **Usage Hint**: `[priority] Title | Description`
4. Click "Save"

### 3.6 Test the Integration

1. Open your Slack workspace
2. In any channel, type: `/ticket Test ticket from Slack`
3. You should see a success message with the ticket number
4. Verify the ticket appears in your TicketFlow dashboard

---

## Step 4: Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Click on your OAuth Client ID
4. Under "Authorized redirect URIs", add:
   ```
   https://ticketflow.vercel.app/auth/callback
   https://xxxxx.supabase.co/auth/v1/callback
   ```
5. Click "Save"

---

## Step 5: Test Everything

### 5.1 Test Authentication

1. Go to `https://ticketflow.vercel.app`
2. Click "Get Started"
3. Sign in with Google
4. Should redirect to dashboard

### 5.2 Test Ticket Creation (Web)

1. Click "Create Ticket"
2. Fill in details
3. Submit
4. Verify ticket appears in list

### 5.3 Test Slack Integration

1. In Slack: `/ticket high Server down | Production is unreachable`
2. Should see success message
3. Check dashboard - ticket should appear
4. Verify all details are correct

---

## Step 6: Configure Domain (Optional)

### 6.1 Add Custom Domain in Vercel

1. Vercel project → Settings → Domains
2. Add your domain (e.g., `ticketflow.com`)
3. Follow Vercel's DNS configuration instructions

### 6.2 Update Environment Variables

```env
NEXT_PUBLIC_APP_URL=https://ticketflow.com
```

### 6.3 Update Slack App

1. Update slash command Request URL to use your domain
2. Update Google OAuth redirect URIs to use your domain

---

## Troubleshooting

### Issue: Slack command returns "Invalid request signature"

**Solution:**
- Double-check `SLACK_SIGNING_SECRET` in Vercel matches Slack app
- Ensure environment variable is set for Production
- Redeploy after adding variables

### Issue: Google OAuth fails

**Solution:**
- Check redirect URIs in Google Cloud Console
- Verify Supabase callback URL is added
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct

### Issue: Tickets don't appear after Slack command

**Solution:**
- Check Vercel logs: Deployments → Select deployment → Logs
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check Supabase database: Table Editor → tickets

### Issue: RLS policies prevent ticket creation

**Solution:**
- Temporarily disable RLS for testing:
  ```sql
  ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
  ```
- Debug and fix policies
- Re-enable RLS

---

## Post-Deployment Checklist

- [ ] App loads at production URL
- [ ] Google OAuth login works
- [ ] Can create tickets via web interface
- [ ] Can view ticket list and details
- [ ] Can add comments to tickets
- [ ] Can update ticket status/priority/assignee
- [ ] Slack `/ticket` command works
- [ ] Tickets created via Slack appear in dashboard
- [ ] All environment variables are set
- [ ] Database migrations ran successfully
- [ ] RLS policies are enabled

---

## Monitoring & Maintenance

### Vercel Logs

View logs: Deployments → Select deployment → Runtime Logs

### Supabase Logs

View logs: Logs → Postgres Logs / API Logs

### Slack App Analytics

View usage: Slack app dashboard → Analytics

---

## Scaling Considerations

When you reach these limits on free tiers:

### Supabase Free Tier Limits
- 500MB database
- 2GB bandwidth/month
- 50,000 monthly active users

**Upgrade to Pro ($25/mo)**: Unlimited database, 250GB bandwidth

### Vercel Free Tier Limits
- 100GB bandwidth/month
- 6000 build minutes/month

**Upgrade to Pro ($20/mo)**: 1TB bandwidth, unlimited builds

---

## Next Steps

Once deployed and tested:

1. **Set up monitoring**: Add error tracking (Sentry, LogRocket)
2. **Add analytics**: Track user behavior (PostHog, Mixpanel)
3. **Launch to users**: Announce in your Slack workspace
4. **Gather feedback**: Create feedback channel
5. **Iterate**: Build features users request most

---

## Need Help?

- **Vercel docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase docs**: [supabase.com/docs](https://supabase.com/docs)
- **Slack API docs**: [api.slack.com](https://api.slack.com)

Good luck with your launch! 🚀

