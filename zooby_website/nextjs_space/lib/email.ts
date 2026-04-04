type SendLeadEmailInput = {
  firstName: string
  email: string
}

type EmailResult = {
  sent: boolean
  skipped: boolean
  reason?: string
}

function normalizeEmail(email: string) {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : null
}

function buildEmailBody(firstName: string) {
  return {
    subject: 'HomeGuard Pro received your request',
    text: `Hi ${firstName}, thanks for reaching out to HomeGuard Pro. We received your request and will follow up shortly to confirm details and scheduling.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <p>Hi ${firstName},</p>
        <p>Thanks for reaching out to HomeGuard Pro. We received your request and will follow up shortly to confirm details and scheduling.</p>
      </div>
    `,
  }
}

export async function sendLeadSubmissionEmail(input: SendLeadEmailInput): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !fromEmail) {
    return { sent: false, skipped: true, reason: 'Resend credentials are not configured.' }
  }

  const toEmail = normalizeEmail(input.email)

  if (!toEmail) {
    return { sent: false, skipped: true, reason: 'Email address could not be normalized.' }
  }

  const body = buildEmailBody(input.firstName)

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: body.subject,
      text: body.text,
      html: body.html,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Resend email failed (${response.status}): ${errorText || response.statusText}`)
  }

  return { sent: true, skipped: false }
}
