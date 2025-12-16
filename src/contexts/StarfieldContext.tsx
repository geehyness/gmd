// src/context/StarfieldContext.tsx
'use client';

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

// Types for our enhanced starfield
export interface Planet {
	x: number;
	y: number;
	radius: number;
	orbitRadius: number;
	orbitSpeed: number;
	color: string;
	angle: number;
	parentStarId: number;
	independent?: boolean;
}

export interface Star {
	id: number;
	x: number;
	y: number;
	z: number;
	size: number;
	type: 'cross' | 'star' | 'circle';
	color: string;
	rotation: number;
	vx: number;
	vy: number;
	spinFactor: number;
	hasPlanets: boolean;
	planets: Planet[];
	glowIntensity: number;
}

export interface InteractiveCircle {
	x: number;
	y: number;
	radius: number;
	isActive: boolean;
	vx: number;
	vy: number;
	color: string;
	life: number;
}

export interface StarfieldConfig {
	starCount: number;
	minSize: number;
	maxSize: number;
	minDepth: number;
	maxDepth: number;
	baseSpeed: number;
	momentumDecay: number;
	scrollSensitivity: number;
	glowIntensity: number;
	connectionChance: number;
	maxConnectionDistance: number;
	rotationSpeed: number;
	trailOpacity: number;
	planetChance: number;
	maxPlanetsPerStar: number;
	blackHole: {
		isEnabled: boolean;
		mass: number;
		gravity: number;
		attractionRadius: number;
		spin: number;
		accretionDisk: boolean;
		escapeMomentumThreshold: number;
		layers: number;
		pulseSpeed: number;
		colorPalette: string[];
	};
}

export const DEFAULT_CONFIG: StarfieldConfig = {
	starCount: 170, // More stars for better coverage
	minSize: 1,
	maxSize: 8,
	minDepth: 0.1,
	maxDepth: 100.0,
	baseSpeed: 0.00005, // HALF SPEED (was 0.000004)
	momentumDecay: 0.97,
	scrollSensitivity: 0.0000003, // HALF SENSITIVITY
	glowIntensity: 1.0,
	connectionChance: 0.25,
	maxConnectionDistance: 180,
	rotationSpeed: 0.0002, // HALF SPEED (was 0.0004)
	trailOpacity: 0.2,
	planetChance: 0.7,
	maxPlanetsPerStar: 3,
	// In StarfieldContext.tsx, update the gravity value:
	blackHole: {
		isEnabled: true,
		mass: 120,
		gravity: 90, // Increased from 0.002 (100x stronger)
		attractionRadius: 900,
		spin: 0.8,
		accretionDisk: true,
		escapeMomentumThreshold: 25,
		layers: 2,
		pulseSpeed: 0.0008,
		colorPalette: [
			'#FF3F00', '#FF6B00', '#FF9500',
			'#00B4D8', '#0077B6', '#0096C7',
			'#7209B7', '#560BAD'
		]
	}
};

interface StarfieldContextType {
	config: StarfieldConfig;
	updateConfig: (key: string, value: any) => void;
	updateBlackHoleConfig: (key: string, value: any) => void;
	resetConfig: () => void;
	isInitialized: boolean;
	interactiveCircle: InteractiveCircle | null;
	setInteractiveCircle: (circle: InteractiveCircle | null) => void;
	setIsInitialized: (value: boolean) => void;
}

const StarfieldContext = createContext<StarfieldContextType | undefined>(undefined);

export const useStarfield = () => {
	const context = useContext(StarfieldContext);
	if (!context) {
		throw new Error('useStarfield must be used within a StarfieldProvider');
	}
	return context;
};

interface StarfieldProviderProps {
	children: React.ReactNode;
}

export const StarfieldProvider: React.FC<StarfieldProviderProps> = ({ children }) => {
	const [config, setConfig] = useState<StarfieldConfig>(DEFAULT_CONFIG);
	const [isInitialized, setIsInitialized] = useState(false);
	const [interactiveCircle, setInteractiveCircle] = useState<InteractiveCircle | null>(null);
	const configRef = useRef(config);

	const updateConfig = useCallback((key: string, value: any) => {
		setConfig(prev => {
			const newConfig = { ...prev, [key]: value };
			configRef.current = newConfig;
			return newConfig;
		});
	}, []);

	const updateBlackHoleConfig = useCallback((key: string, value: any) => {
		setConfig(prev => {
			const newConfig = {
				...prev,
				blackHole: {
					...prev.blackHole,
					[key]: value
				}
			};
			configRef.current = newConfig;
			return newConfig;
		});
	}, []);

	const resetConfig = useCallback(() => {
		setConfig(DEFAULT_CONFIG);
		configRef.current = DEFAULT_CONFIG;
	}, []);

	return (
		<StarfieldContext.Provider
			value={{
				config,
				updateConfig,
				updateBlackHoleConfig,
				resetConfig,
				isInitialized,
				setIsInitialized,
				interactiveCircle,
				setInteractiveCircle
			}}
		>
			{children}
		</StarfieldContext.Provider>
	);
};