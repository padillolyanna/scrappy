
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { loadPages } from '@/lib/notebookStore'
import EditScrapbookClient from './EditScrapbookClient'

export default async function EditScrapbookPage({ params }: PageProps<'/scrapbook/[id]/edit'>) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?next=/scrapbook/${id}/edit`)

  const { data: scrapbook } = await supabase
    .from('scrapbooks')
    .select('id, title, cover_id, is_public, user_id')
    .eq('id', id)
    .single()
  if (!scrapbook) return notFound()
  if (scrapbook.user_id !== user.id) redirect(`/scrapbook/${id}`)

  const pages = await loadPages(supabase, id)

  return (
    <EditScrapbookClient
      scrapbookId={id}
      userId={user.id}
      initialTitle={scrapbook.title}
      coverId={scrapbook.cover_id}
      isPublic={scrapbook.is_public}
      initialPages={pages}
    />
  )
}
