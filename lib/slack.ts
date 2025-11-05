import { App, ExpressReceiver } from '@slack/bolt'

// Initialize Slack app
export function createSlackApp() {
  const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    endpoints: '/api/slack/events',
    processBeforeResponse: true,
  })

  const app = new App({
    token: process.env.SLACK_BOT_TOKEN!,
    receiver,
  })

  return { app, receiver }
}

// Parse ticket command arguments
export function parseTicketCommand(text: string): {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
} {
  // Simple parsing: /ticket [priority] Title | Description
  // Example: /ticket high Fix login bug | Users can't log in with Google
  
  const parts = text.split('|').map(p => p.trim())
  let title = parts[0]
  const description = parts[1]

  // Check for priority prefix
  let priority: 'low' | 'medium' | 'high' | undefined
  const priorityMatch = title.match(/^(low|medium|high)\s+(.+)$/i)
  if (priorityMatch) {
    priority = priorityMatch[1].toLowerCase() as 'low' | 'medium' | 'high'
    title = priorityMatch[2]
  }

  return {
    title,
    description,
    priority,
  }
}

// Format ticket for Slack message
export function formatTicketMessage(ticket: {
  ticket_number: number
  title: string
  status: string
  priority: string
  webUrl: string
}): string {
  const statusEmoji = {
    open: '🔵',
    in_progress: '🟡',
    closed: '🟢',
  }[ticket.status] || '⚪'

  const priorityEmoji = {
    low: '⬇️',
    medium: '➡️',
    high: '⬆️',
  }[ticket.priority] || '➡️'

  return `${statusEmoji} *Ticket #${ticket.ticket_number}*\n` +
    `${priorityEmoji} Priority: ${ticket.priority.toUpperCase()}\n` +
    `📝 ${ticket.title}\n` +
    `🔗 <${ticket.webUrl}|View ticket>`
}

