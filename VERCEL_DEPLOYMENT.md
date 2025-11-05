# 🚀 Vercel Deployment Guide

Quick guide to deploy TicketFlow to Vercel production.

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- ✅ Supabase project created and migrations run
- ✅ Slack app created at api.slack.com/apps
- ✅ Slack bot token and signing secret
- ✅ All environment variables ready

---

## 🎯 Step-by-Step Deployment

### Step 1: Deploy to Vercel

Run this command and follow the prompts:

```bash
vercel
```

**Prompts you'll see:**

1. **Set up and deploy?** → Press Enter (Yes)
2. **Which scope?** → Choose your account
3. **Link to existing project?** → `N` (No)
4. **Project name?** → `ticketflow` (or your choice)
5. **Directory?** → Press Enter (current directory)
6. **Override settings?** → `N` (No)

**Wait for deployment...** ⏳

You'll get a URL like: `https://ticketflow-abc123.vercel.app`

### Step 2: Add Environment Variables

After deployment, add your environment variables:

```bash
# Add Supabase variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste your Supabase anon key when prompted

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste your Supabase service role key when prompted

# Add Slack variables
vercel env add SLACK_BOT_TOKEN
# Paste your Slack bot token when prompted

vercel env add SLACK_SIGNING_SECRET
# Paste your Slack signing secret when prompted

# Add app URL (use your Vercel URL)
vercel env add NEXT_PUBLIC_APP_URL
# Paste: https://your-project.vercel.app
```

**For each command:**
- When asked which environment: Choose **Production, Preview, and Development** (press 'a' then Enter)

### Step 3: Redeploy with Environment Variables

```bash
vercel --prod
```

This will redeploy with all your environment variables.

---

## 🔧 Update Slack App Configuration

Now update your Slack app to use the production URL:

### 1. Go to api.slack.com/apps → Your App

### 2. Update Slash Command
- Go to **Slash Commands** → `/ticket`
- Change **Request URL** to: `https://your-project.vercel.app/api/slack/commands`
- Click **Save**

### 3. Update Interactivity
- Go to **Interactivity & Shortcuts**
- Change **Request URL** to: `https://your-project.vercel.app/api/slack/interactions`
- Click **Save Changes**

### 4. Update OAuth Redirect (if using Google OAuth)
- Go to Google Cloud Console → Your OAuth Client
- Add redirect URI: `https://your-project.vercel.app/auth/callback`
- Also add to Supabase: `https://your-supabase-project.supabase.co/auth/v1/callback`

---

## ✅ Test Your Deployment

### 1. Test the Website
Visit: `https://your-project.vercel.app`

You should see your landing page.

### 2. Test Slack Integration
In Slack, type:
```
/ticket
```

You should see the modal form. Fill it out and create a ticket.

### 3. Check Dashboard
Go to: `https://your-project.vercel.app/dashboard/tickets`

Your ticket should appear!

---

## 🎨 Custom Domain (Optional)

Want a custom domain like `ticketflow.com`?

### 1. Add Domain in Vercel
```bash
vercel domains add ticketflow.com
```

### 2. Update DNS
Add these records in your domain registrar:
- **Type**: CNAME
- **Name**: @ (or www)
- **Value**: cname.vercel-dns.com

### 3. Update Environment Variable
```bash
vercel env add NEXT_PUBLIC_APP_URL
# Value: https://ticketflow.com
```

### 4. Redeploy
```bash
vercel --prod
```

### 5. Update Slack URLs
- Update all Slack URLs to use `https://ticketflow.com` instead of `.vercel.app`

---

## 🐛 Troubleshooting

### Deployment Fails

**Error: Build failed**
```bash
# Check logs
vercel logs

# Common fixes:
# 1. Make sure all dependencies are in package.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
vercel --prod
```

### Slack Integration Not Working

**Error: "Invalid signature"**
1. Check environment variables are set:
```bash
vercel env ls
```

2. Make sure `SLACK_SIGNING_SECRET` matches your Slack app
3. Redeploy:
```bash
vercel --prod
```

### Database Errors

**Error: Can't connect to Supabase**
1. Check Supabase URL and keys are correct
2. Verify Supabase project is running
3. Check Supabase logs in dashboard

### Environment Variables Not Working

**Variables not loading**
```bash
# Pull env vars locally to test
vercel env pull .env.local

# Verify they're set
vercel env ls

# Redeploy
vercel --prod
```

---

## 📊 Monitor Your Deployment

### View Logs
```bash
vercel logs
```

### View Deployments
```bash
vercel ls
```

### View Project in Dashboard
```bash
vercel
```

Then go to: https://vercel.com/dashboard

---

## 🔄 Future Deployments

Every time you make changes:

```bash
# Deploy to production
vercel --prod

# Or just deploy (creates preview)
vercel
```

**Tip:** Set up GitHub integration for automatic deployments on push!

---

## 🎯 Next Steps After Deployment

1. ✅ Test `/ticket` command end-to-end
2. ✅ Share with your team for beta testing
3. ✅ Post on r/sysadmin for feedback
4. ✅ Add Stripe billing
5. ✅ Launch on Product Hunt
6. ✅ Build Microsoft Teams integration

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Slack API**: https://api.slack.com/docs

---

## 🎉 You're Live!

Your app is now in production and ready to use!

Share your Slack app with your workspace and start getting tickets! 🚀

