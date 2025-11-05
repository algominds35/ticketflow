# TicketFlow - Integrations Roadmap

## Phase 1: Slack Integration (MVP)

### Commands
- [x] Basic ticket creation flow exists
- [ ] `/ticket create` - Create ticket from any channel
- [ ] `/ticket list` - Show my tickets
- [ ] `/ticket #ID` - View ticket details
- [ ] `/ticket assign #ID @user` - Assign ticket
- [ ] `/ticket close #ID` - Close ticket

### Notifications
- [ ] Bot DMs when assigned a ticket
- [ ] Channel message when ticket is created
- [ ] Thread replies sync to ticket comments
- [ ] Status change notifications

### Features
- [ ] Auto-create #ticket-123 channels
- [ ] Interactive buttons (Assign, Close, Priority)
- [ ] Rich message formatting
- [ ] File attachments from Slack → ticket

---

## Phase 2: Microsoft Teams Integration

### Setup
- [ ] Register Teams app in Azure
- [ ] Create Teams app manifest
- [ ] Bot registration & configuration
- [ ] OAuth for Teams authentication

### Commands
- [ ] `@TicketFlow create [title]` - Create ticket
- [ ] `@TicketFlow list` - Show my tickets
- [ ] `@TicketFlow #ID` - View ticket details
- [ ] `@TicketFlow assign #ID @user` - Assign ticket
- [ ] `@TicketFlow close #ID` - Close ticket

### Adaptive Cards
- [ ] Ticket creation card
- [ ] Ticket detail card with actions
- [ ] Status update cards
- [ ] Assignment notifications

### Teams-Specific Features
- [ ] Personal chat with bot
- [ ] Channel tabs (embed dashboard)
- [ ] Meeting integration (create tickets from meetings)
- [ ] Outlook integration (email → ticket)

---

## Phase 3: Advanced Features

### Slack Advanced
- [ ] Workflow builder integration
- [ ] Slack Connect (external tickets)
- [ ] Custom fields in Slack modals
- [ ] Bulk actions

### Teams Advanced
- [ ] Power Automate integration
- [ ] SharePoint document linking
- [ ] Planner integration
- [ ] Guest user support

### Both Platforms
- [ ] SLA notifications
- [ ] Auto-escalation
- [ ] Ticket templates
- [ ] Custom workflows
- [ ] Analytics in-app

---

## Pricing Tiers

### Free Tier
- 1 agent
- 50 tickets/month
- Basic Slack OR Teams integration

### Starter - $20/agent/month
- Unlimited tickets
- Full Slack OR Teams integration
- Email notifications

### Professional - $40/agent/month
- Everything in Starter
- BOTH Slack AND Teams
- Advanced automations
- SLA tracking
- Analytics dashboard

### Enterprise - $80/agent/month
- Everything in Professional
- Custom workflows
- SSO/SAML
- Priority support
- Dedicated account manager
- Custom integrations

---

## Market Positioning

**Slack Focus:**
- Startups, tech companies, remote teams
- 10-200 employees
- Price-sensitive
- Want modern, simple tools

**Teams Focus:**
- Enterprises, government, healthcare, education
- 500-100,000+ employees
- Already paying for M365
- Need security, compliance, integration with Microsoft ecosystem
- Willing to pay MORE for enterprise features

**Dual Integration (Your Secret Weapon):**
- Companies transitioning Slack → Teams
- Hybrid companies (acquired companies on different platforms)
- International orgs (US uses Slack, Europe uses Teams)
- Charge PREMIUM for dual support

---

## Technical Stack

### Slack
- `@slack/bolt` - Slack app framework
- Slash commands via API routes
- Events API for real-time
- OAuth for workspace installation

### Microsoft Teams
- `@microsoft/teams-js` - Teams SDK
- Bot Framework SDK
- Adaptive Cards
- Graph API for user/channel data
- Azure Bot Service

### Backend
- Next.js API routes
- Supabase for data
- Queue system for message processing (Vercel Queues or Inngest)
- Webhooks for both platforms

---

## Revenue Projections

### Year 1 Goal: $150K ARR
- 50 Slack customers @ $500/mo avg = $25K/mo
- 10 Teams customers @ $2,000/mo avg = $20K/mo
- Total: ~$45K/mo starting run rate

### Year 2 Goal: $500K ARR
- 100 Slack customers @ $750/mo avg
- 30 Teams customers @ $3,000/mo avg

**Key Insight:** Teams customers pay 3-4x more because:
- Larger teams (more agents)
- Higher tier plans (need compliance, SSO)
- Enterprise sales (can charge premium)

