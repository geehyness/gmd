'use client';
import React from 'react';
import {
	Box, Flex, Heading, Text, Container,
	useColorModeValue, useToken
} from '@chakra-ui/react';
import PublicProjects from '@/components/PublicProjects';
import StarfieldControls from '@/components/StarfieldControls';
import { Project } from '@/types/sanity';

interface StarsProps {
	projects: Project[];
}

const Stars: React.FC<StarsProps> = ({ projects }) => {
	const textPrimaryToken = useColorModeValue('neutral.light.text-primary', 'neutral.dark.text-primary');
	const accentRgba = useToken('colors', 'accent.500');

	return (
		<Box position="relative" w="100%" minH="100vh">
			{/* Starfield is provided by EnhancedStarfield in providers.tsx */}
			<StarfieldControls />
		</Box>
	);
};

export default Stars;