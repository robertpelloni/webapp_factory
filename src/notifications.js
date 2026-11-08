const logger = require('./logger');

/**
 * Formats a Discord webhook payload.
 */
function formatDiscordPayload({ type = 'info', title, message, details }) {
  const color = type === 'error' ? 0xff0000 : type === 'warn' ? 0xffaa00 : 0x00ff00;
  return {
    embeds: [
      {
        title: `[Factory ${type.toUpperCase()}] ${title}`,
        description: message,
        color,
        fields: details
          ? Object.entries(details).map(([k, v]) => ({
              name: k,
              value: String(v),
              inline: true
            }))
          : [],
        timestamp: new Date().toISOString()
      }
    ]
  };
}

/**
 * Formats a Slack webhook payload.
 */
function formatSlackPayload({ type = 'info', title, message, details }) {
  const emoji = type === 'error' ? ':rotating_light:' : type === 'warn' ? ':warning:' : ':white_check_mark:';
  const text = `${emoji} *[Factory ${type.toUpperCase()}] ${title}*\n${message}`;

  const blocks = [
    {
      type: 'section',
      text: { type: 'mrkdwn', text }
    }
  ];

  if (details && Object.keys(details).length > 0) {
    const fields = Object.entries(details).map(([k, v]) => ({
      type: 'mrkdwn',
      text: `*${k}:*\n${v}`
    }));
    blocks.push({
      type: 'section',
      fields
    });
  }

  return { text, blocks };
}

/**
 * Sends a webhook alert to Discord or Slack.
 */
async function sendWebhookAlert({ type = 'info', title, message, details = null, webhookUrl = process.env.FACTORY_WEBHOOK_URL }) {
  if (!webhookUrl) {
    logger.info(`[Notification Mock] Webhook alert suppressed (no FACTORY_WEBHOOK_URL configured): [${type.toUpperCase()}] ${title} - ${message}`);
    return { success: true, method: 'mock', status: 'skipped' };
  }

  try {
    const isDiscord = webhookUrl.includes('discord.com');
    const payload = isDiscord
      ? formatDiscordPayload({ type, title, message, details })
      : formatSlackPayload({ type, title, message, details });

    logger.info(`[Notification] Dispatching ${isDiscord ? 'Discord' : 'Slack'} alert: ${title}`);

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Webhook responded with status ${res.status}`);
    }

    return { success: true, method: isDiscord ? 'discord' : 'slack', status: res.status };
  } catch (error) {
    logger.error(`[Notification] Failed to send webhook alert: ${error.message}`);
    return { success: false, error: error.message };
  }
}

module.exports = {
  formatDiscordPayload,
  formatSlackPayload,
  sendWebhookAlert
};
