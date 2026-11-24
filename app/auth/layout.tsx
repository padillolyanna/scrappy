import type { ReactNode } from 'react'

// Login/signup draw their own scrappy.exe window, so the page frame drops its
// title bar and status bar here (see .y2k-bare in globals.css).
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="y2k-bare">{children}</div>
}
