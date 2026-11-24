'use client'

import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import Navbar from './Navbar'

const AUTH_PATHS = ['/auth/login', '/auth/signup', '/auth/callback']

function NavbarInner() {
  const pathname = usePathname()
  if (AUTH_PATHS.some(p => pathname.startsWith(p))) return null
  // the homepage draws its own Y2K header + tab bar (logged in and out)
  if (pathname === '/') return null
  return <Navbar />
}

export default function NavbarWrapper() {
  return (
    <Suspense fallback={<Navbar />}>
      <NavbarInner />
    </Suspense>
  )
}
