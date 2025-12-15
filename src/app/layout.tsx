// src/app/layout.tsx
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import ClientLayout from '@/components/ClientLayout'
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Godliness Dongorere - Portfolio',
  description: 'Software Developer specializing in FullStack Solutions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#FF3F00" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ClientLayout
            siteTitle={"Godliness Dongorere"}
            siteLogoUrl={undefined}
          >
            <Analytics />
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  )
}