'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase-client'
import { TEMPLATES } from '@/lib/types'
import AuthModal from '@/components/ui/AuthModal'

interface Exchange {
  id: string
  creator_id: string
  template_id: string
  status: string
  expires_at: string
}

export default function ExchangeJoinClient({ token }: { token: string }) {
  const { user, loading } = useAuth()
  const [exchange, setExchange] = useState<Exchange | null>(null)
  const [loadingExchange, setLoadingExchange] = useState(true)
  const [invalidToken, setInvalidToken] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [alreadyAnswered, setAlreadyAnswered] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadExchange() {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('exchanges')
        .select('id, creator_id, template_id, status, expires_at')
        .eq('invite_token', token)
        .single()

      if (fetchError || !data) {
        setInvalidToken(true)
        setLoadingExchange(false)
        return
      }

      if (new Date(data.expires_at) < new Date()) {
        setInvalidToken(true)
        setLoadingExchange(false)
        return
      }

      setExchange(data)

      if (user) {
        const { data: existingAnswers } = await supabase
          .from('exchange_answers')
          .select('id')
          .eq('exchange_id', data.id)
          .eq('user_id', user.id)
          .limit(1)
        if (existingAnswers && existingAnswers.length > 0) {
          setAlreadyAnswered(true)
        }
      }

      setLoadingExchange(false)
    }
    loadExchange()
  }, [token, user])

  async function handleSubmit() {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    if (!exchange) return

    const template = TEMPLATES.find((t) => t.id === exchange.template_id)
    if (!template) return

    const unanswered = template.questions.filter((q) => !answers[q.id]?.trim())
    if (unanswered.length > 0) {
      setError('Please answer all questions before submitting.')
      return
    }

    setSubmitting(true)
    setError('')
    const supabase = createClient()

    await supabase
      .from('exchange_participants')
      .upsert({ exchange_id: exchange.id, user_id: user.id }, { onConflict: 'exchange_id,user_id' })

    const answerRows = template.questions.map((q) => ({
      exchange_id: exchange.id,
      user_id: user.id,
      question_id: q.id,
      question_text: q.question_text,
      answer_text: answers[q.id] ?? '',
    }))

    const { error: insertError } = await supabase.from('exchange_answers').insert(answerRows)

    if (insertError) {
      setError('Could not save answers. Please try again.')
      setSubmitting(false)
      return
    }

    await supabase.from('exchanges').update({ status: 'active' }).eq('id', exchange.id)

    setSubmitted(true)
    setSubmitting(false)
  }

  const template = exchange ? TEMPLATES.find((t) => t.id === exchange.template_id) : null

  if (loadingExchange || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-caveat text-[#888] text-xl" style={{ fontFamily: 'Caveat, cursive' }}>
          loading exchange...
        </div>
      </div>
    )
  }

  if (invalidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="font-pixel text-5xl text-[#FFB6D9] mb-4">✗</div>
          <h2
            className="font-pacifico text-2xl text-[#3A0030] mb-2"
            style={{ fontFamily: 'Pacifico, cursive' }}
          >
            invalid or expired link
          </h2>
          <p className="font-caveat text-lg text-[#888] mb-6" style={{ fontFamily: 'Caveat, cursive' }}>
            this exchange link is no longer valid ✦
          </p>
          <Link href="/exchange" className="btn-y2k">
            start a new exchange
          </Link>
        </div>
      </div>
    )
  }

  if (submitted || alreadyAnswered) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 py-10 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="font-pixel text-5xl text-[#FF4FA3] mb-4">✦</div>
            <h2
              className="font-pacifico text-3xl text-[#3A0030] mb-2"
              style={{ fontFamily: 'Pacifico, cursive' }}
            >
              {alreadyAnswered && !submitted ? 'already answered!' : 'answers submitted!'}
            </h2>
            <p className="font-caveat text-xl text-[#888] mb-8" style={{ fontFamily: 'Caveat, cursive' }}>
              {alreadyAnswered && !submitted
                ? "you've already submitted your answers for this exchange ✦"
                : 'your answers are in! waiting for the other person to complete theirs ✦'}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/exchange" className="btn-y2k">
                start another exchange
              </Link>
              <Link href="/my-space" className="btn-outline-y2k">
                my space
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div
              className="font-pixel text-xs text-[#FF4FA3] mb-2 tracking-widest"
              style={{ fontSize: '12px' }}
            >
              ✉ EXCHANGE INVITATION
            </div>
            <h1
              className="font-pacifico text-4xl text-[#3A0030]"
              style={{ fontFamily: 'Pacifico, cursive' }}
            >
              answer these questions
            </h1>
            <p
              className="font-caveat text-xl text-[#888] mt-2"
              style={{ fontFamily: 'Caveat, cursive' }}
            >
              {template?.name ?? 'exchange questions'} ✦
            </p>
          </div>

          {!user && (
            <div className="bg-[#FFB6D9]/20 border-2 border-[#FFB6D9] rounded-xl px-4 py-3 mb-6 text-center">
              <div className="font-caveat text-[#3A0030]" style={{ fontFamily: 'Caveat, cursive' }}>
                you need to{' '}
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-[#FF4FA3] font-bold hover:underline"
                >
                  log in
                </button>{' '}
                to submit your answers ✦
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 mb-4 font-nunito text-sm">
              {error}
            </div>
          )}

          {template && (
            <div className="space-y-4">
              {template.questions.map((q, i) => (
                <div
                  key={q.id}
                  className="bg-white rounded-xl border-2 border-[#FFB6D9]/50 p-5"
                >
                  <div
                    className="font-pixel text-xs text-[#888] mb-1"
                    style={{ fontSize: '12px' }}
                  >
                    QUESTION {i + 1} OF {template.questions.length}
                  </div>
                  <label
                    className="font-caveat text-xl text-[#3A0030] block mb-2"
                    style={{ fontFamily: 'Caveat, cursive', fontSize: '20px' }}
                  >
                    {q.question_text}
                  </label>
                  <textarea
                    value={answers[q.id] ?? ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    placeholder={q.placeholder ?? 'write your answer...'}
                    className="input-y2k resize-none font-caveat w-full"
                    rows={2}
                    style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}
                    onClick={() => !user && setShowAuthModal(true)}
                    readOnly={!user}
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-y2k w-full py-4 text-base mt-6"
          >
            {submitting ? 'submitting...' : 'submit my answers ✦'}
          </button>
        </div>
      </main>
      <Footer />

      {showAuthModal && (
        <AuthModal reason="save" onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  )
}
