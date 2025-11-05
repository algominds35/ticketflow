import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Verify request is from Slack
function verifySlackRequest(req: NextRequest, body: string): boolean {
  const timestamp = req.headers.get('x-slack-request-timestamp');
  const slackSignature = req.headers.get('x-slack-signature');
  
  if (!timestamp || !slackSignature) return false;

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
    const text = formData.get('text') || 'No description provided';
    const userId = formData.get('user_id');
    const userName = formData.get('user_name');

    // Generate temporary ticket number (we'll use Supabase tomorrow)
    const ticketNumber = Math.floor(Math.random() * 1000);

    return NextResponse.json({
      response_type: 'in_channel',
      text: `✅ *Ticket #${ticketNumber} created!*\n\n📝 *Description:* ${text}\n👤 *Created by:* ${userName}\n\n_🚀 Full dashboard tracking coming soon!_`,
    });
  } catch (error) {
    console.error('Slack command error:', error);
    return NextResponse.json({ 
      text: '❌ Error creating ticket. Please try again.' 
    }, { status: 500 });
  }
}
