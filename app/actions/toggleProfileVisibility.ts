'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function toggleProfileVisibility(
  makePublic: boolean,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ is_public: makePublic })
    .eq('id', user.id)

  if (error) return { error: error.message }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  revalidatePath('/')
  if (profile?.username) revalidatePath(`/profile/${profile.username}`)
  return {}
}
