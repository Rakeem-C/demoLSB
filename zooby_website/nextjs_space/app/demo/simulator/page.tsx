'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SimulatorPage() {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)

  const messages = [
    "Hi — we received your request about a roof leak.",
    "Is this an active leak or something you noticed after a storm?",
    "Got it — we recommend an inspection within 24 hours.",
    "You can book a time here: Tomorrow 2–4pm or Friday 10–12pm.",
    "Appointment confirmed. A technician will arrive within your selected window.",
  ]

  function next() {
    if (step < messages.length - 1) setStep(step + 1)
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="text-xl">Customer Experience Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!started ? (
            <Button onClick={() => setStarted(true)}>Start Demo</Button>
          ) : (
            <>
              <div className="border rounded-xl p-4 bg-slate-50 min-h-[200px] flex flex-col gap-2">
                {messages.slice(0, step + 1).map((msg, i) => (
                  <div key={i} className="bg-white p-2 rounded-lg shadow text-sm">
                    {msg}
                  </div>
                ))}
              </div>
              <Button onClick={next} disabled={step === messages.length - 1}>
                Continue
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
