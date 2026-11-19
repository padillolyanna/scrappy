import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCRAPPY — Your little corner of the internet",
  description: "Make memories, collect answers, decorate your pages, and leave a little piece of yourself behind.",
  icons: { icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✦</text></svg>" },
  openGraph: {
    title: "SCRAPPY",
    description: "Your little corner of the internet.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&family=VT323&family=Caveat:wght@400;600;700&family=Press+Start+2P&family=Nunito:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
