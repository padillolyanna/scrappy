'use client'

import Link from 'next/link'
import PetAvatar from '@/components/pet/PetAvatar'

export default function PetWelcome() {
  return (
    <div className="y2kh-panel y2kh-pet-welcome" aria-label="Welcome from the Scrappy pet">
      <h2 className="y2kh-ttl y2kh-ttl--pink" aria-hidden="true">
        <span className="y2kh-ttl-text">welcome_msg.exe</span>
        <span className="y2kh-winbtns"><i>_</i><i>□</i><i>×</i></span>
      </h2>
      <div className="y2kh-pet-welcome-body">
        <div className="y2kh-pet-welcome-figure" aria-hidden="true">
          <PetAvatar equipped={{}} size={80} mood="happy" animated={false} title="" />
        </div>
        <div className="y2kh-pet-welcome-bubble">
          <p className="y2kh-pet-welcome-text">hi! welcome to scrappy ♡<br /><span>your little corner of the internet awaits.</span></p>
          <div className="y2kh-ctas">
            <Link href="/scrapbook/create" className="y2kh-btn y2kh-btn--pink">Make my scrapbook →</Link>
            <Link href="/explore" className="y2kh-btn y2kh-btn--chrome">Explore</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
