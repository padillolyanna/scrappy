import type { Metadata } from 'next'
import Link from 'next/link'
import InfoPage, { InfoCard } from '@/components/site/InfoPage'

export const metadata: Metadata = {
  title: 'About Scrappy — your little corner of the internet',
  description:
    'Scrappy is a free digital scrapbook community with a Y2K soul: decorate scrapbook pages, take photobooth strips, answer daily prompts, swap notes with friends and customize your own profile page.',
}

const FEATURES = [
  { title: 'Digital scrapbooks', href: '/scrapbook/create', color: '#FF4FA3', text: 'Build notebook-style pages with photos, frames, stickers, gems, washi tape, doodles and handwritten notes. Drag, resize and rotate anything, then flip through it like a real spiral notebook.' },
  { title: 'Photobooth', href: '/photobooth', color: '#1D9BF0', text: 'Snap photo strips with your webcam or phone camera, then decorate them like a purikura machine: textured backgrounds, magazine covers, frames, rhinestones and stamps. Download and keep them.' },
  { title: 'Daily prompt', href: '/prompts', color: '#7C4DDB', text: 'A new question every day, like "what song takes you back to childhood?". Answer it, read what others said, and add your favourite answers to a scrapbook.' },
  { title: 'Confession wall', href: '/confessions', color: '#F43F5E', text: 'Share small anonymous thoughts and react to others. Confessions are moderated, and no names are shown.' },
  { title: 'Scrapbook exchange', href: '/exchange', color: '#14B8A6', text: 'Pass notes the old-school way: answer the same questions as a friend or a stranger, reveal your answers together, and turn the swap into a friendship page.' },
  { title: 'Your own page', href: '/my-space', color: '#F59E0B', text: 'A customizable profile in the spirit of early social sites: pick a layout, background, glitter name, Top 8, a profile song and a comment wall.' },
]

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="ABOUT SCRAPPY"
      title="About Scrappy"
      intro={
        <>
          Scrappy is a free digital scrapbook community, a little corner of the internet where you can keep memories, decorate pages and
          meet people who love the same nostalgic, handmade feeling as you do.
        </>
      }
    >
      <InfoCard title="Why we made Scrappy">
        <p>
          The early internet felt personal. People decorated their pages, collected stickers and glitter graphics, filled in quizzes for their
          friends, and kept online diaries that felt like their own room. Today most apps feel the same and disappear into a feed.
        </p>
        <p>
          Scrappy brings back that cosy, creative side of the web. Everything you make here is yours to arrange, rearrange and keep, whether
          that&apos;s a scrapbook about your summer, a photo strip with your best friends, or a profile page that looks exactly the way you want.
        </p>
      </InfoCard>

      <InfoCard title="What you can do on Scrappy" color="#1D9BF0">
        <div className="grid sm:grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <Link key={f.title} href={f.href} className="block rounded-xl border-2 p-3 no-underline hover:-translate-y-0.5 transition-transform" style={{ borderColor: f.color, textDecoration: 'none' }}>
              <div className="font-nunito font-extrabold text-base" style={{ color: f.color }}>{f.title} →</div>
              <div className="font-nunito text-[15px] text-[#3A2A35] leading-snug mt-1">{f.text}</div>
            </Link>
          ))}
        </div>
      </InfoCard>

      <InfoCard title="How it works" color="#7C4DDB">
        <ol>
          <li><strong>Make a free account</strong> with your email. You can browse public scrapbooks, highlights and confessions without one.</li>
          <li><strong>Pick a cover and a template</strong>, or start from a blank notebook.</li>
          <li><strong>Decorate</strong> with photos, frames, stickers, text and backgrounds, all fully editable later.</li>
          <li><strong>Choose who can see it</strong>: public, link-only, or private.</li>
          <li><strong>Share it</strong> with friends or keep it just for you.</li>
        </ol>
      </InfoCard>

      <InfoCard title="Our community values" color="#14B8A6">
        <ul>
          <li><strong>Be kind.</strong> No bullying, hate or harassment, including in comments and confessions.</li>
          <li><strong>Keep it safe.</strong> Don&apos;t post anyone&apos;s private information, and only upload photos you have the right to share.</li>
          <li><strong>Make it yours.</strong> Original art and personal memories are what make Scrappy special.</li>
        </ul>
        <p>Content that breaks these values can be removed, and accounts can be suspended. You can report anything from its page or through our <Link href="/contact">contact page</Link>.</p>
      </InfoCard>

      <InfoCard title="Is Scrappy free?" color="#F59E0B">
        <p>
          Yes. Scrappy is free to use. To keep it running we may show advertising, served by Google AdSense. You can read how that works,
          including cookies and your choices, in our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </InfoCard>

      <p>
        Questions, ideas or found a bug? We&apos;d love to hear from you on the <Link href="/contact">contact page</Link>.
      </p>
    </InfoPage>
  )
}
