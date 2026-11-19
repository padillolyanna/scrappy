'use client'

interface MarqueeProps {
  text?: string
  className?: string
  bg?: string
  textColor?: string
}

const DEFAULT_TEXT = '✦ make memories ✦ collect answers ✦ decorate your pages ✦ leave a little piece of yourself ✦ your corner of the internet ✦ sparkle and shine ✦ be yourself ✦ '

export default function Marquee({
  text = DEFAULT_TEXT,
  className = '',
  bg = 'bg-[#FF4FA3]',
  textColor = 'text-white',
}: MarqueeProps) {
  const doubled = text + text

  return (
    <div className={`overflow-hidden py-2 ${bg} ${className}`}>
      <div className="flex whitespace-nowrap" style={{ animation: 'marquee 25s linear infinite' }}>
        <span className={`font-pixel text-sm tracking-widest ${textColor} inline-block`} style={{ fontSize: '16px' }}>
          {doubled}
        </span>
        <span className={`font-pixel text-sm tracking-widest ${textColor} inline-block`} style={{ fontSize: '16px' }}>
          {doubled}
        </span>
      </div>
    </div>
  )
}
