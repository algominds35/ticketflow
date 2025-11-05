'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User } from 'lucide-react'

interface DashboardNavProps {
  user: {
    email?: string
    user_metadata?: {
      name?: string
      avatar_url?: string
    }
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-8">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold">TicketFlow</span>
        </Link>
        
        <div className="ml-8 flex space-x-4">
          <Link href="/dashboard">
            <Button 
              variant={pathname === '/dashboard' ? 'default' : 'ghost'}
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/tickets">
            <Button 
              variant={pathname?.startsWith('/dashboard/tickets') ? 'default' : 'ghost'}
            >
              Tickets
            </Button>
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Avatar" 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.user_metadata?.name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <form action="/auth/logout" method="post">
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full cursor-pointer">
                    Sign out
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

