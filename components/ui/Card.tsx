import type { ReactNode, HTMLAttributes } from 'react'

type Shadow = 'ink' | 'pink'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  shadow?: Shadow
  radius?: number
  border?: number
}

export default function Card({ children, shadow = 'ink', radius = 20, border = 2.5, className, style, ...rest }: CardProps) {
  const shadowValue = shadow === 'pink'
    ? '6px 6px 0 rgba(224,0,122,0.35)'
    : `4px 6px 0 var(--ink)`

  return (
    <div
      {...rest}
      className={className}
      style={{
        background: 'white',
        border: `${border}px solid var(--ink)`,
        borderRadius: radius,
        boxShadow: shadowValue,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
