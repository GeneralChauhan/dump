import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { SidebarClient } from './components/sidebar'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { baseUrl } from './sitemap'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Portfolio - Meeting Backgrounds & More',
    template: '%s | Portfolio',
  },
  description: 'Professional meeting backgrounds and portfolio showcase. Download high-quality virtual backgrounds for your video calls.',
  openGraph: {
    title: 'Portfolio - Meeting Backgrounds & More',
    description: 'Professional meeting backgrounds and portfolio showcase. Download high-quality virtual backgrounds for your video calls.',
    url: baseUrl,
    siteName: 'Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        'text-black bg-white',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="antialiased">
        <SidebarClient />
        <main className="lg:ml-64 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {children}
            <Footer />
          </div>
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
