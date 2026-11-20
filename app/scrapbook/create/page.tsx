'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import CoverSelector from '@/components/scrapbook/CoverSelector'
import TemplateSelector from '@/components/scrapbook/TemplateSelector'
import NotebookEditor from '@/components/notebook/NotebookEditor'
import StaticSpread from '@/components/notebook/Spread'
import AuthModal from '@/components/ui/AuthModal'
import { slugify } from '@/lib/utils'
import { PAGE_H, SPREAD_W, starterPages, type NbPage } from '@/lib/notebook'
import { savePages, syncAnswers, uploadDataUrl } from '@/lib/notebookStore'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase-client'

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { num: 1, label: 'Cover' },
  { num: 2, label: 'Template' },
  { num: 3, label: 'Decorate' },
  { num: 4, label: 'Publish' },
]

const DRAFT_KEY = 'scrappy_draft_v2'

export default function CreateScrapbookPage() {
  const [step, setStep] = useState<Step>(1)
  const [coverId, setCoverId] = useState('pink-princess')
  const [templateId, setTemplateId] = useState('about-me')
  const [title, setTitle] = useState('')
  const [pages, setPages] = useState<NbPage[]>([])
  const [seededFor, setSeededFor] = useState('')
  const [draftWarning, setDraftWarning] = useState(false)
  const [error, setError] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private' | 'link'>('public')
  const [saving, setSaving] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const [draftBanner, setDraftBanner] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // Load draft from localStorage on mount
  useEffect(() => {
    let raw: string | null = null
    try { raw = localStorage.getItem(DRAFT_KEY) } catch {}
    if (!raw) return
    try {
      const d = JSON.parse(raw)
      if (d.coverId) setCoverId(d.coverId)
      if (d.templateId) setTemplateId(d.templateId)
      if (d.title) setTitle(d.title)
      if (Array.isArray(d.pages)) setPages(d.pages)
      if (d.seededFor) setSeededFor(d.seededFor)
      if (d.visibility) setVisibility(d.visibility)
      if (d.step) setStep(d.step)
      setDraftRestored(true)
      if (user) setDraftBanner(true)
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save draft to localStorage on changes
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ coverId, templateId, title, pages, seededFor, visibility, step }))
        setDraftWarning(false)
      } catch {
        // usually quota: lots of un-uploaded photos held as data URLs
        setDraftWarning(true)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [coverId, templateId, title, pages, seededFor, visibility, step])

  const layoutKey = `${coverId}|${templateId}`

  // Lay out a starter spread the first time the editor opens
  function seedIfEmpty() {
    if (pages.length === 0) {
      setPages(starterPages(coverId, templateId, title))
      setSeededFor(layoutKey)
    }
  }

  const uploadImage = useCallback(
    (dataUrl: string) => {
      if (!user) return Promise.reject(new Error('guest'))
      return uploadDataUrl(createClient(), user.id, dataUrl)
    },
    [user],
  )

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
      setError("couldn't publish right now — your draft is still saved here. try again in a sec ✦")
      return
    }

    try {
      const saved = await savePages(supabase, scrapbook.id, user.id, pages)
      await syncAnswers(supabase, scrapbook.id, user.id, saved, visibility !== 'private')
    } catch {
      setSaving(false)
      setError('your scrapbook was created but the pages could not be saved — try again from the edit page.')
      router.push(`/scrapbook/${scrapbook.id}/edit`)
      return
    }

    try { localStorage.removeItem(DRAFT_KEY) } catch {}
    router.push(`/scrapbook/${scrapbook.id}`)
  }

  function goNext() {
    if (step >= 4) return
    if (step + 1 === 3) seedIfEmpty()
    setStep((s) => (s + 1) as Step)
  }
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
                style={{ fontSize: '12px' }}
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
                  style={{ fontSize: '12px' }}
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
                <div>
                  {seededFor && seededFor !== layoutKey && pages.length > 0 && (
                    <div className="bg-[#E4F4FF] border-2 border-[#2B0A2E] rounded-xl px-4 py-2 mb-3 flex items-center justify-between gap-3 flex-wrap">
                      <span className="font-pixel text-lg text-[#2B0A2E]">you changed the cover or template — want a fresh starter layout?</span>
                      <div className="flex gap-2">
                        <button
                          className="btn-bevel text-xs !px-3 !py-1"
                          onClick={() => {
                            if (window.confirm('Replace your pages with the new starter layout?')) {
                              setPages(starterPages(coverId, templateId, title))
                              setSeededFor(layoutKey)
                            }
                          }}
                        >
                          use new layout
                        </button>
                        <button className="btn-outline-y2k text-xs !px-3 !py-1" onClick={() => setSeededFor(layoutKey)}>keep mine</button>
                      </div>
                    </div>
                  )}
                  {draftWarning && (
                    <div className="font-pixel text-lg text-[#D4006E] mb-2">
                      ⚠ your draft is too big to autosave in this browser (lots of photos!) — {user ? 'publish or save soon' : 'log in so photos upload'} ✦
                    </div>
                  )}
                  {pages.length === 0 && (
                    <div className="text-center py-10">
                      <button className="btn-bevel" onClick={seedIfEmpty}>✦ open my notebook</button>
                    </div>
                  )}
                  {pages.length > 0 && (
                    <NotebookEditor
                      pages={pages}
                      onChange={setPages}
                      title={title}
                      onTitleChange={setTitle}
                      templateId={templateId}
                      uploadImage={user ? uploadImage : undefined}
                      actions={<button onClick={goNext} className="btn-bevel text-xs !px-3 !py-1.5">done ▶</button>}
                    />
                  )}
                </div>
              )}
              {step === 4 && (
                <PublishStep
                  visibility={visibility}
                  onVisibilityChange={setVisibility}
                  title={title}
                  coverId={coverId}
                  pages={pages}
                  saving={saving}
                  onPublish={handlePublish}
                  isGuest={!user}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="mt-6 bg-[#FFE4F0] border-2 border-[#D4006E] rounded-xl px-4 py-2 font-pixel text-lg text-[#D4006E]" role="alert">{error}</div>
          )}
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
  pages,
  saving,
  onPublish,
  isGuest,
}: {
  visibility: string
  onVisibilityChange: (v: 'public' | 'private' | 'link') => void
  title: string
  coverId: string
  pages: NbPage[]
  saving: boolean
  onPublish: () => void
  isGuest: boolean
}) {
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

      <div className="max-w-md mx-auto mb-8">
        <div className="scrap-card overflow-hidden">
          <div className="bg-[#f7eaf1] flex items-center justify-center py-4 overflow-hidden">
            <div style={{ width: SPREAD_W * 0.4, height: PAGE_H * 0.4 }}>
              <div style={{ transform: 'scale(0.4)', transformOrigin: '0 0' }}>
                <StaticSpread left={pages[0]} right={pages[1]} />
              </div>
            </div>
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
