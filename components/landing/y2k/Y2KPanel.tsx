import type { ReactNode, CSSProperties } from 'react'

/** Animated GIF that swaps to a still frame for people who prefer reduced motion. */
export function Gif({ anim, still, alt = '', w, h, className }: { anim: string; still: string; alt?: string; w: number; h: number; className?: string }) {
  return (
    <picture className={className}>
      <source srcSet={`/y2k/${still}`} media="(prefers-reduced-motion: reduce)" />
      <img src={`/y2k/${anim}`} alt={alt} width={w} height={h} className="y2kh-px" />
    </picture>
  )
}

/* plain <img> on purpose: these are tiny GIFs that must not be re-encoded */
export function Px({ src, w, h, alt = '', className, style }: { src: string; w: number; h: number; alt?: string; className?: string; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/y2k/${src}`} width={w} height={h} alt={alt} className={`y2kh-px ${className ?? ''}`} style={style} />
}

export function Panel({ title, tone = 'pink', id, children, winBtns = false }: { title: ReactNode; tone?: 'pink' | 'blue' | 'lilac' | 'orange' | 'lime'; id?: string; children: ReactNode; winBtns?: boolean }) {
  return (
    <section className="y2kh-panel" aria-labelledby={id}>
      <h2 id={id} className={`y2kh-ttl y2kh-ttl--${tone}`}>
        <span className="y2kh-ttl-text">{title}</span>
        {winBtns && (
          <span className="y2kh-winbtns" aria-hidden="true"><i>_</i><i>□</i><i>×</i></span>
        )}
      </h2>
      {children}
    </section>
  )
}

