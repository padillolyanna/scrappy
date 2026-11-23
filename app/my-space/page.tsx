export const instant = false

import { connection } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SCRAPBOOK_COVERS } from '@/lib/types'
import { decodePaper, rowToElement, type NbPage } from '@/lib/notebook'
import MySpaceClient from '@/components/my-space/MySpaceClient'

export default async function MySpacePage() {
  await connection()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { data: profile },
    { data: scrapbooks, count: scrapbookCount },
    { data: confessions, count: confessionCount },
    { data: favorites },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('username, display_name, is_admin')
      .eq('id', user.id)
      .single(),
    supabase
      .from('scrapbooks')
      .select('id, title, cover_id, is_public, created_at, like_count, view_count')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('confessions')
      .select('id, content, category, is_approved, created_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('favorites')
      .select('scrapbook_id, scrapbooks!inner(id, title, cover_id, is_public, like_count, profiles!inner(username))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12),
  ])

  // Batch-fetch first page + elements for thumbnail previews
  const sbIds = (scrapbooks ?? []).map((s) => s.id)
  const firstPageMap: Record<string, NbPage> = {}
  if (sbIds.length) {
    const { data: pageRows } = await supabase
      .from('scrapbook_pages')
      .select('id, scrapbook_id, page_number, bg_color, bg_texture')
      .in('scrapbook_id', sbIds)
      .order('page_number', { ascending: true })

    // First page per scrapbook
    const firstPages: Record<string, { id: string; scrapbook_id: string; bg_color: string | null; bg_texture: string | null }> = {}
    for (const p of (pageRows ?? [])) {
      if (!firstPages[p.scrapbook_id]) firstPages[p.scrapbook_id] = p
    }

    const pageIds = Object.values(firstPages).map((p) => p.id)
    if (pageIds.length) {
      const { data: elRows } = await supabase
        .from('scrapbook_elements')
        .select('id, page_id, type, content, x, y, width, height, rotation, z_index, props')
        .in('page_id', pageIds)

      for (const [sbId, p] of Object.entries(firstPages)) {
        const elements = (elRows ?? [])
          .filter((r) => r.page_id === p.id)
          .map(rowToElement)
          .filter((e): e is NonNullable<typeof e> => !!e)
          .sort((a, b) => a.z - b.z)
        firstPageMap[sbId] = {
          id: p.id,
          ...decodePaper(p.bg_texture ?? null),
          color: p.bg_color || '#FFF8ED',
          elements,
        }
      }
    }
  }

  const displayName = profile?.username ?? user.email?.split('@')[0] ?? 'you'

  // Map favorites to usable shape
  const favScrapbooks = (favorites ?? []).map((f) => {
    const sb = f.scrapbooks as unknown as {
      id: string
      title: string
      cover_id: string
      is_public: boolean
      like_count: number
      profiles: { username: string }
    }
    return sb
  }).filter(Boolean)

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF0F7]">
      <main className="flex-1 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-pixel text-2xl text-[#FF4FA3]">✦</span>
              <h1
                className="font-pacifico text-4xl text-[#3A0030]"
                style={{ fontFamily: 'Pacifico, cursive' }}
              >
                my space
              </h1>
            </div>
            <p
              className="font-caveat text-xl text-[#888] ml-10"
              style={{ fontFamily: 'Caveat, cursive' }}
            >
              welcome back, @{displayName} ✦
            </p>
            {profile?.is_admin && (
              <div className="ml-10 mt-2">
                <Link
                  href="/admin"
                  className="font-pixel text-xs bg-[#3A0030] text-[#FFB6D9] px-3 py-1 rounded-full hover:bg-[#5A0048] transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  ADMIN DASHBOARD →
                </Link>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
            {[
              {
                href: `/profile/${displayName}/edit`,
                label: 'CUSTOMIZE MY PAGE',
                symbol: '✎',
                color: 'bg-[#FF4FA3]/20 border-[#FF4FA3] ring-2 ring-[#FF4FA3]/30',
              },
              {
                href: '/scrapbook/create',
                label: 'NEW SCRAPBOOK',
                symbol: '✦',
                color: 'bg-[#FFB6D9]/30 border-[#FF4FA3]',
              },
              {
                href: '/prompts',
                label: 'DAILY PROMPT',
                symbol: '★',
                color: 'bg-[#C9B6FF]/30 border-[#C9B6FF]',
              },
              {
                href: '/confessions',
                label: 'CONFESSIONS',
                symbol: '♡',
                color: 'bg-[#A8DFFF]/30 border-[#A8DFFF]',
              },
              {
                href: '/explore',
                label: 'EXPLORE',
                symbol: '◎',
                color: 'bg-[#FFF0A8]/50 border-[#FFD700]',
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`${action.color} border-2 rounded-xl p-4 text-center transition-all hover:scale-105 hover:shadow-md`}
              >
                <div className="font-pixel text-2xl text-[#FF4FA3] mb-1">{action.symbol}</div>
                <div
                  className="font-pixel text-xs text-[#3A0030]"
                  style={{ fontSize: '14px' }}
                >
                  {action.label}
                </div>
              </Link>
            ))}
          </div>

          {/* Profile link */}
          <div className="mb-6 flex items-center gap-3">
            <Link
              href={`/profile/${displayName}`}
              className="btn-outline-y2k text-xs py-1.5 px-4"
              style={{ fontSize: '12px' }}
            >
              view my profile →
            </Link>
            <Link
              href={`/profile/${displayName}/edit`}
              className="font-pixel text-xs text-[#FF4FA3] hover:underline"
              style={{ fontSize: '12px' }}
            >
              edit profile
            </Link>
          </div>

          <MySpaceClient
            userId={user.id}
            firstPages={firstPageMap}
            scrapbooks={(scrapbooks ?? []).map((sb) => {
              const cover = SCRAPBOOK_COVERS.find((c) => c.id === sb.cover_id)
              return { ...sb, coverGradient: cover?.bg_gradient ?? 'from-pink-200 to-pink-100', coverSymbol: cover?.preview_symbol ?? '✦' }
            })}
            scrapbookCount={scrapbookCount ?? 0}
            confessions={confessions ?? []}
            confessionCount={confessionCount ?? 0}
            favorites={favScrapbooks.map((sb) => {
              const cover = SCRAPBOOK_COVERS.find((c) => c.id === sb.cover_id)
              return { ...sb, coverGradient: cover?.bg_gradient ?? 'from-pink-200 to-pink-100', coverSymbol: cover?.preview_symbol ?? '✦' }
            })}
          />
        </div>
      </main>
    </div>
  )
}
