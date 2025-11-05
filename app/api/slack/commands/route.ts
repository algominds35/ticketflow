import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { WebClient } from '@slack/web-api';

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

    const formData = new URLSearchParams(body);
    const triggerId = formData.get('trigger_id');
    const userId = formData.get('user_id');
    const channelId = formData.get('channel_id');

    // Open a modal for structured ticket creation
    await slackClient.views.open({
      trigger_id: triggerId!,
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
        }),
      },
    });

    // Return empty 200 response (modal is already displayed)
    return NextResponse.json({});
  } catch (error) {
    console.error('Slack command error:', error);
    return NextResponse.json({ 
      text: '❌ Error opening ticket form. Please try again.' 
    }, { status: 500 });
  }
}
