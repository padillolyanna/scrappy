import type { Metadata } from 'next'
import Link from 'next/link'
import InfoPage, { InfoCard } from '@/components/site/InfoPage'
import { CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Cookie Policy — Scrappy',
  description: 'How Scrappy uses cookies and similar technologies, what each type does, and how you can manage your preferences.',
}

export default function CookiePolicyPage() {
  const contact = CONTACT_EMAIL
    ? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    : <Link href="/contact">our contact page</Link>

  return (
    <InfoPage
      eyebrow="LEGAL"
      title="Cookie Policy"
      updated="November 24, 2026"
      intro={
        <>
          This page explains what cookies are, how Scrappy uses them, and what choices you have. For the full picture
          of how we handle your data, see our <Link href="/privacy">Privacy Policy</Link>.
        </>
      }
    >
      <InfoCard title="1. What are cookies?">
        <p>
          Cookies are small text files stored by your browser when you visit a website. They let the website remember
          things like whether you&apos;re signed in, your preferences, and how you use the site. Cookies are very common
          and are used by almost every website you visit.
        </p>
        <p>
          Scrappy also uses <strong>local storage</strong>, a similar technology built into your browser, to remember
          things like scrapbook drafts you&apos;re working on. Local storage stays on your device and is not sent to our servers.
        </p>
      </InfoCard>

      <InfoCard title="2. Essential cookies" color="#14B8A6">
        <p>
          <strong>These cookies are required for Scrappy to work.</strong> Without them, you cannot sign in or use
          authenticated features. We do not need your consent to set these cookies.
        </p>
        <table className="w-full text-sm border-collapse mt-2">
          <thead>
            <tr className="border-b border-[#2B0A2E]/20">
              <th className="text-left pb-2 font-nunito font-bold">Cookie</th>
              <th className="text-left pb-2 font-nunito font-bold">Provider</th>
              <th className="text-left pb-2 font-nunito font-bold">Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#2B0A2E]/10">
              <td className="py-2 pr-4 font-mono text-xs">sb-*</td>
              <td className="py-2 pr-4">Supabase</td>
              <td className="py-2">Keeps you signed in between pages and browser sessions.</td>
            </tr>
            <tr className="border-b border-[#2B0A2E]/10">
              <td className="py-2 pr-4 font-mono text-xs">scrappy_gate</td>
              <td className="py-2 pr-4">Scrappy</td>
              <td className="py-2">Grants administrator access to the admin panel (admin accounts only).</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-sm text-[#5A3A50]">
          <strong>Local storage (not cookies):</strong> we also use local storage to remember your scrapbook drafts,
          your cookie consent choice, and whether you&apos;ve seen certain intro screens. This data stays entirely on your device.
        </p>
      </InfoCard>

      <InfoCard title="3. Analytics cookies" color="#7C4DDB">
        <p>
          Scrappy may use analytics technologies to understand how the site is used — which pages are visited, how long
          people stay, and what features are most popular. This helps us fix bugs and improve the experience.
        </p>
        <p>
          At present, analytics are handled through our hosting provider (Vercel) which may log basic usage signals.
          We do not currently use a separate third-party analytics service (such as Google Analytics). If we add one in
          the future, we will update this policy and ask for your consent where required.
        </p>
      </InfoCard>

      <InfoCard title="4. Advertising cookies (Google AdSense)" color="#F59E0B">
        <p>
          Scrappy uses Google AdSense to display advertising on some pages. This helps keep Scrappy free.
          When ads are shown, Google and its advertising partners may set cookies in your browser to:
        </p>
        <ul>
          <li>Show you ads relevant to your interests based on your browsing activity across the web.</li>
          <li>Measure whether an ad was seen and whether it was effective.</li>
          <li>Prevent the same ad from appearing too many times.</li>
          <li>Detect click fraud and protect advertisers.</li>
        </ul>
        <p>
          Google&apos;s advertising cookies may include <code>__gads</code>, <code>__gpi</code>, <code>IDE</code>,
          <code>ANID</code>, and others. These are set by Google domains (<code>doubleclick.net</code>,{' '}
          <code>googlesyndication.com</code>) and are governed by{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.
        </p>
        <p>
          <strong>How to opt out of personalized ads:</strong>
        </p>
        <ul>
          <li>Visit <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google&apos;s Ad Settings</a>.</li>
          <li>Use the <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance opt-out</a>.</li>
          <li>Use the <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer">Your Online Choices tool</a> (Europe).</li>
          <li>Or install the <a href="https://support.google.com/ads/answer/7395996" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.</li>
        </ul>
        <p>
          If you opt out, you may still see ads on Scrappy, but they will not be personalised to your browsing history.
        </p>
      </InfoCard>

      <InfoCard title="5. Third-party cookies from embedded content" color="#1D9BF0">
        <p>
          Some Scrappy profile pages may include embedded content from external services, such as a YouTube video or
          Spotify player. When you interact with embedded content, the third-party provider may set cookies under their
          own privacy policy. We do not control these cookies.
        </p>
        <p>
          Providers may include YouTube (Google), Spotify and others, depending on what users choose to embed on their
          profile pages.
        </p>
      </InfoCard>

      <InfoCard title="6. How to manage cookies" color="#F43F5E">
        <p>You have several options for managing cookies:</p>
        <ul>
          <li>
            <strong>Cookie banner:</strong> when you first visit Scrappy you are shown a cookie banner where you can
            accept or decline optional (advertising) cookies. You can change your choice at any time by clearing your
            browser&apos;s local storage for scrappy.fun and refreshing the page.
          </li>
          <li>
            <strong>Browser settings:</strong> all modern browsers let you view, block and delete cookies.
            See your browser&apos;s help documentation for instructions:
            <ul className="mt-1">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Firefox</a></li>
              <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Edge</a></li>
            </ul>
          </li>
        </ul>
        <p>
          <strong>Important:</strong> blocking essential cookies means you will not be able to sign in to Scrappy or
          use account features.
        </p>
      </InfoCard>

      <InfoCard title="7. Changes and contact" color="#EC4899">
        <p>
          We may update this Cookie Policy when we add new features or advertising technologies. We&apos;ll update the
          &ldquo;last updated&rdquo; date at the top and notify signed-in users of significant changes.
        </p>
        <p>
          Questions about cookies or our privacy practices? Contact us at {contact} or see our full{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </InfoCard>
    </InfoPage>
  )
}
