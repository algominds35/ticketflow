import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const origin = request.headers.get('origin')

  await supabase.auth.signOut()

  return NextResponse.redirect(`${origin}/login`)
}

