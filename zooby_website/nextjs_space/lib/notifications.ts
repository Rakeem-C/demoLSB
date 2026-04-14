/**
 * Notification service for DemoLSB lead response system.
 * Uses real Twilio/Resend when configured, otherwise falls back to mock logging.
 */

import { appendLeadActivityEvent } from './lead-inbox'
import { sendLeadSubmissionEmail } from './email'
import { sendLeadSubmissionSms, sendSmsMessage } from './sms'

type InternalAlertInput = {
  leadId: string
  firstName: string
  phone: string
  email: string
  message: string
  submittedAt: Date
}

type CustomerAckInput = {
  leadId: string
  firstName: string
  phone: string
  email: string
}

type NotificationResult = {
  sent: boolean
  skipped: boolean
  provider: 'twilio' | 'resend' | 'mock' | 'none'
  reason?: string
  simulated?: boolean
}

const INTERNAL_ADMIN_PHONE = process.env.INTERNAL_ADMIN_PHONE || ''
const INTERNAL_ADMIN_EMAIL = process.env.INTERNAL_ADMIN_EMAIL || ''
const INTERNAL_ALERTS_ENABLED = (process.env.INTERNAL_ALERTS_ENABLED || 'true').toLowerCase() === 'true'
const USE_SIMULATED_PROVIDERS = (process.env.USE_SIMULATED_PROVIDERS || 'false').toLowerCase() === 'true'
const DEMO_MODE = (process.env.DEMO_MODE || 'false').toLowerCase() === 'true'

function shouldUseRealTwilio() {
  if (USE_SIMULATED_PROVIDERS || DEMO_MODE) return false
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)
}

function shouldUseRealResend() {
  if (USE_SIMULATED_PROVIDERS || DEMO_MODE) return false
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL)
}

function buildInternalAlertMessage(input: InternalAlertInput) {
  return [
    'New DemoLSB lead',
    `Name: ${input.firstName}`,
    `Phone: ${input.phone}`,
    `Email: ${input.email}`,
    `Lead ID: ${input.leadId}`,
    `Message: ${input.message}`,
  ].join('\n')
}

function buildCustomerAckMessage(firstName: string) {
  return `Hi ${firstName}, thanks for reaching out to HomeGuard Pro. Quick question so I can help you faster: what service are you looking for?`
}

async function sendMockSms(to: string, body: string): Promise<NotificationResult> {
  console.log('[MOCK SMS]', { to, body })
  return { sent: true, skipped: false, provider: 'mock', simulated: true }
}

async function sendMockEmail(to: string, subject: string, body: string): Promise<NotificationResult> {
  console.log('[MOCK EMAIL]', { to, subject, body })
  return { sent: true, skipped: false, provider: 'mock', simulated: true }
}

async function sendInternalSmsAlert(to: string, body: string): Promise<NotificationResult> {
  if (!shouldUseRealTwilio()) {
    return sendMockSms(to, body)
  }

  const result = await sendSmsMessage({ phone: to, body })
  return {
    sent: result.sent,
    skipped: result.skipped,
    provider: 'twilio',
    reason: result.reason,
  }
}

async function sendInternalEmailAlert(to: string, subject: string, body: string): Promise<NotificationResult> {
  if (!shouldUseRealResend()) {
    return sendMockEmail(to, subject, body)
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: [to],
      subject,
      text: body,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Resend internal alert failed (${response.status}): ${errorText || response.statusText}`)
  }

  return { sent: true, skipped: false, provider: 'resend' }
}

export async function sendInternalAlert(input: InternalAlertInput): Promise<{ sms: NotificationResult; email: NotificationResult }> {
  if (!INTERNAL_ALERTS_ENABLED) {
    return {
      sms: { sent: false, skipped: true, provider: 'none', reason: 'Internal alerts disabled' },
      email: { sent: false, skipped: true, provider: 'none', reason: 'Internal alerts disabled' },
    }
  }

  const body = buildInternalAlertMessage(input)
  const results: { sms: NotificationResult; email: NotificationResult } = {
    sms: { sent: false, skipped: true, provider: 'none', reason: 'No admin phone configured' },
    email: { sent: false, skipped: true, provider: 'none', reason: 'No admin email configured' },
  }

  try {
    if (INTERNAL_ADMIN_PHONE.trim()) {
      results.sms = await sendInternalSmsAlert(INTERNAL_ADMIN_PHONE, body)
    }
  } catch (error) {
    console.warn('Internal SMS alert failed:', error)
    results.sms = { sent: false, skipped: true, provider: shouldUseRealTwilio() ? 'twilio' : 'mock', reason: error instanceof Error ? error.message : 'SMS alert failed' }
  }

  try {
    if (INTERNAL_ADMIN_EMAIL.trim()) {
      results.email = await sendInternalEmailAlert(INTERNAL_ADMIN_EMAIL, 'New DemoLSB Lead', body)
    }
  } catch (error) {
    console.warn('Internal email alert failed:', error)
    results.email = { sent: false, skipped: true, provider: shouldUseRealResend() ? 'resend' : 'mock', reason: error instanceof Error ? error.message : 'Email alert failed' }
  }

  return results
}

export async function sendCustomerAcknowledgment(input: CustomerAckInput): Promise<{ sms: NotificationResult; email: NotificationResult }> {
  const message = buildCustomerAckMessage(input.firstName)
  const results: { sms: NotificationResult; email: NotificationResult } = {
    sms: { sent: false, skipped: true, provider: 'none', reason: 'No customer phone' },
    email: { sent: false, skipped: true, provider: 'none', reason: 'No customer email' },
  }

  try {
    if (input.phone.trim()) {
      if (shouldUseRealTwilio()) {
        const smsResult = await sendLeadSubmissionSms({ firstName: input.firstName, phone: input.phone })
        results.sms = { sent: smsResult.sent, skipped: smsResult.skipped, provider: 'twilio', reason: smsResult.reason }
      } else {
        results.sms = await sendMockSms(input.phone, message)
      }
    }
  } catch (error) {
    console.warn('Customer SMS failed:', error)
    results.sms = { sent: false, skipped: true, provider: shouldUseRealTwilio() ? 'twilio' : 'mock', reason: error instanceof Error ? error.message : 'Customer SMS failed' }
  }

  try {
    if (input.email.trim()) {
      if (shouldUseRealResend()) {
        const emailResult = await sendLeadSubmissionEmail({ firstName: input.firstName, email: input.email })
        results.email = {
          sent: emailResult.sent,
          skipped: emailResult.skipped,
          provider: 'resend',
          reason: emailResult.reason,
        }
      } else {
        results.email = await sendMockEmail(input.email, 'HomeGuard Pro received your request', message)
      }
    }
  } catch (error) {
    console.warn('Customer email failed:', error)
    results.email = { sent: false, skipped: true, provider: shouldUseRealResend() ? 'resend' : 'mock', reason: error instanceof Error ? error.message : 'Customer email failed' }
  }

  return results
}

export async function logNotificationToTimeline(
  leadId: string,
  notificationType: 'internal_alert' | 'customer_ack',
  results: { sms: NotificationResult; email: NotificationResult }
) {
  try {
    const details = [
      results.sms.sent
        ? `${notificationType === 'internal_alert' ? 'Internal alert' : 'Customer acknowledgment'} SMS sent via ${results.sms.provider}${results.sms.simulated ? ' (simulated)' : ''}`
        : `${notificationType === 'internal_alert' ? 'Internal alert' : 'Customer acknowledgment'} SMS skipped: ${results.sms.reason}`,
      results.email.sent
        ? `${notificationType === 'internal_alert' ? 'Internal alert' : 'Customer acknowledgment'} email sent via ${results.email.provider}${results.email.simulated ? ' (simulated)' : ''}`
        : `${notificationType === 'internal_alert' ? 'Internal alert' : 'Customer acknowledgment'} email skipped: ${results.email.reason}`,
    ]
      .filter(Boolean)
      .join('. ')

    const result = await appendLeadActivityEvent(leadId, {
      type: 'notification',
      title: notificationType === 'internal_alert' ? 'Internal alert sent' : 'Customer acknowledgment sent',
      detail: details,
    })

    if (!result) {
      console.warn(`Failed to append timeline event for lead ${leadId}`)
    }
  } catch (error) {
    console.warn('Failed to log notification to timeline:', error)
  }
}
