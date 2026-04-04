type SendLeadSmsInput = {
  firstName: string
  phone: string
}

type SmsResult = {
  sent: boolean
  skipped: boolean
  reason?: string
}

function normalizePhone(phone: string) {
  const trimmed = phone.trim()

  if (trimmed.startsWith('+') && /^\+[1-9]\d{7,14}$/.test(trimmed)) {
    return trimmed
  }

  const digits = trimmed.replace(/\D/g, '')

  if (digits.length === 10) {
    return `+1${digits}`
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  return null
}

function buildSmsMessage(firstName: string) {
  return `Hi ${firstName}, thanks for reaching out to HomeGuard Pro. We received your request and will follow up shortly to confirm details and scheduling.`
}

export async function sendLeadSubmissionSms(input: SendLeadSmsInput): Promise<SmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    return { sent: false, skipped: true, reason: 'Twilio credentials are not configured.' }
  }

  const toNumber = normalizePhone(input.phone)

  if (!toNumber) {
    return { sent: false, skipped: true, reason: 'Phone number could not be normalized.' }
  }

  const body = new URLSearchParams({
    To: toNumber,
    From: fromNumber,
    Body: buildSmsMessage(input.firstName),
  })

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Twilio SMS failed (${response.status}): ${errorText || response.statusText}`)
  }

  return { sent: true, skipped: false }
}
