/**
 * Test script for Layer 2 qualification sequence
 * 
 * Run with: node scripts/test-qualification.js
 */

const { startQualificationSequence, processCustomerReply, getQualificationSummary } = require('../lib/qualification-engine')

console.log('=== DemoLSB Layer 2 Qualification Engine Test ===\n')

// Test 1: Start qualification
console.log('Test 1: Starting qualification for "John"')
const { initialState, firstMessage } = startQualificationSequence('John')
console.log(`Initial state: ${JSON.stringify(initialState, null, 2)}`)
console.log(`First message: "${firstMessage}"\n`)

// Test 2: Process service inquiry reply
console.log('Test 2: Customer replies "roof repair"')
let state = initialState
let result = processCustomerReply(state, 'roof repair', 'John')
state = result.updatedState
console.log(`Updated state: ${JSON.stringify(state, null, 2)}`)
console.log(`System response: "${result.systemResponse}"`)
console.log(`Should advance: ${result.shouldAdvance}\n`)

// Test 3: Process urgency assessment reply
console.log('Test 3: Customer replies "urgent - leaking roof"')
result = processCustomerReply(state, 'urgent - leaking roof', 'John')
state = result.updatedState
console.log(`Updated state: ${JSON.stringify(state, null, 2)}`)
console.log(`System response: "${result.systemResponse}"`)
console.log(`Should advance: ${result.shouldAdvance}\n`)

// Test 4: Process scheduling preference reply
console.log('Test 4: Customer replies "morning works best"')
result = processCustomerReply(state, 'morning works best', 'John')
state = result.updatedState
console.log(`Updated state: ${JSON.stringify(state, null, 2)}`)
console.log(`System response: "${result.systemResponse}"`)
console.log(`Should advance: ${result.shouldAdvance}\n`)

// Test 5: Get summary
console.log('Test 5: Qualification summary')
const summary = getQualificationSummary(state)
console.log(`Summary: ${summary}\n`)

// Test 5b: Layer 3 - Booking handoff
console.log('Test 5b: Layer 3 - Booking handoff')
const { determineBookingHandoff, getQualificationCompletionMessage } = require('../lib/booking-handoff')
const handoff = determineBookingHandoff(state, 'test-lead-123', { useSimulated: true })
console.log(`Booking handoff type: ${handoff.type}`)
console.log(`Booking handoff message: ${handoff.message}`)
console.log(`Simulated: ${handoff.simulated}\n`)

const completionMessage = getQualificationCompletionMessage(state, 'test-lead-123', { useSimulated: true })
console.log(`Full completion message:\n${completionMessage}\n`)

// Test 6: Test unclear replies
console.log('Test 6: Testing unclear replies')
console.log('Testing "I need help" (unclear service):')
const unclearResult = processCustomerReply(initialState, 'I need help', 'John')
console.log(`System response: "${unclearResult.systemResponse}"`)
console.log(`Should advance: ${unclearResult.shouldAdvance}\n`)

console.log('Testing "maybe later" (unclear urgency):')
const urgencyState = { ...initialState, stage: 'urgency_assessment', serviceCategory: 'roof_repair' }
const unclearUrgency = processCustomerReply(urgencyState, 'maybe later', 'John')
console.log(`System response: "${unclearUrgency.systemResponse}"`)
console.log(`Should advance: ${unclearUrgency.shouldAdvance}\n`)

console.log('Testing "call me" (unclear time):')
const timeState = { ...urgencyState, stage: 'scheduling_preference', urgency: 'soon' }
const unclearTime = processCustomerReply(timeState, 'call me', 'John')
console.log(`System response: "${unclearTime.systemResponse}"`)
console.log(`Should advance: ${unclearTime.shouldAdvance}\n`)

// Test 7: Different handoff types based on qualification
console.log('Test 7: Different handoff types based on qualification')

console.log('\nScenario A: Urgent roof repair (callback request):')
const urgentState = {
  ...initialState,
  stage: 'completed',
  serviceCategory: 'roof_repair',
  urgency: 'urgent',
  timePreference: 'morning',
  completedAt: new Date()
}
const urgentHandoff = determineBookingHandoff(urgentState, 'urgent-lead', { useSimulated: false })
console.log(`Handoff type: ${urgentHandoff.type}`)
console.log(`Message: ${urgentHandoff.message}\n`)

console.log('Scenario B: Exploring painting estimate (booking link):')
const exploringState = {
  ...initialState,
  stage: 'completed',
  serviceCategory: 'exterior_painting',
  urgency: 'exploring',
  timePreference: 'anytime',
  completedAt: new Date()
}
const exploringHandoff = determineBookingHandoff(exploringState, 'exploring-lead', { useSimulated: false })
console.log(`Handoff type: ${exploringHandoff.type}`)
console.log(`Message: ${exploringHandoff.message}`)
console.log(`Action URL: ${exploringHandoff.actionUrl}\n`)

console.log('Scenario C: Soon replacement with afternoon preference (time handoff):')
const timeState = {
  ...initialState,
  stage: 'completed',
  serviceCategory: 'roof_replacement',
  urgency: 'soon',
  timePreference: 'afternoon',
  completedAt: new Date()
}
const timeHandoff = determineBookingHandoff(timeState, 'time-lead', { useSimulated: false })
console.log(`Handoff type: ${timeHandoff.type}`)
console.log(`Message: ${timeHandoff.message}\n`)

console.log('=== Test Complete ===')
console.log('\nAPI Endpoints created:')
console.log('1. POST /api/qualification/start - Start qualification for a lead')
console.log('2. POST /api/qualification/reply - Process customer reply')
console.log('3. GET /api/qualification/status?leadId=... - Get qualification status')
console.log('4. POST /api/booking/handoff - Generate booking handoff')
console.log('5. GET /api/booking/handoff?leadId=... - Get handoff options')
console.log('\nQualification automatically starts when customer receives acknowledgment message.')
console.log('Booking handoff automatically generated when qualification completes.')