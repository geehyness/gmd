// src/components/ClientLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Box, Flex } from '@chakra-ui/react'; // Added Flex
import React from 'react';

export default function ClientLayout({
    children,
    siteTitle,
    siteLogoUrl,
}: {
    children: React.ReactNode;
    siteTitle: string;
    siteLogoUrl?: string;
}) {
    const pathname = usePathname();
    const isDashboardPage = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');
    const isHomeViewerPage = pathname === '/house-viewer';
    const navbarType = isDashboardPage ? 'dashboard' : 'customer';

    return (
        // Changed to Flex container with column direction
        <Flex direction="column" minH="100vh">
            <Navbar
                type={navbarType}
                appName={siteTitle}
                siteLogoUrl={siteLogoUrl}
            />
            <Box
                pt={isHomeViewerPage ? '0' : '64px'}
                flex="1"
            >
                {children}
            </Box>
            {/* Footer now at the bottom of the viewport */}
            {!isHomeViewerPage && <Footer appName={siteTitle} />}
        </Flex>
    );
}