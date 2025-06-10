import pino from 'pino'
import { createWriteStream } from 'pino-sentry'
import { WebClient } from '@slack/web-api'

const sentryStream = createWriteStream({
  dsn: process.env.SENTRY_DSN!,
  environment: process.env.NODE_ENV,
})

const slack = process.env.SLACK_TOKEN ? 
  new WebClient(process.env.SLACK_TOKEN) : 
  null

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
}, pino.multistream([
  { stream: process.stdout },
  { stream: sentryStream },
]))

export class Logger {
  static async error(error: Error, context?: Record<string, any>) {
    logger.error({ error, ...context })

    if (process.env.NODE_ENV === 'production' && slack) {
      try {
        await slack.chat.postMessage({
          channel: process.env.SLACK_ERROR_CHANNEL!,
          text: `🚨 Error: ${error.message}\n\`\`\`${error.stack}\`\`\``,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Error:* ${error.message}\n\n*Stack:*\n\`\`\`${error.stack}\`\`\``,
              },
            },
            context && {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `*Context:*\n${JSON.stringify(context, null, 2)}`,
                },
              ],
            },
          ].filter(Boolean),
        })
      } catch (slackError) {
        logger.error('Failed to send error to Slack:', slackError)
      }
    }
  }

  static info(message: string, data?: Record<string, any>) {
    logger.info({ msg: message, ...data })
  }

  static warn(message: string, data?: Record<string, any>) {
    logger.warn({ msg: message, ...data })
  }

  static debug(message: string, data?: Record<string, any>) {
    logger.debug({ msg: message, ...data })
  }
} 