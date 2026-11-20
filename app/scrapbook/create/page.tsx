'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import CoverSelector from '@/components/scrapbook/CoverSelector'
import TemplateSelector from '@/components/scrapbook/TemplateSelector'
import ScrapbookEditor from '@/components/scrapbook/ScrapbookEditor'
import AuthModal from '@/components/ui/AuthModal'
import { TEMPLATES, SCRAPBOOK_COVERS } from '@/lib/types'
import { generateId, slugify } from '@/lib/utils'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase-client'

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { num: 1, label: 'Cover' },
  { num: 2, label: 'Template' },
  { num: 3, label: 'Customize' },
  { num: 4, label: 'Publish' },
]

const DRAFT_KEY = 'scrappy_draft'

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
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const [draftBanner, setDraftBanner] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // Load draft from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    try {
      const d = JSON.parse(raw)
      if (d.coverId) setCoverId(d.coverId)
      if (d.templateId) setTemplateId(d.templateId)
      if (d.title) setTitle(d.title)
      if (d.answers) setAnswers(d.answers)
      if (d.stickers) setStickers(d.stickers)
      if (d.visibility) setVisibility(d.visibility)
      if (d.step) setStep(d.step)
      setDraftRestored(true)
      if (user) setDraftBanner(true)
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save draft to localStorage on changes
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ coverId, templateId, title, answers, stickers, visibility, step }))
  }, [coverId, templateId, title, answers, stickers, visibility, step])

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
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setSaving(true)
    const supabase = createClient()
    const slug = slugify(title || 'my-scrapbook') + '-' + Date.now().toString(36)

    const { data: scrapbook, error: sbError } = await supabase
      .from('scrapbooks')
      .insert({
        user_id: user.id,
        title: title || 'my scrapbook',
        slug,
        cover_id: coverId,
        is_public: visibility !== 'private',
      })
      .select('id')
      .single()

    if (sbError || !scrapbook) {
      setSaving(false)
      return
    }

    const { data: page } = await supabase
      .from('scrapbook_pages')
      .insert({ scrapbook_id: scrapbook.id })
      .select('id')
      .single()

    if (page && stickers.length > 0) {
      await supabase.from('scrapbook_elements').insert(
        stickers.map((s) => ({
          page_id: page.id,
          type: 'sticker',
          content: s.emoji,
          x: s.x,
          y: s.y,
        }))
      )
    }

    const validAnswers = answers.filter((a) => a.answer_text.trim())
    if (validAnswers.length > 0) {
      await supabase.from('answers').insert(
        validAnswers.map((a) => ({
          user_id: user.id,
          question_id: a.question_id,
          question_text: a.question_text,
          scrapbook_id: scrapbook.id,
          answer_text: a.answer_text,
          is_public: visibility !== 'private',
        }))
      )
    }

    localStorage.removeItem(DRAFT_KEY)
    router.push(`/scrapbook/${scrapbook.id}`)
  }

  function goNext() { if (step < 4) setStep((s) => (s + 1) as Step) }
  function goBack() { if (step > 1) setStep((s) => (s - 1) as Step) }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Draft restored banner */}
          {draftBanner && (
            <div className="bg-[#FFF0A8] border-2 border-[#FFD700] rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
              <div className="font-caveat text-base text-[#3A0030]" style={{ fontFamily: 'Caveat, cursive' }}>
                ✦ your draft was restored! pick up right where you left off.
              </div>
              <button
                onClick={() => setDraftBanner(false)}
                className="font-pixel text-xs text-[#888] hover:text-[#3A0030] ml-4"
                style={{ fontSize: '9px' }}
              >
                dismiss
              </button>
            </div>
          )}

          {/* Guest notice */}
          {!user && draftRestored && (
            <div className="bg-[#FFB6D9]/20 border-2 border-[#FFB6D9] rounded-xl px-4 py-3 mb-6 flex items-center justify-between flex-wrap gap-2">
              <div className="font-caveat text-base text-[#3A0030]" style={{ fontFamily: 'Caveat, cursive' }}>
                your draft is saved locally ✦ create an account to publish it
              </div>
            </div>
          )}

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
                  isGuest={!user}
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

      {showAuthModal && (
        <AuthModal reason="publish" onClose={() => setShowAuthModal(false)} />
      )}
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
  isGuest,
}: {
  visibility: string
  onVisibilityChange: (v: 'public' | 'private' | 'link') => void
  title: string
  coverId: string
  saving: boolean
  onPublish: () => void
  isGuest: boolean
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
          {isGuest ? 'create a free account to save and publish ✦' : 'choose how you want to share your scrapbook ✦'}
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

      {!isGuest && (
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
      )}
    </div>
  )
}
