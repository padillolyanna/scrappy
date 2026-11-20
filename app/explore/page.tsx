'use client'

import { useState, useEffect, useCallback } from 'react'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { SCRAPBOOK_COVERS } from '@/lib/types'
import AuthModal from '@/components/ui/AuthModal'
import { useAuth } from '@/lib/useAuth'

type SortOption = 'newest' | 'popular' | 'views'

interface Scrapbook {
  id: string
  title: string
  cover_id: string
  like_count: number
  view_count: number
  created_at: string
  user_id: string
  profiles: { username: string } | null
}

function ScrapbookCard({ sb, userId, onAuthNeeded }: {
  sb: Scrapbook
  userId: string | null
  onAuthNeeded: () => void
}) {
  const cover = SCRAPBOOK_COVERS.find((c) => c.id === sb.cover_id)
  const username = sb.profiles?.username ?? 'unknown'

  return (
    <div className="group relative bg-white rounded-xl border-2 border-[#FFB6D9]/40 overflow-hidden hover:border-[#FF4FA3] hover:shadow-lg transition-all">
      <Link href={`/scrapbook/${sb.id}`} className="block">
        <div
          className={`h-32 bg-gradient-to-br ${cover?.bg_gradient ?? 'from-pink-200 to-pink-100'} flex items-center justify-center relative`}
        >
          <span className="text-4xl font-pixel text-[#3A0030]/25">
            {cover?.preview_symbol ?? '✦'}
          </span>
        </div>
        <div className="p-3">
          <div
            className="font-caveat text-base text-[#3A0030] truncate"
            style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}
          >
            {sb.title || 'untitled'}
          </div>
          <div className="font-nunito text-xs text-[#FF4FA3] font-bold">@{username}</div>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-nunito text-xs text-[#888]">♡ {sb.like_count || 0}</span>
            <span className="font-nunito text-xs text-[#888]">◎ {sb.view_count || 0}</span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default function ExplorePage() {
  const { user } = useAuth()
  const [scrapbooks, setScrapbooks] = useState<Scrapbook[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 24

  const fetchScrapbooks = useCallback(async (reset = false) => {
    setLoading(true)
    const supabase = createClient()
    const currentPage = reset ? 0 : page

    let query = supabase
      .from('scrapbooks')
      .select('id, title, cover_id, like_count, view_count, created_at, user_id, profiles!inner(username)')
      .eq('is_public', true)
      .range(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE - 1)

    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`)
    }

    if (sort === 'popular') {
      query = query.order('like_count', { ascending: false })
    } else if (sort === 'views') {
      query = query.order('view_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (!error && data) {
      const mapped = data.map((sb) => ({
        ...sb,
        profiles: Array.isArray(sb.profiles) ? sb.profiles[0] : sb.profiles,
      })) as Scrapbook[]
      if (reset) {
        setScrapbooks(mapped)
        setPage(0)
      } else {
        setScrapbooks((prev) => [...prev, ...mapped])
      }
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoading(false)
  }, [search, sort, page])

  // Fetch on mount and when sort changes
  useEffect(() => {
    fetchScrapbooks(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchScrapbooks(true)
  }

  function loadMore() {
    setPage((p) => p + 1)
    fetchScrapbooks(false)
  }

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Liked' },
    { value: 'views', label: 'Most Viewed' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div
              className="font-pixel text-xs text-[#FF4FA3] mb-2 tracking-widest"
              style={{ fontSize: '12px' }}
            >
              ✦ COMMUNITY SCRAPBOOKS ✦
            </div>
            <h1
              className="font-pacifico text-5xl text-[#3A0030]"
              style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(28px, 6vw, 48px)' }}
            >
              explore scrappy
            </h1>
            <p
              className="font-caveat text-xl text-[#888] mt-2"
              style={{ fontFamily: 'Caveat, cursive' }}
            >
              discover scrapbooks from the community ✦
            </p>
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search scrapbooks..."
                className="input-y2k flex-1"
              />
              <button type="submit" className="btn-y2k px-4">
                search
              </button>
            </form>
            <div className="flex gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`font-pixel text-xs px-3 py-2 rounded-full border-2 transition-all ${
                    sort === opt.value
                      ? 'bg-[#3A0030] border-[#3A0030] text-white'
                      : 'border-[#FFB6D9] text-[#3A0030] bg-white hover:border-[#FF4FA3]'
                  }`}
                  style={{ fontSize: '12px' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading && scrapbooks.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="font-caveat text-2xl text-[#888]"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                loading scrapbooks...
              </div>
            </div>
          ) : scrapbooks.length === 0 ? (
            <div className="text-center py-16">
              <div className="font-pixel text-4xl text-[#FFB6D9] mb-4">◎</div>
              <div
                className="font-caveat text-2xl text-[#888]"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                no scrapbooks found ✦
              </div>
              <Link href="/scrapbook/create" className="btn-y2k mt-4 inline-block">
                be the first! create yours
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {scrapbooks.map((sb) => (
                  <ScrapbookCard
                    key={sb.id}
                    sb={sb}
                    userId={user?.id ?? null}
                    onAuthNeeded={() => setShowAuthModal(true)}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="btn-outline-y2k"
                  >
                    {loading ? 'loading...' : 'load more ✦'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link href="/scrapbook/create" className="btn-y2k px-8 py-3 text-sm">
              ✦ create your own scrapbook
            </Link>
          </div>
        </div>
      </main>
      <Footer />

      {showAuthModal && (
        <AuthModal reason="favorite" onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  )
}
