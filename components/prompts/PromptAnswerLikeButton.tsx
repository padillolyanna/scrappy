'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

interface Props {
  answerId: string
  initialCount: number
  initialLiked: boolean
  loggedIn: boolean
}

export default function PromptAnswerLikeButton({ answerId, initialCount, initialLiked, loggedIn }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!loggedIn || loading) return
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.rpc('toggle_prompt_answer_like', { p_answer_id: answerId })
    if (data) {
      setLiked(data.liked)
      setCount(data.like_count)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading || !loggedIn}
      title={loggedIn ? (liked ? 'unlike' : 'like') : 'log in to like'}
      className={`font-nunito text-xs flex items-center gap-1 transition-colors ${
        liked ? 'text-[#FF4FA3]' : 'text-[#bbb] hover:text-[#FF4FA3]'
      } disabled:cursor-default`}
    >
      {liked ? '♥' : '♡'} {count}
    </button>
  )
}
