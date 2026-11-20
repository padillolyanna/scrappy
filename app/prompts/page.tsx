export const instant = false

import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function PromptsPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: todayPrompt } = await supabase
    .from('daily_prompts')
    .select('*')
    .eq('date', today)
    .single()

  let todayAnswers: {
    user_id: string | null
    answer_text: string
    is_anonymous: boolean
    like_count: number
    profiles: { username: string } | null
  }[] = []

  if (todayPrompt?.id) {
    const { data } = await supabase
      .from('prompt_answers')
      .select('user_id, answer_text, is_anonymous, like_count, profiles(username)')
      .eq('prompt_id', todayPrompt.id)
      .order('like_count', { ascending: false })
      .limit(50)
    todayAnswers = (data as unknown as typeof todayAnswers) ?? []
  }

  // Also fetch upcoming prompts for context
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
            style={{ fontSize: '11px' }}
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
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl border-2 border-[#FFB6D9] p-6 shadow-sm mb-6">
              <p
                className="font-caveat text-2xl text-[#3A0030] leading-snug"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                "{todayPrompt.question_text}"
              </p>
            </div>
          </div>
        )}

        {/* All answers section */}
        {todayAnswers.length > 3 && (
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
                      key={i}
                      className="break-inside-avoid bg-white rounded-xl p-4 border border-[#FFB6D9]/30 mb-4"
                    >
                      <div className="font-pixel text-xs text-[#FF4FA3] mb-1" style={{ fontSize: '9px' }}>
                        @{username}
                      </div>
                      <p
                        className="font-caveat text-[#3A0030]"
                        style={{ fontFamily: 'Caveat, cursive', fontSize: '17px', lineHeight: 1.4 }}
                      >
                        {a.answer_text}
                      </p>
                      <div className="font-nunito text-xs text-[#888] mt-2">♡ {a.like_count || 0}</div>
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
                  <div className="font-pixel text-xs text-[#FFB6D9] flex-shrink-0" style={{ fontSize: '9px' }}>
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
