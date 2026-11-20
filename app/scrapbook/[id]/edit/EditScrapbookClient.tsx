'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NotebookEditor from '@/components/notebook/NotebookEditor'
import { createClient } from '@/lib/supabase-client'
import { starterPages, type NbPage } from '@/lib/notebook'
import { savePages, syncAnswers, uploadDataUrl } from '@/lib/notebookStore'

export default function EditScrapbookClient({
  scrapbookId, userId, initialTitle, coverId, isPublic, initialPages,
}: {
  scrapbookId: string
  userId: string
  initialTitle: string
  coverId: string
  isPublic: boolean
  initialPages: NbPage[]
}) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [pages, setPages] = useState<NbPage[]>(() =>
    initialPages.length ? initialPages : starterPages(coverId, 'about-me', initialTitle),
  )
  const [status, setStatus] = useState<'saved' | 'dirty' | 'saving' | 'error'>(initialPages.length ? 'saved' : 'dirty')
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setStatus('dirty')
  }, [pages, title])

  useEffect(() => {
    if (status !== 'dirty') return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [status])

  const uploadImage = useCallback((d: string) => uploadDataUrl(createClient(), userId, d), [userId])

  async function save(andView = false) {
    setStatus('saving')
    const supabase = createClient()
    try {
      const saved = await savePages(supabase, scrapbookId, userId, pages)
      await supabase.from('scrapbooks').update({ title: title || 'my scrapbook', updated_at: new Date().toISOString() }).eq('id', scrapbookId)
      await syncAnswers(supabase, scrapbookId, userId, saved, isPublic)
      first.current = true
      setPages(saved)
      setStatus('saved')
      if (andView) {
        router.push(`/scrapbook/${scrapbookId}`)
        router.refresh()
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="py-6 px-3">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <Link href={`/scrapbook/${scrapbookId}`} className="font-nunito text-sm text-[#888] hover:text-[#FF4FA3]">← back to scrapbook</Link>
        <span className={`font-pixel text-lg ${status === 'error' ? 'text-[#D4006E]' : 'text-[#7C4DDB]'}`} role="status">
          {status === 'saved' ? '✓ all changes saved' : status === 'saving' ? 'saving…' : status === 'error' ? "⚠ couldn't save — try again" : '● unsaved changes'}
        </span>
      </div>
      <NotebookEditor
        pages={pages}
        onChange={setPages}
        title={title}
        onTitleChange={setTitle}
        uploadImage={uploadImage}
        actions={
          <>
            <button onClick={() => save(false)} disabled={status === 'saving'} className="btn-outline-y2k text-xs !px-3 !py-1">save</button>
            <button onClick={() => save(true)} disabled={status === 'saving'} className="btn-bevel text-xs !px-3 !py-1.5">save & view ▶</button>
          </>
        }
      />
    </main>
  )
}
