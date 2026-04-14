export type QualificationStage = 'service' | 'urgency' | 'contact_time' | 'complete'

export type QualificationState = {
  stage: QualificationStage
  serviceNeeded?: string | null
  urgencyLevel?: 'urgent' | 'soon' | 'researching' | null
  preferredCallbackTime?: string | null
  complete: boolean
}

export type QualificationProgress = {
  state: QualificationState
  reply: string
  updates: {
    status?: 'new' | 'contacted' | 'qualified' | 'scheduled' | 'closed'
    recommendedNextAction?: string
    summaryAppend?: string
  }
}

export function getInitialQualificationState(): QualificationState {
  return {
    stage: 'service',
    serviceNeeded: null,
    urgencyLevel: null,
    preferredCallbackTime: null,
    complete: false,
  }
}

export function getInitialQualificationPrompt(firstName: string) {
  const safeName = firstName.trim() || 'there'
  return `Hey ${safeName}, got your request. Quick question so I can help faster: what service are you looking for?`
}

function normalizeText(input: string) {
  return input.trim().replace(/\s+/g, ' ')
}

function inferUrgencyLevel(input: string): 'urgent' | 'soon' | 'researching' {
  const normalized = input.toLowerCase()

  if (
    normalized.includes('asap') ||
    normalized.includes('urgent') ||
    normalized.includes('today') ||
    normalized.includes('now') ||
    normalized.includes('immediately') ||
    normalized.includes('leak')
  ) {
    return 'urgent'
  }

  if (
    normalized.includes('this week') ||
    normalized.includes('soon') ||
    normalized.includes('next week') ||
    normalized.includes('quote') ||
    normalized.includes('estimate')
  ) {
    return 'soon'
  }

  return 'researching'
}

export function advanceQualification(
  current: QualificationState | null | undefined,
  inboundReply: string
): QualificationProgress {
  const state = current ? { ...current } : getInitialQualificationState()
  const reply = normalizeText(inboundReply)

  if (!reply) {
    return {
      state,
      reply: 'I didn\'t catch that. What service are you looking for?',
      updates: {},
    }
  }

  if (state.stage === 'service') {
    state.serviceNeeded = reply
    state.stage = 'urgency'

    return {
      state,
      reply: 'Got it — is this something you\'re looking to get done soon, or are you just exploring options right now?',
      updates: {
        status: 'contacted',
        summaryAppend: ` Service needed: ${reply}.`,
      },
    }
  }

  if (state.stage === 'urgency') {
    const urgency = inferUrgencyLevel(reply)
    state.urgencyLevel = urgency
    state.stage = 'contact_time'

    return {
      state,
      reply: 'Perfect — what\'s the best time for a quick call or text back?',
      updates: {
        status: urgency === 'researching' ? 'contacted' : 'qualified',
        recommendedNextAction:
          urgency === 'urgent'
            ? 'Call in under 5 minutes'
            : urgency === 'soon'
              ? 'Text and call today'
              : 'Nurture with callback reminder',
        summaryAppend: ` Urgency: ${urgency}.`,
      },
    }
  }

  if (state.stage === 'contact_time') {
    state.preferredCallbackTime = reply
    state.stage = 'complete'
    state.complete = true

    return {
      state,
      reply:
        'Thanks — I\'ve got everything I need. We\'ll follow up shortly to confirm details and next steps. You can also book here: /schedule',
      updates: {
        status: 'qualified',
        recommendedNextAction: 'Book inspection',
        summaryAppend: ` Preferred callback time: ${reply}.`,
      },
    }
  }

  return {
    state,
    reply: 'You\'re all set — we\'ll follow up shortly.',
    updates: {},
  }
}
