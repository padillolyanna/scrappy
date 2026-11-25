'use client'

import { createClient } from '@/lib/supabase-client'

/* Uploads a picture for the hangout board (flyers, recap photos, hangout covers) to the
   public "announcements" bucket. Only admins can upload there (see the bucket policies). */
export const BOARD_IMAGE_MAX_MB = 5

export async function uploadBoardImage(file: File, folder: 'notes' | 'hangouts' = 'notes'): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (JPG, PNG, GIF or WebP).')
  if (file.size > BOARD_IMAGE_MAX_MB * 1024 * 1024) throw new Error(`That picture is over ${BOARD_IMAGE_MAX_MB} MB. Try a smaller one.`)
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const supabase = createClient()
  const { error } = await supabase.storage.from('announcements').upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new Error(error.message)
  return supabase.storage.from('announcements').getPublicUrl(path).data.publicUrl
}
