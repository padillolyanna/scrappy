import Link from 'next/link'
import TodayOnScrappy, { type TodayPrompt, type TodayConfession, type TodayExchangeStats } from './TodayOnScrappy'

interface Props {
  user: { username: string }
  prompt?: TodayPrompt | null
  confessions?: TodayConfession[]
  exchangeStats?: TodayExchangeStats
  latestScrapbook?: { id: string; title: string } | null
}

export default function HomeDashboard({ user, prompt, confessions, exchangeStats, latestScrapbook }: Props) {
  const scrapbookLabel = latestScrapbook
    ? latestScrapbook.title.length > 24
      ? latestScrapbook.title.slice(0, 24) + '…'
      : latestScrapbook.title
    : null

  return (
    <div>
      {/* Welcome bar */}
      <div style={{ padding: 'clamp(24px, 4vw, 36px) 20px 0', maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ fontFamily: "'Chango', 'Arial Black', sans-serif", fontSize: 14, color: '#FF4FA3', letterSpacing: '0.04em', marginBottom: 6 }}>
          welcome back <span aria-hidden="true">✦</span>
        </div>
        <h1
          style={{
            fontFamily: "'Chango', 'Arial Black', sans-serif",
            fontSize: 'clamp(26px, 4vw, 38px)',
            color: '#3A0030',
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          @{user.username}
        </h1>

        {/* Quick links */}
        <div className="flex gap-3 flex-wrap mb-10">
          {scrapbookLabel ? (
            <Link href={`/scrapbook/${latestScrapbook!.id}/edit`} className="btn-bevel" style={{ fontSize: 13, padding: '8px 20px' }}>
              Continue: {scrapbookLabel} →
            </Link>
          ) : (
            <Link href="/scrapbook/create" className="btn-bevel" style={{ fontSize: 13, padding: '8px 20px' }}>
              <span aria-hidden="true">✦</span> Start a scrapbook →
            </Link>
          )}
          <Link href="/my-space" className="btn-outline-y2k" style={{ fontSize: 13, padding: '8px 20px' }}>
            My Space
          </Link>
          <Link href="/exchange" className="btn-outline-y2k" style={{ fontSize: 13, padding: '8px 20px' }}>
            Exchanges
          </Link>
          <Link href="/prompts" className="btn-outline-y2k" style={{ fontSize: 13, padding: '8px 20px' }}>
            Daily Prompt
          </Link>
        </div>
      </div>

      {/* Community feed */}
      <TodayOnScrappy
        prompt={prompt}
        confessions={confessions}
        exchangeStats={exchangeStats}
      />
    </div>
  )
}
