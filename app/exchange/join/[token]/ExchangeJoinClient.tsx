'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase-client'
import { NotebookCover, NotebookPage } from '@/components/exchange/Notebook'
import { MAX_ANSWER_LEN, personName, rpcMessage, type ExchangeInfo, type RevealPerson } from '@/lib/exchange'

export default function ExchangeJoinClient({ token }: { token: string }) {
  const { user, loading } = useAuth()
  const [info, setInfo] = useState<ExchangeInfo | null | undefined>(undefined)
  const [people, setPeople] = useState<RevealPerson[] | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [opened, setOpened] = useState(false)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    const sb = createClient()
    const { data, error: e } = await sb.rpc('get_exchange', { p_token: token })
    if (e) { setError(rpcMessage(e)); setInfo(null); return }
    const ex = data as ExchangeInfo | null
    setInfo(ex)
    if (ex?.revealed && ex.is_member) {
      const r = await sb.rpc('reveal_exchange', { p_token: token })
      setPeople((r.data as RevealPerson[]) ?? [])
    }
  }, [token])

  useEffect(() => {
    if (loading) return
    const t = setTimeout(() => void load(), 0) // load runs after this render, not inside the effect body
    return () => clearTimeout(t)
  }, [load, loading, user?.id])

  // while waiting for the other person, check back every 20 seconds
  const waiting = !!info && info.is_member && info.i_answered && !info.revealed && !editing
  useEffect(() => {
    if (!waiting) return
    const t = setInterval(() => void load(), 20000)
    return () => clearInterval(t)
  }, [waiting, load])

  async function submit() {
    if (!info) return
    const missing = info.questions.filter((q) => !answers[q.id]?.trim()).length
    if (missing) { setError(`answer ${missing === 1 ? 'the last question' : `${missing} more questions`} first ✎`); return }
    setBusy(true); setError('')
    const { data, error: e } = await createClient().rpc('answer_exchange', { p_token: token, p_answers: answers })
    setBusy(false)
    if (e) { setError(rpcMessage(e)); return }
    setEditing(false)
    const ex = data as ExchangeInfo
    setInfo(ex)
    if (ex.revealed) {
      const r = await createClient().rpc('reveal_exchange', { p_token: token })
      setPeople((r.data as RevealPerson[]) ?? [])
    }
  }

  const link = typeof window === 'undefined' ? '' : `${window.location.origin}/exchange/join/${token}`
  const copy = () => navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  const from = personName(info?.creator)

  let body: ReactNode
  if (info === undefined || loading) {
    body = <p className="xch-muted xch-center">opening the notebook…</p>
  } else if (!info) {
    body = (
      <Message title="notebook not found" sticker="cute-kitten">
        <p>{error || 'This link doesn’t lead to a notebook. It may have been typed wrong.'}</p>
        <Link href="/exchange" className="y2kh-btn y2kh-btn--pink">start a new notebook</Link>
      </Message>
    )
  } else if (!info.questions.length) {
    body = (
      <Message title="this is an old exchange" sticker="y2k-computer">
        <p>Exchanges were rebuilt as notebooks with your own questions. Start a fresh one ♡</p>
        <Link href="/exchange" className="y2kh-btn y2kh-btn--pink">start a new notebook</Link>
      </Message>
    )
  } else if (info.full) {
    body = (
      <Message title="this notebook is taken" sticker="charm-bow">
        <p>Two people are already writing in {from}&apos;s notebook. You can make your own and pass it to someone ♡</p>
        <Link href="/exchange" className="y2kh-btn y2kh-btn--pink">start my own notebook</Link>
      </Message>
    )
  } else if (info.expired && !info.is_member) {
    body = (
      <Message title="this notebook expired" sticker="cute-kitten">
        <p>Invites last 30 days. Ask {from} to send a new one, or start your own.</p>
        <Link href="/exchange" className="y2kh-btn y2kh-btn--pink">start a new notebook</Link>
      </Message>
    )
  } else if (info.revealed && info.is_member) {
    body = <Reveal info={info} people={people} opened={opened} onOpen={() => setOpened(true)} />
  } else if (!user) {
    body = (
      <div className="xch-two">
        <div className="xch-preview">
          <NotebookCover cover={info.cover} title={info.title} sub={`from ${from}`} sticker="gem-heart" size="lg" />
        </div>
        <NotebookPage tape="pink" corner="charm-bow">
          <h1 className="xch-page-h">{from} passed you a notebook! ✉</h1>
          <p>There are <b>{info.questions.length} questions</b> inside. Answer them, and once you&apos;re done you&apos;ll both see each other&apos;s pages.</p>
          <ol className="xch-peek">
            {info.questions.slice(0, 3).map((q) => <li key={q.id}>{q.text}</li>)}
            {info.questions.length > 3 && <li className="xch-muted">…and {info.questions.length - 3} more</li>}
          </ol>
          <div className="xch-nav">
            <Link href={`/auth/login?next=/exchange/join/${token}`} className="y2kh-btn y2kh-btn--pink y2kh-btn--big">log in to answer ✎</Link>
            <Link href={`/auth/signup?next=/exchange/join/${token}`} className="y2kh-btn y2kh-btn--chrome y2kh-btn--big">join free</Link>
          </div>
        </NotebookPage>
      </div>
    )
  } else if (info.i_answered && !editing) {
    body = (
      <div className="xch-two">
        <div className="xch-preview">
          <NotebookCover cover={info.cover} title={info.title} sub={info.is_creator ? 'sealed ♡' : `from ${from}`} sticker="charm-padlock" size="lg" />
        </div>
        <NotebookPage tape="blue" corner="cute-star">
          <h1 className="xch-page-h">your page is sealed 🔒</h1>
          {info.is_creator ? (
            <>
              <p>{info.other_answered ? 'Your friend is done, just a sec…' : 'Now pass the notebook on! Send this link to one friend. When they finish their page, it opens for both of you.'}</p>
              <div className="xch-link">{link}</div>
              <div className="xch-nav">
                <button className="y2kh-btn y2kh-btn--pink" onClick={copy}>{copied ? '✓ copied!' : 'copy link'}</button>
                <button className="y2kh-btn y2kh-btn--chrome" onClick={() => (navigator.share ? navigator.share({ title: `${info.title} on Scrappy`, text: 'fill in my slam book ♡', url: link }).catch(() => {}) : copy())}>share ✦</button>
              </div>
            </>
          ) : (
            <p>Waiting for {from} to finish their page. This page checks again every few seconds.</p>
          )}
          <div className="xch-nav">
            <button className="y2kh-btn y2kh-btn--chrome" onClick={() => { setEditing(true); setError('') }}>✎ change my answers</button>
            <Link href="/exchange" className="y2kh-btn y2kh-btn--chrome">my notebooks</Link>
          </div>
        </NotebookPage>
      </div>
    )
  } else {
    body = (
      <NotebookPage tape="yellow" corner="gem-heart" className="xch-wide">
        <p className="xch-kicker">✉ {info.title}</p>
        <h1 className="xch-page-h">{editing ? 'change your answers' : info.is_creator ? 'your page' : `${from}'s notebook`}</h1>
        {!editing && !info.is_creator && (
          <p className="xch-muted">{info.other_answered ? `${from} already wrote their page. It stays sealed 🔒 until you finish yours.` : 'Answer every question, then seal your page.'}</p>
        )}
        {editing && <p className="xch-muted">Write your answers again. They replace the old ones until the notebook is revealed.</p>}
        {error && <p className="xch-error" role="alert">{error}</p>}
        <div className="xch-answers">
          {info.questions.map((q, i) => (
            <div key={q.id} className="xch-qa">
              <label htmlFor={`a-${q.id}`} className="xch-q"><span>{i + 1}.</span> {q.text}</label>
              <textarea id={`a-${q.id}`} className="xch-pen" rows={2} maxLength={MAX_ANSWER_LEN} value={answers[q.id] ?? ''} placeholder="write here…" onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div className="xch-nav">
          {editing && <button className="y2kh-btn y2kh-btn--chrome" onClick={() => setEditing(false)}>cancel</button>}
          <button className="y2kh-btn y2kh-btn--pink y2kh-btn--big" onClick={submit} disabled={busy}>{busy ? 'sealing…' : 'seal my page ✉'}</button>
        </div>
      </NotebookPage>
    )
  }

  return <div className="xch">{body}</div>
}

function Message({ title, sticker, children }: { title: string; sticker: string; children: ReactNode }) {
  return (
    <NotebookPage tape="pink" corner={sticker} className="xch-msg">
      <h1 className="xch-page-h">{title}</h1>
      <div className="xch-msg-body">{children}</div>
    </NotebookPage>
  )
}

function Reveal({ info, people, opened, onOpen }: { info: ExchangeInfo; people: RevealPerson[] | null; opened: boolean; onOpen: () => void }) {
  const me = people?.find((p) => p.is_me)
  const them = people?.find((p) => !p.is_me)
  if (!opened) {
    return (
      <div className="xch-reveal-cover">
        <p className="xch-kicker">both pages are in ✦</p>
        <button className="xch-open" onClick={onOpen} aria-label="open the notebook">
          <NotebookCover cover={info.cover} title={info.title} sub="tap to open ♡" sticker="gem-heart" size="lg" />
        </button>
      </div>
    )
  }
  return (
    <div className="xch-spread-wrap">
      <header className="xch-spread-head">
        <p className="xch-kicker">✉ {info.title}</p>
        <h1 className="xch-page-h">{personName(me)} ♡ {personName(them)}</h1>
      </header>
      {!people ? <p className="xch-muted xch-center">turning the pages…</p> : (
        <ol className="xch-spread">
          {info.questions.map((q, i) => (
            <li key={q.id} className="xch-row" style={{ animationDelay: `${Math.min(i, 8) * 0.12}s` }}>
              <p className="xch-row-q"><span>{i + 1}.</span> {q.text}</p>
              <div className="xch-row-a">
                <div className="xch-slip xch-slip--me">
                  <span className="xch-slip-who">{personName(me)}</span>
                  <p>{me?.answers?.[q.id] ?? '—'}</p>
                </div>
                <div className="xch-slip xch-slip--them">
                  <span className="xch-slip-who">{personName(them)}</span>
                  <p>{them?.answers?.[q.id] ?? '—'}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      <div className="xch-nav xch-nav--center">
        <Link href="/exchange" className="y2kh-btn y2kh-btn--pink">start another notebook ✎</Link>
        {them?.username && <Link href={`/profile/${them.username}`} className="y2kh-btn y2kh-btn--chrome">visit {personName(them)}&apos;s page</Link>}
      </div>
    </div>
  )
}
