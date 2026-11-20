import type { SupabaseClient } from '@supabase/supabase-js'
import { dataUrlToBlob, elementToRow, questionAnswers, rowToElement, type NbPage, type PaperId } from '@/lib/notebook'
import { TEMPLATES } from '@/lib/types'

const BUCKET = 'scrapbook-media'

export async function uploadDataUrl(supabase: SupabaseClient, userId: string, dataUrl: string) {
  const blob = dataUrlToBlob(dataUrl)
  const ext = blob.type === 'image/png' ? 'png' : 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: '31536000' })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

/** Upload any photos still held as data URLs. Photos that fail stay inline. */
export async function uploadPendingImages(supabase: SupabaseClient, userId: string, pages: NbPage[]) {
  const cache = new Map<string, string>()
  const out: NbPage[] = []
  for (const p of pages) {
    const elements = []
    for (const el of p.elements) {
      if (el.type === 'image' && el.content.startsWith('data:')) {
        let url = cache.get(el.content)
        if (!url) {
          try {
            url = await uploadDataUrl(supabase, userId, el.content)
            cache.set(el.content, url)
          } catch {
            url = el.content
          }
        }
        elements.push({ ...el, content: url })
      } else elements.push(el)
    }
    out.push({ ...p, elements })
  }
  return out
}

/** Replace all pages of a scrapbook. New rows are written before old rows are
 *  removed so a failed save never wipes the scrapbook. */
export async function savePages(supabase: SupabaseClient, scrapbookId: string, userId: string, pages: NbPage[]) {
  const ready = await uploadPendingImages(supabase, userId, pages)

  const { data: oldPages } = await supabase.from('scrapbook_pages').select('id').eq('scrapbook_id', scrapbookId)

  const { data: inserted, error: pageErr } = await supabase
    .from('scrapbook_pages')
    .insert(ready.map((p, i) => ({ scrapbook_id: scrapbookId, page_number: i + 1, bg_color: p.color, bg_texture: p.paper })))
    .select('id, page_number')
  if (pageErr || !inserted) throw pageErr ?? new Error('could not save pages')

  const idByNumber = new Map(inserted.map((r) => [r.page_number as number, r.id as string]))
  const rows = ready.flatMap((p, i) => p.elements.map((el) => elementToRow(el, idByNumber.get(i + 1)!)))
  if (rows.length) {
    const { error: elErr } = await supabase.from('scrapbook_elements').insert(rows)
    if (elErr) {
      await supabase.from('scrapbook_pages').delete().in('id', inserted.map((r) => r.id))
      throw elErr
    }
  }

  if (oldPages?.length) {
    await supabase.from('scrapbook_pages').delete().in('id', oldPages.map((r) => r.id))
  }
  return ready
}

/** Load notebook pages. Returns [] for legacy scrapbooks with no v2 elements. */
export async function loadPages(supabase: SupabaseClient, scrapbookId: string): Promise<NbPage[]> {
  const { data: pageRows } = await supabase
    .from('scrapbook_pages')
    .select('id, page_number, bg_color, bg_texture')
    .eq('scrapbook_id', scrapbookId)
    .order('page_number', { ascending: true })
  if (!pageRows?.length) return []

  const { data: elRows } = await supabase
    .from('scrapbook_elements')
    .select('id, page_id, type, content, x, y, width, height, rotation, z_index, props')
    .in('page_id', pageRows.map((p) => p.id))

  let any = false
  const pages: NbPage[] = pageRows.map((p) => {
    const elements = (elRows ?? [])
      .filter((r) => r.page_id === p.id)
      .map(rowToElement)
      .filter((e): e is NonNullable<typeof e> => !!e)
      .sort((a, b) => a.z - b.z)
    if (elements.length) any = true
    return { id: p.id, paper: (p.bg_texture as PaperId) || 'plain', color: p.bg_color || '#FFF8ED', elements }
  })
  return any ? pages : []
}

/** Mirror answered question cards into `answers` so they show up in feeds. */
export async function syncAnswers(supabase: SupabaseClient, scrapbookId: string, userId: string, pages: NbPage[], isPublic: boolean) {
  const idFor = new Map<string, string>()
  TEMPLATES.forEach((t) => t.questions.forEach((q) => idFor.set(q.question_text, q.id)))
  const rows = questionAnswers(pages).map((a) => ({
    user_id: userId,
    scrapbook_id: scrapbookId,
    question_id: idFor.get(a.question_text) ?? `custom-${a.question_text.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`,
    question_text: a.question_text,
    answer_text: a.answer_text,
    is_public: isPublic,
  }))
  await supabase.from('answers').delete().eq('scrapbook_id', scrapbookId).eq('user_id', userId)
  if (rows.length) await supabase.from('answers').insert(rows)
}
