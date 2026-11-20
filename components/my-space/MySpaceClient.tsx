'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

interface Scrapbook {
  id: string
  title: string
  cover_id: string
  is_public: boolean
  created_at: string
  like_count: number
  view_count: number
  coverGradient: string
  coverSymbol: string
}

interface FavScrapbook {
  id: string
  title: string
  cover_id: string
  is_public: boolean
  like_count: number
  coverGradient: string
  coverSymbol: string
  profiles: { username: string }
}

interface Confession {
  id: string
  content: string
  category: string
  is_approved: boolean
  created_at: string
}

interface Props {
  userId: string
  scrapbooks: Scrapbook[]
  scrapbookCount: number
  confessions: Confession[]
  confessionCount: number
  favorites: FavScrapbook[]
}

type Tab = 'scrapbooks' | 'favorites' | 'confessions'

export default function MySpaceClient({
  userId,
  scrapbooks: initialScrapbooks,
  scrapbookCount,
  confessions,
  confessionCount,
  favorites,
}: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('scrapbooks')
  const [scrapbooks, setScrapbooks] = useState(initialScrapbooks)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      return
    }
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('scrapbooks').delete().eq('id', id).eq('user_id', userId)
    setScrapbooks((prev) => prev.filter((s) => s.id !== id))
    setDeletingId(null)
    setConfirmDelete(null)
  }

  async function handleToggleVisibility(id: string, currentlyPublic: boolean) {
    const supabase = createClient()
    await supabase
      .from('scrapbooks')
      .update({ is_public: !currentlyPublic })
      .eq('id', id)
      .eq('user_id', userId)
    setScrapbooks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_public: !currentlyPublic } : s))
    )
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'scrapbooks', label: 'MY SCRAPBOOKS', count: scrapbookCount },
    { key: 'favorites', label: 'FAVORITES', count: favorites.length },
    { key: 'confessions', label: 'CONFESSIONS', count: confessionCount },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-2 mb-6 border-b-2 border-[#FFB6D9]/30 pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`font-pixel text-xs px-4 py-2 rounded-t-xl border-2 transition-all ${
              tab === t.key
                ? 'bg-white border-[#FF4FA3] border-b-white text-[#FF4FA3] -mb-[2px]'
                : 'bg-[#FFB6D9]/10 border-transparent text-[#888] hover:text-[#FF4FA3]'
            }`}
            style={{ fontSize: '12px' }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Scrapbooks tab */}
      {tab === 'scrapbooks' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="font-pixel text-xs text-[#888]" style={{ fontSize: '12px' }}>
              {scrapbooks.length} scrapbook{scrapbooks.length !== 1 ? 's' : ''}
            </div>
            <Link
              href="/scrapbook/create"
              className="btn-y2k text-xs py-1.5 px-4"
              style={{ fontSize: '12px' }}
            >
              + new scrapbook
            </Link>
          </div>

          {scrapbooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scrapbooks.map((sb) => (
                <div
                  key={sb.id}
                  className="bg-white rounded-xl border-2 border-[#FFB6D9]/40 overflow-hidden"
                >
                  <Link href={`/scrapbook/${sb.id}`}>
                    <div
                      className={`h-24 bg-gradient-to-br ${sb.coverGradient} flex items-center justify-center`}
                    >
                      <span className="font-pixel text-2xl text-[#3A0030]/25">{sb.coverSymbol}</span>
                    </div>
                  </Link>
                  <div className="p-3">
                    <div
                      className="font-caveat text-base text-[#3A0030] truncate mb-1"
                      style={{ fontFamily: 'Caveat, cursive', fontSize: '16px' }}
                    >
                      {sb.title || 'untitled'}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`font-pixel text-xs px-2 py-0.5 rounded-full ${
                          sb.is_public
                            ? 'bg-green-100 text-green-700'
                            : 'bg-[#888]/10 text-[#888]'
                        }`}
                        style={{ fontSize: '12px' }}
                      >
                        {sb.is_public ? 'public' : 'private'}
                      </span>
                      <span className="font-nunito text-xs text-[#888]">♡ {sb.like_count || 0}</span>
                      <span className="font-nunito text-xs text-[#888]">◎ {sb.view_count || 0}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Link
                        href={`/scrapbook/${sb.id}`}
                        className="font-pixel text-xs text-[#FF4FA3] hover:underline"
                        style={{ fontSize: '12px' }}
                      >
                        view →
                      </Link>
                      <button
                        onClick={() => handleToggleVisibility(sb.id, sb.is_public)}
                        className="font-pixel text-xs text-[#888] hover:text-[#FF4FA3] transition-colors"
                        style={{ fontSize: '12px' }}
                      >
                        {sb.is_public ? 'make private' : 'make public'}
                      </button>
                      <button
                        onClick={() => handleDelete(sb.id)}
                        disabled={deletingId === sb.id}
                        className={`font-pixel text-xs transition-colors ${
                          confirmDelete === sb.id
                            ? 'text-red-500 hover:text-red-700'
                            : 'text-[#888] hover:text-red-400'
                        }`}
                        style={{ fontSize: '12px' }}
                      >
                        {deletingId === sb.id
                          ? 'deleting...'
                          : confirmDelete === sb.id
                          ? 'confirm delete?'
                          : 'delete'}
                      </button>
                      {confirmDelete === sb.id && (
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="font-pixel text-xs text-[#888] hover:text-[#3A0030] transition-colors"
                          style={{ fontSize: '12px' }}
                        >
                          cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-[#FFB6D9]/30">
              <div className="font-pixel text-4xl text-[#FFB6D9] mb-4">✦</div>
              <div
                className="font-caveat text-xl text-[#888]"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                no scrapbooks yet
              </div>
              <Link href="/scrapbook/create" className="btn-y2k mt-4 inline-block">
                create your first one ✦
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Favorites tab */}
      {tab === 'favorites' && (
        <div>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((sb) => (
                <Link
                  key={sb.id}
                  href={`/scrapbook/${sb.id}`}
                  className="bg-white rounded-xl border-2 border-[#FFB6D9]/40 overflow-hidden hover:border-[#FF4FA3] transition-all group"
                >
                  <div
                    className={`h-24 bg-gradient-to-br ${sb.coverGradient} flex items-center justify-center`}
                  >
                    <span className="font-pixel text-2xl text-[#3A0030]/25">{sb.coverSymbol}</span>
                  </div>
                  <div className="p-3">
                    <div
                      className="font-caveat text-base text-[#3A0030] truncate"
                      style={{ fontFamily: 'Caveat, cursive', fontSize: '16px' }}
                    >
                      {sb.title || 'untitled'}
                    </div>
                    <div className="font-nunito text-xs text-[#FF4FA3] font-bold">
                      @{sb.profiles?.username ?? 'unknown'}
                    </div>
                    <div className="font-nunito text-xs text-[#888] mt-1">♡ {sb.like_count || 0}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-[#FFB6D9]/30">
              <div className="font-pixel text-4xl text-[#FFB6D9] mb-4">★</div>
              <div
                className="font-caveat text-xl text-[#888]"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                no favorites yet
              </div>
              <Link href="/explore" className="btn-outline-y2k mt-4 inline-block">
                explore scrapbooks ✦
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Confessions tab */}
      {tab === 'confessions' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="font-pixel text-xs text-[#888]" style={{ fontSize: '12px' }}>
              {confessionCount} confession{confessionCount !== 1 ? 's' : ''}
            </div>
            <Link
              href="/confessions"
              className="btn-outline-y2k text-xs py-1.5 px-4"
              style={{ fontSize: '12px' }}
            >
              + new confession
            </Link>
          </div>

          {confessions.length > 0 ? (
            <div className="space-y-3">
              {confessions.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border-2 border-[#FFB6D9]/40 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="font-pixel text-xs text-[#888]"
                      style={{ fontSize: '12px' }}
                    >
                      {c.category}
                    </span>
                    <span
                      className={`font-pixel text-xs px-2 py-0.5 rounded-full ${
                        c.is_approved
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                      style={{ fontSize: '12px' }}
                    >
                      {c.is_approved ? 'approved' : 'pending'}
                    </span>
                    <span className="font-nunito text-xs text-[#888] ml-auto">
                      {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="font-caveat text-[#3A0030]" style={{ fontFamily: 'Caveat, cursive', fontSize: '16px' }}>
                    &ldquo;{c.content}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-[#FFB6D9]/30">
              <div className="font-pixel text-4xl text-[#FFB6D9] mb-4">♡</div>
              <div
                className="font-caveat text-xl text-[#888]"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                no confessions yet
              </div>
              <Link href="/confessions" className="btn-outline-y2k mt-4 inline-block">
                post a confession ✦
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
