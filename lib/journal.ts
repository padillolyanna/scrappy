export interface JournalArticle {
  slug: string
  title: string
  description: string
  category: 'scrapbook-ideas' | 'y2k-inspiration' | 'creative-guides' | 'scrappy-guides'
  categoryLabel: string
  readingTime: string
  publishedAt: string
  coverColor: string
  intro: string
  body: string
}

export const JOURNAL_CATEGORIES = {
  'scrapbook-ideas': 'Scrapbook Ideas',
  'y2k-inspiration': 'Y2K Inspiration',
  'creative-guides': 'Creative Guides',
  'scrappy-guides': 'Scrappy Guides',
} as const

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    slug: 'how-to-start-a-digital-scrapbook',
    title: 'How to start a digital scrapbook (even if you think you\'re not creative)',
    description: 'Digital scrapbooking has no rules, no expensive supplies and no ruined pages. Here\'s how to start your first one.',
    category: 'scrapbook-ideas',
    categoryLabel: 'Scrapbook Ideas',
    readingTime: '5 min',
    publishedAt: 'November 20, 2026',
    coverColor: '#FF4FA3',
    intro: 'The hardest part about starting a scrapbook is thinking you need to be artistic. You don\'t. A scrapbook is just a collection of things that matter to you — a photo, a phrase, a colour that reminds you of a specific summer. That\'s it.',
    body: `Digital scrapbooking has one enormous advantage over its paper equivalent: nothing is permanent. You can drag a photo somewhere, change your mind, move it three times, pick a completely different background and still not have used a single piece of tape. This freedom is exactly what makes it a genuinely good creative hobby for anyone, artistic or not.

## Start with a reason, not a template

The best scrapbooks start with a small, specific idea. Not "my life" — that's too big. Try something like:

- **A particular summer** — photos, songs you played on repeat, one vivid memory
- **A person** — a friendship page, a birthday tribute, a portrait of your pet
- **A feeling** — something soft and pink and slow, something sharp and neon and chaotic
- **A list** — your current favourite things, the books you read this year, places you want to go

A narrow starting point makes the first page much easier to fill. You can always expand later.

## Pick your cover and colour palette first

Before you add a single photo, spend a few minutes on the cover. The cover sets the tone for everything that follows. If you pick something soft and floral, you'll find yourself reaching for muted, dreamy photos. If you pick something bold and geometric, you might lean into brighter images and bolder text.

On Scrappy, the cover templates are designed to give you a colour story to follow. Use it. You don't have to match everything exactly, but having a rough palette — two or three main colours — makes the whole scrapbook feel more intentional, even if every element was placed completely by instinct.

## Add your photos before anything else

Place your photos first. Everything else — stickers, text, decorations — exists to support the photos, not compete with them.

A good approach for a first scrapbook page:

1. Add one or two photos you love to the page.
2. Move them until the placement feels balanced (trust your gut here, not any rule about "thirds").
3. Add a text element for a caption, a date, or a one-line memory.
4. Only then add stickers, frames or decorations — in moderation.

Restraint is usually more effective than abundance on the first attempt.

## Don't finish it in one sitting

Scrapbooks are better when they accumulate over time. Work on a page, save it, come back a week later with fresh eyes. You'll often notice one thing that isn't working, change it, and suddenly the whole page clicks.

The goal isn't a perfect, finished object. The goal is a page that, in five years, makes you remember something you'd otherwise have forgotten.

## Start on Scrappy

If you haven't made a scrapbook yet, the fastest way to start is to open a blank page on [Scrappy's scrapbook creator](/scrapbook/create), upload one photo, and add one sentence. That's enough for today.`,
  },
  {
    slug: 'y2k-scrapbook-aesthetic-guide',
    title: 'The Y2K scrapbook aesthetic: a complete visual guide',
    description: 'Everything that makes the early-2000s digital aesthetic so distinctive — and how to bring it into your scrapbook pages.',
    category: 'y2k-inspiration',
    categoryLabel: 'Y2K Inspiration',
    readingTime: '6 min',
    publishedAt: 'November 19, 2026',
    coverColor: '#7C4DDB',
    intro: 'The Y2K aesthetic is having a full comeback, and it\'s not hard to see why. It was the last era of the internet that felt handmade — before algorithms decided what everything should look like.',
    body: `The years between roughly 1998 and 2006 produced a visual language that is immediately recognisable: frosted plastic, holographic everything, tiny butterfly clips, screen-printed fonts on glitter backgrounds, and an almost naive enthusiasm about technology that we don't really have anymore.

Here's what makes it work, and how to use it deliberately in your own scrapbook pages.

## Colour

Y2K colour palettes are almost always either very pastel or very saturated. There isn't much in between.

**Pastel Y2K** leans into pinks, lavenders, baby blues, mint greens and cream. Think frosted nail polish, iridescent lip gloss, early-2000s bedroom walls. This palette feels soft and nostalgic.

**Saturated Y2K** uses hot pink, lime green, electric blue, deep purple and bright orange together without apology. Think magazine covers from 2001, pop star merchandise, the inside of a Claire's store. This palette feels energetic and maximalist.

Both work. The key is committing to one direction rather than trying to mix them randomly.

## Typography

Y2K fonts had personality. The era produced several recognisable type categories:

- **Pixel and bitmap fonts** — small, boxy, designed for small screens
- **Bubble and rounded fonts** — inflated, friendly, almost 3D-looking
- **Handwritten fonts** — written in gel pen, wide and curvy
- **Logo-style display fonts** — dramatic, used for headings, never for body text

On a scrapbook page, you don't need all of these. Pick two: one for headings (dramatic or pixel) and one for notes (handwritten or rounded). Let the contrast do the work.

## Texture and pattern

Y2K scrapbooks were obsessed with texture. Things that look good:

- **Holographic or iridescent effects** — foil, shimmer, that rainbow-on-CD look
- **Plaid and argyle** — especially in pinks and purples
- **Stars and sparkles** — the more the better
- **Transparent and frosted elements** — like the see-through parts of an old flip phone
- **Repeating micro-patterns** — tiny hearts, tiny daisies, tiny cherries on a pastel background

## Photos

The original Y2K scrapbook photo was taken on a cheap digital camera or a disposable film camera. The images were:

- Slightly overexposed or slightly washed out
- Taken very close to the subject
- Not staged — candid, slightly blurry, flash-heavy
- Often printed small and stuck in a cluster

You don't need to replicate the technical imperfections. But photos that feel personal, spontaneous and a little imperfect fit the Y2K aesthetic much better than highly polished portraits.

## What to avoid

A few things that break the aesthetic:
- Ultra-clean, minimal design
- Lots of negative space
- Monochrome palettes
- Perfectly aligned grids
- Professional-looking photography

Y2K scrapbooks were maximalist, crowded and personal. If it feels like too much, you might be close to the right amount.

## Start with one page

The best way to get a feel for this aesthetic is to build one page with the specific intention of making it feel like something from your childhood bedroom wall. Use a pastel or saturated background, pick a pixel or handwritten font, add a cluster of photos and cover the gaps with stars and tiny stickers.

Then adjust from there. The aesthetic will start to feel intuitive once you've made one page you like.`,
  },
  {
    slug: 'photobooth-strip-ideas',
    title: '10 photobooth strip ideas to try with your friends',
    description: 'Creative themes and ideas for your next photobooth session — from Y2K sleepover vibes to colour-coordinated shoots.',
    category: 'creative-guides',
    categoryLabel: 'Creative Guides',
    readingTime: '4 min',
    publishedAt: 'November 18, 2026',
    coverColor: '#1D9BF0',
    intro: 'A photobooth strip with a good theme is so much better than a random collection of photos. Here are ten ideas to try the next time you use Scrappy\'s photobooth.',
    body: `Photobooth strips are small and casual, which is exactly what makes them good. You don't need a plan. But if you go in with even a loose idea, the results are always more interesting than "just take some pictures."

## 1. Colour-coordinated outfits

Pick a colour — hot pink, all black, all white, the most yellow things you own — and dress accordingly. The strip will feel more cohesive without any effort in the actual photo-taking, and it always looks good framed as a Scrappy profile decoration.

## 2. The progression shot

One expression that slowly escalates across four frames. Start neutral. Get progressively happier, sadder, more dramatic, or more absurd. The last frame should be fully committed.

## 3. Seasonal or holiday theme

Match the strip to the time of year — Halloween makeup in October, cosy winter layers in December, sun-washed summer photos in July. You'll appreciate having the dated context in a few years.

## 4. The inside joke

Take photos that only make sense to you and one specific friend. An object that's become a recurring joke. A re-enactment of a specific memory. A reference that no one outside the two of you would understand. These are the strips that will matter most later.

## 5. Pets only

Four consecutive photos of a dog or cat who is visibly unimpressed. Possibly the best use of the photobooth feature.

## 6. Y2K sleepover

Butterfly clips, fluffy pens, face masks, the most 2003 bedding you can find. Film with warm overhead light at night. Apply the warmest filter available. This is the strip for girls' night nostalgia.

## 7. Serious vs. silly

Alternate: one serious face, one completely silly face, back and forth. The contrast across four frames is always funnier than it sounds.

## 8. The growing-up comparison

Take a strip with someone you've known for years, then compare it to an older photo taken in the same style. Even without an old photobooth strip to reference, the comparison is worthwhile.

## 9. The ordinary Tuesday

Just. The. Way. Things. Look. Right. Now. No theme, no coordination, just your face in your room on an ordinary Tuesday. These are often the best strips because they're the most honest.

## 10. Text and poses

Hold up handwritten messages on paper — a quote, a date, the name of a song, an in-joke — across the four frames. It turns the strip into something that explains itself.

---

All of these work in [Scrappy's photobooth](/photobooth). Try a few layouts, pick the frame that fits, and download it. Then stick it in a scrapbook or leave it on your profile where it belongs.`,
  },
  {
    slug: 'how-scrapbook-exchange-works',
    title: 'How Scrapbook Exchange works — and why you should try it',
    description: 'Scrapbook Exchange is Scrappy\'s answer to passing notes in class. Here\'s the full process from start to shared scrapbook.',
    category: 'scrappy-guides',
    categoryLabel: 'Scrappy Guides',
    readingTime: '4 min',
    publishedAt: 'November 17, 2026',
    coverColor: '#14B8A6',
    intro: 'The best thing about Scrapbook Exchange is that it feels nothing like modern social media. You answer questions seriously. Someone else does too. Then you find out what you have in common.',
    body: `Passing notes was a whole form of communication before it got replaced by texting. Scrapbook Exchange is Scrappy's attempt to bring that back — the slowness, the specificity, the small thrill of revealing what someone else wrote in response to the same question.

## How it works

**Step 1: Choose a theme.** Each exchange is built around a set of questions organised around a theme — something like "first memories" or "what summer felt like" or "describe yourself using only colours."

**Step 2: Answer the questions.** You answer your questions privately. Your exchange partner answers theirs. Neither of you can see the other's answers until you both submit.

**Step 3: Send the invite.** You can invite a specific friend by sharing an invite link. Or you can be matched with a stranger who chose the same theme.

**Step 4: Both of you submit.** Once both sides have finished, the reveal is unlocked.

**Step 5: The reveal.** You see your partner's answers next to your own. The questions are the same, so you get a direct comparison — where you overlap, where you diverge, what surprised you.

**Step 6: The shared scrapbook.** Scrappy turns the exchange into a shared scrapbook page that both of you can keep.

## Why it's worth trying

The specific constraint of answering the same questions as someone else produces a kind of conversation you can't replicate by just messaging. The format forces you to commit to an answer before seeing how the other person responded. That commitment changes what you write.

It also works with strangers in a way that most things don't. Because the questions are the same, you're not trying to find things to say — you're just comparing two independent answers to the same thing.

## Tips for a good exchange

- Answer honestly. The comparison is only interesting if both sides are real.
- Don't overthink it. The first instinct is usually the right answer for this kind of question.
- Pick a theme that's specific enough to have an actual answer, not so broad it could mean anything.

If you haven't tried an exchange yet, go to [Scrapbook Exchange](/exchange) and start one. It takes about fifteen minutes and produces something genuinely interesting.`,
  },
  {
    slug: 'organize-digital-scrapbook-themes',
    title: 'Five ways to organise your digital scrapbooks by theme',
    description: 'Moving beyond the "dump everything in one place" approach — five thematic frameworks that make scrapbooks easier to start and more satisfying to keep.',
    category: 'scrapbook-ideas',
    categoryLabel: 'Scrapbook Ideas',
    readingTime: '5 min',
    publishedAt: 'November 15, 2026',
    coverColor: '#F59E0B',
    intro: 'The most common reason people don\'t finish a scrapbook is that they tried to make it about everything at once. A scrapbook with a theme is easier to start, easier to fill and more satisfying to look back on.',
    body: `The question isn't whether to have a theme — it's which kind of theme gives you the most to work with. Here are five approaches that work reliably, and which type of person each one tends to suit.

## 1. The time period

**Best for:** people who have a clear chapter they want to preserve

This is the most traditional approach: a scrapbook for a specific summer, a school year, a holiday, a year of life. The constraint is built in by time — once the period ends, the scrapbook ends.

The advantage is that you know exactly what goes in it and what doesn't. The disadvantage is that you need to do it relatively close to when it happened, while you still have the photos and the memories.

Tips:
- Include one written piece per page — a date, a caption, a single sentence about why this photo matters.
- Don't try to be comprehensive. Pick the moments that actually stick in memory.
- The last page should feel like an ending.

## 2. The person

**Best for:** people who want to give or keep something sentimental

A scrapbook dedicated to a specific person: a best friend, a partner, a family member, a pet. These are some of the best scrapbooks to give as gifts and to keep yourself.

The constraint here is the subject. Everything that goes in should connect to that person — shared photos, inside references, things that capture who they are or what your relationship is.

## 3. The feeling or aesthetic

**Best for:** people who think in images and vibes rather than chronology

Not all scrapbooks need to be documentary. Some of the most interesting ones are purely aesthetic — a collection of images, colours and textures that together express a feeling.

The Y2K aesthetic lends itself particularly well to this. A scrapbook doesn't have to be about a specific summer to feel like a specific summer.

For this type:
- Think about two or three words that describe the feeling you want. That's your brief.
- Find photos, colours and textures that match.
- Text can be minimal or absent — the images do the work.

## 4. The interest

**Best for:** people with one specific thing they want to document

Music. Film. A sport. A creative practice. A niche hobby. A city. A type of architecture. A colour.

An interest-based scrapbook is essentially a visual personal essay on a subject you care about. It doesn't need photos of you at all — though it can include them. The subject is the subject.

This type works well as a first scrapbook because the constraint is so clear. You don't have to decide what goes in — if it's about your subject, it goes in.

## 5. The question

**Best for:** people who like writing and reflection

Pick a question and answer it slowly, one page at a time. "What does home feel like?" "What am I afraid of?" "What do I want to remember about right now?"

Each page is a different response to the same question — a photo, a quote, a memory, a colour. Over time the scrapbook becomes a kind of answer.

This type is personal in a way that the others sometimes aren't. It works particularly well alongside Scrappy's [Daily Prompt](/prompts) — if a prompt resonates, it might be the seed of a scrapbook page.

---

The most important thing about a theme is that it gives you a reason to include each page and a reason to leave things out. Start with the simplest one that fits what you want to remember.`,
  },
]

export function getArticle(slug: string): JournalArticle | undefined {
  return JOURNAL_ARTICLES.find((a) => a.slug === slug)
}

export function getArticlesByCategory(category: JournalArticle['category']): JournalArticle[] {
  return JOURNAL_ARTICLES.filter((a) => a.category === category)
}
