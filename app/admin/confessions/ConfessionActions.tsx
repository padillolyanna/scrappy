'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

interface Props {
  id: string
  isApproved: boolean
}

export default function ConfessionActions({ id, isApproved }: Props) {
  const [loading, setLoading] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('confessions').update({ is_approved: true }).eq('id', id)
    router.refresh()
    setLoading(false)
  }

  async function handleReject() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('confessions').update({ is_approved: false }).eq('id', id)
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('confessions').delete().eq('id', id)
    router.refresh()
    setLoading(false)
    setShowConfirmDelete(false)
  }

  if (showConfirmDelete) {
    return (
      <div className="flex flex-col gap-1.5 items-end min-w-[110px]">
        <div className="text-xs text-gray-500">are you sure?</div>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 disabled:opacity-50 transition-colors w-full"
        >
          {loading ? '...' : 'yes, delete'}
        </button>
        <button
          onClick={() => setShowConfirmDelete(false)}
          className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors w-full"
        >
          cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 items-end min-w-[110px]">
      {!isApproved ? (
        <button
          onClick={handleApprove}
          disabled={loading}
          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50 transition-colors w-full"
        >
          {loading ? '...' : 'approve'}
        </button>
      ) : (
        <button
          onClick={handleReject}
          disabled={loading}
          className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded hover:bg-amber-600 disabled:opacity-50 transition-colors w-full"
        >
          {loading ? '...' : 'unpublish'}
        </button>
      )}
      <button
        onClick={() => setShowConfirmDelete(true)}
        disabled={loading}
        className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded hover:bg-red-50 hover:border-red-400 disabled:opacity-50 transition-colors w-full"
      >
        delete
      </button>
    </div>
  )
}
