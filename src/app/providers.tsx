// src/app/providers.tsx
'use client'

import { ChakraProvider } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import themes from '@/app/theme/theme'
import { PageTransitionProvider } from '@/components/PageTransitionProvider'
import { StarfieldProvider } from '@/contexts/StarfieldContext'
import EnhancedStarfield from '@/components/EnhancedStarfield'

// Dynamically import ThemeProvider from next-themes with ssr: false
const ThemeProvider = dynamic(
  () => import('next-themes').then((mod) => mod.ThemeProvider),
  { ssr: false }
)

interface ProvidersProps {
  children?: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ChakraProvider theme={themes}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <StarfieldProvider>
          <EnhancedStarfield />
          <PageTransitionProvider>
            {children}
          </PageTransitionProvider>
        </StarfieldProvider>
      </ThemeProvider>
    </ChakraProvider>
  )
}