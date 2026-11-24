'use client'

import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import Y2KSiteHeader from './Y2KSiteHeader'

const AUTH_PATHS = ['/auth/login', '/auth/signup', '/auth/callback']

function NavbarInner() {
  const pathname = usePathname()
  if (AUTH_PATHS.some(p => pathname.startsWith(p))) return null
  if (pathname === '/') return null
  return <Y2KSiteHeader pathname={pathname} />
}

// null fallback: static pages start with no bar, then it fades in after hydration.
// Previously the fallback was <Y2KSiteHeader /> which caused a double-header on the
// homepage (server renders the fallback, client replaces it with null — brief flash).
export default function NavbarWrapper() {
  return (
    <Suspense fallback={null}>
      <NavbarInner />
    </Suspense>
  )
}
