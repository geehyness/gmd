// src/components/StarfieldControls.tsx

'use client';

import React, { useEffect } from 'react';
import {
	Box, VStack, HStack, IconButton, Text, FormControl, FormLabel,
	Slider, SliderTrack, SliderFilledTrack, SliderThumb,
	Switch, Collapse, Button, Divider, useDisclosure, Icon
} from '@chakra-ui/react';
import { FaTimes, FaCog, FaRocket, FaSun, FaMoon, FaMeteor, FaExpand, FaLink, FaPlay } from 'react-icons/fa';
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

	// Debug: Log config changes
	useEffect(() => {
		console.log('Config updated:', {
			starCount: config.starCount,
			glowIntensity: config.glowIntensity,
			blackHoleEnabled: config.blackHole.isEnabled,
			blackHoleMass: config.blackHole.mass,
			blackHoleGravity: config.blackHole.gravity
		});
	}, [config]);

	// Control sections with icons and groupings
	const controlSections = [
		{
			title: "Black Hole Core",
			icon: FaPlay,
			controls: [
				{
					label: "Enable Black Hole",
					type: "switch",
					key: "isEnabled",
					value: config.blackHole.isEnabled,
					onChange: (val: boolean) => updateBlackHoleConfig('isEnabled', val),
					section: "blackHole"
				},
				{
					label: "Mass (Size)",
					type: "slider",
					key: "mass",
					value: config.blackHole.mass,
					min: 10,
					max: 500,
					step: 1,
					unit: "px",
					onChange: (val: number) => updateBlackHoleConfig('mass', val),
					section: "blackHole"
				},
				{
					label: "Gravity Strength",
					type: "slider",
					key: "gravity",
					value: config.blackHole.gravity,
					min: 0,
					max: 500,
					step: 1,
					unit: "",
					onChange: (val: number) => updateBlackHoleConfig('gravity', val),
					section: "blackHole"
				}
			]
		},
		{
			title: "Black Hole Effects",
			icon: FaMeteor,
			controls: [
				{
					label: "Accretion Disk",
					type: "switch",
					key: "accretionDisk",
					value: config.blackHole.accretionDisk,
					onChange: (val: boolean) => updateBlackHoleConfig('accretionDisk', val),
					section: "blackHole"
				},
				{
					label: "Disk Layers",
					type: "slider",
					key: "layers",
					value: config.blackHole.layers,
					min: 1,
					max: 8,
					step: 1,
					unit: " layers",
					onChange: (val: number) => updateBlackHoleConfig('layers', val),
					section: "blackHole"
				},
				{
					label: "Pulse Speed",
					type: "slider",
					key: "pulseSpeed",
					value: config.blackHole.pulseSpeed,
					min: 0,
					max: 0.002,
					step: 0.0001,
					unit: "",
					onChange: (val: number) => updateBlackHoleConfig('pulseSpeed', val),
					section: "blackHole"
				}
			]
		},
		{
			title: "Star System",
			icon: FaSun,
			controls: [
				{
					label: "Star Count",
					type: "slider",
					key: "starCount",
					value: config.starCount,
					min: 20,
					max: 500,
					step: 10,
					unit: " stars",
					onChange: (val: number) => updateConfig('starCount', val)
				},
				{
					label: "Min Star Size",
					type: "slider",
					key: "minSize",
					value: config.minSize,
					min: 0.5,
					max: 5,
					step: 0.1,
					unit: "px",
					onChange: (val: number) => updateConfig('minSize', val)
				},
				{
					label: "Max Star Size",
					type: "slider",
					key: "maxSize",
					value: config.maxSize,
					min: 1,
					max: 12,
					step: 0.5,
					unit: "px",
					onChange: (val: number) => updateConfig('maxSize', val)
				}
			]
		},
		{
			title: "Planetary Systems",
			icon: FaMoon,
			controls: [
				{
					label: "Planet Chance",
					type: "slider",
					key: "planetChance",
					value: config.planetChance,
					min: 0,
					max: 1,
					step: 0.05,
					unit: "%",
					format: (val: number) => Math.round(val * 100),
					onChange: (val: number) => updateConfig('planetChance', val)
				},
				{
					label: "Max Planets per Star",
					type: "slider",
					key: "maxPlanetsPerStar",
					value: config.maxPlanetsPerStar,
					min: 1,
					max: 8,
					step: 1,
					unit: " planets",
					onChange: (val: number) => updateConfig('maxPlanetsPerStar', val)
				}
			]
		},
		{
			title: "Visual Effects",
			icon: FaExpand,
			controls: [
				{
					label: "Glow Intensity",
					type: "slider",
					key: "glowIntensity",
					value: config.glowIntensity,
					min: 0,
					max: 1,
					step: 0.05,
					unit: "",
					format: (val: number) => val.toFixed(2),
					onChange: (val: number) => updateConfig('glowIntensity', val)
				},
				{
					label: "Trail Opacity",
					type: "slider",
					key: "trailOpacity",
					value: config.trailOpacity,
					min: 0.1,
					max: 1,
					step: 0.05,
					unit: "",
					format: (val: number) => val.toFixed(2),
					onChange: (val: number) => updateConfig('trailOpacity', val)
				}
			]
		},
		{
			title: "Motion & Physics",
			icon: FaPlay,
			controls: [
				{
					label: "Base Speed",
					type: "slider",
					key: "baseSpeed",
					value: config.baseSpeed,
					min: 0,
					max: 0.0001,
					step: 0.000001,
					unit: "",
					format: (val: number) => val.toFixed(6),
					onChange: (val: number) => updateConfig('baseSpeed', val)
				},
				{
					label: "Rotation Speed",
					type: "slider",
					key: "rotationSpeed",
					value: config.rotationSpeed,
					min: 0,
					max: 0.0005,
					step: 0.00001,
					unit: "",
					format: (val: number) => val.toFixed(5),
					onChange: (val: number) => updateConfig('rotationSpeed', val)
				},
				{
					label: "Momentum Decay",
					type: "slider",
					key: "momentumDecay",
					value: config.momentumDecay,
					min: 0.9,
					max: 0.999,
					step: 0.001,
					unit: "",
					format: (val: number) => val.toFixed(3),
					onChange: (val: number) => updateConfig('momentumDecay', val)
				}
			]
		},
		{
			title: "Connections & Interaction",
			icon: FaLink,
			controls: [
				{
					label: "Connection Chance",
					type: "slider",
					key: "connectionChance",
					value: config.connectionChance,
					min: 0,
					max: 1,
					step: 0.05,
					unit: "%",
					format: (val: number) => Math.round(val * 100),
					onChange: (val: number) => updateConfig('connectionChance', val)
				},
				{
					label: "Max Connection Distance",
					type: "slider",
					key: "maxConnectionDistance",
					value: config.maxConnectionDistance,
					min: 50,
					max: 500,
					step: 10,
					unit: "px",
					onChange: (val: number) => updateConfig('maxConnectionDistance', val)
				},
				{
					label: "Scroll Sensitivity",
					type: "slider",
					key: "scrollSensitivity",
					value: config.scrollSensitivity,
					min: 0.0000001,
					max: 0.000001,
					step: 0.00000001,
					unit: "",
					format: (val: number) => val.toFixed(7),
					onChange: (val: number) => updateConfig('scrollSensitivity', val)
				}
			]
		}
	];

	const renderControl = (control: any) => {
		if (control.type === "slider") {
			return (
				<FormControl key={control.key}>
					<FormLabel color={textPrimaryToken} fontSize="sm">{control.label}</FormLabel>
					<Slider
						value={control.value}
						min={control.min}
						max={control.max}
						step={control.step}
						onChange={(val) => {
							console.log(`Changing ${control.label} to:`, val);
							control.onChange(val);
						}}
					>
						<SliderTrack bg="transparent">
							<SliderFilledTrack bg={accentRgba} />
						</SliderTrack>
						<SliderThumb />
					</Slider>
					<Text color={textSecondaryToken} fontSize="sm" textAlign="right">
						{control.format ? control.format(control.value) : control.value}{control.unit}
					</Text>
				</FormControl>
			);
		} else if (control.type === "switch") {
			return (
				<FormControl
					key={control.key}
					display="flex"
					alignItems="center"
					justifyContent="space-between"
				>
					<FormLabel htmlFor={control.key} color={textPrimaryToken} fontSize="sm" mb="0">
						{control.label}
					</FormLabel>
					<Switch
						id={control.key}
						colorScheme="brand"
						isChecked={control.value}
						onChange={(e) => {
							console.log(`Toggling ${control.label}:`, e.target.checked);
							control.onChange(e.target.checked);
						}}
					/>
				</FormControl>
			);
		}
		return null;
	};

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
					{controlSections.map((section, index) => (
						<Box key={section.title}>
							<HStack spacing={2} mb={3}>
								<Icon as={section.icon} color={accentRgba} size="sm" />
								<Text color={accentRgba} fontWeight="bold" fontSize="sm">
									{section.title}
								</Text>
							</HStack>
							<VStack spacing={3}>
								{section.controls.map(renderControl)}
							</VStack>
							{index < controlSections.length - 1 && <Divider mt={4} />}
						</Box>
					))}

					<Button
						colorScheme="brand"
						size="sm"
						onClick={() => {
							console.log('Resetting to defaults');
							resetConfig();
						}}
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