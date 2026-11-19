'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CoverSelector from '@/components/scrapbook/CoverSelector'
import TemplateSelector from '@/components/scrapbook/TemplateSelector'
import ScrapbookEditor from '@/components/scrapbook/ScrapbookEditor'
import { TEMPLATES, SCRAPBOOK_COVERS } from '@/lib/types'
import { generateId, slugify } from '@/lib/utils'

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { num: 1, label: 'Cover' },
  { num: 2, label: 'Template' },
  { num: 3, label: 'Customize' },
  { num: 4, label: 'Publish' },
]

export default function CreateScrapbookPage() {
  const [step, setStep] = useState<Step>(1)
  const [coverId, setCoverId] = useState('pink-princess')
  const [templateId, setTemplateId] = useState('about-me')
  const [title, setTitle] = useState('')
  const [answers, setAnswers] = useState<{ question_id: string; question_text: string; answer_text: string }[]>([])
  const [customQuestions, setCustomQuestions] = useState<{ id: string; text: string }[]>([])
  const [stickers, setStickers] = useState<{ id: string; emoji: string; x: number; y: number }[]>([])
  const [visibility, setVisibility] = useState<'public' | 'private' | 'link'>('public')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function handleAnswerChange(questionId: string, text: string) {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.question_id === questionId)
      if (existing) return prev.map((a) => a.question_id === questionId ? { ...a, answer_text: text } : a)
      const template = TEMPLATES.find((t) => t.id === templateId)
      const question = template?.questions.find((q) => q.id === questionId)
      return [...prev, { question_id: questionId, question_text: question?.question_text ?? '', answer_text: text }]
    })
  }

  function handleAddSticker(emoji: string) {
    setStickers((prev) => [
      ...prev,
      { id: generateId(), emoji, x: Math.random() * 60 + 5, y: Math.random() * 60 + 5 },
    ])
  }

  async function handlePublish() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1200))
    const slug = slugify(title || 'my-scrapbook') + '-' + Date.now().toString(36)
    router.push(`/scrapbook/${slug}?preview=true`)
  }

  function goNext() { if (step < 4) setStep((s) => (s + 1) as Step) }
  function goBack() { if (step > 1) setStep((s) => (s - 1) as Step) }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Stepper */}
          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <button
                  onClick={() => step > s.num && setStep(s.num as Step)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all font-pixel text-xs ${
                    step === s.num
                      ? 'bg-[#FF4FA3] border-[#FF4FA3] text-white shadow-lg'
                      : step > s.num
                      ? 'bg-[#FFB6D9]/30 border-[#FF4FA3] text-[#FF4FA3] cursor-pointer'
                      : 'bg-white border-[#FFB6D9] text-[#888] cursor-default'
                  }`}
                  style={{ fontSize: '10px' }}
                >
                  <span>{s.num}</span>
                  <span>{s.label}</span>
                  {step > s.num && <span>✓</span>}
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-6 h-0.5 ${step > s.num ? 'bg-[#FF4FA3]' : 'bg-[#FFB6D9]'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && <CoverSelector selected={coverId} onSelect={setCoverId} />}
              {step === 2 && <TemplateSelector selected={templateId} onSelect={setTemplateId} />}
              {step === 3 && (
                <ScrapbookEditor
                  coverId={coverId}
                  templateId={templateId}
                  title={title}
                  onTitleChange={setTitle}
                  answers={answers}
                  onAnswerChange={handleAnswerChange}
                  customQuestions={customQuestions}
                  onAddQuestion={() => setCustomQuestions((prev) => [...prev, { id: generateId('cq-'), text: '' }])}
                  onRemoveQuestion={(id) => setCustomQuestions((prev) => prev.filter((q) => q.id !== id))}
                  onCustomQuestionChange={(id, text) => setCustomQuestions((prev) => prev.map((q) => q.id === id ? { ...q, text } : q))}
                  stickers={stickers}
                  onAddSticker={handleAddSticker}
                  onRemoveSticker={(id) => setStickers((s) => s.filter((x) => x.id !== id))}
                />
              )}
              {step === 4 && (
                <PublishStep
                  visibility={visibility}
                  onVisibilityChange={setVisibility}
                  title={title}
                  coverId={coverId}
                  saving={saving}
                  onPublish={handlePublish}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            <button onClick={goBack} className={`btn-outline-y2k ${step === 1 ? 'opacity-30 cursor-not-allowed' : ''}`} disabled={step === 1}>
              back
            </button>
            {step < 4 ? (
              <button onClick={goNext} className="btn-y2k">next step</button>
            ) : (
              <button onClick={handlePublish} disabled={saving} className="btn-y2k px-8">
                {saving ? 'saving...' : visibility === 'private' ? 'save privately' : 'publish scrapbook'}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function PublishStep({
  visibility,
  onVisibilityChange,
  title,
  coverId,
  saving,
  onPublish,
}: {
  visibility: string
  onVisibilityChange: (v: 'public' | 'private' | 'link') => void
  title: string
  coverId: string
  saving: boolean
  onPublish: () => void
}) {
  const cover = SCRAPBOOK_COVERS.find((c) => c.id === coverId)

  const OPTIONS = [
    { id: 'public', symbol: '◆', label: 'Public', desc: 'Anyone can discover and view your scrapbook' },
    { id: 'link', symbol: '◎', label: 'Link Only', desc: 'Only people with the link can view it' },
    { id: 'private', symbol: '●', label: 'Private', desc: 'Only you can see this scrapbook' },
  ] as const

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-pacifico text-4xl text-[#3A0030] mb-2" style={{ fontFamily: 'Pacifico, cursive', fontSize: '36px' }}>
          almost there!
        </h2>
        <p className="font-caveat text-xl text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
          choose how you want to share your scrapbook ✦
        </p>
      </div>

      <div className="max-w-xs mx-auto mb-8">
        <div className="scrap-card overflow-hidden">
          <div className={`h-32 bg-gradient-to-br ${cover?.bg_gradient ?? 'from-pink-200 to-pink-100'} flex items-center justify-center`}>
            <span className="text-5xl font-pixel text-[#3A0030]/30">{cover?.preview_symbol}</span>
          </div>
          <div className="p-4 bg-white">
            <div className="font-caveat text-xl text-[#3A0030]" style={{ fontFamily: 'Caveat, cursive' }}>
              {title || 'my scrapbook'}
            </div>
            <div className="font-nunito text-xs text-[#888] mt-1">by you ✦</div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onVisibilityChange(opt.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
              visibility === opt.id
                ? 'border-[#FF4FA3] bg-[#FF4FA3]/5 shadow'
                : 'border-[#FFB6D9]/50 bg-white hover:border-[#FF4FA3]'
            }`}
          >
            <span className="text-2xl font-pixel text-[#FF4FA3]/60">{opt.symbol}</span>
            <div>
              <div className="font-nunito font-black text-[#3A0030] text-sm">{opt.label}</div>
              <div className="font-nunito text-xs text-[#888]">{opt.desc}</div>
            </div>
            {visibility === opt.id && <span className="ml-auto text-[#FF4FA3] font-bold">✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
