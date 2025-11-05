import { NextRequest, NextResponse } from 'next/server';

// Slack OAuth installation URL
export async function GET(req: NextRequest) {
  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/oauth/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'Missing Slack Client ID' }, { status: 500 });
  }

  // Slack OAuth scopes needed for the app
  const scopes = [
    'chat:write',
    'chat:write.public',
    'commands',
    'users:read',
    'users:read.email',
    'team:read',
    'channels:read',
  ].join(',');

  const slackAuthUrl = new URL('https://slack.com/oauth/v2/authorize');
  slackAuthUrl.searchParams.set('client_id', clientId);
  slackAuthUrl.searchParams.set('scope', scopes);
  slackAuthUrl.searchParams.set('redirect_uri', redirectUri);

  // Redirect to Slack OAuth page
  return NextResponse.redirect(slackAuthUrl.toString());
}

