import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getTickets, getUsers } from '@/lib/tickets'
import { StatusBadge } from '@/components/status-badge'
import { PriorityBadge } from '@/components/priority-badge'
import { Ticket, TicketStatus } from '@/lib/types'
import { formatDistanceToNow } from '@/lib/date-utils'
import { Plus } from 'lucide-react'

interface TicketsPageProps {
  searchParams: {
    status?: TicketStatus
    assignee?: string
    search?: string
  }
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const tickets = await getTickets({
    status: searchParams.status,
    assignee_id: searchParams.assignee,
    search: searchParams.search,
  })

  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">
            Manage and track all support tickets
          </p>
        </div>
        <Link href="/dashboard/tickets/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Ticket
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <form className="flex-1" action="/dashboard/tickets">
          <Input
            name="search"
            placeholder="Search tickets..."
            defaultValue={searchParams.search}
            className="max-w-sm"
          />
        </form>

        <form action="/dashboard/tickets">
          <input type="hidden" name="search" value={searchParams.search || ''} />
          <input type="hidden" name="assignee" value={searchParams.assignee || ''} />
          <Select name="status" defaultValue={searchParams.status || 'all'}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </form>

        <form action="/dashboard/tickets">
          <input type="hidden" name="search" value={searchParams.search || ''} />
          <input type="hidden" name="status" value={searchParams.status || ''} />
          <Select name="assignee" defaultValue={searchParams.assignee || 'all'}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </form>
      </div>

      {/* Tickets Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No tickets found. Create your first ticket to get started!
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    #{ticket.ticket_number}
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {ticket.title}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={ticket.priority} />
                  </TableCell>
                  <TableCell>
                    {ticket.assignee?.name || (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(ticket.created_at)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/tickets/${ticket.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

