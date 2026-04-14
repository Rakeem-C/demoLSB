export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { appendLeadActivityEvent, createLeadIntake } from '@/lib/lead-inbox'
import { getInitialQualificationPrompt } from '@/lib/qualification'
import { sendLeadSubmissionEmail } from '@/lib/email'
import { sendLeadSubmissionSms, sendSmsMessage } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const lead = await createLeadIntake(body ?? {})

    try {
      const emailResult = await sendLeadSubmissionEmail({
        firstName: lead.firstName,
        email: lead.email,
      });

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

    try {
      const smsResult = await sendLeadSubmissionSms({
        firstName: lead.firstName,
        phone: lead.phone,
      })

      if (smsResult.skipped) {
        console.info('Lead SMS skipped:', smsResult.reason ?? 'unavailable')
      }
      const kickoff = getInitialQualificationPrompt(lead.firstName)
      const kickoffResult = await sendSmsMessage({ phone: lead.phone, body: kickoff })

      await appendLeadActivityEvent(lead.id, {
        type: 'notification',
        title: kickoffResult.sent ? 'Qualification started' : 'Qualification kickoff skipped',
        detail: kickoffResult.sent
          ? kickoff
          : `Qualification kickoff was not sent. ${kickoffResult.reason ?? 'No provider was available.'}`,
      })
    } catch (smsError) {
      console.warn('Lead SMS failed, continuing submission flow:', smsError)
    }

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
