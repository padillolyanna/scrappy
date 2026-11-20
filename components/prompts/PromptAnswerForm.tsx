'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/lib/useAuth'

interface Props {
  promptId: string
  hasAnswered: boolean
  existingAnswer?: string
}

export default function PromptAnswerForm({ promptId, hasAnswered, existingAnswer }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const [answer, setAnswer] = useState(existingAnswer ?? '')
  const [anonymous, setAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(hasAnswered)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-5 shadow-sm text-center">
        <div className="font-pixel text-xs text-[#888] mb-3" style={{ fontSize: '10px' }}>
          JOIN TO SHARE YOUR ANSWER
        </div>
        <Link href="/auth/signup" className="btn-y2k mr-2">join scrappy ✦</Link>
        <Link href="/auth/login" className="btn-outline-y2k">log in</Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="bg-[#FFD6EC] rounded-2xl border-2 border-[#FFB6D9] p-5 text-center">
        <div className="font-pixel text-2xl text-[#FF4FA3] mb-1">✦</div>
        <div className="font-pacifico text-xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>
          answer posted!
        </div>
        <p className="font-caveat text-[#888] mt-1" style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}>
          your answer is now on the board ✦
        </p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = answer.trim()
    if (!text) return
    setSubmitting(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('prompt_answers').insert({
      prompt_id: promptId,
      user_id: user!.id,
      answer_text: text,
      is_anonymous: anonymous,
    })
    setSubmitting(false)
    if (err) {
      if (err.code === '23505') {
        setError("you've already answered today's prompt")
      } else {
        setError('could not save your answer — please try again')
      }
      return
    }
    setSubmitted(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-5 shadow-sm">
      <div className="font-pixel text-xs text-[#3A0030] mb-3" style={{ fontSize: '10px' }}>
        YOUR ANSWER
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 mb-3 font-nunito text-sm">
          {error}
        </div>
      )}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="write your answer here..."
        className="input-y2k resize-none font-caveat w-full mb-3"
        rows={3}
        maxLength={500}
        style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}
        required
      />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <label className="flex items-center gap-2 font-pixel text-xs text-[#888] cursor-pointer" style={{ fontSize: '10px' }}>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="accent-[#FF4FA3] w-4 h-4"
          />
          post anonymously
        </label>
        <div className="flex items-center gap-3">
          <span className="font-nunito text-xs text-[#888]">{answer.length}/500</span>
          <button
            type="submit"
            disabled={submitting || !answer.trim()}
            className="btn-y2k disabled:opacity-50"
          >
            {submitting ? 'posting...' : 'share my answer ✦'}
          </button>
        </div>
      </div>
    </form>
  )
}
