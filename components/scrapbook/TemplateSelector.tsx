'use client'

import { motion } from 'framer-motion'
import { TEMPLATES, type Template } from '@/lib/types'

interface Props {
  selected: string
  onSelect: (id: string) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  personal: 'bg-[#FFB6D9]/30 text-[#D4006E] border-[#FFB6D9]',
  nostalgia: 'bg-[#FFF0A8]/50 text-[#8B6914] border-[#FFD700]',
  social: 'bg-[#C9B6FF]/30 text-[#7C4DDB] border-[#C9B6FF]',
  thoughts: 'bg-[#A8DFFF]/30 text-[#1A6B8A] border-[#A8DFFF]',
}

export default function TemplateSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2
          className="font-pacifico text-4xl text-[#3A0030] mb-2"
          style={{ fontFamily: 'Pacifico, cursive', fontSize: '36px' }}
        >
          choose a template
        </h2>
        <p className="font-caveat text-xl text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
          pick a set of questions to answer, or start from scratch ✦
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((template, i) => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={selected === template.id}
            onSelect={onSelect}
            delay={i * 0.08}
          />
        ))}

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: TEMPLATES.length * 0.08, duration: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => onSelect('custom')}
          aria-pressed={selected === 'custom'}
          className={`text-left rounded-xl border-2 p-5 transition-all duration-200 border-dashed ${
            selected === 'custom'
              ? 'border-[#FF4FA3] bg-[#FF4FA3]/5 shadow-lg'
              : 'border-[#FFB6D9] hover:border-[#FF4FA3] bg-white'
          }`}
        >
          <div className="text-4xl font-pixel text-[#FFB6D9] mb-3">✏</div>
          <div className="font-nunito font-black text-[#3A0030] mb-1">START FROM SCRATCH</div>
          <div className="font-caveat text-sm text-[#888]" style={{ fontFamily: 'Caveat, cursive', fontSize: '14px' }}>
            write your own questions and answers your way
          </div>
          {selected === 'custom' && (
            <div className="mt-2 inline-block bg-[#FF4FA3] text-white font-pixel text-xs px-2 py-0.5 rounded-full" style={{ fontSize: '12px' }}>
              ✓ SELECTED
            </div>
          )}
        </motion.button>
      </div>
    </div>
  )
}

function TemplateCard({
  template,
  selected,
  onSelect,
  delay,
}: {
  template: Template
  selected: boolean
  onSelect: (id: string) => void
  delay: number
}) {
  const colorClass = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.personal

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(template.id)}
      aria-pressed={selected}
      className={`text-left rounded-xl border-2 p-5 transition-all duration-200 ${
        selected
          ? 'border-[#FF4FA3] bg-white shadow-xl ring-4 ring-[#FF4FA3]/20'
          : 'border-[#FFB6D9]/50 bg-white hover:border-[#FF4FA3] hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-4xl font-pixel text-[#3A0030]/30">{template.symbol}</div>
        <span className={`font-pixel text-[12px] px-2 py-0.5 rounded-full border ${colorClass}`} style={{ fontSize: '12px' }}>
          {template.category}
        </span>
      </div>

      <div className="font-pixel text-xs text-[#3A0030] mb-1" style={{ fontSize: '12px', letterSpacing: '0.05em' }}>
        {template.name}
      </div>
      <div className="font-caveat text-base text-[#888] mb-3" style={{ fontFamily: 'Caveat, cursive', fontSize: '15px' }}>
        {template.description}
      </div>

      <div className="space-y-1">
        {template.questions.slice(0, 3).map((q) => (
          <div key={q.id} className="flex items-center gap-1.5">
            <span className="text-[#FFB6D9] text-xs">♡</span>
            <span className="font-nunito text-xs text-[#666]">{q.question_text}</span>
          </div>
        ))}
        {template.questions.length > 3 && (
          <div className="font-nunito text-xs text-[#888] pl-4">
            + {template.questions.length - 3} more questions
          </div>
        )}
      </div>

      {selected && (
        <div className="mt-3 inline-block bg-[#FF4FA3] text-white font-pixel text-xs px-2 py-0.5 rounded-full" style={{ fontSize: '12px' }}>
          ✓ SELECTED
        </div>
      )}
    </motion.button>
  )
}
