'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function toggleScrapbookVisibility(
  id: string,
  makePublic: boolean,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('scrapbooks')
    .update({ is_public: makePublic })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/my-space')
  revalidatePath('/explore')
  revalidatePath(`/scrapbook/${id}`)
  revalidatePath('/')
  return {}
}
