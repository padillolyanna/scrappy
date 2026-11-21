import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import AppWindow from "@/components/layout/AppWindow";
import CursorTrail from "@/components/ui/CursorTrail";
import PresencePing from "@/components/ui/PresencePing";
import SplashScreen from "@/components/landing/SplashScreen";
import CookieConsent from "@/components/ui/CookieConsent";

export const metadata: Metadata = {
  title: "SCRAPPY",
  description: "Your little corner of the internet.",
openGraph: {
    title: "SCRAPPY",
    description: "Your little corner of the internet.",
    type: "website",
  },
  other: {
    "google-adsense-account": "ca-pub-1565639314627238",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&family=VT323&family=Caveat:wght@400;600;700&family=Press+Start+2P&family=Nunito:wght@400;600;700;800;900&family=Chango&family=Silkscreen&family=Gochi+Hand&family=Fredoka:wght@400;600&family=Cherry+Bomb+One&family=Special+Elite&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col items-center py-4 px-2">
        <SplashScreen />
        <CursorTrail />
        <PresencePing />
        {/* Navbar floats above the AppWindow */}
        <div className="w-full max-w-[960px]">
          <NavbarWrapper />
        </div>
        <AppWindow>
          {children}
        </AppWindow>
        <CookieConsent />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1565639314627238"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
