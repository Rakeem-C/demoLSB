export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { appendLeadActivityEvent, createLeadIntake } from '@/lib/lead-inbox'
import { getInitialQualificationPrompt } from '@/lib/qualification'
import { sendLeadSubmissionEmail } from '@/lib/email'
import { sendLeadSubmissionSms, sendSmsMessage } from '@/lib/sms'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const lead = await createLeadIntake(body ?? {})

    // Layer 1: Internal alert and enhanced customer acknowledgment
    let customerAckResults: {
      sms: { sent: boolean; skipped: boolean; reason?: string; simulated?: boolean; provider: 'twilio' | 'resend' | 'mock' | 'none' }
      email: { sent: boolean; skipped: boolean; reason?: string; simulated?: boolean; provider: 'twilio' | 'resend' | 'mock' | 'none' }
    } = {
      sms: { sent: false, skipped: true, reason: 'Customer acknowledgment not attempted', provider: 'none' },
      email: { sent: false, skipped: true, reason: 'Customer acknowledgment not attempted', provider: 'none' },
    }

    try {
      const { sendInternalAlert, sendCustomerAcknowledgment, logNotificationToTimeline } = await import('@/lib/notifications')

      const internalAlertResults = await sendInternalAlert({
        leadId: lead.id,
        firstName: lead.firstName,
        phone: lead.phone,
        email: lead.email,
        message: lead.message,
        submittedAt: lead.submittedAt,
      })

      await logNotificationToTimeline(lead.id, 'internal_alert', internalAlertResults)

      customerAckResults = await sendCustomerAcknowledgment({
        leadId: lead.id,
        firstName: lead.firstName,
        phone: lead.phone,
        email: lead.email,
      })

      await logNotificationToTimeline(lead.id, 'customer_ack', customerAckResults)
    } catch (notificationError) {
      console.warn('Notification layer error, continuing with original flow:', notificationError)
    }

    const customerSmsDelivered = customerAckResults.sms.sent && !customerAckResults.sms.simulated
    const customerEmailDelivered = customerAckResults.email.sent && !customerAckResults.email.simulated
    console.info('Layer 1 customer acknowledgment outcomes:', {
      sms: customerAckResults.sms,
      email: customerAckResults.email,
      customerSmsDelivered,
      customerEmailDelivered,
    })

    if (!customerEmailDelivered) {
      try {
        const emailResult = await sendLeadSubmissionEmail({
          firstName: lead.firstName,
          email: lead.email,
        })

        await appendLeadActivityEvent(lead.id, {
          type: 'notification',
          title: emailResult.sent ? 'Confirmation email sent' : 'Confirmation email skipped',
          detail: emailResult.sent
            ? `A confirmation email was sent to ${lead.email}.${emailResult.providerMessageId ? ` Resend message ID: ${emailResult.providerMessageId}.` : ''}`
            : `Confirmation email was not sent. ${emailResult.reason ?? 'No provider was available.'}`,
        })

        if (emailResult.skipped) {
          console.info('Lead email skipped:', emailResult.reason ?? 'unavailable')
        }
      } catch (emailError) {
        console.warn('Lead email failed, continuing submission flow:', emailError)
        await appendLeadActivityEvent(lead.id, {
          type: 'notification',
          title: 'Confirmation email failed',
          detail: `The confirmation email could not be sent, but the lead was still created successfully. ${emailError instanceof Error ? emailError.message : ''}`.trim(),
        })
      }
    } else {
      console.info('Customer acknowledgment email delivered from Layer 1 provider.')
    }

    if (!customerSmsDelivered) {
      try {
        console.info('Attempting SMS fallback send via sendLeadSubmissionSms()', { leadId: lead.id, phone: lead.phone })
        const smsResult = await sendLeadSubmissionSms({
          firstName: lead.firstName,
          phone: lead.phone,
        })

        console.info('SMS fallback result:', smsResult)
        await appendLeadActivityEvent(lead.id, {
          type: 'notification',
          title: smsResult.sent ? 'Confirmation SMS sent' : 'Confirmation SMS skipped',
          detail: smsResult.sent
            ? `A confirmation SMS was sent to ${lead.phone}.`
            : `Confirmation SMS was not sent. ${smsResult.reason ?? 'No provider was available.'}`,
        })

        if (smsResult.skipped) console.info('Lead SMS skipped:', smsResult.reason ?? 'unavailable')
      } catch (smsError) {
        console.warn('Lead SMS failed, continuing submission flow:', smsError)
        await appendLeadActivityEvent(lead.id, {
          type: 'notification',
          title: 'Confirmation SMS failed',
          detail: `The confirmation SMS could not be sent, but the lead was still created successfully. ${smsError instanceof Error ? smsError.message : ''}`.trim(),
        })
      }
    } else {
      console.info('Customer acknowledgment SMS delivered from Layer 1 provider.')
    }

    const kickoff = getInitialQualificationPrompt(lead.firstName)
    const kickoffResult = await sendSmsMessage({ phone: lead.phone, body: kickoff })

    if (kickoffResult.sent) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          qualificationStage: 'service',
          qualificationComplete: false,
        },
      }).catch(() => null)
    }

    await appendLeadActivityEvent(lead.id, {
      type: 'notification',
      title: kickoffResult.sent ? 'Qualification started' : 'Qualification kickoff skipped',
      detail: kickoffResult.sent
        ? kickoff
        : `Qualification kickoff was not sent. ${kickoffResult.reason ?? 'No provider was available.'}`,
    })

    return NextResponse.json(
      {
        success: true,
        id: lead.id,
        status: lead.status,
        bookingState: lead.bookingState,
        scheduleUrl: `/schedule?lead=${encodeURIComponent(lead.id)}`,
        message: 'Thanks - your request has been received. A team member will text you shortly to confirm details and scheduling.',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Lead creation error:', error)
    const message = error instanceof Error && error.message === 'Missing required lead fields'
      ? 'Please complete all required fields before submitting.'
      : 'Failed to submit form. Please try again.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
