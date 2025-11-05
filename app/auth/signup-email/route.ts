import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const origin = request.headers.get('origin')

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return NextResponse.redirect(`${origin}/signup?error=${encodeURIComponent(error.message)}`)
  }

  // Check if email confirmation is required
  return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent('Check your email to confirm your account')}`)
}

