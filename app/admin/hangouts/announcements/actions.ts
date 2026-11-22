'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createAnnouncement(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const kind = formData.get('kind') as string
  const hangoutId = formData.get('hangout_id') as string | null
  const noteColor = formData.get('note_color') as string
  const isPinned = formData.get('is_pinned') === 'true'
  const publishAt = formData.get('publish_at') as string
  const expiresAt = formData.get('expires_at') as string | null
  const imageUrl = formData.get('image_url') as string | null

  const { error } = await supabase.from('hangout_announcements').insert({
    title,
    body,
    kind,
    hangout_id: hangoutId || null,
    note_color: noteColor,
    is_pinned: isPinned,
    publish_at: publishAt ? new Date(publishAt).toISOString() : new Date().toISOString(),
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    image_url: imageUrl || null,
    created_by: user?.id ?? null,
  })

  if (error) throw error

  revalidatePath('/hangouts')
  revalidatePath('/')
}

export async function updateAnnouncement(id: string, data: {
  title?: string
  body?: string
  kind?: string
  hangout_id?: string | null
  note_color?: string
  is_pinned?: boolean
  publish_at?: string
  expires_at?: string | null
}) {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = { ...data }
  if (data.publish_at) updateData.publish_at = new Date(data.publish_at).toISOString()
  if (data.expires_at) updateData.expires_at = new Date(data.expires_at).toISOString()

  const { error } = await supabase
    .from('hangout_announcements')
    .update(updateData)
    .eq('id', id)

  if (error) throw error

  revalidatePath('/hangouts')
  revalidatePath('/')
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('hangout_announcements')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/hangouts')
  revalidatePath('/')
}

export async function togglePin(id: string, currentPinned: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('hangout_announcements')
    .update({ is_pinned: !currentPinned })
    .eq('id', id)

  if (error) throw error

  revalidatePath('/hangouts')
  revalidatePath('/')
}
