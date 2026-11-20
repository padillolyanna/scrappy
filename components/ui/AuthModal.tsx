'use client'

import Link from 'next/link'

export type AuthModalReason = 'save' | 'publish' | 'confession' | 'vote' | 'favorite'

const COPY: Record<AuthModalReason, { title: string; body: string; cta: string }> = {
  save: {
    title: 'save your scrapbook',
    body: "your draft is waiting! create a free account to save it and come back whenever.",
    cta: 'save my scrapbook',
  },
  publish: {
    title: 'share with the world',
    body: "you're almost ready! join scrappy to publish your page and share it with the community.",
    cta: 'join & publish',
  },
  confession: {
    title: 'post your confession',
    body: "anonymous confessions are for members only. don't worry — your username stays hidden.",
    cta: 'join to confess',
  },
  vote: {
    title: 'join the conversation',
    body: 'react and vote on confessions when you become a scrappy member.',
    cta: 'join to vote',
  },
  favorite: {
    title: 'save your favorites',
    body: 'love a scrapbook? join scrappy to heart and save pages you love.',
    cta: 'join to save',
  },
}

interface Props {
  reason: AuthModalReason
  onClose: () => void
}

export default function AuthModal({ reason, onClose }: Props) {
  const copy = COPY[reason]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#3A0030]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm animate-bounce-in">
        <div className="window-chrome overflow-hidden rounded-lg shadow-2xl">
          <div className="window-title-bar">
            <span>scrappy.exe — join the fun</span>
            <div className="flex gap-1">
              <span className="window-btn">_</span>
              <span className="window-btn">□</span>
              <button className="window-btn" onClick={onClose}>x</button>
            </div>
          </div>

          <div className="bg-white p-6">
            <div className="text-center mb-5">
              <div className="font-pixel text-3xl text-[#FF4FA3] mb-3">✦</div>
              <h3 className="font-pacifico text-2xl text-[#3A0030] mb-2" style={{ fontFamily: 'Pacifico, cursive' }}>
                {copy.title}
              </h3>
              <p className="font-caveat text-lg text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
                {copy.body}
              </p>
            </div>

            <div className="space-y-2">
              <Link href="/auth/signup" className="btn-y2k w-full text-center block py-2.5">
                {copy.cta} ✦
              </Link>
              <Link href="/auth/login" className="btn-outline-y2k w-full text-center block py-2.5">
                already a member? log in
              </Link>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={onClose}
                className="font-nunito text-xs text-[#888] hover:text-[#FF4FA3] transition-colors"
              >
                not now, just browsing
              </button>
            </div>

            <div className="mt-4 text-center font-pixel text-xs text-[#ddd]" style={{ fontSize: '12px' }}>
              ✦ ★ ♡ ✿ ♪ ◆
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
