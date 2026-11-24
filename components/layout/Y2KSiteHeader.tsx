'use client'

import { useSyncExternalStore } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useProfile } from '@/lib/useProfile'
import TopMarquee from '@/components/landing/TopMarquee'
import Y2KHeader from '@/components/landing/y2k/Y2KHeader'
import Y2KTabs from '@/components/landing/y2k/Y2KTabs'

const noop = () => () => {}
const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric' })
let cached = ''
const today = () => (cached ||= fmt.format(new Date()))

/** Site-wide top bar in the homepage's Y2K style (pink star header + purple tab bar). */
export default function Y2KSiteHeader({ pathname = '' }: { pathname?: string }) {
  const { user, loading } = useAuth()
  const { profile } = useProfile()
  const dateLabel = useSyncExternalStore(noop, today, () => '')
  const member = user && profile?.username ? { username: profile.username } : null
  return (
    <div className="y2kh y2kh--site">
      <div className="y2kh-box">
        <TopMarquee />
        <Y2KHeader user={member} dateLabel={dateLabel} hideAuth={loading || (!!user && !member)} />
        <Y2KTabs user={member} pathname={pathname} />
      </div>
    </div>
  )
}
