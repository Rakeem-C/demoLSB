'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarCheck2, Play, RotateCcw } from 'lucide-react'

type ScenarioKey = 'roof-leak' | 'painting-quote' | 'storm-damage'
type Sender = 'assistant' | 'customer'

type ScriptMessage = {
  sender: Sender
  text: string
  delayMs: number
}

const scenarioLabels: Record<ScenarioKey, string> = {
  'roof-leak': 'Roof leak emergency',
  'painting-quote': 'Interior painting quote',
  'storm-damage': 'Storm damage follow-up',
}

const scriptTemplates: Record<ScenarioKey, ScriptMessage[]> = {
  'roof-leak': [
    { sender: 'assistant', text: 'Hey {name}, this is Zooby from HomeGuard Pro 👋 I saw your roof leak request. Is water actively coming in right now?', delayMs: 1200 },
    { sender: 'customer', text: 'Yes, it started after last night\'s rain and it\'s dripping near the attic.', delayMs: 1800 },
    { sender: 'assistant', text: 'Thanks — we can prioritize this as urgent. Is your roof shingle or metal?', delayMs: 1300 },
    { sender: 'customer', text: 'Shingle roof, around 14 years old.', delayMs: 1700 },
    { sender: 'assistant', text: 'Perfect. I can reserve a same-day inspection window at 3:30 PM. Does that work?', delayMs: 1400 },
    { sender: 'customer', text: 'Yes, book it please.', delayMs: 1500 },
    { sender: 'assistant', text: 'Booked ✅ You\'ll get a confirmation + prep checklist in 1 minute.', delayMs: 1000 },
  ],
  'painting-quote': [
    { sender: 'assistant', text: 'Hi {name}! Zooby here with HomeGuard Pro. Are you looking for interior, exterior, or both?', delayMs: 1200 },
    { sender: 'customer', text: 'Interior only — kitchen, hallway, and living room.', delayMs: 1700 },
    { sender: 'assistant', text: 'Great. Roughly how soon do you want the project done?', delayMs: 1300 },
    { sender: 'customer', text: 'Within the next month ideally.', delayMs: 1700 },
    { sender: 'assistant', text: 'Great fit. We have estimate openings Tuesday at 11:00 AM or Wednesday at 4:30 PM.', delayMs: 1500 },
    { sender: 'customer', text: 'Wednesday works best.', delayMs: 1500 },
    { sender: 'assistant', text: 'Awesome — you\'re confirmed for Wednesday 4:30 PM 🎉', delayMs: 1000 },
  ],
  'storm-damage': [
    { sender: 'assistant', text: 'Hi {name}, following up on your storm damage request. Did you notice missing shingles or ceiling stains?', delayMs: 1300 },
    { sender: 'customer', text: 'Both — and one gutter section came loose.', delayMs: 1800 },
    { sender: 'assistant', text: 'Thanks for confirming. Have you already filed a claim with your insurer?', delayMs: 1300 },
    { sender: 'customer', text: 'Not yet, I wanted a contractor inspection first.', delayMs: 1800 },
    { sender: 'assistant', text: 'Perfect first step. We can inspect and share photo documentation for your claim.', delayMs: 1500 },
    { sender: 'assistant', text: 'Earliest opening is tomorrow at 9:00 AM — want me to lock it in?', delayMs: 1200 },
    { sender: 'customer', text: 'Yes please, that would help a lot.', delayMs: 1500 },
    { sender: 'assistant', text: 'Done ✅ Appointment confirmed for 9:00 AM tomorrow.', delayMs: 1000 },
  ],
}

function withName(template: string, name: string) {
  return template.split('{name}').join(name.trim() || 'there')
}

export function SmsDemoSimulator() {
  const [visitorName, setVisitorName] = useState('Alex')
  const [scenario, setScenario] = useState<ScenarioKey>('roof-leak')
  const [visibleCount, setVisibleCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const script = useMemo(() => {
    return scriptTemplates[scenario].map((msg) => ({
      ...msg,
      text: withName(msg.text, visitorName),
    }))
  }, [scenario, visitorName])

  useEffect(() => {
    setVisibleCount(0)
    setIsRunning(false)
  }, [scenario, visitorName])

  useEffect(() => {
    if (!isRunning || visibleCount >= script.length) {
      return
    }

    const nextMessage = script[visibleCount]
    timerRef.current = setTimeout(() => {
      setVisibleCount((prev) => prev + 1)
    }, nextMessage.delayMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isRunning, visibleCount, script])

  const isTyping = isRunning && visibleCount < script.length

  const restart = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setVisibleCount(0)
    setIsRunning(true)
  }

  return (
    <section className="bg-slate-950 py-16 text-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Visual demo / simulator</p>
          <h2 className="mb-4 font-display text-3xl font-bold leading-tight md:text-4xl">Show visitors exactly how your AI follow-up converts leads into booked jobs.</h2>
          <p className="mb-6 max-w-xl text-slate-300">
            This interactive mock conversation simulates realistic timing, qualification questions, and a booking confirmation — no real texting needed.
          </p>

          <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
            <label className="text-sm text-slate-200">
              Visitor name
              <input
                type="text"
                value={visitorName}
                onChange={(event) => setVisitorName(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-cyan-300 transition focus:ring-2"
                placeholder="Enter your name"
              />
            </label>

            <label className="text-sm text-slate-200">
              Scenario
              <select
                value={scenario}
                onChange={(event) => setScenario(event.target.value as ScenarioKey)}
                className="mt-2 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-cyan-300 transition focus:ring-2"
              >
                {(Object.keys(scenarioLabels) as ScenarioKey[]).map((key) => (
                  <option key={key} value={key}>
                    {scenarioLabels[key]}
                  </option>
                ))}
              </select>
            </label>

            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsRunning(true)}
                disabled={isRunning || visibleCount >= script.length}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play size={14} /> Play demo
              </button>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <RotateCcw size={14} /> Restart
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[360px] rounded-[2.2rem] border border-white/10 bg-slate-900 p-3 shadow-2xl shadow-cyan-900/30">
          <div className="rounded-[1.8rem] border border-white/10 bg-slate-950 p-3">
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-slate-900 px-3 py-2">
              <div>
                <p className="text-sm font-semibold">HomeGuard Pro Assistant</p>
                <p className="text-xs text-slate-400">SMS demo</p>
              </div>
              <CalendarCheck2 className="text-cyan-300" size={18} />
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {script.slice(0, visibleCount).map((message, index) => (
                <div key={`${message.sender}-${index}`} className={`flex ${message.sender === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  <p
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      message.sender === 'assistant' ? 'rounded-bl-md bg-slate-800 text-slate-100' : 'rounded-br-md bg-cyan-400 text-slate-900'
                    }`}
                  >
                    {message.text}
                  </p>
                </div>
              ))}

              {isTyping ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-slate-800 px-3 py-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-300 [animation-delay:50ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-300 [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-300 [animation-delay:200ms]" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
