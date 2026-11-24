import type { Metadata } from 'next'
import Link from 'next/link'
import InfoPage, { InfoCard } from '@/components/site/InfoPage'
import { CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Community Guidelines — Scrappy',
  description: 'The community guidelines for Scrappy: how to treat others, what content is allowed, how moderation works and how to report something.',
}

export default function CommunityGuidelinesPage() {
  const contact = CONTACT_EMAIL
    ? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    : <Link href="/contact">our contact page</Link>

  return (
    <InfoPage
      eyebrow="COMMUNITY"
      title="Community Guidelines"
      updated="November 24, 2026"
      intro={
        <>
          Scrappy is a creative community built on kindness, nostalgia and self-expression. These guidelines exist so
          everyone can feel safe and welcome here. They apply to everything you post: scrapbooks, confessions, comments,
          profile pages, exchange answers and messages.
        </>
      }
    >
      <InfoCard title="1. Be kind and respectful">
        <p>
          Scrappy is not a place for cruelty. Treat every person the way you&apos;d want to be treated in your own little
          corner of the internet.
        </p>
        <ul>
          <li>No bullying, harassment, intimidation or targeted attacks against any person or group.</li>
          <li>No hate speech based on race, ethnicity, nationality, religion, gender, gender identity, sexual orientation, disability, age, or any other protected characteristic.</li>
          <li>No threats of real-world harm, doxxing (sharing someone&apos;s private information), or coordinated pile-ons.</li>
          <li>Disagreement is fine. Personal attacks are not.</li>
        </ul>
      </InfoCard>

      <InfoCard title="2. Keep it appropriate" color="#7C4DDB">
        <p>
          Scrappy is used by teenagers and adults alike. All public content must be safe for a general audience.
        </p>
        <ul>
          <li>No sexually explicit images, text or links. This includes nudity, suggestive imagery involving minors, and non-consensual intimate content.</li>
          <li>No graphic violence, gore or imagery intended to shock or disturb.</li>
          <li>No promotion of self-harm, suicide or dangerous behaviour. If you are struggling, please reach out to a trusted adult or a crisis line.</li>
          <li>No content that exploits, endangers or sexualises children in any way. Such content will be removed immediately and reported to the relevant authorities.</li>
        </ul>
      </InfoCard>

      <InfoCard title="3. Respect copyright and privacy" color="#1D9BF0">
        <ul>
          <li>Only upload photos, artwork, music and other media that you own or have permission to use. Uploading someone else&apos;s copyrighted work without permission is not allowed.</li>
          <li>Do not share another person&apos;s private information — their address, phone number, real name (if they prefer to be anonymous), financial details or similar — without their explicit consent.</li>
          <li>Do not impersonate another person, brand or public figure in a way that is misleading or harmful.</li>
          <li>If your copyright has been infringed, see our <Link href="/copyright">Copyright page</Link>.</li>
        </ul>
      </InfoCard>

      <InfoCard title="4. Confession Wall rules" color="#F43F5E">
        <p>
          The Confession Wall is for small, anonymous thoughts shared in good faith. All confessions go through
          moderation before they appear publicly.
        </p>
        <ul>
          <li>Confessions must follow all the rules above.</li>
          <li>Do not use the Confession Wall to target, name or harass a specific person.</li>
          <li>Do not post other people&apos;s private information — even anonymously.</li>
          <li>Spam, advertising and identical repeated submissions will be rejected.</li>
          <li>Confessions are anonymous on the wall but are linked to your account internally for moderation purposes.</li>
        </ul>
      </InfoCard>

      <InfoCard title="5. Scrapbook Exchange" color="#14B8A6">
        <ul>
          <li>Answer questions honestly and in the spirit of connection.</li>
          <li>Exchange answers are shared with your exchange partner only, unless you both choose to publish them.</li>
          <li>Do not use exchanges to harass, manipulate or trick another person.</li>
          <li>Keep exchange content appropriate — the same content rules apply inside an exchange.</li>
        </ul>
      </InfoCard>

      <InfoCard title="6. Spam and authenticity" color="#F59E0B">
        <ul>
          <li>No spam, advertising or promotional content unless Scrappy has specifically invited it.</li>
          <li>Do not create multiple accounts to get around a ban, inflate votes, or game the Highlights system.</li>
          <li>Automated bots and scraping tools are not permitted without written permission.</li>
          <li>Fake reviews, fake engagement or artificially generated activity designed to mislead others is not allowed.</li>
        </ul>
      </InfoCard>

      <InfoCard title="7. How moderation works" color="#EC4899">
        <p>
          Our moderation process works as follows:
        </p>
        <ul>
          <li><strong>Confessions</strong> are held for review before they appear on the wall. Confessions that break these guidelines are rejected without notice.</li>
          <li><strong>Reports</strong> on scrapbooks, profiles or comments are reviewed by our moderation team. We aim to respond within 48 hours.</li>
          <li><strong>Content removal:</strong> we may remove any content that violates these guidelines, even if it has not been reported, at our sole discretion.</li>
          <li><strong>Account suspension:</strong> repeated or serious violations may result in a temporary or permanent ban.</li>
          <li><strong>Illegal content</strong> (including child exploitation material) is reported to the relevant authorities immediately.</li>
        </ul>
        <p>
          We try to be fair. If you believe a decision was a mistake, you can appeal by contacting us.
        </p>
      </InfoCard>

      <InfoCard title="8. How to report something" color="#7C4DDB">
        <p>
          If you see content that breaks these guidelines:
        </p>
        <ul>
          <li>Use the <strong>Report</strong> button on the scrapbook, profile or confession page.</li>
          <li>Or send us a message at {contact}. Include the link to the content and a brief description of the problem.</li>
        </ul>
        <p>
          Please report in good faith. False reports or using the report system to harass someone will result in account action.
        </p>
        <p>
          For copyright concerns, see our <Link href="/copyright">Copyright page</Link>.
          For privacy requests, see our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </InfoCard>

      <InfoCard title="9. Changes to these guidelines" color="#FF4FA3">
        <p>
          We may update these guidelines as the community grows. Significant changes will be announced to signed-in users.
          Continued use of Scrappy after an update means you accept the revised guidelines.
        </p>
        <p>
          Questions? Reach us at {contact} or through the <Link href="/contact">contact page</Link>.
        </p>
      </InfoCard>
    </InfoPage>
  )
}
