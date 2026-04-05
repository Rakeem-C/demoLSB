type SendLeadEmailInput = {
  firstName: string
  email: string
}

type EmailResult = {
  sent: boolean
  skipped: boolean
  reason?: string
  providerMessageId?: string
}

function normalizeEmail(email: string) {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : null
}

function sanitizeName(firstName: string) {
  const trimmed = firstName.trim()

  if (!trimmed) return 'there'

  return trimmed.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      case "'":
        return '&#39;'
      default:
        return char
    }
  })
}

function buildEmailBody(firstName: string) {
  const safeFirstName = sanitizeName(firstName)

  return {
    subject: 'HomeGuard Pro received your request',
    text: `Hi ${safeFirstName}, thanks for reaching out to HomeGuard Pro. We received your request and will follow up shortly to confirm details and scheduling.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <p>Hi ${safeFirstName},</p>
        <p>Thanks for reaching out to HomeGuard Pro. We received your request and will follow up shortly to confirm details and scheduling.</p>
      </div>
    `,
  }
}

export async function sendLeadSubmissionEmail(input: SendLeadEmailInput): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'HomeGuard Pro <onboarding@resend.dev>'

  if (!apiKey) {
    return { sent: false, skipped: true, reason: 'Resend credentials are not configured.' }
  }

  const toEmail = normalizeEmail(input.email)

  if (!toEmail) {
    return { sent: false, skipped: true, reason: 'Email address could not be normalized.' }
  }

  const body = buildEmailBody(input.firstName)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
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
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`Resend email failed (${response.status}): ${errorText || response.statusText}`)
    }

    const payload = await response.json().catch(() => ({} as { id?: string }))

    return {
      sent: true,
      skipped: false,
      providerMessageId: typeof payload?.id === 'string' ? payload.id : undefined,
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Resend email request timed out after 10s')
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}
