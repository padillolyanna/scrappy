
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase-server'
import { SCRAPBOOK_COVERS } from '@/lib/types'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ScrapbookActions from '@/components/scrapbook/ScrapbookActions'
import NotebookViewer from '@/components/notebook/NotebookViewer'
import { loadPages } from '@/lib/notebookStore'
import { SITE_URL } from '@/lib/site'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: sb } = await supabase
    .from('scrapbooks')
    .select('title, is_public, user_id, profiles!inner(username)')
    .eq('id', id)
    .single()

  if (!sb || !sb.is_public) {
    return { title: 'Scrapbook — Scrappy', robots: { index: false } }
  }

  const profileData = sb.profiles as { username: string } | { username: string }[] | null
  const username = Array.isArray(profileData) ? profileData[0]?.username : profileData?.username

  const title = `${sb.title} — by @${username ?? 'unknown'} on Scrappy`
  const description = `A digital scrapbook by @${username ?? 'unknown'} on Scrappy — the Y2K-inspired community for memories and creativity.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/scrapbook/${id}`,
      siteName: 'Scrappy',
    },
    alternates: { canonical: `${SITE_URL}/scrapbook/${id}` },
  }
}

export default async function ScrapbookViewPage({ params }: PageProps<'/scrapbook/[id]'>) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: scrapbook } = await supabase
    .from('scrapbooks')
    .select('id, title, cover_id, is_public, view_count, like_count, created_at, user_id')
    .eq('id', id)
    .single()

  if (!scrapbook) return notFound()

  if (!scrapbook.is_public && scrapbook.user_id !== user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="font-pixel text-5xl text-[#FFB6D9] mb-4">●</div>
          <h2
            className="font-pacifico text-2xl text-[#3A0030] mb-2"
            style={{ fontFamily: 'Pacifico, cursive' }}
          >
            private scrapbook
          </h2>
          <p
            className="font-caveat text-lg text-[#888]"
            style={{ fontFamily: 'Caveat, cursive' }}
          >
            this one is just for them ✦
          </p>
          <Link href="/explore" className="btn-y2k mt-4 inline-block">
            explore public scrapbooks
          </Link>
        </div>
      </div>
    )
  }

  const [{ data: creator }, { data: answers }, pages] = await Promise.all([
    supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', scrapbook.user_id)
      .single(),
    supabase
      .from('answers')
      .select('question_text, answer_text')
      .eq('scrapbook_id', id)
      .eq('is_public', true)
      .order('created_at', { ascending: true }),
    loadPages(supabase, id),
  ])

  let userVoted = false
  let userFavorited = false
  if (user) {
    const [{ data: vote }, { data: fav }] = await Promise.all([
      supabase
        .from('scrapbook_votes')
        .select('id')
        .eq('scrapbook_id', id)
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('favorites')
        .select('id')
        .eq('scrapbook_id', id)
        .eq('user_id', user.id)
        .maybeSingle(),
    ])
    userVoted = !!vote
    userFavorited = !!fav
  }

  // Increment view count
  await supabase
    .from('scrapbooks')
    .update({ view_count: (scrapbook.view_count || 0) + 1 })
    .eq('id', id)

  const cover = SCRAPBOOK_COVERS.find((c) => c.id === scrapbook.cover_id)
  const isOwner = user?.id === scrapbook.user_id
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://scrappy.fun'}/scrapbook/${id}`

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-8 px-4">
        <div className={`${pages.length ? "max-w-4xl" : "max-w-2xl"} mx-auto`}>
          <Link
            href="/explore"
            className="flex items-center gap-1 text-[#888] hover:text-[#FF4FA3] transition-colors font-nunito text-sm mb-4"
          >
            <span>←</span> explore
          </Link>

          {isOwner && (
            <div className="bg-[#FF4FA3]/10 border-2 border-[#FF4FA3]/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
              <span className="text-xl animate-sparkle text-[#FF4FA3]">✦</span>
              <div>
                <div
                  className="font-pixel text-xs text-[#D4006E]"
                  style={{ fontSize: '12px' }}
                >
                  YOUR SCRAPBOOK
                </div>
                <div className="font-nunito text-sm text-[#888]">
                  Your scrapbook is live. Share this link with friends.
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <Link href={`/scrapbook/${id}/edit`} className="btn-bevel text-xs !px-3 !py-1">
                  ✎ edit pages
                </Link>
                <Link
                  href="/scrapbook/create"
                  className="btn-y2k text-xs py-1 px-4"
                  style={{ fontSize: '12px' }}
                >
                  new ✦
                </Link>
              </div>
            </div>
          )}

          {pages.length > 0 ? (
            <div>
              <div className="text-center mb-4">
                <h1 className="font-chango text-3xl text-[#FF4FA3]" style={{ WebkitTextStroke: '1px #2B0A2E', textShadow: '2px 2px 0 #fff, 3px 3px 0 rgba(43,10,46,.35)' }}>
                  {scrapbook.title || 'my scrapbook'}
                </h1>
                <div className="font-caveat text-lg text-[#888]">
                  by @{creator?.username ?? 'anonymous'} ✦{' '}
                  {new Date(scrapbook.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <NotebookViewer pages={pages} />
            </div>
          ) : (
          <div className="bg-[#FFF8ED] rounded-2xl border-2 border-[#FFB6D9]/50 shadow-xl overflow-hidden">
            <div
              className={`bg-gradient-to-br ${cover?.bg_gradient ?? 'from-pink-200 via-pink-100 to-pink-50'} p-8 text-center relative`}
            >
              <div className="text-7xl font-pixel text-[#3A0030]/20 mb-3">
                {cover?.preview_symbol ?? '✦'}
              </div>
              <h1
                className="font-pacifico text-3xl text-[#3A0030]"
                style={{ fontFamily: 'Pacifico, cursive', fontSize: '32px' }}
              >
                {scrapbook.title || 'my scrapbook'}
              </h1>
              <div
                className="font-caveat text-[#888] mt-1"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                by @{creator?.username ?? 'anonymous'} ✦{' '}
                {new Date(scrapbook.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="absolute top-3 right-3 text-sm animate-sparkle text-[#3A0030]/30">
                ✦
              </div>
              <div className="absolute bottom-3 left-3 text-sm opacity-30 text-[#3A0030]">
                ★ ★ ★
              </div>
            </div>

            <div className="p-8 space-y-4">
              {answers && answers.length > 0 ? (
                answers.map((ans, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-5 shadow-sm border border-[#FFB6D9]/30"
                  >
                    <div
                      className="font-pixel text-xs text-[#888] mb-2 uppercase"
                      style={{ fontSize: '12px' }}
                    >
                      {ans.question_text}
                    </div>
                    <div
                      className="font-caveat text-[#3A0030]"
                      style={{ fontFamily: 'Caveat, cursive', fontSize: '22px' }}
                    >
                      {ans.answer_text}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div
                    className="font-caveat text-[#888] text-xl"
                    style={{ fontFamily: 'Caveat, cursive' }}
                  >
                    this scrapbook has no answers yet ✦
                  </div>
                </div>
              )}
              <div className="text-center pt-4 border-t border-[#FFB6D9]/20">
                <div
                  className="font-pixel text-xs text-[#888]"
                  style={{ fontSize: '12px' }}
                >
                  ✦ made with SCRAPPY ✦
                </div>
                <Link
                  href="/scrapbook/create"
                  className="mt-3 btn-outline-y2k text-xs inline-block"
                  style={{ fontSize: '12px' }}
                >
                  make your own scrapbook
                </Link>
              </div>
            </div>
          </div>
          )}

          {creator && (
            <div className="mt-4 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full bg-[#FF4FA3] flex items-center justify-center text-white font-pixel flex-shrink-0"
                style={{ fontSize: '12px' }}
              >
                {creator.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div
                  className="font-pixel text-xs text-[#3A0030]"
                  style={{ fontSize: '12px' }}
                >
                  @{creator.username}
                </div>
                <Link
                  href={`/profile/${creator.username}`}
                  className="font-nunito text-xs text-[#FF4FA3] hover:underline"
                >
                  view profile →
                </Link>
              </div>
            </div>
          )}

          <ScrapbookActions
            scrapbookId={id}
            userId={user?.id ?? null}
            isOwner={isOwner}
            initialLikeCount={scrapbook.like_count || 0}
            initialVoted={userVoted}
            initialFavorited={userFavorited}
            shareUrl={shareUrl}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
