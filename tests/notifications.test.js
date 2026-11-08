import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as notifPkg from '../src/notifications.js';

describe('Notifications Module', () => {
  it('should format Discord payload correctly with color and embeds', () => {
    const payload = notifPkg.formatDiscordPayload({
      type: 'error',
      title: 'Healing Loop Crash',
      message: 'Syntax error detected in widget script.',
      details: { App: 'Calculator', Attempts: 3 }
    });

    expect(payload.embeds).toBeDefined();
    expect(payload.embeds).toHaveLength(1);
    expect(payload.embeds[0].title).toBe('[Factory ERROR] Healing Loop Crash');
    expect(payload.embeds[0].color).toBe(0xff0000);
    expect(payload.embeds[0].fields).toHaveLength(2);
    expect(payload.embeds[0].fields[0].name).toBe('App');
    expect(payload.embeds[0].fields[0].value).toBe('Calculator');
  });

  it('should format Slack payload correctly with mrkdwn blocks', () => {
    const payload = notifPkg.formatSlackPayload({
      type: 'info',
      title: 'Widget Deployed',
      message: 'Deployed to https://calc.utilityhub.com',
      details: { Provider: 'Vercel' }
    });

    expect(payload.text).toContain('[Factory INFO] Widget Deployed');
    expect(payload.blocks).toHaveLength(2);
    expect(payload.blocks[0].type).toBe('section');
    expect(payload.blocks[1].fields).toHaveLength(1);
    expect(payload.blocks[1].fields[0].text).toContain('*Provider:*');
  });

  it('should fallback gracefully to mock when webhookUrl is not set', async () => {
    const res = await notifPkg.sendWebhookAlert({
      type: 'info',
      title: 'Test Alert',
      message: 'Testing fallback',
      webhookUrl: ''
    });

    expect(res.success).toBe(true);
    expect(res.method).toBe('mock');
    expect(res.status).toBe('skipped');
  });

  it('should dispatch alert when webhookUrl is provided', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200
    });

    const res = await notifPkg.sendWebhookAlert({
      type: 'warn',
      title: 'Test Slack Webhook',
      message: 'Testing dispatch',
      webhookUrl: 'https://hooks.slack.com/services/test/test/test'
    });

    expect(res.success).toBe(true);
    expect(res.method).toBe('slack');
    expect(res.status).toBe(200);

    global.fetch = originalFetch;
  });

  it('should catch and return error when fetch fails', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    const res = await notifPkg.sendWebhookAlert({
      type: 'error',
      title: 'Failed alert',
      message: 'Trigger failure',
      webhookUrl: 'https://discord.com/api/webhooks/test'
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe('Network offline');

    global.fetch = originalFetch;
  });
});
