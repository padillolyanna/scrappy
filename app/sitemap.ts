import { MetadataRoute } from 'next'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/site'
import { JOURNAL_ARTICLES } from '@/lib/journal'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL

  // Static public pages (always included)
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/explore`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/highlights`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/confessions`, changeFrequency: 'hourly', priority: 0.7 },
    { url: `${base}/prompts`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/hangouts`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/exchange`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/photobooth`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/journal`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/privacy`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/tos`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/community-guidelines`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/copyright`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/cookie-policy`, changeFrequency: 'monthly', priority: 0.4 },
  ]

  // Journal articles
  const journalPages: MetadataRoute.Sitemap = JOURNAL_ARTICLES.map((article) => ({
    url: `${base}/journal/${article.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    lastModified: new Date(article.publishedAt),
  }))

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Dynamic: public scrapbooks
  let scrapbookPages: MetadataRoute.Sitemap = []
  try {
    const { data: scrapbooks } = await supabase
      .from('scrapbooks')
      .select('id, updated_at')
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .limit(500)

    scrapbookPages = (scrapbooks ?? []).map((sb) => ({
      url: `${base}/scrapbook/${sb.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      lastModified: new Date(sb.updated_at),
    }))
  } catch {
    // Sitemap still works without dynamic scrapbook pages
  }

  // Dynamic: public profiles
  let profilePages: MetadataRoute.Sitemap = []
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('username, created_at')
      .not('username', 'in', '("testuser","test","demo","admin_test","scrappy_admin")')
      .order('created_at', { ascending: false })
      .limit(500)

    profilePages = (profiles ?? []).map((p) => ({
      url: `${base}/profile/${p.username}`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
      lastModified: new Date(p.created_at),
    }))
  } catch {
    // Sitemap still works without dynamic profile pages
  }

  return [...staticPages, ...journalPages, ...scrapbookPages, ...profilePages]
}
