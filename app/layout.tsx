import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Job Doom Meter',
  description: 'Check if your job is AI-proof — or if it\'s already toast. Get insights on AI automation risk, upskilling suggestions, and alternative career paths.',
  keywords: 'AI automation, job security, career advice, artificial intelligence, future of work',
  authors: [{ name: 'AI Job Doom Meter' }],
  openGraph: {
    title: 'AI Job Doom Meter',
    description: 'Check if your job is AI-proof — or if it\'s already toast',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Job Doom Meter',
    description: 'Check if your job is AI-proof — or if it\'s already toast',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧠</text></svg>" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}