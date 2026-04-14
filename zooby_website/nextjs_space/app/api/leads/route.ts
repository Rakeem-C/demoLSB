export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { appendLeadActivityEvent, createLeadIntake } from '@/lib/lead-inbox';
import { sendLeadSubmissionEmail } from '@/lib/email';
import { sendLeadSubmissionSms } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lead = await createLeadIntake(body ?? {});

    // Layer 1: Internal alert and enhanced customer acknowledgment
    // Track if we've already sent notifications to avoid duplicates
    let layer1NotificationsSent = false;
    
    try {
      const { sendInternalAlert, sendCustomerAcknowledgment, logNotificationToTimeline } = await import('@/lib/notifications');
      
      // Send internal alert to admin
      const internalAlertResults = await sendInternalAlert({
        leadId: lead.id,
        firstName: lead.firstName,
        phone: lead.phone,
        email: lead.email,
        message: lead.message,
        submittedAt: lead.submittedAt
      });
      
      // Log internal alert to timeline
      await logNotificationToTimeline(lead.id, 'internal_alert', internalAlertResults);
      
      // Send enhanced customer acknowledgment
      const customerAckResults = await sendCustomerAcknowledgment({
        leadId: lead.id,
        firstName: lead.firstName,
        phone: lead.phone,
        email: lead.email
      });
      
      // Log customer acknowledgment to timeline
      await logNotificationToTimeline(lead.id, 'customer_ack', customerAckResults);
      
      layer1NotificationsSent = true;
      
    } catch (notificationError) {
      console.warn('Notification layer error, continuing with original flow:', notificationError);
      // Fall back to original notification flow
    }

    // Original customer notification flow (only run if Layer 1 didn't succeed)
    if (!layer1NotificationsSent) {
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
        });

        if (emailResult.skipped) {
          console.info('Lead email skipped:', emailResult.reason ?? 'unavailable');
        }
      } catch (emailError) {
        console.warn('Lead email failed, continuing submission flow:', emailError);
        await appendLeadActivityEvent(lead.id, {
          type: 'notification',
          title: 'Confirmation email failed',
          detail: `The confirmation email could not be sent, but the lead was still created successfully. ${emailError instanceof Error ? emailError.message : ''}`.trim(),
        });
      }

      try {
        const smsResult = await sendLeadSubmissionSms({
          firstName: lead.firstName,
          phone: lead.phone,
        });

        if (smsResult.skipped) {
          console.info('Lead SMS skipped:', smsResult.reason ?? 'unavailable');
        }
      } catch (smsError) {
        console.warn('Lead SMS failed, continuing submission flow:', smsError);
      }
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
    );
  } catch (error: any) {
    console.error('Lead creation error:', error);
    const message = error instanceof Error && error.message === 'Missing required lead fields'
      ? 'Please complete all required fields before submitting.'
      : 'Failed to submit form. Please try again.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
