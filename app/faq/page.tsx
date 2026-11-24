import type { Metadata } from 'next'
import Link from 'next/link'
import InfoPage, { InfoCard } from '@/components/site/InfoPage'
import { CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'FAQ — Scrappy',
  description: 'Frequently asked questions about Scrappy: how to create scrapbooks, privacy settings, the photobooth, Scrapbook Exchange, Journal Hangouts and account management.',
}

function Q({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="font-nunito font-extrabold text-[#3A0030] text-base mb-1">{q}</h3>
      <div className="font-nunito text-[15px] text-[#5A3A50] leading-relaxed">{children}</div>
    </div>
  )
}

export default function FaqPage() {
  const contact = CONTACT_EMAIL
    ? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    : <Link href="/contact">our contact page</Link>

  return (
    <InfoPage
      eyebrow="HELP"
      title="Frequently asked questions"
      intro={
        <>
          Can&apos;t find your answer here? Send us a message on the{' '}
          <Link href="/contact">contact page</Link>.
        </>
      }
    >
      <InfoCard title="Getting started">
        <Q q="What is Scrappy?">
          Scrappy is a free digital scrapbook community inspired by the early-2000s internet. You can create
          notebook-style scrapbook pages decorated with photos, stickers, frames, gems and handwritten text,
          take photobooth strips, answer daily prompts, submit anonymous confessions, swap answers with someone
          through Scrapbook Exchange, and join community Journal Hangout events.
        </Q>
        <Q q="Is Scrappy free?">
          Yes. Scrappy is completely free to use. To help keep it running, some pages may display ads served
          by Google AdSense. See our <Link href="/privacy">Privacy Policy</Link> for details on how advertising works.
        </Q>
        <Q q="Do I need an account to use Scrappy?">
          You can browse public scrapbooks, read the Confession Wall, view Daily Prompts, see Highlights voting, and
          explore profiles without an account. To create a scrapbook, save your work, submit a confession, vote,
          join an exchange or RSVP to a hangout, you need to create a free account.
        </Q>
        <Q q="How old do I need to be to join?">
          You must be at least 13 years old to create an account. If you are under 18, a parent or guardian should
          review our <Link href="/tos">Terms of Service</Link> before you sign up.
        </Q>
      </InfoCard>

      <InfoCard title="Scrapbooks" color="#7C4DDB">
        <Q q="How do I create a scrapbook?">
          Click <strong>Create</strong> in the top navigation, then follow the four steps: pick a cover, choose a
          template (or start blank), decorate your pages with photos, stickers, text and frames, then choose who
          can see it and publish.
        </Q>
        <Q q="Can I make my scrapbook private?">
          Yes. When you publish or edit a scrapbook you can set its visibility to <strong>Public</strong> (anyone
          can see it), <strong>Link only</strong> (only people with the direct link can see it), or{' '}
          <strong>Private</strong> (only you can see it).
        </Q>
        <Q q="Can I edit a scrapbook after I publish it?">
          Yes. Open any scrapbook you own and click the edit button. You can change pages, elements, photos, text
          and visibility at any time.
        </Q>
        <Q q="Can I download my scrapbook?">
          You can take screenshots of individual pages using your device&apos;s screenshot function. A dedicated export
          feature is something we&apos;re considering for the future.
        </Q>
        <Q q="What can I add to a scrapbook page?">
          Photos from your device, text in various handwritten and pixel fonts, decorative stickers, frames, gems,
          washi tape patterns, doodles and coloured backgrounds. Everything can be dragged, resized and rotated.
        </Q>
      </InfoCard>

      <InfoCard title="Photobooth" color="#1D9BF0">
        <Q q="How does the photobooth work?">
          Go to <Link href="/photobooth">Photobooth</Link> and allow camera access. You can choose from several
          strip layouts, then take multiple photos with a countdown timer. After capturing, you can apply filters,
          add decorative frames and stickers, and download your strip to your device.
        </Q>
        <Q q="Can I save my photobooth strips?">
          Yes. If you have an account and are signed in, you can save strips to your Photobooth Gallery. Download
          is available to anyone who creates a strip.
        </Q>
        <Q q="Does the photobooth store my photos on Scrappy's servers?">
          Photos are processed in your browser. They are only uploaded to our servers if you actively choose to
          save a strip to your gallery. See our <Link href="/privacy">Privacy Policy</Link> for details.
        </Q>
      </InfoCard>

      <InfoCard title="Daily Prompt" color="#F59E0B">
        <Q q="What is the Daily Prompt?">
          Every day there&apos;s a new question on the <Link href="/prompts">Daily Prompt</Link> page — something
          like &ldquo;what song takes you back to childhood?&rdquo; or &ldquo;describe a memory using only colours&rdquo;.
          You can answer publicly or anonymously, and read how other people answered.
        </Q>
        <Q q="Can I answer more than once?">
          You can submit one answer per day per prompt. You can edit your answer after submitting.
        </Q>
      </InfoCard>

      <InfoCard title="Confession Wall" color="#F43F5E">
        <Q q="Are confessions really anonymous?">
          Your name is not shown on the Confession Wall. However, confessions are linked to your account internally
          so that our moderation team can review and remove content that breaks our rules. See the{' '}
          <Link href="/community-guidelines">Community Guidelines</Link> for what confessions are allowed.
        </Q>
        <Q q="Why was my confession rejected?">
          All confessions go through moderation before they appear on the wall. Confessions that contain harassment,
          hate speech, explicit content, personal information about others, or other rule violations are rejected
          without notice. See the <Link href="/community-guidelines#confession-wall">Confession Wall rules</Link>.
        </Q>
      </InfoCard>

      <InfoCard title="Scrapbook Exchange" color="#14B8A6">
        <Q q="How does Scrapbook Exchange work?">
          Scrapbook Exchange lets you swap answers to the same set of questions with a friend or a matched stranger.
          You both answer the questions, then reveal your answers together — and Scrappy turns them into a shared
          friendship page you can keep.
        </Q>
        <Q q="How do I start an exchange?">
          Go to <Link href="/exchange">Scrapbook Exchange</Link> and choose a theme. You can invite a specific friend
          by sharing your invite link, or be matched with a stranger.
        </Q>
        <Q q="Can I see my exchange history?">
          Yes. Your completed exchanges appear in your exchange history, accessible from the Exchange page once you
          are signed in.
        </Q>
      </InfoCard>

      <InfoCard title="Journal Hangouts" color="#EC4899">
        <Q q="What are Journal Hangouts?">
          Journal Hangouts are community events hosted by Scrappy — live sessions where people journal together,
          share prompts, work on scrapbook pages or just hang out. They are listed on the{' '}
          <Link href="/hangouts">Journal Hangouts</Link> page.
        </Q>
        <Q q="Are hangouts free to join?">
          Yes, all Scrappy hangouts are free. You need a Scrappy account to RSVP.
        </Q>
        <Q q="What happens after I RSVP?">
          You&apos;ll see the hangout in your confirmed events. When the hangout starts, the meeting link is shown
          on the event page.
        </Q>
      </InfoCard>

      <InfoCard title="Highlights and voting" color="#7C4DDB">
        <Q q="What is Highlights?">
          <Link href="/highlights">Highlights</Link> is Scrappy&apos;s community voting feature. Each voting period
          you can cast one vote per category to celebrate the scrapbooks you love most. Categories include things
          like Most Creative and Most Nostalgic.
        </Q>
        <Q q="How often can I vote?">
          You can cast one vote per category per voting period. Daily categories reset every day; weekly categories
          reset each week.
        </Q>
      </InfoCard>

      <InfoCard title="Account and privacy" color="#F43F5E">
        <Q q="How do I report inappropriate content?">
          Use the <strong>Report</strong> button on any scrapbook, profile or confession page, or send us a message
          at {contact} with the link to the content and a description of the issue. See our{' '}
          <Link href="/community-guidelines">Community Guidelines</Link> for more information.
        </Q>
        <Q q="How do I delete my account?">
          To delete your account and all associated content, contact us at {contact} from the email address linked
          to your account, or send a message through the <Link href="/contact">contact page</Link> while signed in.
          We&apos;ll process deletion requests within 30 days.
        </Q>
        <Q q="Who can see my profile?">
          Your profile page is publicly viewable by default. You can control the visibility of individual scrapbooks.
          Your email address is never shown publicly. See our <Link href="/privacy">Privacy Policy</Link> for full
          details on what other people can see.
        </Q>
        <Q q="How do I report a copyright violation?">
          See our <Link href="/copyright">Copyright page</Link> for instructions on reporting infringement.
        </Q>
      </InfoCard>

      <InfoCard title="Still have a question?" color="#FF4FA3">
        <p>
          If you didn&apos;t find your answer here, we&apos;re happy to help. Send us a message at {contact} or through the{' '}
          <Link href="/contact">contact page</Link>.
        </p>
      </InfoCard>
    </InfoPage>
  )
}
