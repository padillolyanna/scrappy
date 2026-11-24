'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { starterCover, PAGE_W, PAGE_H, type NbPage } from '@/lib/notebook'
import { StaticCover } from '@/components/notebook/Spread'
import { deleteScrapbook } from '@/app/actions/deleteScrapbook'

const SCALE = 0.24
const W = Math.round(PAGE_W * SCALE)
const H = Math.round(PAGE_H * SCALE)

export interface DashScrapbook {
  id: string
  title: string
  cover_id: string
  is_public: boolean
}

function DotMenu({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const handleDelete = () => {
    setOpen(false)
    setConfirmOpen(true)
  }

  const confirmDelete = () => {
    setConfirmOpen(false)
    startTransition(async () => {
      const result = await deleteScrapbook(id)
      if (result.error) {
        setDeleteError(result.error)
      } else {
        onDeleted()
        router.refresh()
      }
    })
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Y2K confirm modal */}
      {confirmOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(43,10,46,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setConfirmOpen(false)}
        >
          <div
            style={{ background: '#FFF0F7', border: '3px solid #2B0A2E', borderRadius: 16, boxShadow: '5px 5px 0 #2B0A2E', padding: '28px 28px 22px', maxWidth: 340, width: '90vw', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 18, color: '#3A0030', marginBottom: 8 }}>delete scrapbook?</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#666', marginBottom: 20 }}>this cannot be undone ✦</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{ padding: '8px 20px', border: '2px solid #2B0A2E', borderRadius: 10, background: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, cursor: 'pointer', color: '#2B0A2E' }}
              >
                cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{ padding: '8px 20px', border: '2px solid #2B0A2E', borderRadius: 10, background: '#E0007A', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, cursor: 'pointer', color: 'white' }}
              >
                delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* In-page error banner */}
      {deleteError && (
        <div
          style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#FFF0F7', border: '2px solid #E0007A', borderRadius: 12, padding: '10px 20px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, color: '#E0007A', boxShadow: '3px 3px 0 #2B0A2E', cursor: 'pointer' }}
          onClick={() => setDeleteError('')}
        >
          {deleteError} — click to dismiss
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        aria-label="More options"
        aria-expanded={open}
        style={{
          minWidth: 36,
          minHeight: 36,
          border: '2px solid #2B0A2E',
          borderRadius: 8,
          background: 'white',
          cursor: isPending ? 'wait' : 'pointer',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 900,
          fontSize: 16,
          color: '#2B0A2E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          letterSpacing: 2,
          lineHeight: 1,
          opacity: isPending ? 0.5 : 1,
        }}
      >
        ···
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            background: 'white',
            border: '2px solid #2B0A2E',
            borderRadius: 10,
            boxShadow: '3px 3px 0 #2B0A2E',
            zIndex: 50,
            minWidth: 160,
            overflow: 'hidden',
          }}
        >
          <Link
            href={`/scrapbook/${id}/edit`}
            onClick={() => setOpen(false)}
            style={{ display: 'block', padding: '10px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: '#2B0A2E', textDecoration: 'none', borderBottom: '1px solid rgba(43,10,46,.1)' }}
          >
            Rename / Settings
          </Link>
          <Link
            href={`/scrapbook/${id}`}
            target="_blank"
            onClick={() => setOpen(false)}
            style={{ display: 'block', padding: '10px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: '#2B0A2E', textDecoration: 'none', borderBottom: '1px solid rgba(43,10,46,.1)' }}
          >
            View as visitor
          </Link>
          <button
            onClick={handleDelete}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: '#E0007A', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Delete scrapbook
          </button>
        </div>
      )}
    </div>
  )
}

export default function DashboardScrapbooks({ scrapbooks: initial }: { scrapbooks: DashScrapbook[] }) {
  const [scrapbooks, setScrapbooks] = useState(initial)
  const [covers, setCovers] = useState<Record<string, NbPage> | null>(null)

  useEffect(() => { setScrapbooks(initial) }, [initial])

  useEffect(() => {
    const c: Record<string, NbPage> = {}
    scrapbooks.forEach((s) => { c[s.id] = starterCover(s.cover_id, s.title || 'my scrapbook') })
    setCovers(c)
  }, [scrapbooks])

  if (!scrapbooks.length) {
    return (
      <div style={{ border: '2px dashed rgba(43,10,46,.2)', borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
        <div className="font-pacifico" style={{ fontSize: 20, color: 'var(--c-text)', marginBottom: 10 }}>no scrapbooks yet</div>
        <p className="font-nunito" style={{ fontSize: 14, color: 'var(--c-text)', opacity: 0.6, marginBottom: 16 }}>Make your first one — it only takes a minute.</p>
        <Link href="/scrapbook/create" className="btn-pill btn-pill-pink" style={{ fontSize: 14 }}>✦ Make a scrapbook</Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {scrapbooks.map((sb) => (
        <div key={sb.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {/* Cover — no card box, just the cover floating */}
          <Link
            href={`/scrapbook/${sb.id}/edit`}
            style={{ display: 'block', position: 'relative', width: '100%', paddingTop: `${(H / W) * 100}%`, overflow: 'hidden', borderRadius: 6, boxShadow: '3px 3px 0 rgba(43,10,46,.35)', flexShrink: 0 }}
          >
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 6 }}>
              <div
                className="pointer-events-none absolute left-0 top-0 origin-top-left"
                style={{ transform: `scale(${SCALE})`, width: PAGE_W, height: PAGE_H }}
              >
                {covers
                  ? <StaticCover page={covers[sb.id]} />
                  : <div style={{ width: PAGE_W, height: PAGE_H, background: '#f3e3ee' }} />
                }
              </div>
            </div>
          </Link>

          {/* Info + actions below the cover, no background */}
          <div style={{ marginTop: 7, width: '100%' }}>
            <div className="font-nunito font-extrabold truncate" style={{ fontSize: 12, color: 'var(--c-text)', marginBottom: 1 }} title={sb.title || 'untitled'}>
              {sb.title || 'untitled'}
            </div>
            <div className="font-silkscreen" style={{ fontSize: 9, color: sb.is_public ? '#14B8A6' : '#aaa', marginBottom: 6, letterSpacing: '0.08em' }}>
              {sb.is_public ? '● PUBLIC' : '○ PRIVATE'}
            </div>
            <div className="flex gap-1.5 items-center">
              <Link
                href={`/scrapbook/${sb.id}/edit`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 30, border: '2px solid #2B0A2E', borderRadius: 8, background: '#E0007A', color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, textDecoration: 'none' }}
              >
                Edit
              </Link>
              <Link
                href={`/scrapbook/${sb.id}`}
                target="_blank"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 30, border: '2px solid #2B0A2E', borderRadius: 8, background: 'white', color: '#2B0A2E', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, textDecoration: 'none' }}
              >
                View
              </Link>
              <DotMenu id={sb.id} onDeleted={() => setScrapbooks((prev) => prev.filter((s) => s.id !== sb.id))} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
