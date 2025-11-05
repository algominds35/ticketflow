export type UserRole = 'admin' | 'agent' | 'user'
export type TicketStatus = 'open' | 'in_progress' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high'
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise'

export interface Organization {
  id: string
  name: string
  slack_team_id: string | null
  stripe_customer_id: string | null
  plan: SubscriptionPlan
  created_at: string
}

export interface User {
  id: string
  org_id: string | null
  email: string
  name: string | null
  slack_user_id: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export interface Ticket {
  id: string
  org_id: string
  ticket_number: number
  title: string
  description: string | null
  status: TicketStatus
  priority: TicketPriority
  requester_id: string | null
  assignee_id: string | null
  tags: string[]
  slack_channel_id: string | null
  slack_thread_ts: string | null
  created_at: string
  updated_at: string
  closed_at: string | null
  requester?: User
  assignee?: User
}

export interface Comment {
  id: string
  ticket_id: string
  user_id: string | null
  content: string
  is_internal: boolean
  created_at: string
  user?: User
}

