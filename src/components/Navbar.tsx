// src/components/Navbar.tsx
'use client';

import React, { useState } from 'react';
import {
    Flex, Heading, Button, HStack, IconButton, Image, useBreakpointValue, useTheme, Stack, useToken, Box
} from '@chakra-ui/react';
import { FiMenu, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface NavbarProps {
    appName: string;
    siteLogoUrl?: string;
    type?: 'customer' | 'dashboard';
}

export function Navbar({ appName, siteLogoUrl, type = 'customer' }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isMobile = useBreakpointValue({ base: true, md: false });
    const theme = useTheme();

    // Get theme tokens for consistent styling
    const [bgCardToken, borderToken, textPrimaryToken] = useToken('colors', [
        'neutral.light.bg-card',
        'neutral.light.border-color',
        'neutral.light.text-primary'
    ]);

    // Glass card style matching homepage
    const glassCardStyle = {
        bg: bgCardToken,
        backdropFilter: 'blur(12px) saturate(160%)',
        border: '1px solid',
        borderColor: borderToken,
        boxShadow: 'md',
        borderRadius: 'xl',
        transition: 'all 0.25s ease-in-out',
    };

    // computed colors
    const brandGlow = useToken('colors', 'brand.200');
    const brandGlowStrong = useToken('colors', 'brand.300');
    const accentRgba = useToken('colors', 'accent.500');


    const menuItems = [
        { name: 'Home', href: '/' },
        { name: '3D Showcase', href: '/house-viewer' },
    ];

    return (
        <Flex
            as="nav"
            position="fixed"
            top="8px"
            left="8px"
            right="8px"
            zIndex={50}
            justify="space-between"
            align="center"
            px={{ base: 4, md: 8 }}
            py={3}
            sx={glassCardStyle}
            mx="auto"
            maxW="container.xl"
            height="60px"
        >
            <Link href="/" passHref>
                <HStack spacing={3} align="center" cursor="pointer" height="100%">
                    {siteLogoUrl ? (
                        <Image src={siteLogoUrl} alt={`${appName} Logo`} boxSize="40px" objectFit="contain" />
                    ) : (
                        <Heading
                            as="h1"
                            size={{ base: "lg", md: "xl" }}
                            fontWeight="extrabold"
                            letterSpacing="tight"
                            color={textPrimaryToken}
                            textShadow={`0 6px 26px ${brandGlow}`}
                        >
                            Godliness <Box as="span" color={accentRgba} display="inline-block" textShadow={`0 8px 30px ${brandGlowStrong}`}>Dongorere</Box>
                        </Heading>
                    )}
                </HStack>
            </Link>

            {/* Right-aligned section for desktop */}
            <HStack spacing={8} height="100%" alignItems="center">
                {!isMobile && (
                    <>
                        {menuItems.map((item) => (
                            <Button
                                key={item.name}
                                as={Link}
                                href={item.href}
                                variant="ghost"
                                color={textPrimaryToken}
                                _hover={{ color: 'accent.500' }}
                                display="flex"
                                alignItems="center"
                                height="100%"
                            >
                                {item.name}
                            </Button>
                        ))}
                        {/*<Button
                            colorScheme="brand"
                            size="sm"
                            as={Link}
                            href="/contact"
                            alignItems="center"
                            height="38px"
                        >
                            Get Started
                        </Button>*/}
                    </>
                )}

                {isMobile && (
                    <IconButton
                        icon={mobileMenuOpen ? <FiX /> : <FiMenu />}
                        aria-label="Toggle menu"
                        variant="ghost"
                        color={textPrimaryToken}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        height="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    />
                )}
            </HStack>

            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: 'fixed',
                        top: '80px',
                        left: '12px',
                        right: '12px',
                        zIndex: 40,
                        backgroundColor: bgCardToken,
                        border: `1px solid ${borderToken}`,
                        padding: '1rem',
                        backdropFilter: 'blur(12px) saturate(160%)',
                        borderRadius: theme.radii.xl,
                        boxShadow: theme.shadows.md,
                    }}
                >
                    <Stack direction="column" spacing={2}>
                        {menuItems.map((item) => (
                            <Button
                                key={item.name}
                                as={Link}
                                href={item.href}
                                variant="ghost"
                                color={textPrimaryToken}
                                justifyContent="flex-start"
                                onClick={() => setMobileMenuOpen(false)}
                                display="flex"
                                alignItems="center"
                                height="48px"
                            >
                                {item.name}
                            </Button>
                        ))}
                        {/*<Button
                            colorScheme="brand"
                            mt={4}
                            as={Link}
                            href="/contact"
                            onClick={() => setMobileMenuOpen(false)}
                            display="flex"
                            alignItems="center"
                            height="48px"
                        >
                            Get Started
                        </Button>*/}
                    </Stack>
                </motion.div>
            )}
        </Flex>
    );
}