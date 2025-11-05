import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle OAuth denial
  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=Installation cancelled`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=Missing authorization code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/oauth/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error('Slack OAuth error:', tokenData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=Slack authorization failed`);
    }

    // Get workspace info
    const teamId = tokenData.team.id;
    const teamName = tokenData.team.name;
    const botToken = tokenData.access_token;

    // Save to database
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if organization already exists
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('slack_team_id', teamId)
      .single();

    if (existingOrg) {
      // Update bot token (in case it changed)
      await supabase
        .from('organizations')
        .update({
          name: teamName,
          // Note: You'd want to store bot_token securely in production
        })
        .eq('id', existingOrg.id);
    } else {
      // Create new organization
      await supabase
        .from('organizations')
        .insert({
          name: teamName,
          slack_team_id: teamId,
          plan: 'free',
        });
    }

    // Success! Redirect back to success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/install-success?team=${encodeURIComponent(teamName)}`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=Installation failed`);
  }
}

