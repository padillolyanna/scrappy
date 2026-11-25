
import { requireAdmin } from '@/lib/admin'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAllAnnouncementsAdmin } from '@/lib/announcements'
import AnnouncementsAdminForm from './AnnouncementsAdminForm'

export default async function AdminAnnouncementsPage() {
  await connection()
  await requireAdmin()

  const supabase = await createClient()

  const [announcements, hangoutsResult] = await Promise.all([
    getAllAnnouncementsAdmin(),
    supabase
      .from('hangouts')
      .select('id, title, start_at')
      .gte('start_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('start_at', { ascending: false })
      .limit(50),
  ])

  const hangouts = (hangoutsResult.data ?? []).map((h) => ({
    id: h.id,
    title: h.title,
    start_at: h.start_at,
  }))

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Announcements</h1>
      <AnnouncementsAdminForm hangouts={hangouts} announcements={announcements} />
    </div>
  )
}
