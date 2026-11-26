import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daily Prompt — Scrappy',
  description: 'A new question every day. Answer it, read what others said, and discover what your community thinks. Free to join.',
  alternates: { canonical: 'https://www.scrappy.fun/prompts' },
}

import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import PromptAnswerForm from '@/components/prompts/PromptAnswerForm'
import PromptAnswerLikeButton from '@/components/prompts/PromptAnswerLikeButton'

export default async function PromptsPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: todayPrompt } = await supabase
    .from('daily_prompts')
    .select('*')
    .eq('date', today)
    .single()

  let todayAnswers: {
    id: string
    user_id: string | null
    answer_text: string
    is_anonymous: boolean
    like_count: number
    profiles: { username: string } | null
  }[] = []

  let hasAnswered = false
  let userAnswer = ''

  if (todayPrompt?.id) {
    const { data } = await supabase
      .from('prompt_answers')
      .select('id, user_id, answer_text, is_anonymous, like_count, profiles(username)')
      .eq('prompt_id', todayPrompt.id)
      .order('like_count', { ascending: false })
      .limit(50)
    todayAnswers = (data as unknown as typeof todayAnswers) ?? []

    if (user) {
      const existing = todayAnswers.find((a) => a.user_id === user.id)
      hasAnswered = !!existing
      userAnswer = existing?.answer_text ?? ''
    }
  }

  const likedAnswerIds = new Set<string>()
  if (user && todayAnswers.length > 0) {
    const { data: likedData } = await supabase
      .from('prompt_answer_likes')
      .select('answer_id')
      .eq('user_id', user.id)
      .in('answer_id', todayAnswers.map((a) => a.id))
    likedData?.forEach((l: { answer_id: string }) => likedAnswerIds.add(l.answer_id))
  }

  const { data: upcomingPrompts } = await supabase
    .from('daily_prompts')
    .select('id, question_text, date, answer_count')
    .gt('date', today)
    .order('date', { ascending: true })
    .limit(5)

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-10 px-4">
        <div className="text-center mb-8">
          <div
            className="font-pixel text-xs text-[#FF4FA3] mb-2 tracking-widest"
            style={{ fontSize: '12px' }}
          >
            ✦ COMMUNITY PROMPTS ✦
          </div>
          <h1
            className="font-pacifico text-5xl text-[#3A0030]"
            style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(28px, 6vw, 48px)' }}
          >
            daily question
          </h1>
          <p
            className="font-caveat text-xl text-[#888] mt-2"
            style={{ fontFamily: 'Caveat, cursive' }}
          >
            answer the question of the day and see what others say ✦
          </p>
        </div>

        {!todayPrompt ? (
          <div className="text-center py-12">
            <div className="font-pixel text-4xl text-[#FFB6D9] mb-4">★</div>
            <div
              className="font-caveat text-2xl text-[#888]"
              style={{ fontFamily: 'Caveat, cursive' }}
            >
              no prompt scheduled for today yet ✦
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 space-y-5">
            {/* Today's question */}
            <div className="bg-white rounded-2xl border-2 border-[#FFB6D9] p-6 shadow-sm">
              <div className="font-pixel text-xs text-[#FFB6D9] mb-2" style={{ fontSize: '12px' }}>
                TODAY&apos;S QUESTION
              </div>
              <p
                className="font-caveat text-2xl text-[#3A0030] leading-snug"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                &ldquo;{todayPrompt.question_text}&rdquo;
              </p>
              <div className="font-nunito text-xs text-[#888] mt-2">
                {todayAnswers.length} answer{todayAnswers.length !== 1 ? 's' : ''} so far
              </div>
            </div>

            {/* Answer form */}
            <PromptAnswerForm
              promptId={todayPrompt.id}
              hasAnswered={hasAnswered}
              existingAnswer={userAnswer}
            />
          </div>
        )}

        {/* All answers */}
        {todayAnswers.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 px-4">
            <div className="panel-header">all answers today ✦</div>
            <div className="widget-box p-4">
              <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                {todayAnswers.map((a, i) => {
                  const username = a.is_anonymous
                    ? 'anonymous'
                    : (a.profiles?.username ?? 'scrappy user')
                  return (
                    <div
                      key={a.id ?? i}
                      className="break-inside-avoid bg-white rounded-xl p-4 border border-[#FFB6D9]/30 mb-4"
                    >
                      <div className="font-pixel text-xs text-[#FF4FA3] mb-1" style={{ fontSize: '12px' }}>
                        @{username}
                      </div>
                      <p
                        className="font-caveat text-[#3A0030]"
                        style={{ fontFamily: 'Caveat, cursive', fontSize: '17px', lineHeight: 1.4 }}
                      >
                        {a.answer_text}
                      </p>
                      <div className="mt-2">
                        <PromptAnswerLikeButton
                          answerId={a.id}
                          initialCount={a.like_count || 0}
                          initialLiked={likedAnswerIds.has(a.id)}
                          loggedIn={!!user}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming prompts */}
        {upcomingPrompts && upcomingPrompts.length > 0 && (
          <div className="max-w-2xl mx-auto mt-8 px-4">
            <div className="panel-header">upcoming prompts ✦</div>
            <div className="widget-box p-4 space-y-3">
              {upcomingPrompts.map((p) => (
                <div key={p.id} className="flex items-start gap-3 py-2 border-b border-[#FFB6D9]/20 last:border-0">
                  <div className="font-pixel text-xs text-[#FFB6D9] flex-shrink-0" style={{ fontSize: '12px' }}>
                    {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div
                    className="font-caveat text-[#3A0030]"
                    style={{ fontFamily: 'Caveat, cursive', fontSize: '16px' }}
                  >
                    {p.question_text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/scrapbook/create" className="btn-y2k">
            add an answer to your scrapbook ✦
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
