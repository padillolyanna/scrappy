import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/explore',
          '/highlights',
          '/confessions',
          '/prompts',
          '/hangouts',
          '/exchange',
          '/photobooth',
          '/journal',
          '/journal/',
          '/scrapbook/',
          '/profile/',
          '/about',
          '/contact',
          '/faq',
          '/privacy',
          '/tos',
          '/community-guidelines',
          '/copyright',
          '/cookie-policy',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/my-space',
          '/my-space/',
          '/profile/*/edit',
          '/scrapbook/*/edit',
          '/scrapbook/create',
          '/photobooth/gallery',
          '/auth/',
          '/api/',
          '/exchange/join/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
