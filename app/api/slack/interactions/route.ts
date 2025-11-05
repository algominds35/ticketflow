import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { WebClient } from '@slack/web-api';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// Verify request is from Slack
function verifySlackRequest(req: NextRequest, body: string): boolean {
  const timestamp = req.headers.get('x-slack-request-timestamp');
  const slackSignature = req.headers.get('x-slack-signature');
  
  if (!timestamp || !slackSignature) return false;

  // Reject old requests (prevent replay attacks)
  const time = Math.floor(Date.now() / 1000);
  if (Math.abs(time - parseInt(timestamp)) > 60 * 5) return false;

  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature = `v0=${crypto
    .createHmac('sha256', process.env.SLACK_SIGNING_SECRET!)
    .update(sigBasestring)
    .digest('hex')}`;

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(slackSignature)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    
    // Verify request is from Slack
    if (!verifySlackRequest(req, body)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the payload
    const formData = new URLSearchParams(body);
    const payloadStr = formData.get('payload');
    
    if (!payloadStr) {
      return NextResponse.json({ error: 'No payload' }, { status: 400 });
    }

    const payload = JSON.parse(payloadStr);
    
    // Handle modal submission
    if (payload.type === 'view_submission' && payload.view.callback_id === 'create_ticket_modal') {
      return await handleTicketCreation(payload);
    }

    // Handle message shortcut (right-click message → "Create ticket")
    if (payload.type === 'message_action' && payload.callback_id === 'create_ticket_from_message') {
      return await handleMessageAction(payload);
    }

    return NextResponse.json({});
  } catch (error) {
    console.error('Slack interaction error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function handleMessageAction(payload: any) {
  const message = payload.message;
  const channelId = payload.channel.id;
  const triggerId = payload.trigger_id;
  const userId = payload.user.id;

  try {
    // Get message content
    const messageText = message.text || '';
    const messageUser = message.user;
    const messageTs = message.ts;
    const messageLink = `https://slack.com/archives/${channelId}/p${messageTs.replace('.', '')}`;

    // Open modal with pre-filled content
    await slackClient.views.open({
      trigger_id: triggerId,
      view: {
        type: 'modal',
        callback_id: 'create_ticket_modal',
        title: {
          type: 'plain_text',
          text: 'Create IT Ticket',
        },
        submit: {
          type: 'plain_text',
          text: 'Create',
        },
        close: {
          type: 'plain_text',
          text: 'Cancel',
        },
        blocks: [
          {
            type: 'input',
            block_id: 'title_block',
            label: {
              type: 'plain_text',
              text: 'Title',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'title',
              initial_value: messageText.length > 100 ? messageText.substring(0, 97) + '...' : messageText,
              placeholder: {
                type: 'plain_text',
                text: 'e.g., Printer on 3rd floor not working',
              },
            },
          },
          {
            type: 'input',
            block_id: 'description_block',
            label: {
              type: 'plain_text',
              text: 'Description',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'description',
              multiline: true,
              initial_value: `${messageText}\n\nOriginal message: ${messageLink}\nFrom: <@${messageUser}>`,
              placeholder: {
                type: 'plain_text',
                text: 'Provide details about the issue...',
              },
            },
            optional: true,
          },
          {
            type: 'input',
            block_id: 'priority_block',
            label: {
              type: 'plain_text',
              text: 'Priority',
            },
            element: {
              type: 'static_select',
              action_id: 'priority',
              initial_option: {
                text: {
                  type: 'plain_text',
                  text: 'Medium',
                },
                value: 'medium',
              },
              options: [
                {
                  text: {
                    type: 'plain_text',
                    text: '⬇️ Low',
                  },
                  value: 'low',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: '➡️ Medium',
                  },
                  value: 'medium',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: '⬆️ High',
                  },
                  value: 'high',
                },
              ],
            },
          },
        ],
        private_metadata: JSON.stringify({
          user_id: userId,
          channel_id: channelId,
          original_message_user: messageUser,
          message_ts: messageTs,
        }),
      },
    });

    return NextResponse.json({});
  } catch (error) {
    console.error('Error handling message action:', error);
    return NextResponse.json({ 
      error: 'Failed to open ticket form' 
    }, { status: 500 });
  }
}

async function handleTicketCreation(payload: any) {
  const values = payload.view.state.values;
  const metadata = JSON.parse(payload.view.private_metadata);
  
  // Extract form data
  const title = values.title_block.title.value;
  const description = values.description_block?.description?.value || '';
  const priority = values.priority_block.priority.selected_option.value;
  
  const slackUserId = payload.user.id;
  const slackTeamId = payload.team.id;
  const channelId = metadata.channel_id;

  try {
    // Get Supabase client with service role to bypass RLS for Slack webhooks
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
    
    // Get or create organization
    let { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('slack_team_id', slackTeamId)
      .single();

    if (!org) {
      // Get workspace info
      const teamInfo = await slackClient.team.info();
      
      // Create organization if doesn't exist
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: teamInfo.team?.name || 'Slack Workspace',
          slack_team_id: slackTeamId,
          plan: 'free',
        })
        .select()
        .single();

      if (orgError) {
        console.error('Error creating organization:', orgError);
        throw orgError;
      }
      org = newOrg;
    }

    // Get or create user
    const slackUserInfo = await slackClient.users.info({
      user: slackUserId,
    });

    // Find or create user in database
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('slack_user_id', slackUserId)
      .single();

    if (!user) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          org_id: org.id,
          slack_user_id: slackUserId,
          email: slackUserInfo.user?.profile?.email || `${slackUserId}@slack.local`,
          name: slackUserInfo.user?.real_name || slackUserInfo.user?.name || 'Unknown User',
          role: 'user',
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }
      user = newUser;
    }

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        org_id: org.id,
        title,
        description,
        priority,
        status: 'open',
        requester_id: user.id,
        slack_channel_id: channelId,
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Error creating ticket:', ticketError);
      throw ticketError;
    }

    // Send confirmation message to channel
    const message = await slackClient.chat.postMessage({
      channel: channelId,
      text: `✅ Ticket #${ticket.id} created`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*✅ Ticket Created*\n\n*#${ticket.id}* - ${title}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Priority:*\n${priority.charAt(0).toUpperCase() + priority.slice(1)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\nOpen`,
            },
            {
              type: 'mrkdwn',
              text: `*Requester:*\n<@${slackUserId}>`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '🔗 View in Dashboard',
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets/${ticket.id}`,
              action_id: 'view_ticket',
            },
          ],
        },
      ],
    });

    // Store the thread timestamp for future updates
    if (message.ts) {
      await supabase
        .from('tickets')
        .update({ slack_thread_ts: message.ts })
        .eq('id', ticket.id);
    }

    // Return empty response (Slack requires this)
    return NextResponse.json({});
  } catch (error) {
    console.error('Error handling ticket creation:', error);
    
    // Return error to user
    return NextResponse.json({
      response_action: 'errors',
      errors: {
        title_block: 'Failed to create ticket. Please try again.',
      },
    });
  }
}

