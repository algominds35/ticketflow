# 🚀 Next Steps - Get Your Slack Integration Working NOW

You're **90% done**. Here's what to do right now to test the `/ticket` command:

---

## ✅ Step 1: Check Your Environment Variables

Make sure you have a `.env.local` file with these values:

```env
# Supabase (from your Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Slack (from api.slack.com/apps)
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
```

If you don't have these yet, follow Step 2.

---

## ✅ Step 2: Configure Your Slack App

### A) Go to Your Slack App
1. Go to https://api.slack.com/apps
2. Select your app (or create one: "From scratch" → name it "TicketFlow")

### B) Add Required Scopes
Go to **OAuth & Permissions** → Scroll to **Bot Token Scopes** → Add:

- ✅ `chat:write`
- ✅ `chat:write.public`
- ✅ `commands`
- ✅ `users:read`
- ✅ `channels:read`
- ✅ `team:read` ← **NEW** (needed for getting workspace name)

### C) Install to Workspace
1. Scroll up to **OAuth Tokens for Your Workspace**
2. Click **"Install to Workspace"** (or **"Reinstall"** if already installed)
3. Click **"Allow"**
4. **Copy the Bot User OAuth Token** (starts with `xoxb-`)
5. Add it to `.env.local` as `SLACK_BOT_TOKEN`

### D) Get Signing Secret
1. Go to **Basic Information**
2. Scroll to **App Credentials**
3. **Copy the Signing Secret**
4. Add it to `.env.local` as `SLACK_SIGNING_SECRET`

---

## ✅ Step 3: Expose Your Local Server (Using ngrok)

Slack needs a public URL to send webhooks to your local dev environment.

### Install ngrok
```bash
npm install -g ngrok
```

### Start ngrok
Open a **new terminal** and run:
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding   https://abc-123-def.ngrok-free.app -> http://localhost:3000
```

**Copy that HTTPS URL** (e.g., `https://abc-123-def.ngrok-free.app`)

---

## ✅ Step 4: Configure Slack Endpoints

Back in your Slack app dashboard (api.slack.com/apps):

### A) Add Slash Command
1. Go to **Slash Commands**
2. Click **"Create New Command"**
3. Fill in:
   - **Command**: `/ticket`
   - **Request URL**: `https://your-ngrok-url.ngrok-free.app/api/slack/commands`
   - **Short Description**: `Create a support ticket`
   - **Usage Hint**: `[issue description]`
4. Click **"Save"**

### B) Enable Interactivity
1. Go to **Interactivity & Shortcuts**
2. Toggle **"Interactivity"** to **ON**
3. **Request URL**: `https://your-ngrok-url.ngrok-free.app/api/slack/interactions`
4. Click **"Save Changes"**

---

## ✅ Step 5: Start Your App

In your main terminal (where your project is):

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.1.0
- Local:   http://localhost:3000
✓ Ready in 2.1s
```

---

## ✅ Step 6: Test It! 🎉

### In Slack:

1. Go to any channel in your workspace
2. Type: `/ticket`
3. You should see a **modal form** pop up
4. Fill it in:
   - **Title**: `Test printer issue`
   - **Description**: `Printer on 3rd floor not working`
   - **Priority**: `High`
5. Click **"Create"**

### Expected Result:

✅ You should see a message in the channel:
```
✅ Ticket Created

#1 - Test printer issue
Priority: High
Status: Open
Requester: @yourname

[🔗 View in Dashboard]
```

### Check Your Dashboard:

1. Open http://localhost:3000/dashboard/tickets
2. You should see your ticket there!

---

## 🐛 Troubleshooting

### Error: "Invalid signature"
- Check that `SLACK_SIGNING_SECRET` in `.env.local` matches Slack app dashboard
- Restart your dev server after changing `.env.local`

### Error: Modal doesn't open
- Check your terminal logs for errors
- Verify ngrok is still running
- Check that Slash Command URL is correct

### Error: Ticket not created
- Check terminal logs
- Verify Supabase credentials in `.env.local`
- Check that your database migration ran successfully

### ngrok URL expired
- Free ngrok URLs expire after 2 hours
- Restart ngrok and update the URLs in Slack app settings

---

## 🎯 What's Next?

Once the `/ticket` command is working:

### Phase 1: Polish the MVP
- [ ] Add button actions (Assign, Start, Close) in Slack
- [ ] Add comments sync (dashboard → Slack thread)
- [ ] Add email fallback for non-Slack users

### Phase 2: Deploy to Production
- [ ] Deploy to Vercel
- [ ] Update Slack app URLs to production domain
- [ ] Add Stripe billing

### Phase 3: Scale
- [ ] Add Microsoft Teams integration
- [ ] Add AI-powered ticket triage
- [ ] Build analytics dashboard
- [ ] Launch on Product Hunt

---

## 📚 Helpful Resources

- **Slack API Docs**: https://api.slack.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## 🚀 You're Ready!

Your app is **working**. Now:

1. Test the `/ticket` flow end-to-end
2. Show it to a few IT team members
3. Get feedback
4. Iterate on features

**You've built the foundation for a 7-8 figure SaaS company.**

Let's go! 💪

