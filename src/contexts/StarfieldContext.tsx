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
	starCount: 50,
	minSize: 1,
	maxSize: 8,
	minDepth: 0.1,
	maxDepth: 60.0,
	baseSpeed: 0.000005,
	momentumDecay: 0.95,
	scrollSensitivity: 0.000001,
	glowIntensity: 0.3,
	connectionChance: 0.4,
	maxConnectionDistance: 150,
	rotationSpeed: 0.0005,
	trailOpacity: 0.85,
	planetChance: 0.2,
	maxPlanetsPerStar: 10,
	blackHole: {
		isEnabled: true,
		mass: 110,
		gravity: 0.1,
		attractionRadius: 600,
		spin: 2,
		accretionDisk: true,
		escapeMomentumThreshold: 25,
		layers: 1,
		pulseSpeed: 0.002,
		colorPalette: ['#FF3F00', '#FF6B00', '#FF9500', '#00B4D8', '#0077B6']
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
				setIsInitialized: () => setIsInitialized(true),
				interactiveCircle,
				setInteractiveCircle
			}}
		>
			{children}
		</StarfieldContext.Provider>
	);
};