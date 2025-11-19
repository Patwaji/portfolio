import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Rajdhani } from 'next/font/google'
import './globals.css'
import { getPageMetadata } from '@/lib/seo'
import { getAllStructuredData } from '@/lib/structuredData'
import Analytics from '@/components/Analytics'
import SmoothScroll from '@/components/SmoothScroll'
import MagneticCursor from '@/components/MagneticCursor'

// Modern sans-serif for body text
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

// Monospace for code/tech elements
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

// Clean, modern display font for headings
const rajdhani = Rajdhani({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = getPageMetadata();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#030014' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = getAllStructuredData();

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${rajdhani.variable}`}>
      <head>
        {/* Structured Data */}
        {structuredData.map((data, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
      </head>
      <body className="antialiased font-sans bg-bg text-text-primary selection:bg-cyan selection:text-bg" suppressHydrationWarning>
        <SmoothScroll>
          <MagneticCursor />
          <Analytics />
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
