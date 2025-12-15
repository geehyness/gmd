'use client';

import React from 'react';
import {
	Box, VStack, HStack, IconButton, Text, FormControl, FormLabel,
	Slider, SliderTrack, SliderFilledTrack, SliderThumb,
	Switch, Collapse, Button, Divider, useDisclosure, Icon
} from '@chakra-ui/react';
import { FaTimes, FaCog, FaRocket } from 'react-icons/fa';
import { useStarfield } from '@/contexts/StarfieldContext';
import { useToken } from '@chakra-ui/react';

const StarfieldControls: React.FC = () => {
	const { config, updateConfig, updateBlackHoleConfig, resetConfig } = useStarfield();
	const { isOpen, onToggle } = useDisclosure();

	const [accentRgba, textPrimaryToken, textSecondaryToken, bgCardToken, borderToken] = useToken('colors', [
		'accent.500',
		'neutral.light.text-primary',
		'neutral.light.text-secondary',
		'neutral.light.bg-card',
		'neutral.light.border-color'
	]);

	const glassCardProps = {
		bg: bgCardToken,
		backdropFilter: 'blur(12px) saturate(160%)',
		border: '1px solid',
		borderColor: borderToken,
		boxShadow: 'md',
		borderRadius: 'xl',
	} as const;

	return (
		<Box
			position="fixed"
			bottom={4}
			right={4}
			zIndex={50}
			p={3}
			width="340px"
			{...glassCardProps}
		>
			<HStack justify="space-between" align="center" mb={isOpen ? 3 : 0}>
				<HStack spacing={2}>
					<Icon as={FaRocket} color={accentRgba} />
					<Text color={textPrimaryToken} fontWeight="bold">Starfield Controls</Text>
				</HStack>
				<IconButton
					aria-label={isOpen ? "Close controls" : "Open controls"}
					icon={isOpen ? <FaTimes /> : <FaCog />}
					size="sm"
					variant="ghost"
					color={accentRgba}
					onClick={onToggle}
				/>
			</HStack>

			<Collapse in={isOpen} animateOpacity>
				<VStack spacing={4} align="stretch" maxH="70vh" overflowY="auto" pr={2} mt={2}>
					{/* Black Hole Settings */}
					<Box>
						<Text color={accentRgba} fontWeight="bold" mb={2}>Black Hole Settings</Text>
						<VStack spacing={3}>
							<FormControl display="flex" alignItems="center" justifyContent="space-between">
								<FormLabel htmlFor="bh-enabled" color={textPrimaryToken} fontSize="sm" mb="0">
									Enable Black Hole
								</FormLabel>
								<Switch
									id="bh-enabled"
									colorScheme="brand"
									isChecked={config.blackHole.isEnabled}
									onChange={(e) => updateBlackHoleConfig('isEnabled', e.target.checked)}
								/>
							</FormControl>

							<FormControl>
								<FormLabel color={textPrimaryToken} fontSize="sm">Mass (Size)</FormLabel>
								<Slider
									value={config.blackHole.mass}
									min={10}
									max={300}
									step={1}
									onChange={(val) => updateBlackHoleConfig('mass', val)}
								>
									<SliderTrack bg="transparent">
										<SliderFilledTrack bg={accentRgba} />
									</SliderTrack>
									<SliderThumb />
								</Slider>
								<Text color={textSecondaryToken} fontSize="sm" textAlign="right">
									{config.blackHole.mass}px
								</Text>
							</FormControl>

							<FormControl>
								<FormLabel color={textPrimaryToken} fontSize="sm">Gravity</FormLabel>
								<Slider
									value={config.blackHole.gravity}
									min={0}
									max={0.01}
									step={0.0001}
									onChange={(val) => updateBlackHoleConfig('gravity', val)}
								>
									<SliderTrack bg="transparent">
										<SliderFilledTrack bg={accentRgba} />
									</SliderTrack>
									<SliderThumb />
								</Slider>
								<Text color={textSecondaryToken} fontSize="sm" textAlign="right">
									{config.blackHole.gravity.toFixed(4)}
								</Text>
							</FormControl>

							<FormControl>
								<FormLabel color={textPrimaryToken} fontSize="sm">Layers</FormLabel>
								<Slider
									value={config.blackHole.layers}
									min={1}
									max={8}
									step={1}
									onChange={(val) => updateBlackHoleConfig('layers', val)}
								>
									<SliderTrack bg="transparent">
										<SliderFilledTrack bg={accentRgba} />
									</SliderTrack>
									<SliderThumb />
								</Slider>
								<Text color={textSecondaryToken} fontSize="sm" textAlign="right">
									{config.blackHole.layers} layers
								</Text>
							</FormControl>
						</VStack>
					</Box>

					<Divider />

					{/* Star Settings */}
					<Box>
						<Text color={accentRgba} fontWeight="bold" mb={2}>Star Settings</Text>
						<VStack spacing={3}>
							<FormControl>
								<FormLabel color={textPrimaryToken} fontSize="sm">Star Count</FormLabel>
								<Slider
									value={config.starCount}
									min={20}
									max={300}
									step={10}
									onChange={(val) => updateConfig('starCount', val)}
								>
									<SliderTrack bg="transparent">
										<SliderFilledTrack bg={accentRgba} />
									</SliderTrack>
									<SliderThumb />
								</Slider>
								<Text color={textSecondaryToken} fontSize="sm" textAlign="right">
									{config.starCount} stars
								</Text>
							</FormControl>

							<FormControl>
								<FormLabel color={textPrimaryToken} fontSize="sm">Planet Chance</FormLabel>
								<Slider
									value={config.planetChance}
									min={0}
									max={1}
									step={0.1}
									onChange={(val) => updateConfig('planetChance', val)}
								>
									<SliderTrack bg="transparent">
										<SliderFilledTrack bg={accentRgba} />
									</SliderTrack>
									<SliderThumb />
								</Slider>
								<Text color={textSecondaryToken} fontSize="sm" textAlign="right">
									{Math.round(config.planetChance * 100)}%
								</Text>
							</FormControl>

							<FormControl>
								<FormLabel color={textPrimaryToken} fontSize="sm">Glow Intensity</FormLabel>
								<Slider
									value={config.glowIntensity}
									min={0}
									max={1}
									step={0.05}
									onChange={(val) => updateConfig('glowIntensity', val)}
								>
									<SliderTrack bg="transparent">
										<SliderFilledTrack bg={accentRgba} />
									</SliderTrack>
									<SliderThumb />
								</Slider>
								<Text color={textSecondaryToken} fontSize="sm" textAlign="right">
									{config.glowIntensity.toFixed(2)}
								</Text>
							</FormControl>
						</VStack>
					</Box>

					<Divider />

					{/* Motion Settings */}
					<Box>
						<Text color={accentRgba} fontWeight="bold" mb={2}>Motion Settings</Text>
						<VStack spacing={3}>
							<FormControl>
								<FormLabel color={textPrimaryToken} fontSize="sm">Base Speed</FormLabel>
								<Slider
									value={config.baseSpeed}
									min={0}
									max={0.0001}
									step={0.000001}
									onChange={(val) => updateConfig('baseSpeed', val)}
								>
									<SliderTrack bg="transparent">
										<SliderFilledTrack bg={accentRgba} />
									</SliderTrack>
									<SliderThumb />
								</Slider>
								<Text color={textSecondaryToken} fontSize="sm" textAlign="right">
									{config.baseSpeed.toFixed(7)}
								</Text>
							</FormControl>

							<FormControl>
								<FormLabel color={textPrimaryToken} fontSize="sm">Scroll Sensitivity</FormLabel>
								<Slider
									value={config.scrollSensitivity}
									min={0.0001}
									max={0.01}
									step={0.0001}
									onChange={(val) => updateConfig('scrollSensitivity', val)}
								>
									<SliderTrack bg="transparent">
										<SliderFilledTrack bg={accentRgba} />
									</SliderTrack>
									<SliderThumb />
								</Slider>
								<Text color={textSecondaryToken} fontSize="sm" textAlign="right">
									{config.scrollSensitivity.toFixed(4)}
								</Text>
							</FormControl>
						</VStack>
					</Box>

					<Button
						colorScheme="brand"
						size="sm"
						onClick={resetConfig}
						mt={2}
					>
						Reset to Defaults
					</Button>
				</VStack>
			</Collapse>
		</Box>
	);
};

export default StarfieldControls;