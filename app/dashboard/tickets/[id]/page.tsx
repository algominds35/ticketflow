import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/status-badge'
import { PriorityBadge } from '@/components/priority-badge'
import { getTicketById, getTicketComments, createComment, updateTicket, getUsers } from '@/lib/tickets'
import { formatDate } from '@/lib/date-utils'
import { ArrowLeft, User } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/server'
import { TicketPriority, TicketStatus } from '@/lib/types'

interface TicketPageProps {
  params: {
    id: string
  }
}

export default async function TicketPage({ params }: TicketPageProps) {
  const ticket = await getTicketById(params.id)
  
  if (!ticket) {
    notFound()
  }

  const comments = await getTicketComments(params.id)
  const users = await getUsers()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function handleAddComment(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()

    if (!dbUser) return

    const content = formData.get('content') as string
    const is_internal = formData.get('is_internal') === 'on'

    await createComment({
      ticket_id: params.id,
      user_id: dbUser.id,
      content,
      is_internal,
    })

    redirect(`/dashboard/tickets/${params.id}`)
  }

  async function handleUpdateStatus(formData: FormData) {
    'use server'
    
    const status = formData.get('status') as TicketStatus
    await updateTicket(params.id, { status })
    redirect(`/dashboard/tickets/${params.id}`)
  }

  async function handleUpdatePriority(formData: FormData) {
    'use server'
    
    const priority = formData.get('priority') as TicketPriority
    await updateTicket(params.id, { priority })
    redirect(`/dashboard/tickets/${params.id}`)
  }

  async function handleUpdateAssignee(formData: FormData) {
    'use server'
    
    const assignee_id = formData.get('assignee_id') as string
    await updateTicket(params.id, { 
      assignee_id: assignee_id !== 'unassigned' ? assignee_id : undefined 
    })
    redirect(`/dashboard/tickets/${params.id}`)
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <Link href="/dashboard/tickets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tickets
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      #{ticket.ticket_number}
                    </span>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {ticket.description || 'No description provided'}
                </p>
              </div>

              {ticket.tags && ticket.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>
                    Created by {ticket.requester?.name || 'Unknown'} on{' '}
                    {formatDate(ticket.created_at)}
                  </span>
                </div>
                {ticket.updated_at !== ticket.created_at && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    Last updated {formatDate(ticket.updated_at)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Comments ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {comment.user?.name || 'Unknown User'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                      {comment.is_internal && (
                        <Badge variant="secondary" className="text-xs">
                          Internal
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}

              {/* Add Comment Form */}
              <form action={handleAddComment} className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="content">Add a comment</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Write your comment..."
                    required
                    rows={4}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Button type="submit">Add Comment</Button>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="is_internal"
                      className="rounded"
                    />
                    Internal note (not visible to requester)
                  </label>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleUpdateStatus}>
                <Select name="status" defaultValue={ticket.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="w-full mt-2" variant="outline">
                  Update Status
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleUpdatePriority}>
                <Select name="priority" defaultValue={ticket.priority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="w-full mt-2" variant="outline">
                  Update Priority
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignee</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleUpdateAssignee}>
                <Select 
                  name="assignee_id" 
                  defaultValue={ticket.assignee_id || 'unassigned'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" className="w-full mt-2" variant="outline">
                  Update Assignee
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

