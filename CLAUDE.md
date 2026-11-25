# Scrappy — Claude Code Design Contract

This file is the single source of truth for Scrappy's frontend architecture and approved design. Every AI-assisted session must read and follow it. Changes that contradict this file without explicit user instruction are regressions.

---

## 1. Project Identity

**Scrappy** is a Y2K-aesthetic social scrapbook community at `scrappy.fun`. The design language is unambiguously 2000s internet: pink, sparkly, pixel fonts, candy buttons, window chrome, diagonal backgrounds with floating hearts and stars.

**Stack:** Next.js 16 App Router · TypeScript · Tailwind v4 · Supabase · Vercel

---

## 2. Approved Design System

### Colors (CSS custom properties in `app/globals.css`)
```
--c-primary: #FF4FA3    ← hot pink (buttons, accents, links)
--c-secondary: #C9A2FF  ← lavender
--c-bg: #FFF0F7         ← pale pink background
--c-panel: #FFFFFF
--c-outline: #2B0A2E    ← near-black (borders, shadows)
--c-accent: #6FE3FF     ← sky blue
--c-text: #2B0A2E
background: #3A0030     ← deep purple (body/page background)
```

### Fonts (loaded in `app/layout.tsx`)
| Variable class | Font | Use |
|---|---|---|
| `.font-pacifico` | Pacifico | Hero headings |
| `.font-pixel` / `.font-silkscreen` | VT323 / Silkscreen | Labels, tags, UI chrome |
| `.font-caveat` | Caveat | Body copy, answers, captions |
| `.font-chango` | Chango | Button text |
| `.font-nunito` | Nunito | General body, settings |
| `.font-press` | Press Start 2P | Special pixel art labels |

### Key CSS utility classes (all defined in `app/globals.css`)
- `.btn-y2k` — hot-pink bevel candy button (primary action)
- `.btn-outline-y2k` — white outlined secondary button
- `.btn-pill` / `.btn-pill-pink` — rounded pill buttons
- `.btn-bevel` — gradient bevel button
- `.panel-header` — pink gradient title bar for content sections
- `.widget-box` — white content box with ink border
- `.window-chrome` — Windows 98-style window frame
- `.window-title-bar` — blue gradient title bar
- `.input-y2k` — pink-accented form input
- `.card-ink` — white card with thick black border + offset shadow
- `.y2k-app` — applied to AppWindow; activates Y2K typography overrides

**Do not replace these classes with Tailwind utilities or plain inline styles when redesigning components. These classes ARE the design system.**

---

## 3. Route → Canonical Component Map

Every route below has ONE canonical implementation. Do not create duplicates.

| Route | File | Key components used |
|---|---|---|
| `/` | `app/page.tsx` | `Y2KHome` (logged-out), `Y2KDashboard` (logged-in), `TopMarquee`, `AnnouncementBoard` |
| `/explore` | `app/explore/page.tsx` | — |
| `/highlights` | `app/highlights/page.tsx` | inline `ScrapbookVoteCard` |
| `/confessions` | `app/confessions/page.tsx` | — |
| `/prompts` | `app/prompts/page.tsx` | `PromptAnswerForm`, `PromptAnswerLikeButton` |
| `/hangouts` | `app/hangouts/page.tsx` | `JournalHangouts` (components/landing/) |
| `/hangouts/[id]` | `app/hangouts/[id]/page.tsx` | `RSVPButton`, `AnnouncementNote` |
| `/exchange` | `app/exchange/page.tsx` | — |
| `/exchange/join/[token]` | `app/exchange/join/[token]/page.tsx` | `ExchangeJoinClient` |
| `/photobooth` | `app/photobooth/page.tsx` | inline |
| `/photobooth/gallery` | `app/photobooth/gallery/page.tsx` | — |
| `/scrapbook/[id]` | `app/scrapbook/[id]/page.tsx` | — |
| `/scrapbook/create` | `app/scrapbook/create/page.tsx` | — |
| `/profile/[username]` | `app/profile/[username]/page.tsx` | — |
| `/my-space` | `app/my-space/page.tsx` | — |
| `/auth/login` | `app/auth/login/page.tsx` | — |
| `/auth/signup` | `app/auth/signup/page.tsx` | — |
| `/admin/*` | `app/admin/` subtree | uses `app/admin/layout.tsx` fixed overlay |

### Homepage components (logged-out)
`components/landing/y2k/Y2KHome.tsx` — full logged-out landing page  
`components/landing/y2k/Y2KDashboard.tsx` — logged-in dashboard shell  
`components/landing/y2k/Y2KHeader.tsx` — header section  
`components/landing/y2k/Y2KTv.tsx` — TV/showcase widget  
`components/landing/TopMarquee.tsx` — scrolling marquee strip  

### Shared layout
`components/layout/AppWindow.tsx` — Y2K window frame wrapping all client pages  
`components/layout/NavbarWrapper.tsx` — floating navbar above AppWindow  
`components/layout/Footer.tsx` — page footer  

---

## 4. Admin Panel Architecture

Admin (`/admin/*`) renders INSIDE the root layout (which includes AppWindow) but is covered by a **`position: fixed; inset: 0; z-index: 9999; background: #f9fafb`** overlay in `app/admin/layout.tsx`. This hides the Y2K chrome without restructuring routes. Do not remove this overlay.

Admin login: `/admin/login` (not `/auth/login`). Gate: `/api/gate/[token]`.  
Auth guard: `lib/admin.ts → requireAdmin()` — called in every admin page server component.

---

## 5. What Must Never Be Changed Without Explicit Instruction

- The Y2K color system (--c-primary, --c-bg, --c-outline, etc.)
- The `.btn-y2k`, `.btn-outline-y2k`, `.panel-header`, `.widget-box` CSS classes
- The AppWindow Y2K chrome structure
- The root layout (`app/layout.tsx`) font loading or body background
- The admin layout's `position: fixed` overlay
- Supabase schema, RLS policies, or security-definer functions
- The `lib/admin.ts` requireAdmin redirect target (`/admin/login`)

---

## 6. Dead Code — Do Not Resurrect

The following were legacy implementations removed from the repo. Do not re-import or recreate them:

- `components/landing/legacy/Hero.tsx` — old landing hero (deleted)
- `components/landing/legacy/ScrappyHighlights.tsx` — old highlights section (deleted)

If a component isn't listed in §3 above, verify it's actually imported before modifying it.

---

## 7. Deployment Workflow

```
local change → commit → git push origin main → Vercel auto-deploys
```

- Production branch: `main`
- Vercel project: `scrappy` (team `padillolyanna-7083s-projects`)
- Production domain: `scrappy.fun` / `www.scrappy.fun`

**Changes made in Claude worktree isolation mode are NOT deployed until committed and pushed to main.** Always verify changes are on `main` and pushed before treating them as deployed.

After every code change: `vercel --prod` or confirm Vercel auto-deployed from the push.

### Verify what's live
```bash
vercel ls           # shows recent deployments
vercel inspect      # checks current production deployment
```

---

## 8. Caching Configuration

| Layer | Setting | Notes |
|---|---|---|
| Next.js client router | `dynamic: 0` (no cache), `static: 30` | Dynamic routes always re-fetch |
| Vercel CDN | Invalidated on every deployment | No stale CDN after deploy |
| Service workers | None | No PWA, no SW |
| ISR | Not used | No `export const revalidate` on pages |

Static pages (no `cookies()` calls) may be served from client router cache for up to 30 seconds during soft navigation. Hard refresh always gets the latest.

---

## 9. How Visual Regressions Have Happened (and Why They Won't Now)

The two confirmed root causes of past reversions:

1. **Stale git worktrees**: Claude Code's isolation mode creates worktrees inside `.claude/worktrees/`. These contained old code (commits 87fd3cc, c31a5a3 — older design iterations). They're now removed and `.claude/worktrees/` is in `.gitignore`.

2. **No design contract**: Without this file, new AI sessions had no authoritative reference for the approved design and could inadvertently rewrite components differently.

A regression is recoverable with: `git log --oneline` to find the last good commit, `git diff HEAD~1` to see what changed.

---

## 10. Supabase Project

- Project: `yviwsaviferipcndvdmk`
- Migrations live in: `supabase/migrations/` (run manually in Supabase SQL editor)
- Auth: email/password + Google OAuth
- Storage buckets: `scrapbook-assets`, `photobooth`, `profile-pictures`, `announcements`

Key tables: `profiles`, `scrapbooks`, `scrapbook_pages`, `scrapbook_elements`, `confessions`, `exchanges`, `exchange_participants`, `exchange_answers`, `daily_prompts`, `prompt_answers`, `prompt_answer_likes`, `highlight_votes`, `voting_periods`, `voting_categories`, `hangouts`, `hangout_rsvps`, `photobooth_sessions`, `contact_messages`, `announcements`
