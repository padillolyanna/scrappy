'use client'

import { useState, useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import { assetThumb } from '@/lib/assetLibrary'
import DashboardScrapbooks, { type DashScrapbook } from '@/components/landing/DashboardScrapbooks'
import type { TodayPrompt } from '@/components/landing/TodayOnScrappy'
import type { NbPage } from '@/lib/notebook'
import CoverThumb from './CoverThumb'
import { Panel } from './Y2KPanel'
import { toggleProfileVisibility } from '@/app/actions/toggleProfileVisibility'
import PetAvatar from '@/components/pet/PetAvatar'
import { usePet } from '@/lib/pet/usePet'

/* Logged-in homepage content in the same lo-fi Y2K windows as the logged-out page. */

const SHORTCUTS = [
  { href: '/scrapbook/create', label: 'New scrapbook', icon: 'gem-star' },
  { href: '/photobooth', label: 'Photobooth', icon: 'y2k-camera' },
  { href: '/prompts', label: 'Daily prompt', icon: 'mat-paper' },
  { href: '/confessions', label: 'Confessions', icon: 'charm-padlock' },
  { href: '/exchange', label: 'Note exchange', icon: 'y2k-flip' },
  { href: '/hangouts', label: 'Hangouts', icon: 'mat-pushpin' },
  { href: '/pet', label: 'My Little Pet ♡', icon: 'y2k-pet' },
]

function PetPanel() {
  const { pet, loading } = usePet({ claim: 'session' })
  return (
    <Panel title="my little pet ♡" tone="pink" id="y2kd-pet">
      <div className="y2kh-pad y2kd-pet-wrap">
        {loading ? (
          <div className="y2kd-pet-loading">loading…</div>
        ) : (
          <PetAvatar equipped={pet?.equipped ?? {}} size={110} mood="idle" />
        )}
        <div className="y2kd-pet-info">
          <p className="y2kh-small" style={{ marginBottom: 8 }}>your scrappy companion ✦</p>
          <Link href="/pet" className="y2kh-btn y2kh-btn--pink">dress up →</Link>
        </div>
      </div>
    </Panel>
  )
}

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button type="button" className="y2kh-btn y2kh-btn--chrome" onClick={async () => {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }}>
      {copied ? '✓ copied!' : 'copy link'}
    </button>
  )
}

export default function Y2KDashboard({ user, prompt, latestScrapbook, scrapbooks, firstPages, isPublic: initialIsPublic = true, announcementsSlot }: {
  user: { username: string; id: string }
  prompt?: TodayPrompt | null
  latestScrapbook?: { id: string; title: string; cover_id: string } | null
  scrapbooks: DashScrapbook[]
  firstPages?: Record<string, NbPage>
  isPublic?: boolean
  announcementsSlot?: ReactNode
}) {
  const profileUrl = `https://scrappy.fun/profile/${user.username}`
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [visibilityPending, startVisibilityTransition] = useTransition()

  const handleToggleVisibility = () => {
    const next = !isPublic
    setIsPublic(next)
    startVisibilityTransition(async () => {
      const result = await toggleProfileVisibility(next)
      if (result.error) setIsPublic(!next)
    })
  }

  return (
    <>
      <div className="y2kh-grid y2kh-grid--hero">
        <Panel title="my_page.exe" tone="pink" id="y2kd-page" winBtns>
          <div className="y2kd-addr">
            <span className="y2kd-addr-label">Address</span>
            <span className="y2kd-addr-url">scrappy.fun/profile/{user.username}</span>
            <button
              onClick={handleToggleVisibility}
              disabled={visibilityPending}
              className={`y2kd-public y2kd-public--btn${isPublic ? '' : ' y2kd-public--private'}`}
              title={isPublic ? 'Click to make profile private' : 'Click to make profile public'}
            >
              {isPublic ? 'PUBLIC' : 'PRIVATE'}
            </button>
          </div>
          <div className="y2kh-pad y2kd-me">
            <div className="y2kd-avatar" aria-hidden="true">{user.username[0]?.toUpperCase()}</div>
            <div>
              <p className="y2kd-handle">@{user.username}</p>
              <p className="y2kh-small" style={{ marginTop: 2 }}>your profile page ✦ what visitors see</p>
            </div>
          </div>
          <div className="y2kh-pad y2kh-ctas" style={{ paddingTop: 0 }}>
            <Link href={`/profile/${user.username}`} target="_blank" className="y2kh-btn y2kh-btn--pink">open my page</Link>
            <Link href={`/profile/${user.username}/edit`} className="y2kh-btn y2kh-btn--purple">customize</Link>
            <CopyLink url={profileUrl} />
          </div>
        </Panel>

        <Panel title="pick up where you left off" tone="lilac" id="y2kd-latest">
          {latestScrapbook ? (
            <div className="y2kh-pad y2kd-latest">
              <Link href={`/scrapbook/${latestScrapbook.id}/edit`} className="y2kh-cover" aria-label={`Edit ${latestScrapbook.title || 'untitled'}`}>
                <CoverThumb coverId={latestScrapbook.cover_id} title={latestScrapbook.title || 'my scrapbook'} scale={0.24} />
              </Link>
              <div>
                <p className="y2kd-title">{latestScrapbook.title || 'untitled'}</p>
                <Link href={`/scrapbook/${latestScrapbook.id}/edit`} className="y2kh-btn y2kh-btn--pink">keep decorating →</Link>
              </div>
            </div>
          ) : (
            <div className="y2kh-pad" style={{ textAlign: 'center' }}>
              <p className="y2kh-lead" style={{ margin: '0 auto 12px' }}>No scrapbooks yet.</p>
              <Link href="/scrapbook/create" className="y2kh-btn y2kh-btn--pink">start your first →</Link>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="shortcuts" tone="blue" id="y2kd-shortcuts">
        <nav className="y2kd-icons" aria-label="Shortcuts">
          {SHORTCUTS.map((s) => (
            <Link key={s.href} href={s.href} className="y2kd-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assetThumb(s.icon)} alt="" width={52} height={52} />
              <span>{s.label}</span>
            </Link>
          ))}
        </nav>
      </Panel>

      <PetPanel />

      {prompt && (
        <Panel title="♥ Scrappy asks:" tone="lime" id="y2kd-prompt">
          <div className="y2kh-pad y2kd-prompt">
            <p>{prompt.question_text}</p>
            <Link href="/prompts" className="y2kh-btn y2kh-btn--purple">answer it →</Link>
          </div>
        </Panel>
      )}

      {announcementsSlot && (
        <Panel title="✦ journal hangouts board" tone="pink" id="y2kd-hangouts">
          <div className="y2kh-pad">{announcementsSlot}</div>
        </Panel>
      )}

      <Panel title={`my scrapbooks (${scrapbooks.length})`} tone="orange" id="y2kd-books" winBtns>
        <div className="y2kh-pad">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <Link href="/scrapbook/create" className="y2kh-btn y2kh-btn--pink">+ new scrapbook</Link>
          </div>
          <DashboardScrapbooks scrapbooks={scrapbooks} firstPages={firstPages} />
        </div>
      </Panel>
    </>
  )
}
