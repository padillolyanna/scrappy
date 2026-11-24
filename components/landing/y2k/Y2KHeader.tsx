import Link from 'next/link'
import { Gif, Px } from './Y2KPanel'

/** Pink star header with the chunky logo, date line, INFO bubble and account buttons.
    Used on the homepage and (compact) as the site-wide top bar. */
export default function Y2KHeader({ user, dateLabel, hideAuth = false }: { user?: { username: string } | null; dateLabel: string; hideAuth?: boolean }) {
  return (
        <header className="y2kh-head">
          <Px src="star-40.gif" w={40} h={40} className="y2kh-deco" style={{ left: '46%', top: 8 }} />
          <Px src="star-24.gif" w={24} h={24} className="y2kh-deco" style={{ left: '58%', top: 52 }} />
          <Px src="star-yellow-24.gif" w={24} h={24} className="y2kh-deco" style={{ right: 18, bottom: 10 }} />

          <div className="y2kh-brand">
            <Link href="/" className="y2kh-logo" aria-label="Scrappy home">
              scrappy<span>.fun</span>
              <Gif anim="sparkle-anim.gif" still="sparkle-still.gif" w={16} h={16} className="y2kh-logo-spark" />
            </Link>
            <p className="y2kh-date">
              {user ? <>hi @{user.username} ✦ </> : null}{dateLabel ? <>Today is {dateLabel}</> : 'welcome'} ✦ <Link href="/prompts">answer today&apos;s prompt</Link>
            </p>
          </div>

          <div className={`y2kh-headright${user ? ' y2kh-headright--loggedin' : ''}`}>
            {!user && <Link href="/about" className="y2kh-bubble">click for <b>INFO</b><br />about Scrappy!</Link>}
            {hideAuth ? null : user ? (
              <div className="y2kh-auth">
                <Link href="/" className="y2kh-btn y2kh-btn--chrome">my space</Link>
                <Link href={`/profile/${user.username}`} className="y2kh-btn y2kh-btn--pink">my page ✦</Link>
              </div>
            ) : (
              <div className="y2kh-auth">
                <Link href="/auth/login" className="y2kh-btn y2kh-btn--chrome">log in</Link>
                <Link href="/auth/signup" className="y2kh-btn y2kh-btn--pink">join free ✦</Link>
              </div>
            )}
          </div>
        </header>

  )
}
