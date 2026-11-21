import Link from 'next/link'
import MidnightCountdown from '@/components/ui/MidnightCountdown'

export interface TodayPrompt {
  id: string
  question_text: string
  date: string
  answer_count: number
}

export interface TodayConfession {
  id: string
  content: string
  category: string
}

export interface TodayExchangeStats {
  total: number
  today: number
}

interface Props {
  prompt?: TodayPrompt | null
  confessions?: TodayConfession[]
  exchangeStats?: TodayExchangeStats
}

const NOTE_COLORS = ['#FFF0A8', '#FFD6EC', '#D6EDFF']
const NOTE_ROTATIONS = ['-2deg', '1.5deg', '-1deg']
const TACK_COLORS = ['#FF4FA3', '#7C4DDB', '#FF6B00']

export default function TodayOnScrappy({ prompt, confessions = [], exchangeStats }: Props) {
  const hasConfessions = confessions.length > 0

  return (
    <section style={{ padding: '0 20px clamp(40px, 6vw, 64px)', maxWidth: 1120, margin: '0 auto' }}>
      <div className="text-center mb-6">
        <div className="font-pixel text-[#FF4FA3] tracking-widest" style={{ fontSize: '12px' }} aria-hidden="true">COMMUNITY</div>
        <h2 className="font-pacifico text-3xl sm:text-4xl text-[#3A0030] mt-1">
          today on scrappy <span aria-hidden="true">✦</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">

        {/* Daily Prompt card */}
        <div
          className="bg-white rounded-2xl border-2 border-[#2B0A2E] overflow-hidden"
          style={{ boxShadow: '3px 4px 0 rgba(43,10,46,.18)' }}
        >
          <h3 className="panel-header" style={{ margin: 0, borderRadius: 0 }}>today&apos;s prompt ✎</h3>
          {prompt ? (
            <div
              style={{
                background: '#FFF8ED',
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(100,160,220,0.2) 27px, rgba(100,160,220,0.2) 28px)',
                padding: '14px 16px 14px 20px',
              }}
            >
              <p
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 18,
                  color: '#3A0030',
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                <span style={{ background: 'rgba(255,200,0,0.4)', padding: '0 2px' }}>
                  &ldquo;{prompt.question_text}&rdquo;
                </span>
              </p>
              <div
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: 12,
                  color: '#aaa',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                NEXT IN: <MidnightCountdown />
              </div>
              <Link href="/prompts" className="btn-bevel" style={{ fontSize: 12, padding: '6px 14px' }}>
                Answer today&apos;s prompt →
              </Link>
            </div>
          ) : (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: '#888', marginBottom: 10 }}>
                New prompt every day at midnight <span aria-hidden="true">✦</span>
              </p>
              <Link href="/prompts" className="btn-bevel" style={{ fontSize: 12, padding: '6px 14px', display: 'inline-block' }}>
                See all prompts →
              </Link>
            </div>
          )}
        </div>

        {/* Scrapbook Exchange card */}
        <div
          className="bg-white rounded-2xl border-2 border-[#2B0A2E] overflow-hidden"
          style={{ boxShadow: '3px 4px 0 rgba(43,10,46,.18)' }}
        >
          <h3 className="panel-header" style={{ margin: 0, borderRadius: 0, background: 'linear-gradient(180deg, rgba(255,255,255,.35), #14B8A6 55%)' }}>
            <span aria-hidden="true">✉</span> scrapbook exchange
          </h3>
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 17, color: '#3A0030', lineHeight: 1.5, marginBottom: 10 }}>
              Pass notes with a stranger. Answer the same questions, reveal together, find your people.
            </p>
            {exchangeStats && exchangeStats.total > 0 && (
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: '#888', marginBottom: 10 }}>
                <span aria-hidden="true">✦</span> {exchangeStats.total.toLocaleString()} exchanges done
              </div>
            )}
            <Link href="/exchange" className="btn-bevel" style={{ fontSize: 12, padding: '6px 14px' }}>
              Start an exchange →
            </Link>
          </div>
        </div>

        {/* Confession wall card */}
        {hasConfessions ? (
          <div
            className="rounded-2xl border-2 border-[#2B0A2E] overflow-hidden"
            style={{
              background: '#C8945A',
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
              backgroundSize: '10px 10px',
              boxShadow: '3px 4px 0 rgba(43,10,46,.18)',
            }}
          >
            <h3 className="panel-header" style={{ margin: 0, borderRadius: 0 }}>
              <span aria-hidden="true">✦</span> confession wall
            </h3>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {confessions.slice(0, 3).map((c, i) => (
                <div
                  key={c.id}
                  style={{
                    background: NOTE_COLORS[i % NOTE_COLORS.length],
                    padding: '10px 10px 8px',
                    borderRadius: 2,
                    transform: `rotate(${NOTE_ROTATIONS[i % NOTE_ROTATIONS.length]})`,
                    boxShadow: '2px 2px 6px rgba(0,0,0,0.15)',
                    position: 'relative',
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: -6,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 11,
                      height: 11,
                      borderRadius: '50%',
                      background: `radial-gradient(circle at 35% 35%, #fff 0%, ${TACK_COLORS[i % TACK_COLORS.length]} 60%)`,
                      border: '1.5px solid #2B0A2E',
                      zIndex: 5,
                    }}
                  />
                  <p style={{ fontFamily: "'Caveat', cursive", fontSize: 13, color: '#3A0030', lineHeight: 1.4, marginTop: 4 }}>
                    {c.content.length > 80 ? c.content.slice(0, 80) + '...' : c.content}
                  </p>
                </div>
              ))}
              <Link
                href="/confessions"
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: 13,
                  color: '#2B0A2E',
                  textDecoration: 'underline',
                  background: 'rgba(255,255,255,0.6)',
                  padding: '2px 8px',
                  borderRadius: 20,
                  display: 'inline-block',
                  marginTop: 2,
                  alignSelf: 'flex-end',
                }}
              >
                READ ALL →
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="bg-white rounded-2xl border-2 border-[#2B0A2E] overflow-hidden"
            style={{ boxShadow: '3px 4px 0 rgba(43,10,46,.18)' }}
          >
            <h3
              className="panel-header"
              style={{ margin: 0, borderRadius: 0, background: 'linear-gradient(180deg, rgba(255,255,255,.35), #EC4899 55%)' }}
            >
              <span aria-hidden="true">✦</span> confession wall
            </h3>
            <div style={{ padding: 16, textAlign: 'center' }}>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: '#888', marginBottom: 10 }}>
                Say the thing you&apos;ve never said out loud, anonymously.
              </p>
              <Link href="/confessions" className="btn-bevel" style={{ fontSize: 12, padding: '6px 14px', display: 'inline-block' }}>
                Read confessions →
              </Link>
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
