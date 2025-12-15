'use client';
import React from 'react';
import {
    Box, Flex, Heading, Text, Container,
    useColorModeValue, useToken
} from '@chakra-ui/react';
import PublicProjects from '@/components/PublicProjects';
import StarfieldControls from '@/components/StarfieldControls';
import { Project } from '@/types/sanity';

interface ProjectsPageClientProps {
    projects: Project[];
}

const ProjectsPageClient: React.FC<ProjectsPageClientProps> = ({ projects }) => {
    const textPrimaryToken = useColorModeValue('neutral.light.text-primary', 'neutral.dark.text-primary');
    const accentRgba = useToken('colors', 'accent.500');

    return (
        <Box position="relative" w="100%" minH="100vh">
            {/* Starfield is provided by EnhancedStarfield in providers.tsx */}
            <StarfieldControls />

            <Container maxW="container.xl" pt={20} pb={20} position="relative" zIndex={1}>
                <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    textAlign="center"
                    minH={{ base: '30vh', md: '40vh' }}
                    mb={{ base: 10, md: 16 }}
                >
                    <Heading
                        as="h1"
                        size={{ base: '2xl', md: '3xl', lg: '4xl' }}
                        color={textPrimaryToken}
                        fontWeight="extrabold"
                        letterSpacing="tight"
                        mb={4}
                    >
                        Projects
                    </Heading>
                    <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        color={accentRgba}
                        maxW="2xl"
                    >
                        A showcase of my recent work and a glimpse into my capabilities in modern software development.
                    </Text>
                </Flex>
                <PublicProjects />
            </Container>
        </Box>
    );
};

export default ProjectsPageClient;