export const instant = false

import { requireAdmin } from '@/lib/admin'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAllAnnouncementsAdmin } from '@/lib/announcements'
import AnnouncementsAdminForm from './AnnouncementsAdminForm'
import Link from 'next/link'

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
    <div className="min-h-screen bg-[#FFF0F7] font-nunito">
      {/* Top bar */}
      <div className="bg-[#3A0030] text-[#FFB6D9] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-pacifico text-xl text-glitter" style={{ fontFamily: 'Pacifico, cursive' }}>
            SCRAPPY
          </Link>
          <span className="font-pixel text-xs text-[#FFB6D9]/50" style={{ fontSize: '12px' }}>/ ADMIN / HANGOUTS / ANNOUNCEMENTS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="font-pixel text-xs text-[#FFB6D9] hover:text-white transition-colors" style={{ fontSize: '12px' }}>
            DASHBOARD
          </Link>
          <Link href="/admin/hangouts" className="font-pixel text-xs text-[#FFB6D9] hover:text-white transition-colors" style={{ fontSize: '12px' }}>
            HANGOUTS
          </Link>
          <Link href="/hangouts" className="font-pixel text-xs text-[#FFB6D9]/60 hover:text-[#FFB6D9] transition-colors" style={{ fontSize: '12px' }}>
            VIEW HANGOUTS
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-pacifico text-3xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>
            hangout board
          </h1>
          <p className="font-caveat text-lg text-[#888] mt-1" style={{ fontFamily: 'Caveat, cursive' }}>
            post announcements, reminders and recaps for the community ♡
          </p>
        </div>

        <AnnouncementsAdminForm
          hangouts={hangouts}
          announcements={announcements}
        />
      </div>
    </div>
  )
}
