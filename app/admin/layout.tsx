import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#f9fafb', overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      <nav style={{
        background: '#111827', color: '#fff',
        padding: '0 20px', height: '40px',
        display: 'flex', alignItems: 'center', gap: '4px',
        fontSize: '12px', fontFamily: 'monospace', flexShrink: 0,
      }}>
        <span style={{ color: '#6b7280', letterSpacing: '0.1em', marginRight: '16px' }}>SCRAPPY/ADMIN</span>
        <Link href="/admin" className="adm-nav-link">Dashboard</Link>
        <Link href="/admin/confessions" className="adm-nav-link">Confessions</Link>
        <Link href="/admin/hangouts" className="adm-nav-link">Hangouts</Link>
        <Link href="/admin/hangouts/announcements" className="adm-nav-link">Announcements</Link>
        <div style={{ marginLeft: 'auto' }}>
          <Link href="/" style={{ padding: '4px 10px', color: '#6b7280', textDecoration: 'none', borderRadius: '4px' }}>
            View site ↗
          </Link>
        </div>
      </nav>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )
}
