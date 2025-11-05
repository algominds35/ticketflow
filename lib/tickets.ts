import { createClient } from '@/lib/supabase/server'
import { Ticket, Comment, TicketStatus, TicketPriority } from './types'

export async function getTickets(filters?: {
  status?: TicketStatus
  assignee_id?: string
  search?: string
}): Promise<Ticket[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('tickets')
    .select(`
      *,
      requester:users!tickets_requester_id_fkey(id, name, email, avatar_url),
      assignee:users!tickets_assignee_id_fkey(id, name, email, avatar_url)
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.assignee_id) {
    query = query.eq('assignee_id', filters.assignee_id)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching tickets:', error)
    return []
  }

  return data as Ticket[]
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      requester:users!tickets_requester_id_fkey(id, name, email, avatar_url),
      assignee:users!tickets_assignee_id_fkey(id, name, email, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching ticket:', error)
    return null
  }

  return data as Ticket
}

export async function getTicketComments(ticketId: string): Promise<Comment[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:users(id, name, email, avatar_url)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return data as Comment[]
}

export async function createTicket(ticket: {
  title: string
  description?: string
  priority: TicketPriority
  assignee_id?: string
  tags?: string[]
  org_id: string
  requester_id: string
}): Promise<Ticket | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tickets')
    .insert([ticket])
    .select(`
      *,
      requester:users!tickets_requester_id_fkey(id, name, email, avatar_url),
      assignee:users!tickets_assignee_id_fkey(id, name, email, avatar_url)
    `)
    .single()

  if (error) {
    console.error('Error creating ticket:', error)
    return null
  }

  return data as Ticket
}

export async function updateTicket(
  id: string,
  updates: Partial<Pick<Ticket, 'title' | 'description' | 'status' | 'priority' | 'assignee_id' | 'tags'>>
): Promise<Ticket | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      requester:users!tickets_requester_id_fkey(id, name, email, avatar_url),
      assignee:users!tickets_assignee_id_fkey(id, name, email, avatar_url)
    `)
    .single()

  if (error) {
    console.error('Error updating ticket:', error)
    return null
  }

  return data as Ticket
}

export async function createComment(comment: {
  ticket_id: string
  user_id: string
  content: string
  is_internal?: boolean
}): Promise<Comment | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select(`
      *,
      user:users(id, name, email, avatar_url)
    `)
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return null
  }

  return data as Comment
}

export async function getUsers() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data
}

