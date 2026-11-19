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
      <div className="flex flex-col gap-2 items-end min-w-[120px]">
        <div className="font-nunito text-xs text-[#888] text-right">are you sure?</div>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="font-pixel text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors w-full"
          style={{ fontSize: '9px' }}
        >
          {loading ? '...' : 'yes, delete'}
        </button>
        <button
          onClick={() => setShowConfirmDelete(false)}
          className="font-pixel text-xs border border-[#FFB6D9] text-[#888] px-3 py-1.5 rounded-lg hover:border-[#FF4FA3] transition-colors w-full"
          style={{ fontSize: '9px' }}
        >
          cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 items-end min-w-[120px]">
      {!isApproved ? (
        <button
          onClick={handleApprove}
          disabled={loading}
          className="font-pixel text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors w-full"
          style={{ fontSize: '9px' }}
        >
          {loading ? '...' : 'approve'}
        </button>
      ) : (
        <button
          onClick={handleReject}
          disabled={loading}
          className="font-pixel text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors w-full"
          style={{ fontSize: '9px' }}
        >
          {loading ? '...' : 'unpublish'}
        </button>
      )}
      <button
        onClick={() => setShowConfirmDelete(true)}
        disabled={loading}
        className="font-pixel text-xs border-2 border-red-200 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors w-full"
        style={{ fontSize: '9px' }}
      >
        delete
      </button>
    </div>
  )
}
