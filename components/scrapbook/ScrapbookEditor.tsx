'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TEMPLATES, SCRAPBOOK_COVERS } from '@/lib/types'
import { STICKER_CATEGORIES } from '@/lib/utils'

interface Answer {
  question_id: string
  question_text: string
  answer_text: string
}

interface Props {
  coverId: string
  templateId: string
  title: string
  onTitleChange: (t: string) => void
  answers: Answer[]
  onAnswerChange: (questionId: string, text: string) => void
  customQuestions: { id: string; text: string }[]
  onAddQuestion: () => void
  onRemoveQuestion: (id: string) => void
  onCustomQuestionChange: (id: string, text: string) => void
  stickers: { id: string; emoji: string; x: number; y: number }[]
  onAddSticker: (emoji: string) => void
  onRemoveSticker: (id: string) => void
}

const BG_TEXTURES = [
  { id: 'cream', label: 'Cream', style: 'bg-[#FFF8ED]' },
  { id: 'pink', label: 'Baby Pink', style: 'bg-[#FFE4F0]' },
  { id: 'lavender', label: 'Lavender', style: 'bg-[#EDE4FF]' },
  { id: 'blue', label: 'Baby Blue', style: 'bg-[#E4F4FF]' },
  { id: 'butter', label: 'Butter', style: 'bg-[#FFF8E0]' },
  { id: 'lined', label: 'Lined Paper', style: 'paper-texture' },
]

export default function ScrapbookEditor({
  coverId,
  templateId,
  title,
  onTitleChange,
  answers,
  onAnswerChange,
  customQuestions,
  onAddQuestion,
  onRemoveQuestion,
  onCustomQuestionChange,
  stickers,
  onAddSticker,
  onRemoveSticker,
}: Props) {
  const [activeTab, setActiveTab] = useState<'write' | 'decorate' | 'preview'>('write')
  const [bgTexture, setBgTexture] = useState('cream')
  const [stickerCategory, setStickerCategory] = useState<keyof typeof STICKER_CATEGORIES>('symbols')

  const cover = SCRAPBOOK_COVERS.find((c) => c.id === coverId)
  const template = TEMPLATES.find((t) => t.id === templateId)
  const bgStyle = BG_TEXTURES.find((b) => b.id === bgTexture)?.style ?? 'bg-[#FFF8ED]'

  return (
    <div>
      <div className="text-center mb-6">
        <h2
          className="font-pacifico text-4xl text-[#3A0030] mb-2"
          style={{ fontFamily: 'Pacifico, cursive', fontSize: '36px' }}
        >
          decorate your scrapbook
        </h2>
        <p className="font-caveat text-xl text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
          fill in your answers and add your personal touch ✦
        </p>
      </div>

      <div className="mb-6 max-w-md mx-auto">
        <label className="font-pixel text-xs text-[#3A0030] mb-1 block" style={{ fontSize: '10px' }}>
          SCRAPBOOK TITLE
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="my little life..."
          className="input-y2k font-caveat text-xl"
          style={{ fontFamily: 'Caveat, cursive', fontSize: '20px' }}
        />
      </div>

      <div className="flex gap-2 mb-6 max-w-lg mx-auto">
        {(['write', 'decorate', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 font-pixel py-2 rounded-full border-2 transition-all text-xs capitalize ${
              activeTab === tab
                ? 'bg-[#FF4FA3] border-[#FF4FA3] text-white shadow'
                : 'bg-white border-[#FFB6D9] text-[#3A0030] hover:border-[#FF4FA3]'
            }`}
            style={{ fontSize: '10px', letterSpacing: '0.08em' }}
          >
            {tab === 'write' ? 'WRITE' : tab === 'decorate' ? 'DECORATE' : 'PREVIEW'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'write' && (
          <motion.div
            key="write"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {template?.questions.map((q) => {
              const ans = answers.find((a) => a.question_id === q.id)
              return (
                <div key={q.id} className="bg-white rounded-xl border-2 border-[#FFB6D9]/50 p-5">
                  <label className="font-caveat text-xl text-[#3A0030] block mb-2" style={{ fontFamily: 'Caveat, cursive', fontSize: '20px' }}>
                    {q.question_text}
                  </label>
                  <textarea
                    value={ans?.answer_text ?? ''}
                    onChange={(e) => onAnswerChange(q.id, e.target.value)}
                    placeholder={q.placeholder ?? 'write your answer...'}
                    className="input-y2k resize-none font-caveat"
                    rows={2}
                    style={{ fontFamily: 'Caveat, cursive', fontSize: '16px' }}
                  />
                </div>
              )
            })}

            {customQuestions.map((cq) => (
              <div key={cq.id} className="bg-white rounded-xl border-2 border-dashed border-[#C9B6FF] p-5">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={cq.text}
                    onChange={(e) => onCustomQuestionChange(cq.id, e.target.value)}
                    placeholder="write your own question..."
                    className="input-y2k font-caveat flex-1"
                    style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}
                  />
                  <button
                    onClick={() => onRemoveQuestion(cq.id)}
                    className="text-[#888] hover:text-red-400 transition-colors px-2"
                  >
                    x
                  </button>
                </div>
                <textarea
                  placeholder="your answer..."
                  className="input-y2k resize-none font-caveat"
                  rows={2}
                  style={{ fontFamily: 'Caveat, cursive', fontSize: '16px' }}
                />
              </div>
            ))}

            <button
              onClick={onAddQuestion}
              className="w-full border-2 border-dashed border-[#FFB6D9] rounded-xl py-4 font-caveat text-[#888] hover:border-[#FF4FA3] hover:text-[#FF4FA3] transition-all"
              style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}
            >
              + add your own question
            </button>
          </motion.div>
        )}

        {activeTab === 'decorate' && (
          <motion.div
            key="decorate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-white rounded-xl border-2 border-[#FFB6D9]/50 p-5 mb-4">
              <div className="font-pixel text-xs text-[#3A0030] mb-3" style={{ fontSize: '10px' }}>PAGE BACKGROUND</div>
              <div className="flex gap-2 flex-wrap">
                {BG_TEXTURES.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setBgTexture(bg.id)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${bg.style} ${
                      bgTexture === bg.id ? 'border-[#FF4FA3] scale-110 shadow' : 'border-[#FFB6D9]'
                    }`}
                    title={bg.label}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-[#FFB6D9]/50 p-5 mb-4">
              <div className="font-pixel text-xs text-[#3A0030] mb-3" style={{ fontSize: '10px' }}>ADD SYMBOLS</div>
              <div className="flex gap-2 mb-3 flex-wrap">
                {(Object.keys(STICKER_CATEGORIES) as (keyof typeof STICKER_CATEGORIES)[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setStickerCategory(cat)}
                    className={`font-pixel text-xs px-3 py-1 rounded-full border capitalize transition-all ${
                      stickerCategory === cat
                        ? 'bg-[#FF4FA3] border-[#FF4FA3] text-white'
                        : 'bg-white border-[#FFB6D9] text-[#3A0030]'
                    }`}
                    style={{ fontSize: '9px' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                {STICKER_CATEGORIES[stickerCategory].map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => onAddSticker(symbol)}
                    className="sticker text-2xl hover:scale-125 transition-transform text-[#FF4FA3]"
                  >
                    {symbol}
                  </button>
                ))}
              </div>

              {stickers.length > 0 && (
                <div className="mt-4 border-t border-[#FFB6D9]/30 pt-3">
                  <div className="font-pixel text-xs text-[#888] mb-2" style={{ fontSize: '9px' }}>ADDED (click to remove)</div>
                  <div className="flex gap-2 flex-wrap">
                    {stickers.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onRemoveSticker(s.id)}
                        className="text-2xl hover:opacity-50 transition-opacity relative group text-[#FF4FA3]"
                      >
                        {s.emoji}
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ fontSize: '8px' }}>
                          x
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-sm mx-auto"
          >
            <div className={`${bgStyle} rounded-2xl p-6 border-2 border-[#FFB6D9]/50 shadow-xl min-h-[500px] relative overflow-hidden`}>
              {cover && (
                <div className={`bg-gradient-to-r ${cover.bg_gradient} -mx-6 -mt-6 mb-4 p-4 text-center`}>
                  <div className="text-4xl font-pixel text-[#3A0030]/30 mb-1">{cover.preview_symbol}</div>
                  <div
                    className="font-pacifico text-white text-xl"
                    style={{ fontFamily: 'Pacifico, cursive', textShadow: '1px 1px 4px rgba(0,0,0,0.3)' }}
                  >
                    {title || 'my scrapbook'}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {answers.filter((a) => a.answer_text).map((ans) => (
                  <div key={ans.question_id} className="bg-white/60 rounded-lg p-3">
                    <div className="font-pixel text-[8px] text-[#888] mb-1" style={{ fontSize: '8px' }}>
                      {ans.question_text}
                    </div>
                    <div
                      className="font-caveat text-[#3A0030] text-base"
                      style={{ fontFamily: 'Caveat, cursive', fontSize: '16px' }}
                    >
                      {ans.answer_text}
                    </div>
                  </div>
                ))}
                {answers.filter((a) => a.answer_text).length === 0 && (
                  <div className="text-center font-caveat text-[#888] py-8" style={{ fontFamily: 'Caveat, cursive' }}>
                    your answers will appear here ✦
                  </div>
                )}
              </div>

              {stickers.map((s) => (
                <div
                  key={s.id}
                  className="absolute text-2xl pointer-events-none text-[#FF4FA3]"
                  style={{ bottom: `${s.y}%`, right: `${s.x}%` }}
                >
                  {s.emoji}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
