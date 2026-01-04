// src/components/ClientLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Box, Flex } from '@chakra-ui/react';
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
    const isStarsPage = pathname === '/stars';
    const navbarType = isDashboardPage ? 'dashboard' : 'customer';

    return (
        <Flex direction="column" minH="100vh" className="content-above-starfield">
            {(!isHomeViewerPage && !isStarsPage) && <Navbar
                type={navbarType}
                appName={siteTitle}
                siteLogoUrl={siteLogoUrl}
            />}
            <Box
                pt={isHomeViewerPage ? '0' : '64px'}
                flex="1"
                position="relative"
                zIndex={10}
            >
                {children}
            </Box>
            {(!isHomeViewerPage && !isStarsPage) && <Footer appName={siteTitle} />}

        </Flex>
    );
}