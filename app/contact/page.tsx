import type { Metadata } from 'next'
import Link from 'next/link'
import InfoPage, { InfoCard } from '@/components/site/InfoPage'
import { CONTACT_EMAIL } from '@/lib/site'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Scrappy',
  description: 'Get in touch with the Scrappy team: questions, bug reports, content reports, privacy requests and advertising.',
}

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="SAY HI"
      title="Contact us"
      intro={<>Questions, ideas, something broken, or something that shouldn&apos;t be on Scrappy? Send us a note and a real person will read it.</>}
    >
      <InfoCard title="Send a message">
        <ContactForm />
      </InfoCard>

      {CONTACT_EMAIL && (
        <InfoCard title="Prefer email?" color="#1D9BF0">
          <p>
            Write to us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </InfoCard>
      )}

      <InfoCard title="Before you write" color="#7C4DDB">
        <ul>
          <li><strong>Reporting content:</strong> include the link to the scrapbook, profile or confession, and what&apos;s wrong with it.</li>
          <li><strong>Deleting your data:</strong> send the message while signed in, or from the email on your account, so we can confirm it&apos;s you.</li>
          <li><strong>Bugs:</strong> tell us what you were doing, and which device and browser you use.</li>
        </ul>
        <p>
          You might also find your answer on the <Link href="/about">About page</Link> or in our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </InfoCard>
    </InfoPage>
  )
}
