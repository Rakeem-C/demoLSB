export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createLeadIntake } from '@/lib/lead-inbox';
import { sendLeadSubmissionSms } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lead = await createLeadIntake(body ?? {});

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
