'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/lib/useAuth'

const TOPICS = [
  { id: 'general', label: 'General question' },
  { id: 'bug', label: 'Something is broken' },
  { id: 'report', label: 'Report content or a user' },
  { id: 'privacy', label: 'Privacy / delete my data' },
  { id: 'ads', label: 'Advertising' },
  { id: 'other', label: 'Something else' },
]

export default function ContactForm() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', topic: 'general', message: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [hp, setHp] = useState('') // honeypot for bots

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (hp) return setState('sent')
    setState('sending')
    const { error } = await createClient().from('contact_messages').insert({
      name: form.name.trim() || null,
      email: (form.email || user?.email || '').trim(),
      topic: form.topic,
      message: form.message.trim(),
      user_id: user?.id ?? null,
    })
    setState(error ? 'error' : 'sent')
  }

  if (state === 'sent') {
    return (
      <div className="rounded-2xl border-2 border-[#22C55E] bg-[#F0FFF4] p-5 text-center" role="status">
        <div className="font-pacifico text-2xl text-[#15803D]">thank you ♡</div>
        <p className="font-nunito text-base text-[#3A2A35] mt-1">Your message was sent. We usually reply within a few days.</p>
      </div>
    )
  }

  const label = 'block font-nunito font-bold text-[15px] text-[#3A0030] mb-1'
  const input = 'w-full border-2 border-[#2B0A2E]/70 rounded-xl px-3 py-2.5 font-nunito text-base text-[#2B0A2E] bg-white outline-none focus:border-[#FF4FA3] focus:ring-2 focus:ring-[#FF4FA3]/30'
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className={label}>
          Your name <span className="font-normal text-[#888]">(optional)</span>
          <input className={`${input} mt-1`} value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
        </label>
        <label className={label}>
          Email so we can reply
          <input
            className={`${input} mt-1`}
            type="email"
            required={!user}
            placeholder={user?.email ?? 'you@example.com'}
            value={form.email}
            maxLength={200}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
          />
        </label>
      </div>
      <label className={label}>
        What&apos;s it about?
        <select className={`${input} mt-1`} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
          {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </label>
      <label className={label}>
        Message
        <textarea
          className={`${input} mt-1 resize-y`}
          rows={6}
          required
          minLength={5}
          maxLength={3000}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us what's up… if you're reporting something, include the link to the page."
        />
        <span className="block text-right font-nunito text-sm text-[#888] font-normal">{form.message.length}/3000</span>
      </label>
      <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden />
      {state === 'error' && (
        <p className="font-nunito text-base text-[#D4006E]" role="alert">Sorry, that didn&apos;t send. Please try again in a moment.</p>
      )}
      <button type="submit" disabled={state === 'sending'} className="btn-y2k w-full sm:w-auto px-8 py-3 text-base">
        {state === 'sending' ? 'sending…' : 'SEND MESSAGE ✦'}
      </button>
    </form>
  )
}
