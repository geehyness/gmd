// src/components/Footer.tsx
'use client';

import React from 'react';
import {
  Box,
  Text,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  useToken,
} from '@chakra-ui/react';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

interface FooterProps {
  appName?: string;
}

export function Footer({ appName = 'Godliness Dongorere' }: FooterProps) {
  // Get accent color from theme
  const [accentColor] = useToken('colors', ['accent.500']);

  return (
    <Box w="full" bg="#151515" py={12} zIndex={10}>
      <Container maxW="container.xl">
        <Flex direction="column" align="center">
          <Heading as="h3" size="md" color="white" mb={4}>
            Godliness <Box as="span" color={accentColor} display="inline-block">Dongorere</Box>
          </Heading>
          <HStack spacing={4} mb={6}>
            <IconButton
              aria-label="GitHub"
              icon={<FiGithub />}
              variant="ghost"
              color="white"
              _hover={{ color: accentColor }}
              as="a"
              href="https://github.com/gdongorere"
              target="_blank"
            />
            <IconButton
              aria-label="LinkedIn"
              icon={<FiLinkedin />}
              variant="ghost"
              color="white"
              _hover={{ color: accentColor }}
              as="a"
              href="https://linkedin.com/in/gdongorere"
              target="_blank"
            />
            <IconButton
              aria-label="Email"
              icon={<FiMail />}
              variant="ghost"
              color="white"
              _hover={{ color: accentColor }}
              as="a"
              href="mailto:gdongorere@gmail.com"
            />
          </HStack>
          <Text color="white" mb={6} textAlign="center">
            Software Developer & AI/3D Solutions Specialist
          </Text>
        </Flex>

        <Divider borderColor="rgba(255,255,255,0.12)" mb={6} />

        <Text color="rgba(255,255,255,0.5)" textAlign="center">
          © {new Date().getFullYear()} Godliness Dongorere. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
}