import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50" data-y2k-off>
      <nav className="bg-gray-900 text-white px-5 py-2.5 flex items-center gap-1 text-xs font-mono">
        <span className="text-gray-500 tracking-widest mr-4">SCRAPPY/ADMIN</span>
        <Link href="/admin" className="px-3 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors">
          Dashboard
        </Link>
        <Link href="/admin/confessions" className="px-3 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors">
          Confessions
        </Link>
        <Link href="/admin/hangouts" className="px-3 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors">
          Hangouts
        </Link>
        <Link href="/admin/hangouts/announcements" className="px-3 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors">
          Announcements
        </Link>
        <div className="ml-auto">
          <Link href="/" className="px-3 py-1 text-gray-500 hover:text-gray-300 rounded transition-colors">
            View site ↗
          </Link>
        </div>
      </nav>
      {children}
    </div>
  )
}
