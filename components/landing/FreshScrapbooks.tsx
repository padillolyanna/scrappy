'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { starterCover, PAGE_W, PAGE_H, type NbPage } from '@/lib/notebook'
import { StaticCover } from '@/components/notebook/Spread'

export interface FreshScrapbook {
  id: string
  title: string
  cover_id: string
  profiles: { username: string } | null
}

const SCALE = 0.3
const W = Math.round(PAGE_W * SCALE)
const H = Math.round(PAGE_H * SCALE)

function CoverThumb({ sb }: { sb: FreshScrapbook }) {
  const [cover, setCover] = useState<NbPage | null>(null)
  useEffect(() => { setCover(starterCover(sb.cover_id, sb.title || 'my scrapbook')) }, [sb])

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: `${(H / W) * 100}%`, overflow: 'hidden', borderBottom: '2.5px solid var(--ink)' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#f3e3ee' }}>
        <div
          className="pointer-events-none absolute left-0 top-0 origin-top-left"
          style={{ transform: `scale(${SCALE})`, width: PAGE_W, height: PAGE_H }}
        >
          {cover ? <StaticCover page={cover} /> : null}
        </div>
      </div>
    </div>
  )
}

export default function FreshScrapbooks({ scrapbooks }: { scrapbooks: FreshScrapbook[] }) {
  if (!scrapbooks.length) return null

  return (
    <section style={{ padding: '80px 24px', background: 'var(--ground)' }}>
      <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <h2 className="font-pacifico" style={{ fontSize: 'clamp(34px, 4.4vw, 56px)', color: 'var(--ink)', lineHeight: 1.1 }}>
            fresh from the club
          </h2>
          <Link href="/explore" className="font-silkscreen" style={{ fontSize: 15, color: 'var(--pink-text)', textDecoration: 'none', flexShrink: 0 }}>
            See everything on Explore →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
          {scrapbooks.map((sb) => (
            <Link
              key={sb.id}
              href={`/scrapbook/${sb.id}`}
              style={{
                display: 'block',
                textDecoration: 'none',
                background: 'white',
                border: '2.5px solid var(--ink)',
                borderRadius: 16,
                boxShadow: '4px 6px 0 var(--ink)',
                overflow: 'hidden',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => { const t = e.currentTarget as HTMLElement; t.style.transform = 'translateY(-4px)'; t.style.boxShadow = '4px 10px 0 var(--ink)' }}
              onMouseLeave={(e) => { const t = e.currentTarget as HTMLElement; t.style.transform = ''; t.style.boxShadow = '4px 6px 0 var(--ink)' }}
            >
              <CoverThumb sb={sb} />
              <div style={{ padding: '12px 14px' }}>
                <div className="font-nunito font-extrabold truncate" style={{ fontSize: 15, color: 'var(--ink)', marginBottom: 2 }}>
                  {sb.title || 'untitled'}
                </div>
                <div className="font-nunito font-bold" style={{ fontSize: 14, color: 'var(--pink-text)' }}>
                  @{sb.profiles?.username ?? 'anonymous'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
