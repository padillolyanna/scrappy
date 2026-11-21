import type { Metadata } from 'next'
import Link from 'next/link'
import InfoPage, { InfoCard } from '@/components/site/InfoPage'
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms of Service — Scrappy',
  description: 'The rules for using Scrappy — what you can do, what you cannot post, and how we handle your content.',
}

export default function TosPage() {
  const contact = CONTACT_EMAIL
    ? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    : <Link href="/contact">our contact page</Link>

  return (
    <InfoPage
      eyebrow="LEGAL"
      title="Terms of Service"
      updated="November 21, 2026"
      intro={
        <>
          By creating an account or using Scrappy ({SITE_URL}) you agree to these terms. Please read
          them — they explain what you can do, what you cannot post, and how we handle your content.
        </>
      }
    >
      <InfoCard title="1. Who can use Scrappy">
        <p>
          You must be at least <strong>13 years old</strong> to create an account. If you are under
          18, you confirm that a parent or guardian has reviewed and agreed to these terms on your
          behalf. Scrappy is not directed at children under 13 and we do not knowingly collect
          personal information from them. If you believe a child under 13 has an account, contact
          us and we will delete it.
        </p>
      </InfoCard>

      <InfoCard title="2. Your account" color="#7C4DDB">
        <ul>
          <li>You are responsible for keeping your password secure and for all activity under your account.</li>
          <li>Your username must not impersonate another person or brand.</li>
          <li>You may only have one account. Creating accounts to evade a ban is not allowed.</li>
          <li>We may suspend or terminate accounts that violate these terms.</li>
        </ul>
      </InfoCard>

      <InfoCard title="3. Content you post" color="#1D9BF0">
        <p>
          You keep ownership of content you create. By posting it on Scrappy you grant us a
          non-exclusive, royalty-free licence to store, display and distribute it on the platform so
          the service can function.
        </p>
        <p>You are responsible for everything you post. You must not post content that:</p>
        <ul>
          <li>is illegal or promotes illegal activity</li>
          <li>infringes the copyright or intellectual property of others</li>
          <li>
            is hateful, discriminatory, or derogatory based on race, ethnicity, religion,
            disability, age, nationality, gender, gender identity, sexual orientation, or any other
            protected characteristic
          </li>
          <li>harasses, bullies, or threatens any person or group</li>
          <li>promotes or glorifies self-harm, suicide, or violence</li>
          <li>is sexually explicit or pornographic</li>
          <li>contains private information about another person without their consent</li>
          <li>is misleading, deceptive, or constitutes spam</li>
          <li>contains malware or harmful code</li>
        </ul>
        <p>
          Violations may result in content removal and account suspension. Illegal content
          (including child exploitation material) will be reported to the relevant authorities.
        </p>
      </InfoCard>

      <InfoCard title="4. Confessions wall" color="#F59E0B">
        <p>
          Confessions are anonymous in display but are linked to your account internally so we can
          moderate abuse. All confessions are reviewed before they appear on the wall. Confessions
          that violate Section 3 will be rejected without notice. Repeated violations will result
          in account termination.
        </p>
      </InfoCard>

      <InfoCard title="5. Uploaded images and media" color="#14B8A6">
        <p>
          You may only upload images and media that you own or have permission to use. Uploading
          copyrighted material, nudity, or graphic violence is not allowed. We reserve the right to
          remove any media that violates these terms.
        </p>
      </InfoCard>

      <InfoCard title="6. Advertising" color="#EC4899">
        <p>
          Scrappy displays ads served by Google AdSense to keep the service free. By using Scrappy
          you acknowledge that ads may be shown. See our{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link> for details on how
          advertising cookies work and how to opt out of personalized ads.
        </p>
      </InfoCard>

      <InfoCard title="7. Intellectual property" color="#7C4DDB">
        <p>
          The Scrappy name, logo, design, and original code are our property. You may not copy,
          reproduce, or use them without permission. If you believe content on Scrappy infringes
          your copyright, contact us at {contact} with details of the alleged infringement.
        </p>
      </InfoCard>

      <InfoCard title="8. Disclaimer and limitation of liability" color="#F43F5E">
        <p>
          Scrappy is provided <strong>"as is"</strong> without warranty of any kind. We are not
          responsible for user-generated content or for any loss or damage arising from your use
          of the service. Our total liability to you for any claim is limited to the greater of
          $100 USD or the amount you paid us in the past 12 months (which for a free service is $0).
        </p>
      </InfoCard>

      <InfoCard title="9. Changes and termination" color="#1D9BF0">
        <p>
          We may update these terms at any time. Continued use of Scrappy after an update means
          you accept the new terms. We may suspend or shut down Scrappy at any time. We may
          terminate your account if you violate these terms.
        </p>
      </InfoCard>

      <InfoCard title="10. Governing law and contact" color="#FF4FA3">
        <p>
          These terms are governed by the laws of the Philippines. Any disputes will be resolved
          in the courts of the Philippines. Questions? Reach us at {contact}.
        </p>
      </InfoCard>
    </InfoPage>
  )
}
