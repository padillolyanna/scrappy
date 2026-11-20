'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/lib/useAuth'
import AuthModal from '@/components/ui/AuthModal'

interface PromptAnswer {
  user_id: string | null
  answer_text: string
  is_anonymous: boolean
  like_count: number
  profiles: { username: string } | null
}

interface DailyPromptData {
  id: string
  question_text: string
  date: string
  answer_count: number
}

interface Props {
  initialPrompt?: DailyPromptData | null
  initialAnswers?: PromptAnswer[]
}

function Countdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    function calc() {
      const now = new Date()
      const tomorrow = new Date()
      tomorrow.setHours(24, 0, 0, 0)
      const diff = tomorrow.getTime() - now.getTime()
      return {
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      }
    }
    setTime(calc())
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <span
      style={{
        fontFamily: "'Silkscreen', monospace",
        fontSize: 15,
        background: '#0a0a0a',
        color: '#00ff41',
        padding: '2px 8px',
        border: '1px solid #333',
        borderRadius: 3,
        letterSpacing: '0.08em',
      }}
    >
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  )
}

export default function DailyPrompt({ initialPrompt, initialAnswers }: Props) {
  const { user } = useAuth()
  const [answer, setAnswer] = useState('')
  const [prompt, setPrompt] = useState<DailyPromptData | null>(initialPrompt ?? null)
  const [answers, setAnswers] = useState<PromptAnswer[]>(initialAnswers ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [alreadyAnswered, setAlreadyAnswered] = useState(false)
  const [loadingPrompt, setLoadingPrompt] = useState(!initialPrompt)

  useEffect(() => {
    if (initialPrompt) return
    async function loadPrompt() {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('daily_prompts')
        .select('*')
        .eq('date', today)
        .single()
      setPrompt(data)
      setLoadingPrompt(false)

      if (data) {
        const { data: answerData } = await supabase
          .from('prompt_answers')
          .select('user_id, answer_text, is_anonymous, like_count, profiles(username)')
          .eq('prompt_id', data.id)
          .order('like_count', { ascending: false })
          .limit(5)
        setAnswers((answerData as unknown as PromptAnswer[]) ?? [])
      }
    }
    loadPrompt()
  }, [initialPrompt])

  useEffect(() => {
    if (!user || !prompt) return
    async function checkAnswered() {
      if (!prompt) return
      const supabase = createClient()
      const { data } = await supabase
        .from('prompt_answers')
        .select('id')
        .eq('prompt_id', prompt.id)
        .eq('user_id', user!.id)
        .maybeSingle()
      setAlreadyAnswered(!!data)
    }
    checkAnswered()
  }, [user, prompt])

  async function handleSubmit() {
    if (!answer.trim()) return
    if (!user) {
      setShowAuthModal(true)
      return
    }
    if (!prompt) return
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('prompt_answers').insert({
      prompt_id: prompt.id,
      user_id: user.id,
      answer_text: answer.trim(),
      is_anonymous: false,
    })
    if (!error) {
      await supabase
        .from('daily_prompts')
        .update({ answer_count: (prompt.answer_count || 0) + 1 })
        .eq('id', prompt.id)
      setSubmitted(true)
      setAlreadyAnswered(true)
      setAnswers((prev) => [
        { user_id: user.id, answer_text: answer.trim(), is_anonymous: false, like_count: 0, profiles: null },
        ...prev,
      ])
    }
    setSubmitting(false)
  }

  const questionText = prompt?.question_text ?? "loading today's question..."
  const totalAnswers = prompt?.answer_count ?? answers.length

  return (
    <section style={{ padding: '0 20px 20px' }}>
      <div className="panel-header">today&apos;s prompt ✎</div>
      <div className="widget-box" style={{ padding: 0 }}>
        <div className="grid md:grid-cols-[55%_45%]">
          <div
            style={{
              background: '#FFF8ED',
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 27px,
                rgba(100,160,220,0.25) 27px,
                rgba(100,160,220,0.25) 28px
              )`,
              borderRight: '1px solid rgba(201,182,255,0.3)',
              padding: '16px 16px 16px 52px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 36, top: 0, bottom: 0,
                width: 2,
                background: 'rgba(255,100,100,0.5)',
              }}
            />
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 10,
                  top: `${i * 36 + 18}px`,
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#C9A2FF',
                  border: '1.5px solid #2B0A2E',
                }}
              />
            ))}

            {loadingPrompt ? (
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: '#888', marginBottom: 14 }}>
                loading today&apos;s prompt...
              </div>
            ) : (
              <div style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 20,
                color: '#3A0030',
                lineHeight: 1.5,
                marginBottom: 14,
                display: 'inline',
              }}>
                <span style={{ background: 'rgba(255,200,0,0.4)', padding: '0 2px' }}>
                  &ldquo;{questionText}&rdquo;
                </span>
              </div>
            )}

            {submitted || alreadyAnswered ? (
              <div style={{
                background: '#E8F8F0',
                border: '1.5px solid #28C840',
                borderRadius: 6,
                padding: '8px 12px',
                fontFamily: "'Caveat', cursive",
                fontSize: 15,
                color: '#28C840',
                marginBottom: 10,
              }}>
                ✓ your answer is on the wall! ✦
              </div>
            ) : (
              <>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={user ? 'write your answer here...' : 'join scrappy to answer ✦'}
                  rows={3}
                  onClick={() => !user && setShowAuthModal(true)}
                  readOnly={!user}
                  style={{
                    width: '100%',
                    borderRadius: 4,
                    padding: '8px 10px',
                    resize: 'none',
                    fontFamily: "'Caveat', cursive",
                    fontSize: 16,
                    background: 'white',
                    border: '2px solid #C9A2FF',
                    outline: 'none',
                    boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.1)',
                    color: '#3A0030',
                    display: 'block',
                    marginBottom: 10,
                  }}
                />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !answer.trim()}
                    className="btn-bevel"
                    style={{ fontSize: 12, padding: '6px 14px', opacity: !answer.trim() ? 0.5 : 1 }}
                  >
                    {submitting ? 'submitting...' : 'submit ✎'}
                  </button>
                </div>
              </>
            )}

            <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: '#aaa', display: 'flex', alignItems: 'center', gap: 8 }}>
              NEXT PROMPT IN: <Countdown />
            </div>
          </div>

          <div style={{ padding: '14px', background: 'white' }}>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: '#888', marginBottom: 8 }}>
              {totalAnswers > 0 ? `${totalAnswers.toLocaleString()} ANSWERS TODAY` : 'BE THE FIRST TO ANSWER!'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {answers.length > 0 ? (
                answers.slice(0, 3).map((a, i) => {
                  const username = a.is_anonymous ? 'anonymous' : (a.profiles?.username ?? 'scrappy user')
                  return (
                    <div
                      key={i}
                      className="sticky-note"
                      style={{
                        background: ['#FFF0A8', '#FFD6EC', '#D6EDFF'][i % 3],
                        padding: '8px 10px',
                        borderRadius: 2,
                        transform: `rotate(${[-1, 1, -0.5][i % 3]}deg)`,
                      }}
                    >
                      <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 11, fontWeight: 'bold', color: '#FF4FA3', marginBottom: 3 }}>
                        @{username}
                      </div>
                      <p style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: '#3A0030', lineHeight: 1.4 }}>
                        {a.answer_text}
                      </p>
                      <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 10, color: '#aaa', marginTop: 4 }}>
                        ♡ {a.like_count || 0}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: '#888', textAlign: 'center', padding: '16px 0' }}>
                  no answers yet ✦
                </div>
              )}
            </div>

            <div style={{ marginTop: 10 }}>
              <Link href="/prompts" style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#FF4FA3', textDecoration: 'underline' }}>
                READ ALL ANSWERS →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal reason="save" onClose={() => setShowAuthModal(false)} />
      )}
    </section>
  )
}
