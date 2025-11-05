import { NextRequest, NextResponse } from 'next/server';
import { WebClient } from '@slack/web-api';

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function POST(req: NextRequest) {
  try {
    const { channel, thread_ts, text } = await req.json();

    if (!channel || !thread_ts || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Post comment as a threaded reply
    await slackClient.chat.postMessage({
      channel,
      thread_ts,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error posting comment to Slack:', error);
    return NextResponse.json({ error: 'Failed to post to Slack' }, { status: 500 });
  }
}

