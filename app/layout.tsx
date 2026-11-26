import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import AppWindow from "@/components/layout/AppWindow";
import CursorTrail from "@/components/ui/CursorTrail";
import PresencePing from "@/components/ui/PresencePing";
import CookieConsent from "@/components/ui/CookieConsent";
import Mascot from "@/components/ui/Mascot";

export const metadata: Metadata = {
  title: "Scrappy — make Y2K scrapbook pages",
  description: "Scrappy is a free digital scrapbook community inspired by the early-2000s internet. Decorate spiral-notebook pages with photos, washi tape, gems and doodles.",
  metadataBase: new URL("https://www.scrappy.fun"),
  openGraph: {
    title: "Scrappy — make Y2K scrapbook pages",
    description: "Decorate spiral-notebook pages with photos, washi tape, gems and doodles. Free, and all yours.",
    type: "website",
    siteName: "Scrappy",
    url: "https://www.scrappy.fun",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scrappy — make Y2K scrapbook pages",
    description: "A free digital scrapbook community inspired by the early-2000s internet.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  other: {
    "google-adsense-account": "ca-pub-1565639314627238",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload the two fonts that appear above the fold on every page */}
        <link rel="preload" as="style"
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Cherry+Bomb+One&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Cherry+Bomb+One&display=swap"
          rel="stylesheet"
        />
        {/* Remaining decorative fonts load after paint so they don't block render */}
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&family=VT323&family=Caveat:wght@400;600;700&family=Press+Start+2P&family=Nunito:wght@400;600&family=Chango&family=Silkscreen&display=swap"
          rel="stylesheet"
          media="print"
          // @ts-expect-error onLoad fires when print sheet loads, then we swap to all
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Pacifico&family=VT323&family=Caveat:wght@400;600;700&family=Press+Start+2P&family=Nunito:wght@400;600&family=Chango&family=Silkscreen&display=swap"
            rel="stylesheet"
          />
        </noscript>
      </head>
      <body className="min-h-full flex flex-col items-center py-4 px-2 relative">
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MXCGJR2W" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Scrappy",
              "url": "https://www.scrappy.fun",
              "description": "A free digital scrapbook community inspired by the early-2000s internet.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://www.scrappy.fun/explore?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <CursorTrail />
        <PresencePing />
        {/* Navbar floats above the AppWindow */}
        <div className="w-full max-w-[960px]" data-site-nav>
          <NavbarWrapper />
        </div>
        <AppWindow>
          {children}
        </AppWindow>
        <Mascot />
        <CookieConsent />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1565639314627238"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MXCGJR2W');`,
          }}
        />
      </body>
    </html>
  );
}
