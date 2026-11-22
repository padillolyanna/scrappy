'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function deleteScrapbook(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify ownership before deleting
  const { data: sb } = await supabase
    .from('scrapbooks')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!sb || sb.user_id !== user.id) return { error: 'Not authorized' }

  const { error } = await supabase.from('scrapbooks').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/')
  return {}
}
