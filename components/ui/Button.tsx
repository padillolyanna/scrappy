import type { ReactNode, ButtonHTMLAttributes } from 'react'
import Link from 'next/link'

type Variant = 'pink' | 'chrome' | 'purple' | 'outline'
type Size = 'default' | 'hero'

interface BaseProps {
  variant?: Variant
  size?: Size
  children: ReactNode
  className?: string
}

type ButtonProps = BaseProps & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>
type LinkProps = BaseProps & { href: string; target?: string; rel?: string }
type Props = ButtonProps | LinkProps

const VARIANT_STYLES: Record<Variant, string> = {
  pink:    'bg-gradient-to-b from-[#FF7AC0] to-[#E0007A] text-white shadow-[inset_0_3px_0_rgba(255,255,255,.55),0_5px_0_var(--ink)]',
  chrome:  'bg-gradient-to-b from-white to-[#E6E9F2] text-[var(--ink)] shadow-[inset_0_3px_0_rgba(255,255,255,.55),0_5px_0_var(--ink)]',
  purple:  'bg-gradient-to-b from-[#B98CFF] to-[#6A3FD0] text-white shadow-[inset_0_3px_0_rgba(255,255,255,.55),0_5px_0_var(--ink)]',
  outline: 'bg-white text-[var(--ink)] shadow-[inset_0_3px_0_rgba(255,255,255,.55),0_5px_0_var(--ink)]',
}

const SIZE_STYLES: Record<Size, string> = {
  default: 'min-h-[44px] px-6 text-[16px]',
  hero:    'min-h-[54px] px-8 text-[18px]',
}

const BASE = 'inline-flex items-center justify-center rounded-full border-[3px] border-[var(--ink)] font-[Nunito,sans-serif] font-black leading-none select-none cursor-pointer transition-[transform,box-shadow] duration-100 no-underline active:translate-y-[3px] active:shadow-[inset_0_3px_0_rgba(255,255,255,.55),0_2px_0_var(--ink)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--pink)]'

function classes(variant: Variant = 'pink', size: Size = 'default', extra?: string) {
  return [BASE, VARIANT_STYLES[variant], SIZE_STYLES[size], extra].filter(Boolean).join(' ')
}

export default function Button(props: Props) {
  const { variant = 'pink', size = 'default', children, className } = props

  if ('href' in props && props.href) {
    const { href, target, rel } = props as LinkProps
    return (
      <Link href={href} target={target} rel={rel} className={classes(variant, size, className)}>
        {children}
      </Link>
    )
  }

  const { href: _href, ...rest } = props as ButtonProps & { href?: undefined }
  return (
    <button {...rest} className={classes(variant, size, className)}>
      {children}
    </button>
  )
}
