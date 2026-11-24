export const instant = false

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import ProfileLayout, { type MiniProfile } from '@/components/profile/ProfileLayout'
import { AddToTop8Button, ShareProfileButton } from '@/components/profile/ProfileClient'
import { sanitizeExtras, sanitizeStyle } from '@/lib/profileStyle'
import { SITE_URL } from '@/lib/site'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, bio')
    .eq('username', username)
    .single()

  if (!profile) return { title: 'Profile — Scrappy' }

  const name = profile.display_name || `@${profile.username}`
  const title = `${name} — Scrappy`
  const description = profile.bio
    ? `${profile.bio.slice(0, 150)} — view ${name}'s scrapbooks on Scrappy.`
    : `View @${profile.username}'s profile and scrapbooks on Scrappy, the Y2K-inspired digital scrapbook community.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `${SITE_URL}/profile/${profile.username}`,
      siteName: 'Scrappy',
    },
    alternates: { canonical: `${SITE_URL}/profile/${profile.username}` },
  }
}

const ONLINE_WINDOW_MS = 5 * 60 * 1000

function isOnline(lastSeen: string | null) {
  return !!lastSeen && Date.now() - new Date(lastSeen).getTime() < ONLINE_WINDOW_MS
}

export default async function ProfilePage({ params }: PageProps<'/profile/[username]'>) {
  const { username } = await params
  const supabase = await createClient()
  const {
    data: { user: viewer },
  } = await supabase.auth.getUser()

  // select('*') so the page still works before the profile migration is applied
  const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).single()
  if (!profile) return notFound()

  const style = sanitizeStyle(profile.profile_style)
  const extras = sanitizeExtras(profile.profile_extras)
  const isOwner = viewer?.id === profile.id

  const [{ data: scrapbooks }, { data: friends }] = await Promise.all([
    supabase
      .from('scrapbooks')
      .select('id, title, cover_id, like_count')
      .eq('user_id', profile.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(12),
    extras.top8.length
      ? supabase.from('profiles').select('id, username, display_name, avatar_url').in('id', extras.top8)
      : Promise.resolve({ data: [] as MiniProfile[] }),
  ])

  const top8 = extras.top8
    .map((id) => (friends ?? []).find((f) => f.id === id))
    .filter((f): f is MiniProfile => !!f)
  const online = isOnline(profile.last_seen_at)

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {isOwner && (
          <div className="flex items-center justify-between gap-2 flex-wrap px-4 py-2 bg-[#FFF0A8] border-b-2 border-[#2B0A2E]">
            <span className="font-pixel text-lg text-[#2B0A2E]">✦ this is your page — make it yours!</span>
            <div className="flex gap-2">
              <Link href={`/profile/${profile.username}/edit?tab=look`} className="btn-bevel text-xs !px-3 !py-1">✎ customize my page</Link>
              <Link href={`/profile/${profile.username}/edit`} className="btn-outline-y2k text-xs !px-3 !py-1">edit info</Link>
            </div>
          </div>
        )}
        <ProfileLayout
          profile={profile}
          style={style}
          extras={extras}
          scrapbooks={scrapbooks ?? []}
          top8={top8}
          online={online || isOwner}
          contactSlot={
            <>
              {!isOwner && <AddToTop8Button targetId={profile.id} viewerId={viewer?.id ?? null} />}
              <ShareProfileButton />
            </>
          }
        />
      </main>
      <Footer />
    </div>
  )
}
