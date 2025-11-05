import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Store the auth user ID in a state parameter to verify on callback
    const state = Buffer.from(JSON.stringify({ 
      auth_user_id: user.id,
      email: user.email 
    })).toString('base64');

    const slackAuthUrl = new URL('https://slack.com/oauth/v2/authorize');
    slackAuthUrl.searchParams.set('client_id', process.env.SLACK_CLIENT_ID!);
    slackAuthUrl.searchParams.set('user_scope', 'identity.basic,identity.email,identity.team');
    slackAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/oauth/connect-callback`);
    slackAuthUrl.searchParams.set('state', state);

    return NextResponse.redirect(slackAuthUrl.toString());
  } catch (error) {
    console.error('Slack connect error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=slack_connect_failed', req.url));
  }
}

