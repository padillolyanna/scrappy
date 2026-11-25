'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase-client'
import AuthModal from '@/components/ui/AuthModal'
import { NotebookCover, NotebookPage } from '@/components/exchange/Notebook'
import { assetThumb } from '@/lib/assetLibrary'
import {
  COVERS, MAX_ANSWER_LEN, MAX_QUESTION_LEN, MAX_QUESTIONS, NOTEBOOK_TEMPLATES, QUESTION_IDEAS,
  rpcMessage, shelfStatus, type Cover, type ShelfNotebook,
} from '@/lib/exchange'

type Step = 'home' | 'cover' | 'questions' | 'answer' | 'done'
interface Item { key: string; text: string; answer: string }
interface Draft { cover: Cover; title: string; templateId: string; items: Item[] }

const DRAFT_KEY = 'scrappy-exchange-draft'
let keySeq = 0
const newKey = () => `k${Date.now().toString(36)}${(keySeq++).toString(36)}`
const fromTemplate = (id: string): Item[] =>
  (NOTEBOOK_TEMPLATES.find((t) => t.id === id)?.questions ?? []).map((text) => ({ key: newKey(), text, answer: '' }))

function readDraft(): Draft | null {
  try { const raw = localStorage.getItem(DRAFT_KEY); return raw ? JSON.parse(raw) as Draft : null } catch { return null }
}
const subscribeNoop = () => () => {}
const hasDraftClient = () => { try { return !!localStorage.getItem(DRAFT_KEY) } catch { return false } }

export default function ExchangePage() {
  const { user, loading } = useAuth()
  const [step, setStep] = useState<Step>('home')
  const [draft, setDraft] = useState<Draft>({ cover: 'pink', title: '', templateId: 'slam-book', items: [] })
  const [newQ, setNewQ] = useState('')
  const [page, setPage] = useState(0) // which question is open on the answer step (mobile flips)
  const [shelf, setShelf] = useState<ShelfNotebook[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [copied, setCopied] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const hasDraft = useSyncExternalStore(subscribeNoop, hasDraftClient, () => false)

  // my notebooks shelf
  useEffect(() => {
    if (!user) return
    let live = true
    createClient().rpc('my_exchanges').then(({ data }) => { if (live) setShelf((data as ShelfNotebook[]) ?? []) })
    return () => { live = false }
  }, [user, step])

  // keep the draft so nothing is lost when a guest goes off to log in
  useEffect(() => {
    if (step === 'home' || step === 'done') return
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)) } catch { /* storage off */ }
  }, [draft, step])

  const items = draft.items
  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const setItem = (key: string, patch: Partial<Item>) => update({ items: items.map((it) => (it.key === key ? { ...it, ...patch } : it)) })
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]; [next[i], next[j]] = [next[j], next[i]]; update({ items: next })
  }
  const addQuestion = (text: string) => {
    const t = text.trim().slice(0, MAX_QUESTION_LEN)
    if (!t || items.length >= MAX_QUESTIONS) return
    update({ items: [...items, { key: newKey(), text: t, answer: '' }] })
    setNewQ('')
  }
  const pickTemplate = (id: string) => {
    const t = NOTEBOOK_TEMPLATES.find((x) => x.id === id)
    update({ templateId: id, items: fromTemplate(id), title: draft.title || (t && t.id !== 'custom' ? `${t.name} ♡` : '') })
  }

  const start = (resume: boolean) => {
    const d = resume ? readDraft() : null
    setDraft(d ?? { cover: 'pink', title: 'slam book ♡', templateId: 'slam-book', items: fromTemplate('slam-book') })
    setError(''); setPage(0)
    setStep(resume && d ? (d.items.some((i) => i.answer) ? 'answer' : 'questions') : 'cover')
  }

  const questionsOk = items.filter((i) => i.text.trim()).length > 0
  const unanswered = items.filter((i) => i.text.trim() && !i.answer.trim()).length

  const goAnswer = () => {
    update({ items: items.filter((i) => i.text.trim()) })
    if (!user) { setShowAuth(true); return }
    setPage(0); setStep('answer')
  }

  async function create() {
    if (!user) { setShowAuth(true); return }
    if (unanswered) { setError(`answer ${unanswered === 1 ? 'the last question' : `${unanswered} more questions`} first ✎`); return }
    setBusy(true); setError('')
    const real = items.filter((i) => i.text.trim())
    const { data, error: e } = await createClient().rpc('create_exchange', {
      p_title: draft.title,
      p_template: draft.templateId,
      p_cover: draft.cover,
      p_questions: real.map((i) => ({ text: i.text })),
      p_answers: Object.fromEntries(real.map((i, n) => [`q${n + 1}`, i.answer])),
    })
    setBusy(false)
    if (e || !data) { setError(rpcMessage(e)); return }
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    setToken(data as string)
    setStep('done')
  }

  const link = token ? `${typeof window === 'undefined' ? '' : window.location.origin}/exchange/join/${token}` : ''
  const copy = () => navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  const tpl = NOTEBOOK_TEMPLATES.find((t) => t.id === draft.templateId)

  const steps: [Step, string][] = [['cover', 'notebook'], ['questions', 'questions'], ['answer', 'your answers'], ['done', 'pass it on']]
  const stepIdx = steps.findIndex(([s]) => s === step)

  return (
    <div className="xch">
      {step === 'home' ? (
        <>
          <header className="xch-hero">
            <div className="xch-hero-text">
              <p className="xch-kicker">✉ scrapbook exchange</p>
              <h1 className="xch-title">Pass the notebook</h1>
              <p className="xch-lead">Make a slam book with your own questions, answer it, then pass it to a friend. Their answers stay sealed until you&apos;ve both written yours, then you flip it open together ♡</p>
              <div className="xch-cta">
                <button className="y2kh-btn y2kh-btn--pink y2kh-btn--big" onClick={() => start(false)}>✎ start a new notebook</button>
                {hasDraft && <button className="y2kh-btn y2kh-btn--chrome y2kh-btn--big" onClick={() => start(true)}>continue my draft</button>}
              </div>
            </div>
            <div className="xch-hero-art" aria-hidden="true">
              <NotebookCover cover="leopard" title="slam book ♡" sub="property of xoxo" sticker="gem-heart" size="lg" />
              <div className="xch-hero-note">pass it on!! ✦</div>
            </div>
          </header>

          <ol className="xch-how">
            <li><b>1</b><span><strong>Pick a notebook</strong>Choose a cover and a set of questions.</span></li>
            <li><b>2</b><span><strong>Make it yours</strong>Edit, reorder or write your own questions.</span></li>
            <li><b>3</b><span><strong>Answer first</strong>Fill in your page. It stays sealed.</span></li>
            <li><b>4</b><span><strong>Pass it on</strong>Send the link, then reveal both pages together.</span></li>
          </ol>

          <section className="xch-shelf" aria-labelledby="xch-shelf-title">
            <h2 id="xch-shelf-title" className="xch-h2">my notebooks</h2>
            {!user && !loading && <p className="xch-muted"><Link href="/auth/login?next=/exchange">Log in</Link> to see the notebooks you&apos;ve passed around.</p>}
            {user && shelf === null && <p className="xch-muted">loading your shelf…</p>}
            {user && shelf?.length === 0 && <p className="xch-muted">No notebooks yet. Start one and pass it to a friend ♡</p>}
            {!!shelf?.length && (
              <ul className="xch-shelf-row">
                {shelf.map((n) => {
                  const st = shelfStatus(n)
                  return (
                    <li key={n.token}>
                      <Link href={`/exchange/join/${n.token}`} className="xch-book">
                        <NotebookCover cover={n.cover} title={n.title} sub={`${n.n_questions} questions`} size="sm" />
                        <span className={`xch-badge xch-badge--${st.tone}`}>{st.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
      ) : (
        <>
          <nav className="xch-steps" aria-label="Steps">
            {steps.map(([s, label], i) => (
              <span key={s} className={i === stepIdx ? 'is-on' : i < stepIdx ? 'is-done' : ''} aria-current={i === stepIdx ? 'step' : undefined}>
                <b>{i < stepIdx ? '✓' : i + 1}</b> {label}
              </span>
            ))}
          </nav>

          {error && <p className="xch-error" role="alert">{error}</p>}

          {/* 1 · notebook */}
          {step === 'cover' && (
            <div className="xch-two">
              <div className="xch-preview">
                <NotebookCover cover={draft.cover} title={draft.title || 'our notebook'} sub={tpl?.name} sticker={tpl?.sticker} size="lg" />
              </div>
              <NotebookPage tape="pink" corner="charm-bow">
                <h2 className="xch-page-h">choose your notebook</h2>
                <label className="xch-label" htmlFor="xch-title">name it</label>
                <input id="xch-title" className="xch-input" maxLength={60} value={draft.title} placeholder="our notebook ♡" onChange={(e) => update({ title: e.target.value })} />

                <p className="xch-label">cover</p>
                <div className="xch-covers" role="radiogroup" aria-label="cover">
                  {COVERS.map((c) => (
                    <button key={c.id} role="radio" aria-checked={draft.cover === c.id} className={`xch-swatch xnb-cover--${c.id}`} onClick={() => update({ cover: c.id })} title={c.label} aria-label={c.label} />
                  ))}
                </div>

                <p className="xch-label">questions to start from</p>
                <div className="xch-tpls">
                  {NOTEBOOK_TEMPLATES.map((t) => (
                    <button key={t.id} className="xch-tpl" aria-pressed={draft.templateId === t.id} onClick={() => pickTemplate(t.id)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={assetThumb(t.sticker)} alt="" width={36} height={36} />
                      <span><b>{t.name}</b><small>{t.questions.length ? `${t.questions.length} questions · ${t.blurb}` : t.blurb}</small></span>
                    </button>
                  ))}
                </div>
                <div className="xch-nav">
                  <button className="y2kh-btn y2kh-btn--chrome" onClick={() => setStep('home')}>◀ back</button>
                  <button className="y2kh-btn y2kh-btn--pink" onClick={() => setStep('questions')}>next: questions ▶</button>
                </div>
              </NotebookPage>
            </div>
          )}

          {/* 2 · questions */}
          {step === 'questions' && (
            <NotebookPage tape="blue" corner="cute-star" className="xch-wide">
              <h2 className="xch-page-h">write the questions <small>{items.length}/{MAX_QUESTIONS}</small></h2>
              <p className="xch-muted">Edit any question, move it up or down, or write your own. Your friend answers the same ones.</p>
              <ol className="xch-qlist">
                {items.map((it, i) => (
                  <li key={it.key}>
                    <span className="xch-qn">{i + 1}.</span>
                    <input className="xch-line" value={it.text} maxLength={MAX_QUESTION_LEN} aria-label={`question ${i + 1}`} onChange={(e) => setItem(it.key, { text: e.target.value })} />
                    <span className="xch-qtools">
                      <button onClick={() => move(i, -1)} disabled={i === 0} aria-label={`move question ${i + 1} up`}>▲</button>
                      <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`move question ${i + 1} down`}>▼</button>
                      <button onClick={() => update({ items: items.filter((x) => x.key !== it.key) })} aria-label={`remove question ${i + 1}`} className="is-del">✕</button>
                    </span>
                  </li>
                ))}
              </ol>
              {items.length < MAX_QUESTIONS ? (
                <form className="xch-add" onSubmit={(e) => { e.preventDefault(); addQuestion(newQ) }}>
                  <span className="xch-qn">{items.length + 1}.</span>
                  <input className="xch-line" value={newQ} maxLength={MAX_QUESTION_LEN} placeholder="write your own question…" aria-label="new question" onChange={(e) => setNewQ(e.target.value)} />
                  <button type="submit" className="y2kh-btn y2kh-btn--pink" disabled={!newQ.trim()}>+ add</button>
                </form>
              ) : <p className="xch-muted">This notebook is full ({MAX_QUESTIONS} questions).</p>}
              <div className="xch-ideas">
                <span>need ideas?</span>
                {QUESTION_IDEAS.filter((q) => !items.some((it) => it.text === q)).slice(0, 6).map((q) => (
                  <button key={q} onClick={() => addQuestion(q)} disabled={items.length >= MAX_QUESTIONS}>+ {q}</button>
                ))}
              </div>
              <div className="xch-nav">
                <button className="y2kh-btn y2kh-btn--chrome" onClick={() => setStep('cover')}>◀ back</button>
                <button className="y2kh-btn y2kh-btn--pink" onClick={goAnswer} disabled={!questionsOk}>next: answer them ▶</button>
              </div>
            </NotebookPage>
          )}

          {/* 3 · answer */}
          {step === 'answer' && (
            <NotebookPage tape="yellow" corner="gem-heart" className="xch-wide">
              <h2 className="xch-page-h">your page <small>{items.length - unanswered}/{items.length} answered</small></h2>
              <p className="xch-muted">Answer first, then pass the notebook on. Your friend can&apos;t see this page until they&apos;ve written theirs 🔒</p>
              <div className="xch-answers">
                {items.map((it, i) => (
                  <div key={it.key} className={`xch-qa ${i === page ? 'is-open' : ''}`}>
                    <label htmlFor={`a-${it.key}`} className="xch-q"><span>{i + 1}.</span> {it.text}</label>
                    <textarea id={`a-${it.key}`} className="xch-pen" rows={2} maxLength={MAX_ANSWER_LEN} value={it.answer} placeholder="write here…" onFocus={() => setPage(i)} onChange={(e) => setItem(it.key, { answer: e.target.value })} />
                  </div>
                ))}
              </div>
              <div className="xch-nav">
                <button className="y2kh-btn y2kh-btn--chrome" onClick={() => setStep('questions')}>◀ edit questions</button>
                <button className="y2kh-btn y2kh-btn--pink y2kh-btn--big" onClick={create} disabled={busy}>{busy ? 'sealing…' : 'seal my page & get the link ✉'}</button>
              </div>
            </NotebookPage>
          )}

          {/* 4 · pass it on */}
          {step === 'done' && (
            <div className="xch-done">
              <div className="xch-note">
                <span className="xnb-tape xnb-tape--pink" aria-hidden="true" />
                <h2 className="xch-page-h">pass the notebook! ✉</h2>
                <p>Your page is sealed. Send this link to a friend. When they finish their page, you&apos;ll both see each other&apos;s answers.</p>
                <div className="xch-link" aria-label="invite link">{link}</div>
                <div className="xch-nav xch-nav--center">
                  <button className="y2kh-btn y2kh-btn--pink" onClick={copy}>{copied ? '✓ copied!' : 'copy link'}</button>
                  <button className="y2kh-btn y2kh-btn--chrome" onClick={() => (navigator.share ? navigator.share({ title: `${draft.title || 'our notebook'} on Scrappy`, text: 'fill in my slam book ♡', url: link }).catch(() => {}) : copy())}>share ✦</button>
                </div>
                <p className="xch-muted">Only one person can join. The link works for 30 days.</p>
                <div className="xch-nav xch-nav--center">
                  <Link href={`/exchange/join/${token}`} className="y2kh-btn y2kh-btn--chrome">open my notebook</Link>
                  <button className="y2kh-btn y2kh-btn--chrome" onClick={() => setStep('home')}>my notebooks</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showAuth && <AuthModal reason="save" onClose={() => setShowAuth(false)} />}
    </div>
  )
}
