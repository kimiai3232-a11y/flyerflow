import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://flyerflow.ca'),
  title: {
    default: "FlyerFlow - Find Weekly Sales at Big-Chain Stores Near You",
    template: "%s | FlyerFlow",
  },
  description: "Discover current weekly flyer deals from Walmart, Canadian Tire, Giant Tiger, and Dollarama in Toronto. Filter by store, category, and distance.",
  keywords: ["flyers", "sales", "deals", "weekly ads", "Toronto", "Walmart", "Canadian Tire", "Giant Tiger", "Dollarama", "grocery deals", "shopping"],
  authors: [{ name: "FlyerFlow" }],
  creator: "FlyerFlow",
  publisher: "FlyerFlow",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://flyerflow.ca",
    siteName: "FlyerFlow",
    title: "FlyerFlow - Find Weekly Sales at Big-Chain Stores Near You",
    description: "Discover current weekly flyer deals from major retailers in Toronto. Filter by store, category, and distance.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FlyerFlow - Find sales near you",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlyerFlow - Find Weekly Sales Near You",
    description: "Discover current weekly flyer deals from major retailers in Toronto.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  const plausibleScriptUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL || 'https://plausible.io/js/script.js'

  return (
    <html
      lang="en-CA"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://nominatim.openstreetmap.org" />
        {plausibleDomain && (
          <>
            <script
              defer
              data-domain={plausibleDomain}
              src={plausibleScriptUrl}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }
                `
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
