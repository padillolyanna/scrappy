import type { ReactNode } from 'react'
import { assetThumb } from '@/lib/assetLibrary'
import type { Cover } from '@/lib/exchange'

/* The visual pieces of the exchange notebook: a spiral-bound cover and lined pages. */

export function NotebookCover({ cover, title, sub, sticker, size = 'md' }: { cover: Cover; title: string; sub?: string; sticker?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`xnb-cover xnb-cover--${cover} xnb-cover--${size}`}>
      <span className="xnb-rings" aria-hidden="true" />
      <div className="xnb-label">
        <b>{title}</b>
        {sub && <small>{sub}</small>}
      </div>
      {sticker && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="xnb-cover-sticker" src={assetThumb(sticker)} alt="" width={48} height={48} />
      )}
      <span className="xnb-elastic" aria-hidden="true" />
    </div>
  )
}

export function NotebookPage({ children, tape, className = '', corner }: { children: ReactNode; tape?: 'pink' | 'blue' | 'yellow' | 'mint'; className?: string; corner?: string }) {
  return (
    <div className={`xnb-page ${className}`}>
      <span className="xnb-spiral" aria-hidden="true" />
      {tape && <span className={`xnb-tape xnb-tape--${tape}`} aria-hidden="true" />}
      {corner && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="xnb-corner" src={assetThumb(corner)} alt="" width={56} height={56} />
      )}
      <div className="xnb-page-in">{children}</div>
    </div>
  )
}
