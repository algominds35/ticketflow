import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard-nav'
import { ConnectSlackBanner } from '@/components/connect-slack-banner'
import { SuccessBanner } from '@/components/success-banner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if user has connected their Slack account
  const { data: userData } = await supabase
    .from('users')
    .select('org_id, slack_user_id')
    .eq('auth_user_id', user.id)
    .single()

  const needsSlackConnection = !userData || !userData.org_id || !userData.slack_user_id

  return (
    <div className="min-h-screen">
      <DashboardNav user={user} />
      <main className="container mx-auto p-8">
        <SuccessBanner />
        {needsSlackConnection && <ConnectSlackBanner />}
        {children}
      </main>
    </div>
  )
}

