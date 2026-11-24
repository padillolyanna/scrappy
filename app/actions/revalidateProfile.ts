'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateProfile(username: string) {
  revalidatePath(`/profile/${username}`)
  revalidatePath('/my-space')
  revalidatePath('/')
}
