# TicketFlow - Quick Start (5 Minutes)

The absolute fastest way to see TicketFlow in action.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (sign up takes 1 minute)
- A Google account

---

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

---

## Step 2: Set Up Supabase (2 min)

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Wait for provisioning (~2 minutes)
3. Go to **SQL Editor** → Paste contents of `supabase/migrations/001_initial_schema.sql` → Run
4. Go to **Settings → API** → Copy:
   - Project URL
   - anon key
   - service_role key

---

## Step 3: Configure Environment (1 min)

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 4: Set Up Google OAuth (2 min)

1. **Supabase Dashboard** → Authentication → Providers → Google → Toggle ON
2. **Google Cloud Console** → Create OAuth credentials
3. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID + Secret → Paste in Supabase Google settings

---

## Step 5: Run! (10 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✅ You're Done!

Now you can:
- Sign in with Google
- Create tickets
- Manage your helpdesk

---

## Next Steps

**Want Slack integration?**
→ See [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) Section 6

**Want to deploy to production?**
→ See [`DEPLOYMENT.md`](./DEPLOYMENT.md)

**Want to add features?**
→ See [`FEATURES.md`](./FEATURES.md) for roadmap

---

## Troubleshooting

### "Invalid Refresh Token" error
→ Delete your user in Supabase dashboard, try logging in again

### Can't see tickets
→ Check browser console, verify RLS policies ran in migration

### OAuth fails
→ Double-check redirect URIs match exactly in Google Cloud Console

---

## Need Help?

- Full setup guide: [`SETUP_GUIDE.md`](./SETUP_GUIDE.md)
- Deployment guide: [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- Open an issue on GitHub

**You got this!** 🚀

