/**
 * Conversation store for DemoLSB qualification sequence.
 * Simple in-memory store for preview/demo validation.
 */

import {
  type QualificationState,
  getQualificationSummary as getQualificationSummaryText,
  isQualificationComplete,
  processCustomerReply,
  startQualificationSequence,
} from './qualification-engine'

type ConversationStore = Record<string, QualificationState>

const conversationGlobal = globalThis as typeof globalThis & {
  __conversationStore?: ConversationStore
}

function getConversationStore(): ConversationStore {
  if (!conversationGlobal.__conversationStore) {
    conversationGlobal.__conversationStore = {}
  }

  return conversationGlobal.__conversationStore
}

export function getQualificationState(leadId: string): QualificationState | null {
  return getConversationStore()[leadId] ?? null
}

export function setQualificationState(leadId: string, state: QualificationState) {
  getConversationStore()[leadId] = state
}

export function initializeQualification(leadId: string, customerName: string) {
  const { initialState, firstMessage } = startQualificationSequence(customerName)
  setQualificationState(leadId, initialState)
  return { state: initialState, firstMessage }
}

export function processQualificationReply(leadId: string, customerReply: string, customerName: string) {
  const store = getConversationStore()
  const currentState = store[leadId] ?? startQualificationSequence(customerName).initialState
  const result = processCustomerReply(currentState, customerReply, customerName)
  store[leadId] = result.updatedState
  return result
}

export function hasActiveQualification(leadId: string) {
  const state = getQualificationState(leadId)
  return Boolean(state && !isQualificationComplete(state))
}

export function getActiveConversations() {
  return Object.entries(getConversationStore())
    .filter(([, state]) => !isQualificationComplete(state))
    .map(([leadId, state]) => ({ leadId, state }))
}

export function clearQualificationState(leadId: string) {
  delete getConversationStore()[leadId]
}

export function getQualificationSummary(leadId: string) {
  const state = getQualificationState(leadId)
  if (!state) return 'No qualification data'
  if (!isQualificationComplete(state)) return `Qualification in progress (stage: ${state.stage})`
  return getQualificationSummaryText(state)
}
