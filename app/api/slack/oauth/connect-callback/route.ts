import { NextRequest, NextResponse } from 'next/server';
import { WebClient } from '@slack/web-api';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const slackClient = new WebClient();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/dashboard?error=${error}`, req.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/dashboard?error=missing_params', req.url));
    }

    // Decode state to get auth_user_id
    const { auth_user_id, email } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Exchange code for token
    const tokenResponse = await slackClient.oauth.v2.access({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/oauth/connect-callback`,
    });

    if (!tokenResponse.ok) {
      console.error('Slack OAuth error:', tokenResponse);
      return NextResponse.redirect(new URL('/dashboard?error=slack_auth_failed', req.url));
    }

    // @ts-ignore - Slack types are not perfect
    const slackUserId = tokenResponse.authed_user?.id;
    // @ts-ignore
    const slackTeamId = tokenResponse.team?.id;

    if (!slackUserId || !slackTeamId) {
      return NextResponse.redirect(new URL('/dashboard?error=missing_slack_data', req.url));
    }

    // Use service role to bypass RLS
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

    // Find the organization by slack_team_id
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('slack_team_id', slackTeamId)
      .single();

    if (orgError || !org) {
      console.error('Organization not found for team:', slackTeamId, orgError);
      return NextResponse.redirect(new URL('/dashboard?error=org_not_found', req.url));
    }

    // Check if user already exists in this org
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('slack_user_id', slackUserId)
      .eq('org_id', org.id)
      .single();

    if (existingUser) {
      // Update the existing user to link auth_user_id
      const { error: updateError } = await supabase
        .from('users')
        .update({
          auth_user_id: auth_user_id,
          email: email || existingUser.email,
        })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.redirect(new URL('/dashboard?error=update_failed', req.url));
      }
    } else {
      // Get Slack user info
      const slackUserInfo = await slackClient.users.info({
        user: slackUserId,
        token: process.env.SLACK_BOT_TOKEN,
      });

      // Create new user record
      const { error: createError } = await supabase
        .from('users')
        .insert({
          org_id: org.id,
          auth_user_id: auth_user_id,
          slack_user_id: slackUserId,
          email: email || slackUserInfo.user?.profile?.email || `${slackUserId}@slack.local`,
          name: slackUserInfo.user?.real_name || slackUserInfo.user?.name || 'Unknown User',
          role: 'user',
        });

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.redirect(new URL('/dashboard?error=create_failed', req.url));
      }
    }

    return NextResponse.redirect(new URL('/dashboard?connected=true', req.url));
  } catch (error) {
    console.error('Slack connect callback error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=unknown', req.url));
  }
}

