import Link from 'next/link'

/** Always-visible links to the site's info pages (shown inside every page window). */
export default function LegalBar() {
  return (
    <nav aria-label="site information" className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-4 py-3 border-t-2 border-[#2B0A2E]/15 font-nunito text-sm text-[#7A5A70]">
      <Link href="/about" className="hover:text-[#FF4FA3] underline-offset-2 hover:underline">About</Link>
      <Link href="/contact" className="hover:text-[#FF4FA3] underline-offset-2 hover:underline">Contact</Link>
      <Link href="/privacy" className="hover:text-[#FF4FA3] underline-offset-2 hover:underline">Privacy Policy</Link>
      <span>© 2026 Scrappy</span>
    </nav>
  )
}
