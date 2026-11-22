export const instant = false

import { requireAdmin } from '@/lib/admin'
import { connection } from 'next/server'
import AdminHangoutForm from './AdminHangoutForm'

export default async function AdminHangoutsPage() {
  await connection()
  await requireAdmin()

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Create a hangout</h1>
      <div className="bg-white rounded border border-gray-200 p-6">
        <AdminHangoutForm />
      </div>
    </div>
  )
}
