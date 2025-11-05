import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createTicket, getUsers } from '@/lib/tickets'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { TicketPriority } from '@/lib/types'

export default async function NewTicketPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const users = await getUsers()

  async function handleCreateTicket(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/login')
    }

    // Get or create user record using service role to bypass RLS
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    // Check if user exists
    let { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()

    // Create user if doesn't exist
    if (!dbUser) {
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url,
        }])
        .select()
        .single()
      
      if (insertError) {
        console.error('Failed to create user:', insertError)
        throw new Error(`Failed to create user: ${insertError.message}`)
      }
      
      dbUser = newUser
    }

    if (!dbUser) {
      throw new Error('User not found after creation')
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const priority = formData.get('priority') as TicketPriority
    const assignee_id = formData.get('assignee_id') as string
    const tagsString = formData.get('tags') as string
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : []

    // Create ticket using admin client to ensure it works
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .insert([{
        title,
        description: description || null,
        priority,
        status: 'open',
        assignee_id: assignee_id !== 'unassigned' ? assignee_id : null,
        tags,
        org_id: dbUser.org_id || dbUser.id, // Use user's org or user id as org
        requester_id: dbUser.id,
      }])
      .select()
      .single()

    if (ticketError) {
      console.error('Failed to create ticket:', ticketError)
      throw new Error(`Failed to create ticket: ${ticketError.message}`)
    }

    if (ticket) {
      redirect(`/dashboard/tickets/${ticket.id}`)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/dashboard/tickets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tickets
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Ticket</CardTitle>
          <CardDescription>
            Submit a new support request or issue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreateTicket} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide more details about the issue..."
                rows={6}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select name="priority" defaultValue="medium" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee_id">Assignee</Label>
                <Select name="assignee_id" defaultValue="unassigned">
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
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="bug, feature, urgent (comma-separated)"
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple tags with commas
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" size="lg">
                Create Ticket
              </Button>
              <Link href="/dashboard/tickets">
                <Button type="button" variant="outline" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

