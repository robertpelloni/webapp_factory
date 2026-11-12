import { NextResponse } from 'next/server';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const notifPath = path.resolve(process.cwd(), '../../src/notifications.js');
    const { sendWebhookAlert } = require(notifPath);

    const result = await sendWebhookAlert({
      type: 'info',
      title: 'Manual Webhook Test Triggered',
      message: 'Dashboard user triggered a manual webhook connectivity check.',
      details: {
        Source: 'Next.js Unified Dashboard',
        Timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
