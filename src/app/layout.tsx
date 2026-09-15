import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ChatWidget from '@/components/ChatWidget'
import AgeGateModal from '@/components/AgeGateModal'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Simran Arrora ♡ | Creator • Collaborator • Professional',
    template: '%s | Simran Arrora ♡',
  },
  description:
    'Official creative platform of Simran Arrora — explore visual galleries, video showcases, community updates, and book verified brand collaborations and sessions.',
  keywords: [
    'Simran Arrora',
    'Creator',
    'Model',
    'Content Creator',
    'Collaborator',
    'Photo Gallery',
    'Brand Collaboration',
  ],
  authors: [{ name: 'Simran Arrora' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://simranarrora.com'),
  openGraph: {
    title: 'Simran Arrora ♡ | Creator • Collaborator • Professional',
    description:
      'Official creative platform of Simran Arrora. High-fashion visuals, video collection, and professional bookings.',
    siteName: 'Simran Arrora',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} dark`}>
      <body className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#e91e8c] selection:text-white">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <ChatWidget />
        <AgeGateModal />
      </body>
    </html>
  )
}
