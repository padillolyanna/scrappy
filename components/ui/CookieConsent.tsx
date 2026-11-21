'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'scrappy_cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-xl"
    >
      <div
        className="bg-white rounded-2xl border-2 border-[#2B0A2E] p-4 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ boxShadow: '4px 5px 0 rgba(43,10,46,.25)' }}
      >
        <div className="flex-1 font-nunito text-sm text-[#3A0030] leading-relaxed">
          <span className="font-pixel text-[#FF4FA3] mr-1" style={{ fontSize: '11px' }}>COOKIES</span>{' '}
          We use cookies and Google AdSense to keep Scrappy free. By clicking{' '}
          <strong>Accept</strong> you agree to our use of cookies as described in our{' '}
          <Link href="/privacy" className="underline text-[#7C4DDB] hover:text-[#FF4FA3]">
            Privacy Policy
          </Link>
          .
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="font-pixel px-4 py-2 rounded-full border-2 border-[#2B0A2E] text-[#3A0030] hover:bg-[#f5f5f5] transition-colors"
            style={{ fontSize: '11px' }}
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="btn-y2k"
            style={{ fontSize: '11px', padding: '8px 16px' }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
