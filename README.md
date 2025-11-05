# TicketFlow 🎫

Modern IT helpdesk system built natively for Slack (with Microsoft Teams support coming soon).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ticketflow)

---

## 🚀 Quick Start

**Want to get started quickly?**

1. **Local Development**: Follow [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) - Get running in 15 minutes
2. **Production Deploy**: Follow [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Deploy to Vercel in 30 minutes
3. **Features**: See [`FEATURES.md`](./FEATURES.md) - Full feature list and roadmap

---

## 📸 Screenshots

[Add screenshots once app is deployed]

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Integration**: Slack SDK (@slack/bolt)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Slack workspace for testing
- Google OAuth credentials

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to provision (~2 minutes)
3. Go to the SQL Editor in Supabase dashboard
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
5. Run the migration
6. Go to Settings → API and copy your keys

### 3. Configure Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for local dev)
   - `https://your-project.supabase.co/auth/v1/callback` (for Supabase)
6. Copy Client ID and Secret
7. In Supabase dashboard, go to Authentication → Providers → Google
8. Enable Google provider and paste your credentials

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── dashboard/           # Main dashboard pages
│   │   └── tickets/         # Ticket pages
│   ├── login/               # Authentication pages
│   └── api/                 # API routes (Slack webhooks)
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── TicketList.tsx       # Ticket list component
│   ├── TicketDetail.tsx     # Ticket detail component
│   └── CreateTicketForm.tsx # Create ticket form
├── lib/
│   ├── supabase/            # Supabase client utilities
│   ├── tickets.ts           # Ticket CRUD functions
│   └── slack.ts             # Slack integration
└── supabase/
    └── migrations/          # Database migrations
```

## Setting Up Slack Integration (Week 2-3)

### 1. Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name it "TicketFlow" and choose your workspace

### 2. Configure Bot Scopes

Go to OAuth & Permissions and add these scopes:
- `chat:write`
- `commands`
- `users:read`
- `channels:read`

### 3. Install to Workspace

1. Click "Install to Workspace"
2. Copy the "Bot User OAuth Token" (starts with `xoxb-`)
3. Add to `.env.local`:
   ```env
   SLACK_BOT_TOKEN=xoxb-your-token
   ```

### 4. Get Signing Secret

1. Go to Basic Information
2. Copy "Signing Secret"
3. Add to `.env.local`:
   ```env
   SLACK_SIGNING_SECRET=your-secret
   ```

### 5. Deploy to Vercel

You need a public URL for Slack webhooks:

```bash
npm run build
# Deploy to Vercel (follow prompts)
vercel
```

### 6. Configure Slash Command

1. In Slack app settings, go to Slash Commands
2. Create command `/ticket`
3. Request URL: `https://your-domain.vercel.app/api/slack/commands`
4. Save

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Environment Variables in Vercel

Add all variables from `.env.local` in:
Settings → Environment Variables

Make sure to add for all environments (Production, Preview, Development)

## Database Schema

### Organizations
- Stores company/team information
- Links to Slack team ID
- Manages subscription plans

### Users
- User profiles
- Links to Slack user ID
- Role-based permissions (admin/agent/user)

### Tickets
- Core ticket data
- Status tracking (open/in_progress/closed)
- Priority levels (low/medium/high)
- Links to Slack channels/threads

### Comments
- Ticket comments/replies
- Internal notes support
- Syncs with Slack thread replies

## Features

### ✅ Current (MVP)
- Google OAuth login
- Ticket dashboard with filters
- Create/view/update tickets
- Comments system
- Slack `/ticket` command
- Status & priority badges
- Assignee management

### 🚧 Coming Soon (Post-MVP)
- Microsoft Teams integration
- Email notifications
- File attachments
- SLA tracking
- Knowledge base
- Reporting & analytics
- Custom workflows

## Development Timeline

- **Week 1**: Foundation + Auth + Database ✓
- **Week 2**: Dashboard + Ticket Detail
- **Week 3**: Create Form + Slack Integration
- **Week 4**: Polish + Deploy

## Support

For issues or questions:
- Check the `/supabase/migrations` folder for database schema
- Review shadcn/ui docs: [ui.shadcn.com](https://ui.shadcn.com)
- Slack SDK docs: [api.slack.com](https://api.slack.com)

## License

MIT

