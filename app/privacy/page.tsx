import type { Metadata } from 'next'
import Link from 'next/link'
import InfoPage, { InfoCard } from '@/components/site/InfoPage'
import { CONTACT_EMAIL, POLICY_UPDATED } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy Policy — Scrappy',
  description: 'How Scrappy collects, uses and protects your information, including cookies and Google AdSense advertising, and the choices you have.',
}

export default function PrivacyPage() {
  const contact = CONTACT_EMAIL ? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> : <Link href="/contact">our contact page</Link>
  return (
    <InfoPage
      eyebrow="LEGAL"
      title="Privacy Policy"
      updated={POLICY_UPDATED}
      intro={<>This policy explains what information Scrappy (scrappy.fun) collects, why we collect it, how cookies and advertising work on the site, and the choices you have.</>}
    >
      <InfoCard title="1. Information we collect">
        <h3>Information you give us</h3>
        <ul>
          <li><strong>Account details:</strong> your email address, username, password (stored securely by our authentication provider, never in plain text) and optional display name.</li>
          <li><strong>Profile content:</strong> your photo, bio, mood, profile layout and colours, Top 8, profile song link and other details you choose to add.</li>
          <li><strong>Things you create:</strong> scrapbooks, photos you upload, photobooth strips you save, answers to daily prompts, exchange answers and confessions.</li>
          <li><strong>Messages to us:</strong> anything you send through the contact form, including your name and email if you provide them.</li>
        </ul>
        <h3>Information collected automatically</h3>
        <ul>
          <li><strong>Usage and device data:</strong> pages visited, approximate time on the site, browser type, device type and IP address, collected by our hosting provider and advertising partners.</li>
          <li><strong>Activity status:</strong> when you are signed in, we record when you were last active so your profile can show &ldquo;Online Now&rdquo; or your last login.</li>
        </ul>
        <p>Photobooth pictures are processed in your browser. They are only uploaded to our servers if you choose to save them.</p>
      </InfoCard>

      <InfoCard title="2. How we use your information" color="#7C4DDB">
        <ul>
          <li>To create and run your account and show the content you choose to publish.</li>
          <li>To keep Scrappy safe, including moderating confessions and comments, and preventing spam and abuse.</li>
          <li>To send you service messages, such as sign-up confirmation or password reset emails.</li>
          <li>To understand how the site is used so we can fix bugs and improve features.</li>
          <li>To show advertising that helps keep Scrappy free (see section 4).</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </InfoCard>

      <InfoCard title="3. Cookies and local storage" color="#1D9BF0">
        <p>Cookies are small text files stored by your browser. Scrappy uses:</p>
        <ul>
          <li><strong>Essential cookies</strong> that keep you signed in (set by our authentication provider, Supabase). The site won&apos;t work properly without them.</li>
          <li><strong>Local storage</strong> in your browser to remember things like scrapbook drafts and whether you&apos;ve seen the intro screen. This stays on your device.</li>
          <li><strong>Advertising cookies</strong> set by Google and other ad partners, explained below.</li>
        </ul>
        <p>You can block or delete cookies in your browser settings. If you block essential cookies, you may not be able to sign in.</p>
      </InfoCard>

      <InfoCard title="4. Advertising (Google AdSense)" color="#F59E0B">
        <p>Scrappy uses Google AdSense to show ads. This is how it works:</p>
        <ul>
          <li>Third-party vendors, including Google, use cookies to serve ads based on your previous visits to Scrappy and to other websites.</li>
          <li>Google&apos;s use of advertising cookies lets Google and its partners serve ads to you based on your visits to Scrappy and/or other sites on the internet.</li>
          <li>
            You can opt out of personalized advertising by visiting Google&apos;s{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Ads Settings</a>. You can also opt out of some third-party
            vendors&apos; use of cookies for personalized advertising at <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>
            {' '}(or <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer">youronlinechoices.eu</a> in Europe).
          </li>
          <li>
            Other third-party ad vendors or ad networks may also serve ads on Scrappy and use cookies. You can visit their websites to opt out of
            personalized advertising where they offer it. Learn more about how Google uses information from sites that use its services at{' '}
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/partner-sites</a>.
          </li>
        </ul>
        <p>
          If you visit from the European Economic Area, the UK or Switzerland, you&apos;ll be asked for consent before personalized ads or
          non-essential cookies are used, and you can change your choice at any time. If you opt out, you may still see ads, but they won&apos;t be
          personalized.
        </p>
      </InfoCard>

      <InfoCard title="5. Embedded content and other services" color="#14B8A6">
        <p>
          Some pages include content from other sites, such as a YouTube or Spotify player on a profile page. These services may collect data
          and set cookies under their own privacy policies when you interact with them. We also rely on these service providers:
        </p>
        <ul>
          <li><strong>Supabase:</strong> accounts, database and file storage.</li>
          <li><strong>Vercel:</strong> website hosting.</li>
          <li><strong>Google AdSense:</strong> advertising.</li>
          <li><strong>Google Fonts:</strong> loading the site&apos;s fonts.</li>
        </ul>
      </InfoCard>

      <InfoCard title="6. What other people can see" color="#EC4899">
        <ul>
          <li>Your username, profile page and anything you mark as <strong>public</strong> can be seen by anyone.</li>
          <li><strong>Link-only</strong> scrapbooks can be seen by anyone who has the link. <strong>Private</strong> ones are only visible to you.</li>
          <li>Confessions are shown without your name. We keep the link to your account so we can moderate abuse.</li>
        </ul>
      </InfoCard>

      <InfoCard title="7. Keeping, deleting and your rights" color="#7C4DDB">
        <p>
          We keep your information while your account is active. You can edit or delete your scrapbooks, comments and profile details at any
          time. To delete your whole account and its content, or to request a copy of your data, contact us at {contact}. We&apos;ll respond within 30 days.
        </p>
        <p>
          Depending on where you live (for example the EU/UK under the GDPR, California under the CCPA/CPRA, or the Philippines under the Data Privacy Act),
          you may have rights to access, correct, delete or move your data, and to object to certain uses. Contact us to use any of these rights.
        </p>
      </InfoCard>

      <InfoCard title="8. Children" color="#F43F5E">
        <p>
          Scrappy is not intended for children under 13, and you must be at least 13 years old (or the minimum age in your country) to create an
          account. If you believe a child under 13 has given us personal information, please contact us and we&apos;ll delete it.
        </p>
      </InfoCard>

      <InfoCard title="9. Security" color="#1D9BF0">
        <p>
          We use HTTPS encryption, secure authentication and database access rules so that only you can change your own content. No method of
          storing data online is 100% secure, so please use a strong, unique password.
        </p>
      </InfoCard>

      <InfoCard title="10. Changes and contact" color="#FF4FA3">
        <p>
          We may update this policy from time to time. When we do, we&apos;ll change the &ldquo;last updated&rdquo; date at the top, and we&apos;ll notify
          signed-in users of significant changes. Questions about privacy? Reach us at {contact}.
        </p>
      </InfoCard>
    </InfoPage>
  )
}
