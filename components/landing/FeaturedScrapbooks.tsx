'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SCRAPBOOK_COVERS } from '@/lib/types'

export interface LiveScrapbook {
  id: string
  title: string
  cover_id: string
  like_count: number
  view_count: number
  profiles: { username: string } | null
}

const ROTATIONS = ['-2deg', '1deg', '-1deg']

function LiveCard({ sb, i }: { sb: LiveScrapbook; i: number }) {
  const cover = SCRAPBOOK_COVERS.find((c) => c.id === sb.cover_id)
  const username = sb.profiles?.username ?? 'scrappy user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      whileHover={{ scale: 1.03, rotate: 0 }}
      className="scrap-card overflow-hidden cursor-pointer"
      style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]})` }}
    >
      <div className={`h-52 w-full bg-gradient-to-br ${cover?.bg_gradient ?? 'from-pink-200 to-pink-100'} relative overflow-hidden flex items-center justify-center`}>
        <span className="font-pixel text-7xl text-[#3A0030]/20">{cover?.preview_symbol ?? '✦'}</span>
        <div
          className="absolute top-0 left-1/2 bg-yellow-100/70 px-5 py-0.5 border border-yellow-200/60"
          style={{ transform: 'translateX(-50%) rotate(-1deg)', fontFamily: 'Caveat, cursive', fontSize: '9px', color: '#8B6914' }}
        >
          ✦
        </div>
      </div>
      <div className="p-4">
        <div className="font-caveat text-xl text-[#3A0030] leading-tight mb-1" style={{ fontFamily: 'Caveat, cursive' }}>
          {sb.title || 'untitled scrapbook'}
        </div>
        <div className="font-nunito text-xs text-[#888]">
          by <span className="text-[#FF4FA3] font-bold">@{username}</span>
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className="font-nunito text-xs text-[#888]">♡ {sb.like_count || 0}</span>
          <span className="font-nunito text-xs text-[#888]">◎ {sb.view_count || 0} views</span>
        </div>
      </div>
    </motion.div>
  )
}

interface Props {
  scrapbooks?: LiveScrapbook[]
}

export default function FeaturedScrapbooks({ scrapbooks }: Props) {
  const hasLive = scrapbooks && scrapbooks.length > 0

  return (
    <section className="py-16 lg:py-20 bg-[#FFF0F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="font-pixel text-[#FF4FA3] tracking-widest mb-1" style={{ fontSize: '11px' }}>
              {hasLive ? 'COMMUNITY PICKS' : 'FEATURED'}
            </div>
            <h2 className="font-pacifico text-4xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>
              {hasLive ? 'Latest Scrapbooks' : 'Featured Scrapbooks'}
            </h2>
          </div>
          <Link href="/explore" className="font-pixel text-[#FF4FA3] hover:underline" style={{ fontSize: '11px' }}>
            VIEW ALL →
          </Link>
        </div>

        {hasLive ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scrapbooks.slice(0, 3).map((sb, i) => (
              <Link key={sb.id} href={`/scrapbook/${sb.id}`}>
                <LiveCard sb={sb} i={i} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="font-caveat text-xl text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
              be the first to create a scrapbook! ✦
            </div>
            <Link href="/scrapbook/create" className="btn-y2k mt-4 inline-block">
              create yours now
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
