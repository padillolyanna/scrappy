'use client'

import { motion } from 'framer-motion'
import { SCRAPBOOK_COVERS, type ScrapbookCover } from '@/lib/types'

interface Props {
  selected: string
  onSelect: (id: string) => void
}

export default function CoverSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2
          className="font-pacifico text-4xl text-[#3A0030] mb-2"
          style={{ fontFamily: 'Pacifico, cursive', fontSize: '36px' }}
        >
          pick your cover
        </h2>
        <p className="font-caveat text-xl text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
          choose the vibe for your scrapbook ✦
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SCRAPBOOK_COVERS.map((cover, i) => (
          <CoverCard
            key={cover.id}
            cover={cover}
            selected={selected === cover.id}
            onSelect={onSelect}
            delay={i * 0.05}
          />
        ))}
      </div>
    </div>
  )
}

function CoverCard({
  cover,
  selected,
  onSelect,
  delay,
}: {
  cover: ScrapbookCover
  selected: boolean
  onSelect: (id: string) => void
  delay: number
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(cover.id)}
      className={`relative text-left rounded-xl overflow-hidden transition-all duration-200 ${
        selected
          ? 'ring-4 ring-[#FF4FA3]/30 shadow-xl'
          : 'shadow hover:shadow-lg'
      }`}
      style={{ border: selected ? '3px solid #FF4FA3' : '2px solid transparent' }}
    >
      <div className={`h-32 bg-gradient-to-br ${cover.bg_gradient} flex items-center justify-center relative overflow-hidden`}>
        <div className="text-5xl font-pixel text-[#3A0030]/30">{cover.preview_symbol}</div>

        <div className="absolute top-2 right-2 text-xs opacity-60 space-y-0.5">
          {cover.stickers.slice(0, 3).map((s, i) => (
            <div key={i} style={{ fontSize: '12px' }} className="text-[#3A0030]/40">{s}</div>
          ))}
        </div>

        {selected && (
          <div className="absolute top-2 left-2 w-6 h-6 bg-[#FF4FA3] rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
            ✓
          </div>
        )}

        <div className="absolute bottom-2 left-2 text-white/60 animate-sparkle" style={{ fontSize: '12px' }}>
          ✦
        </div>
      </div>

      <div className="bg-white p-3">
        <div className="font-nunito font-black text-sm text-[#3A0030] leading-tight">
          {cover.name}
        </div>
        <div className="font-caveat text-xs text-[#888] mt-0.5" style={{ fontFamily: 'Caveat, cursive', fontSize: '12px' }}>
          {cover.description}
        </div>
      </div>
    </motion.button>
  )
}
