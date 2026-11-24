import type { Metadata } from 'next'
import Link from 'next/link'
import InfoPage, { InfoCard } from '@/components/site/InfoPage'
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Copyright — Scrappy',
  description: 'How to report copyright infringement on Scrappy: our DMCA takedown process, what to include in a report, and how we handle intellectual property claims.',
}

export default function CopyrightPage() {
  const contact = CONTACT_EMAIL
    ? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    : <Link href="/contact">our contact page</Link>

  return (
    <InfoPage
      eyebrow="LEGAL"
      title="Copyright"
      updated="November 24, 2026"
      intro={
        <>
          Scrappy respects intellectual property rights. If you believe content on {SITE_URL} infringes your copyright or
          the copyright of someone you represent, this page explains how to report it.
        </>
      }
    >
      <InfoCard title="1. What is copyright infringement?">
        <p>
          Copyright infringement occurs when someone reproduces, distributes, displays or uses a creative work —
          a photograph, illustration, music, writing, design or other original content — without permission from the
          copyright owner.
        </p>
        <p>
          On Scrappy, this could include:
        </p>
        <ul>
          <li>A photograph you took that someone has uploaded to their scrapbook without your permission.</li>
          <li>Your artwork or illustration used as a decoration or sticker without authorisation.</li>
          <li>Your written text copied into someone else&apos;s scrapbook page.</li>
          <li>Your music or audio used without a licence.</li>
          <li>An entire scrapbook design that closely copies your original design.</li>
        </ul>
      </InfoCard>

      <InfoCard title="2. Before you submit a report" color="#7C4DDB">
        <p>
          Please check the following before filing a copyright report:
        </p>
        <ul>
          <li><strong>Are you the copyright owner, or authorised to act on their behalf?</strong> You must have the right to make a claim.</li>
          <li><strong>Is this actually your work?</strong> Common stock photos, public domain images and freely licensed content (Creative Commons) are not infringements unless specific licence terms are violated.</li>
          <li><strong>Could this be fair use?</strong> Commentary, parody and transformative works may be protected.</li>
        </ul>
        <p>
          If you are unsure, consider consulting a legal professional before submitting a claim.
        </p>
      </InfoCard>

      <InfoCard title="3. How to submit a copyright report" color="#1D9BF0">
        <p>
          Send an email or contact form message to {contact} with the subject line <strong>Copyright Report</strong>.
          Include all of the following:
        </p>
        <ol>
          <li><strong>Your name and contact information</strong> (email address and, if applicable, phone number).</li>
          <li><strong>A description of the original work</strong> you own or represent, including where it can be found online if applicable.</li>
          <li>
            <strong>The URL of the infringing content</strong> on Scrappy — the full link to the specific scrapbook,
            profile page or other content that contains the alleged infringement.
          </li>
          <li>
            <strong>A statement that you have a good-faith belief</strong> that the use of the material in the manner complained of is not authorised by the copyright owner, its agent, or the law.
          </li>
          <li>
            <strong>A statement of accuracy</strong>: &ldquo;I declare under penalty of perjury that the information in this report is accurate and that I am the copyright owner or authorised to act on behalf of the copyright owner.&rdquo;
          </li>
          <li><strong>Your physical or electronic signature.</strong></li>
        </ol>
        <p>
          Incomplete reports may be returned for more information before action can be taken.
        </p>
      </InfoCard>

      <InfoCard title="4. What happens after you report" color="#F59E0B">
        <ol>
          <li>We review your report, usually within 2–5 business days.</li>
          <li>If the report is complete and we find the content to be in violation, we will remove it and notify the user who posted it.</li>
          <li>That user may submit a counter-notice if they believe the removal was an error.</li>
          <li>If a valid counter-notice is filed and you do not inform us of legal action within 10–14 business days, we may restore the content.</li>
          <li>Accounts that repeatedly infringe copyright will be suspended.</li>
        </ol>
      </InfoCard>

      <InfoCard title="5. Counter-notices" color="#14B8A6">
        <p>
          If your content was removed in response to a copyright report and you believe the removal was a mistake or
          misidentification, you may submit a counter-notice to {contact} with the subject <strong>Copyright Counter-Notice</strong>.
        </p>
        <p>A valid counter-notice must include:</p>
        <ol>
          <li>Your name and contact information.</li>
          <li>Identification of the content that was removed and the URL where it appeared.</li>
          <li>A statement under penalty of perjury that you have a good-faith belief that the material was removed by mistake or misidentification.</li>
          <li>Your consent to the jurisdiction of the courts of the Philippines for any claim arising from this matter.</li>
          <li>Your physical or electronic signature.</li>
        </ol>
      </InfoCard>

      <InfoCard title="6. Reporting other intellectual property issues" color="#F43F5E">
        <p>
          For reports of trademark infringement, impersonation or other intellectual property concerns that are not
          covered above, contact us at {contact} with as much detail as possible.
        </p>
        <p>
          For general content concerns (harassment, inappropriate content, community guideline violations),
          see our <Link href="/community-guidelines">Community Guidelines</Link> and use the report button on the relevant content page.
        </p>
      </InfoCard>

      <InfoCard title="7. Scrappy's own intellectual property" color="#EC4899">
        <p>
          The Scrappy name, logo, design system, original graphics, sticker assets and site code are the property of
          Scrappy. You may not reproduce, copy or use them without written permission. If you&apos;d like to partner,
          feature or write about Scrappy, please get in touch at {contact}.
        </p>
      </InfoCard>
    </InfoPage>
  )
}
