
import { connection } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import ConfessionActions from './ConfessionActions'

export default async function AdminConfessionsPage({
  searchParams,
}: PageProps<'/admin/confessions'>) {
  await connection()
  await requireAdmin()
  const supabase = await createClient()

  const params = await searchParams
  const filter = (params?.filter as string) ?? 'all'

  let query = supabase
    .from('confessions')
    .select('id, content, category, is_approved, is_anonymous, guest_name, reaction_count, created_at')
    .order('created_at', { ascending: false })

  if (filter === 'pending') query = query.eq('is_approved', false)
  if (filter === 'approved') query = query.eq('is_approved', true)

  const { data: confessions } = await query.limit(50)

  const { count: pendingCount } = await supabase
    .from('confessions')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', false)

  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: `Pending (${pendingCount ?? 0})` },
    { id: 'approved', label: 'Approved' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Confessions</h1>
        {(pendingCount ?? 0) > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded px-3 py-1.5 text-xs text-amber-700">
            {pendingCount} pending review
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-5">
        {FILTERS.map((f) => (
          <Link
            key={f.id}
            href={`/admin/confessions?filter=${f.id}`}
            className={`text-xs px-3 py-1.5 rounded border transition-colors ${
              filter === f.id
                ? 'bg-gray-900 border-gray-900 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-900'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {confessions?.length ? (
        <div className="space-y-2">
          {confessions.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded border p-4 ${!c.is_approved ? 'border-amber-200' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{c.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                      c.is_approved
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      {c.is_approved ? 'approved' : 'pending'}
                    </span>
                    {c.guest_name ? (
                      <span className="text-xs text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">guest: {c.guest_name}</span>
                    ) : (
                      <span className="text-xs text-gray-400">{c.is_anonymous ? 'anonymous member' : 'public'}</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">"{c.content}"</p>
                  <div className="mt-1.5 text-xs text-gray-400">{c.reaction_count} reactions</div>
                </div>
                <ConfessionActions id={c.id} isApproved={c.is_approved} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-sm text-gray-400">
          No confessions {filter !== 'all' ? `with status "${filter}"` : ''} yet.
        </div>
      )}
    </div>
  )
}
