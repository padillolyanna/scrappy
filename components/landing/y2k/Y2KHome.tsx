import Link from 'next/link'
import type { ReactNode } from 'react'
import { SCRAPBOOK_COVERS } from '@/lib/types'
import { BoothIllustration } from '@/components/landing/PhotoboothSection'
import type { FreshScrapbook } from '@/components/landing/FreshScrapbooks'
import CoverThumb from './CoverThumb'
import Y2KTabs from './Y2KTabs'
import Y2KHeader from './Y2KHeader'
import Y2KTv from './Y2KTv'
import { Gif, Px, Panel } from './Y2KPanel'
import PetWelcome from './PetWelcome'

/*
  Logged-out homepage, built like a 2005-2008 fan site: one bordered "site box",
  tiled GIF backgrounds, a tab bar, small windows with gradient title bars,
  88x31 badges and tiny GIF animations. All decorative images live in /public/y2k
  (about 30 KB total, palette-reduced GIFs). Content is the same as before.
*/

const FEATURES = [
  { title: 'Scrapbook', href: '/scrapbook/create', text: 'Spiral-notebook pages you decorate with photos, frames, gems, washi tape and handwritten notes. Fully editable.' },
  { title: 'Photobooth', href: '/photobooth', text: 'Snap 1–6 photos and decorate them like a purikura machine with patterns, rhinestones and stamps.' },
  { title: 'Your profile', href: '/my-space', text: 'A customizable profile page with glitter names, layouts, backgrounds and a Top 8.' },
  { title: 'Note exchange', href: '/exchange', text: "Pass notes like it's 2004: answer the same questions as a friend and reveal them together." },
]

const NEW_STUFF = [
  { text: '45 new stickers on the object shelf', href: '/scrapbook/create' },
  { text: 'pick your spiral colour', href: '/scrapbook/create' },
  { text: 'journal hangouts board', href: '/hangouts' },
]

const STEPS = ['pick a frame', 'snap 4 poses', 'decorate + save']

const TEMPLATES = [
  ...SCRAPBOOK_COVERS.map((c) => ({ id: c.id, name: c.name })),
  { id: 'blank', name: 'Blank cover' },
]

const FOOT_LINKS = [
  { label: 'Home', href: '/' }, { label: 'Scrapbook', href: '/scrapbook/create' }, { label: 'Explore', href: '/explore' },
  { label: 'Highlights', href: '/highlights' }, { label: 'Confessions', href: '/confessions' }, { label: 'Daily Prompt', href: '/prompts' },
  { label: 'Photobooth', href: '/photobooth' }, { label: 'Scrapbook Exchange', href: '/exchange' },
  { label: 'About Scrappy', href: '/about' }, { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms of Service', href: '/tos' },
]

/** Shared Y2K page frame for the homepage: header, tab bar, tiled body and footer. */
export function Y2KShell({ dateLabel, user, children }: { dateLabel: string; user?: { username: string } | null; children: ReactNode }) {
  return (
    <div className="y2kh" data-y2k-off>
      <div className="y2kh-box">
        <Y2KHeader user={user} dateLabel={dateLabel} />

        {/* ───────────── tab bar (replaces the site navbar here) ───────────── */}
        <Y2KTabs user={user} pathname="/" />

        <div className="y2kh-body">
          {children}
        </div>

        {/* ───────────── footer ───────────── */}
        <footer className="y2kh-foot">
          <div className="y2kh-dots" aria-hidden="true" />
          <nav aria-label="Footer" className="y2kh-foot-links">
            {FOOT_LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
          </nav>
          <p>Scrappy: your little corner of the internet ✦ © 2026 Scrappy. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

export default function Y2KHome({ dateLabel, fresh, hangoutBoard }: { dateLabel: string; fresh: FreshScrapbook[]; hangoutBoard: ReactNode }) {
  return (
    <Y2KShell dateLabel={dateLabel}>
          {/* ───────────── hero: TV + welcome window ───────────── */}
          <div className="y2kh-grid y2kh-grid--hero">
            <Y2KTv />

            <section className="y2kh-panel y2kh-welcome" aria-labelledby="y2kh-h1">
              <h2 className="y2kh-ttl y2kh-ttl--pink" aria-hidden="true">
                <span className="y2kh-ttl-text">welcome.exe</span>
                <span className="y2kh-winbtns"><i>_</i><i>□</i><i>×</i></span>
              </h2>
              <div className="y2kh-pad y2kh-welcome-in">
                <div className="y2kh-burst" aria-hidden="true">100%<br />free!</div>
                <p className="y2kh-kicker">YOUR CORNER OF THE INTERNET</p>
                <h1 id="y2kh-h1" className="y2kh-h1">Make scrapbook pages like it&apos;s 2004.</h1>
                <p className="y2kh-lead">Decorate spiral-notebook pages with photos, washi tape, gems and doodles. Free, and completely yours.</p>
                <div className="y2kh-ctas">
                  <Link href="/scrapbook/create" className="y2kh-btn y2kh-btn--pink y2kh-btn--big">Make my scrapbook →</Link>
                  <Link href="/explore" className="y2kh-btn y2kh-btn--chrome y2kh-btn--big">Explore</Link>
                </div>
              </div>
            </section>
          </div>

          {/* ───────────── pet welcome ───────────── */}
          <PetWelcome />

          {/* ───────────── sidebar + main ───────────── */}
          <div className="y2kh-grid y2kh-grid--cols">
            <aside className="y2kh-side">
              <Panel title="♥ things to do" id="y2kh-todo">
                <ul className="y2kh-list">
                  {FEATURES.map((f) => (
                    <li key={f.title}>
                      <Link href={f.href}><b>{f.title}</b></Link>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel title={<>what&apos;s new <Gif anim="new-blinkie.gif" still="new-still.gif" w={34} h={14} /></>} tone="lime" id="y2kh-new">
                <ul className="y2kh-list y2kh-list--star">
                  {NEW_STUFF.map((n) => (
                    <li key={n.text}><Link href={n.href}>{n.text}</Link></li>
                  ))}
                </ul>
              </Panel>

              <div className="y2kh-badges" aria-label="Web badges">
                <Px src="badge-scrappy.gif" w={88} h={31} alt="Scrappy, est. 2026" />
                <Px src="badge-made-with-love.gif" w={88} h={31} alt="made with love and glitter" />
                <Px src="badge-no-ads-pages.gif" w={88} h={31} alt="no ads in your pages" />
                <Px src="badge-any-screen.gif" w={88} h={31} alt="best viewed on any screen" />
              </div>
            </aside>

            <div className="y2kh-main">
              <Panel title="✦ pick a template" tone="lilac" id="y2kh-templates" winBtns>
                <div className="y2kh-pad">
                  <p className="y2kh-note">every cover is fully editable: stickers, photos, text and more</p>
                  <div className="y2kh-covers">
                    {TEMPLATES.map((t) => (
                      <Link key={t.id} href={`/scrapbook/create?template=${t.id}`} className="y2kh-cover">
                        <CoverThumb coverId={t.id} title={t.id === 'blank' ? 'my scrapbook' : t.name.toLowerCase()} scale={0.2} />
                        <span>{t.name}</span>
                      </Link>
                    ))}
                  </div>
                  <Link href="/scrapbook/create" className="y2kh-more">view all covers →</Link>
                </div>
              </Panel>

              <Panel title="photobooth.exe" tone="blue" id="y2kh-booth" winBtns>
                <div className="y2kh-pad y2kh-booth">
                  <div className="y2kh-booth-art" aria-hidden="true">
                    <div className="y2kh-booth-scale"><BoothIllustration /></div>
                  </div>
                  <div className="y2kh-booth-copy">
                    <h3 className="y2kh-h3">step inside the purikura machine</h3>
                    <p>Pick a frame, strike four poses, then decorate your strip with stamps and gems. Save it to your phone or stick it straight onto a scrapbook page.</p>
                    <ol className="y2kh-steps">
                      {STEPS.map((s, i) => (
                        <li key={s}><span>0{i + 1}</span>{s}</li>
                      ))}
                    </ol>
                    <Link href="/photobooth" className="y2kh-btn y2kh-btn--purple">Try the photobooth →</Link>
                  </div>
                </div>
              </Panel>

              {fresh.length > 0 && (
                <Panel title="fresh from the club" tone="orange" id="y2kh-fresh">
                  <div className="y2kh-pad">
                    <div className="y2kh-fresh">
                      {fresh.map((s) => (
                        <Link key={s.id} href={`/scrapbook/${s.id}`} className="y2kh-cover">
                          <CoverThumb coverId={s.cover_id} title={s.title || 'untitled'} scale={0.2} />
                          <span>{s.title || 'untitled'}</span>
                          {s.profiles?.username && <small>@{s.profiles.username}</small>}
                        </Link>
                      ))}
                    </div>
                    <Link href="/explore" className="y2kh-more">see everything on Explore →</Link>
                  </div>
                </Panel>
              )}
            </div>
          </div>

          {hangoutBoard && (
            <Panel title="✦ journal hangouts board" tone="pink" id="y2kh-hangouts">
              <div className="y2kh-pad">{hangoutBoard}</div>
            </Panel>
          )}

          {/* ───────────── join strip ───────────── */}
          <section className="y2kh-join" aria-labelledby="y2kh-join-h">
            <div className="y2kh-join-burst" aria-hidden="true">join<br />now!</div>
            <p className="y2kh-kicker">JOIN THE CLUB</p>
            <h2 id="y2kh-join-h" className="y2kh-h2">Claim your little corner.</h2>
            <p className="y2kh-lead">It&apos;s free, it&apos;s yours, and it&apos;s exactly as chaotic as you want it to be.</p>
            <div className="y2kh-ctas">
              <Link href="/scrapbook/create" className="y2kh-btn y2kh-btn--pink y2kh-btn--big">✦ Make my scrapbook</Link>
              <Link href="/explore" className="y2kh-btn y2kh-btn--chrome y2kh-btn--big">Explore Scrappy</Link>
            </div>
          </section>
    </Y2KShell>
  )
}
