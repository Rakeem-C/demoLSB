import * as tls from 'node:tls'

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

type SmtpConfig = {
  host: string
  port: number
  user: string
  pass: string
  fromEmail: string
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

function sanitizeHeaderValue(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

function extractEnvelopeEmail(fromValue: string) {
  const trimmed = fromValue.trim()
  const angleMatch = trimmed.match(/<([^>]+)>/)
  const candidate = (angleMatch?.[1] ?? trimmed).trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : null
}

function getSmtpConfig(): SmtpConfig | null {
  const pass = process.env.SMTP_PASS ?? process.env.RESEND_API_KEY ?? ''
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? 'HomeGuard Pro <onboarding@resend.dev>'

  if (!pass) return null

  return {
    host: process.env.SMTP_HOST ?? 'smtp.resend.com',
    port: Number(process.env.SMTP_PORT ?? '465'),
    user: process.env.SMTP_USER ?? 'resend',
    pass,
    fromEmail,
  }
}

function buildMimeMessage(fromEmail: string, toEmail: string, subject: string, text: string, html: string) {
  const boundary = `boundary_${crypto.randomUUID()}`

  return [
    `From: ${sanitizeHeaderValue(fromEmail)}`,
    `To: ${sanitizeHeaderValue(toEmail)}`,
    `Subject: ${sanitizeHeaderValue(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    text,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    html,
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n')
}

function dotStuff(body: string) {
  return body
    .split(/\r?\n/)
    .map((line) => (line.startsWith('.') ? `.${line}` : line))
    .join('\r\n')
}

function createSmtpSession(socket: tls.TLSSocket) {
  socket.setEncoding('utf8')
  socket.setTimeout(10000)

  let buffer = ''
  let lines: string[] = []
  const queue: Array<{ code: number; message: string }> = []
  let pending: ((response: { code: number; message: string }) => void) | null = null
  let rejectPending: ((error: Error) => void) | null = null

  const fail = (error: Error) => {
    if (rejectPending) {
      const reject = rejectPending
      pending = null
      rejectPending = null
      reject(error)
      return
    }
    socket.destroy(error)
  }

  const flushResponse = () => {
    if (!lines.length) return

    const first = lines[0]
    const code = Number(first.slice(0, 3))
    const message = lines.map((line) => line.slice(4)).join('\n')
    const response = { code, message }
    lines = []

    if (pending) {
      const resolve = pending
      pending = null
      rejectPending = null
      resolve(response)
      return
    }

    queue.push(response)
  }

  socket.on('data', (chunk) => {
    buffer += chunk

    let newlineIndex = buffer.indexOf('\n')
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).replace(/\r$/, '')
      buffer = buffer.slice(newlineIndex + 1)

      if (line.length > 0) {
        lines.push(line)
        if (/^\d{3} /.test(line)) {
          flushResponse()
        }
      }

      newlineIndex = buffer.indexOf('\n')
    }
  })

  socket.on('error', (error) => fail(error instanceof Error ? error : new Error(String(error))))
  socket.on('timeout', () => fail(new Error('SMTP request timed out')))

  return {
    async nextResponse() {
      if (queue.length > 0) {
        return queue.shift()!
      }

      return new Promise<{ code: number; message: string }>((resolve, reject) => {
        pending = resolve
        rejectPending = reject
      })
    },
    send(command: string) {
      socket.write(`${command}\r\n`)
    },
    close() {
      socket.end('QUIT\r\n')
    },
  }
}

async function sendViaSmtp(input: SendLeadEmailInput, body: ReturnType<typeof buildEmailBody>): Promise<EmailResult> {
  const smtp = getSmtpConfig()

  if (!smtp) {
    return { sent: false, skipped: true, reason: 'SMTP credentials are not configured.' }
  }

  const toEmail = normalizeEmail(input.email)
  if (!toEmail) {
    return { sent: false, skipped: true, reason: 'Email address could not be normalized.' }
  }

  const envelopeFrom = extractEnvelopeEmail(smtp.fromEmail)
  if (!envelopeFrom) {
    return { sent: false, skipped: true, reason: 'SMTP from address is not valid.' }
  }

  const socket = tls.connect({
    host: smtp.host,
    port: smtp.port,
    servername: smtp.host,
  })

  await new Promise<void>((resolve, reject) => {
    socket.once('secureConnect', resolve)
    socket.once('error', reject)
  })

  const session = createSmtpSession(socket)

  const banner = await session.nextResponse()
  if (banner.code !== 220) {
    throw new Error(`SMTP connect failed (${banner.code}): ${banner.message}`)
  }

  const ehlo = await (() => {
    session.send('EHLO localhost')
    return session.nextResponse()
  })()
  if (ehlo.code !== 250) {
    throw new Error(`SMTP EHLO failed (${ehlo.code}): ${ehlo.message}`)
  }

  const auth = await (() => {
    session.send('AUTH LOGIN')
    return session.nextResponse()
  })()
  if (auth.code !== 334) {
    throw new Error(`SMTP AUTH failed (${auth.code}): ${auth.message}`)
  }

  const userResp = await (() => {
    session.send(Buffer.from(smtp.user, 'utf8').toString('base64'))
    return session.nextResponse()
  })()
  if (userResp.code !== 334) {
    throw new Error(`SMTP username rejected (${userResp.code}): ${userResp.message}`)
  }

  const passResp = await (() => {
    session.send(Buffer.from(smtp.pass, 'utf8').toString('base64'))
    return session.nextResponse()
  })()
  if (passResp.code !== 235) {
    throw new Error(`SMTP password rejected (${passResp.code}): ${passResp.message}`)
  }

  const mailFrom = await (() => {
    session.send(`MAIL FROM:<${envelopeFrom}>`)
    return session.nextResponse()
  })()
  if (mailFrom.code !== 250) {
    throw new Error(`SMTP MAIL FROM failed (${mailFrom.code}): ${mailFrom.message}`)
  }

  const rcptTo = await (() => {
    session.send(`RCPT TO:<${toEmail}>`)
    return session.nextResponse()
  })()
  if (rcptTo.code !== 250 && rcptTo.code !== 251) {
    throw new Error(`SMTP RCPT TO failed (${rcptTo.code}): ${rcptTo.message}`)
  }

  const dataResp = await (() => {
    session.send('DATA')
    return session.nextResponse()
  })()
  if (dataResp.code !== 354) {
    throw new Error(`SMTP DATA failed (${dataResp.code}): ${dataResp.message}`)
  }

  const message = buildMimeMessage(smtp.fromEmail, toEmail, body.subject, body.text, body.html)
  socket.write(`${dotStuff(message)}\r\n.\r\n`)

  const sendResp = await session.nextResponse()
  if (sendResp.code !== 250) {
    throw new Error(`SMTP send failed (${sendResp.code}): ${sendResp.message}`)
  }

  session.close()
  socket.end()

  return { sent: true, skipped: false }
}

async function sendViaResendApi(input: SendLeadEmailInput, body: ReturnType<typeof buildEmailBody>): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'HomeGuard Pro <onboarding@resend.dev>'

  if (!apiKey) {
    return { sent: false, skipped: true, reason: 'Resend credentials are not configured.' }
  }

  const toEmail = normalizeEmail(input.email)

  if (!toEmail) {
    return { sent: false, skipped: true, reason: 'Email address could not be normalized.' }
  }

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

export async function sendLeadSubmissionEmail(input: SendLeadEmailInput): Promise<EmailResult> {
  const body = buildEmailBody(input.firstName)

  try {
    return await sendViaSmtp(input, body)
  } catch (smtpError) {
    console.warn('SMTP email send failed, falling back to Resend API:', smtpError)
    return sendViaResendApi(input, body)
  }
}
