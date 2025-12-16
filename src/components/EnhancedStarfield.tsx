// src/components/EnhancedStarfield.tsx
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useToken } from '@chakra-ui/react';
import { useStarfield, StarfieldConfig, Star, Planet, InteractiveCircle } from '@/contexts/StarfieldContext';

// Constants for scientific accuracy - SCALED FOR 120-140px BLACK HOLE
const GRAVITATIONAL_CONSTANT = 6.67430e-11; // m³ kg⁻¹ s⁻²
const SOLAR_MASS = 1.989e30; // kg
const ASTRONOMICAL_UNIT = 1.496e11; // meters
const SCHWARZSCHILD_RADIUS_FACTOR = 2.95; // km per solar mass

// Scaling factors for 120-140px black hole
const PIXELS_PER_AU = 50; // 50 pixels = 1 AU
const SECONDS_PER_DAY = 86400;
const SIMULATION_TIME_SCALE = SECONDS_PER_DAY; // 1 second sim = 1 real day

// Sgr A* mass (4.3 million solar masses) SCALED FOR VISIBLE SIZE
const BLACK_HOLE_RADIUS_PIXELS = 120; // Your black hole size
const BLACK_HOLE_MASS_SOLAR = 4.3e6;
const BLACK_HOLE_MASS_KG = BLACK_HOLE_MASS_SOLAR * SOLAR_MASS;

// Calculate scaling factor based on black hole radius
const schwarzschildRadiusKm = SCHWARZSCHILD_RADIUS_FACTOR * BLACK_HOLE_MASS_SOLAR;
const schwarzschildRadiusM = schwarzschildRadiusKm * 1000;
const schwarzschildRadiusAU = schwarzschildRadiusM / ASTRONOMICAL_UNIT;
const REAL_SCHWARZSCHILD_RADIUS_PIXELS = schwarzschildRadiusAU * PIXELS_PER_AU;
const SCALE_FACTOR = BLACK_HOLE_RADIUS_PIXELS / REAL_SCHWARZSCHILD_RADIUS_PIXELS;

// Scale constants for simulation
const SCALED_GRAVITATIONAL_CONSTANT = GRAVITATIONAL_CONSTANT * SCALE_FACTOR;
const SCALED_ASTRONOMICAL_UNIT = ASTRONOMICAL_UNIT * SCALE_FACTOR;

const isMobile = () => {
	if (typeof window === "undefined") return false;
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

function hexToRgb(hex: string) {
	if (!hex) return null;
	if (hex.startsWith('rgba')) {
		const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
		if (!match) return null;
		return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: match[4] ? Number(match[4]) : 1 };
	}
	const raw = hex.replace('#', '');
	if (raw.length === 3) {
		const r = parseInt(raw[0] + raw[0], 16);
		const g = parseInt(raw[1] + raw[1], 16);
		const b = parseInt(raw[2] + raw[2], 16);
		return { r, g, b, a: 1 };
	} else if (raw.length === 6) {
		const r = parseInt(raw.substring(0, 2), 16);
		const g = parseInt(raw.substring(2, 4), 16);
		const b = parseInt(raw.substring(4, 6), 16);
		return { r, g, b, a: 1 };
	}
	return null;
}

function rgbaFromHex(hex: string, alpha = 1) {
	const rgb = hexToRgb(hex);
	if (!rgb) return `rgba(0,0,0,${alpha})`;
	return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function generateStarColor(): string {
	const temperature = Math.random() * 40000 + 2000;
	if (temperature < 3500) return 'rgba(255, 150, 100, 1)';
	if (temperature < 5000) return 'rgba(255, 220, 154, 1)';
	if (temperature < 6000) return 'rgba(254, 254, 164, 1)';
	if (temperature < 10000) return 'rgba(218, 232, 255, 1)';
	return 'rgba(208, 221, 255, 1)';
}

function generatePlanetColor(): string {
	const planetTypes = [
		'rgba(13, 62, 208, 1)',
		'rgba(89, 58, 0, 1)',
		'rgba(2, 69, 29, 1)',
		'rgba(87, 61, 23, 1)',
		'rgba(51, 22, 17, 1)',
	];
	return planetTypes[Math.floor(Math.random() * planetTypes.length)];
}

// Trail point interface
interface TrailPoint {
	x: number;
	y: number;
	life: number;
	radius: number;
	color: string;
}

// Scientific orbital parameters
interface OrbitalParameters {
	semiMajorAxis: number; // pixels
	eccentricity: number; // 0-0.7
	inclination: number; // radians
	longitudeOfAscendingNode: number; // radians
	argumentOfPeriapsis: number; // radians
	meanAnomaly: number; // radians
	period: number; // seconds
	meanMotion: number; // radians per second
}

// Enhanced star with scientific orbital mechanics
interface EnhancedStar extends Star {
	originalSize: number;
	life: number;
	isActive: boolean;
	spawnTime: number;
	shouldBeRespawned: boolean;

	// Scientific properties
	mass: number; // solar masses
	temperature: number;

	// Orbital mechanics
	orbitalParams: OrbitalParameters;
	trueAnomaly: number; // current position in orbit
	timeSincePeriapsis: number; // seconds

	// Velocity Verlet integration
	ax: number; // acceleration x
	ay: number; // acceleration y
	prevX: number;
	prevY: number;

	// Trail effect
	trail: TrailPoint[];
	lastTrailTime: number;
}

// Extended Planet interface for EnhancedStarfield
interface ExtendedPlanet extends Planet {
	originalRadius?: number;
	life?: number;
}

interface IndependentPlanet extends Omit<ExtendedPlanet, 'parentStarId'> {
	originalRadius: number;
	life: number;
	parentStarId: number | null;
	trail: TrailPoint[];
	lastTrailTime: number;
}

// Interactive trail for finger/mouse
interface InteractiveTrail {
	points: Array<{ x: number, y: number, time: number }>;
	maxPoints: number;
	isActive: boolean;
}

const EnhancedStarfield: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { config, interactiveCircle, setInteractiveCircle } = useStarfield();
	const configRef = useRef(config);

	const [bgPrimaryHex] = useToken('colors', ['neutral.light.bg-primary']);
	const canvasBg = 'rgba(10, 10, 10, 1)';

	const [isPointerDown, setIsPointerDown] = useState(false);
	const mousePosRef = useRef<{ x: number; y: number } | null>(null);

	// Interactive trail
	const interactiveTrailRef = useRef<InteractiveTrail>({
		points: [],
		maxPoints: 50,
		isActive: false
	});

	const starsRef = useRef<EnhancedStar[]>([]);
	const independentPlanetsRef = useRef<IndependentPlanet[]>([]);
	const animationFrameId = useRef<number | null>(null);
	const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);
	const timeRef = useRef(0);
	const lastTimeRef = useRef(0);
	const spawnTimerRef = useRef(0);

	// Calculate Schwarzschild radius in pixels
	const calculateSchwarzschildRadius = useCallback((): number => {
		// Simple calculation based on black hole mass
		return configRef.current.blackHole.mass * 0.8; // 80% of mass as radius
	}, []);

	// Calculate orbital period using Kepler's Third Law (scaled)
	const calculateOrbitalPeriod = useCallback((semiMajorAxisPixels: number): number => {
		const semiMajorAxisAU = semiMajorAxisPixels / PIXELS_PER_AU;
		const semiMajorAxisM = semiMajorAxisAU * SCALED_ASTRONOMICAL_UNIT;

		// Kepler's Third Law: T² = (4π²/GM) * a³
		const numerator = 4 * Math.PI * Math.PI * Math.pow(semiMajorAxisM, 3);
		const denominator = SCALED_GRAVITATIONAL_CONSTANT * BLACK_HOLE_MASS_KG;
		const periodSeconds = Math.sqrt(numerator / denominator);

		return periodSeconds;
	}, []);

	// Calculate orbital velocity at given distance (vis-viva equation, scaled)
	const calculateOrbitalVelocity = useCallback((distancePixels: number, semiMajorAxisPixels: number): number => {
		// Simple orbital velocity calculation - avoid complex physics
		const G = 6.67430e-11;
		const M = BLACK_HOLE_MASS_KG;

		// Ensure we don't divide by zero
		if (distancePixels < 1) distancePixels = 1;
		if (semiMajorAxisPixels < 1) semiMajorAxisPixels = 1;

		// Convert to meters (simplified scaling)
		const distanceM = distancePixels * SCALE_FACTOR * 1000;
		const semiMajorAxisM = semiMajorAxisPixels * SCALE_FACTOR * 1000;

		// Check for valid values
		if (!isFinite(distanceM) || !isFinite(semiMajorAxisM) || distanceM <= 0 || semiMajorAxisM <= 0) {
			return 0.1; // Default safe velocity
		}

		// Simple circular orbit velocity: v = sqrt(G*M/r)
		const velocityMS = Math.sqrt(G * M / distanceM);

		// Convert to pixels per second with sensible scaling
		const velocityPixelsPerSecond = velocityMS * 0.001; // Reduced scaling

		return isFinite(velocityPixelsPerSecond) ? velocityPixelsPerSecond : 0.1;
	}, []);

	// Solve Kepler's equation for eccentric anomaly
	const solveKeplerEquation = useCallback((meanAnomaly: number, eccentricity: number, tolerance = 1e-12, maxIterations = 50): number => {
		let E = meanAnomaly;
		let deltaE = 1;
		let iterations = 0;

		while (Math.abs(deltaE) > tolerance && iterations < maxIterations) {
			deltaE = (E - eccentricity * Math.sin(E) - meanAnomaly) /
				(1 - eccentricity * Math.cos(E));
			E -= deltaE;
			iterations++;
		}

		return E;
	}, []);

	// Calculate position from orbital elements
	// Calculate position from orbital elements
	const calculateOrbitalPosition = useCallback((orbitalParams: OrbitalParameters, time: number) => {
		// Calculate mean anomaly at current time
		const meanAnomaly = orbitalParams.meanAnomaly + orbitalParams.meanMotion * time;

		// Solve Kepler's equation for eccentric anomaly
		const eccentricAnomaly = solveKeplerEquation(meanAnomaly, orbitalParams.eccentricity);

		// Calculate true anomaly
		const trueAnomaly = 2 * Math.atan2(
			Math.sqrt(1 + orbitalParams.eccentricity) * Math.sin(eccentricAnomaly / 2),
			Math.sqrt(1 - orbitalParams.eccentricity) * Math.cos(eccentricAnomaly / 2)
		);

		// Calculate distance from center
		const distance = orbitalParams.semiMajorAxis * (1 - orbitalParams.eccentricity * Math.cos(eccentricAnomaly));

		// Position in orbital plane
		const xOrbital = distance * Math.cos(trueAnomaly);
		const yOrbital = distance * Math.sin(trueAnomaly);

		// Apply orbital orientation (simplified - ignoring inclination for 2D)
		const x = xOrbital * Math.cos(orbitalParams.longitudeOfAscendingNode) -
			yOrbital * Math.sin(orbitalParams.longitudeOfAscendingNode) * Math.cos(orbitalParams.inclination);
		const y = xOrbital * Math.sin(orbitalParams.longitudeOfAscendingNode) +
			yOrbital * Math.cos(orbitalParams.longitudeOfAscendingNode) * Math.cos(orbitalParams.inclination);

		// Validate results
		const result = {
			x: isFinite(x) ? x : 0,
			y: isFinite(y) ? y : 0,
			distance: isFinite(distance) ? distance : orbitalParams.semiMajorAxis,
			trueAnomaly: isFinite(trueAnomaly) ? trueAnomaly : 0,
			velocity: calculateOrbitalVelocity(
				isFinite(distance) ? distance : orbitalParams.semiMajorAxis,
				orbitalParams.semiMajorAxis
			)
		};

		return result;
	}, [solveKeplerEquation, calculateOrbitalVelocity]);

	// Generate realistic orbital parameters
	const generateOrbitalParameters = useCallback((canvas: HTMLCanvasElement): OrbitalParameters => {
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const screenRadius = Math.min(canvas.width, canvas.height) / 2;

		// Minimum safe distance (3× Schwarzschild radius)
		const schwarzschildRadius = calculateSchwarzschildRadius();
		const minDistance = Math.max(150, schwarzschildRadius * 3); // At least 150 pixels from center

		// Semi-major axis distribution (more stars at larger radii)
		const semiMajorAxis = minDistance + Math.random() * (screenRadius * 0.8 - minDistance);

		// Eccentricity (0-0.7 for elliptical orbits)
		const eccentricity = Math.random() * 0.7;

		// Orbital orientation (random)
		const inclination = Math.random() * Math.PI;
		const longitudeOfAscendingNode = Math.random() * Math.PI * 2;
		const argumentOfPeriapsis = Math.random() * Math.PI * 2;
		const meanAnomaly = Math.random() * Math.PI * 2;

		// Calculate period
		const period = calculateOrbitalPeriod(semiMajorAxis);
		const meanMotion = (2 * Math.PI) / period;

		return {
			semiMajorAxis,
			eccentricity,
			inclination,
			longitudeOfAscendingNode,
			argumentOfPeriapsis,
			meanAnomaly,
			period,
			meanMotion
		};
	}, [calculateSchwarzschildRadius, calculateOrbitalPeriod]);

	// Update interactive circle with orbital mechanics
	const updateInteractiveCircle = useCallback((circle: InteractiveCircle, canvas: HTMLCanvasElement, deltaTime: number) => {
		if (!circle.isActive && circle.life > 0) {
			circle.life -= 0.02 * deltaTime * 60;
			if (circle.life <= 0) {
				return null;
			}
		}

		const bhConfig = configRef.current.blackHole;
		if (bhConfig.isEnabled) {
			const bhX = canvas.width / 2;
			const bhY = canvas.height / 2;
			const dx = bhX - circle.x;
			const dy = bhY - circle.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			// Apply gravitational acceleration
			if (distance > 0) {
				// F = G*M/r², but scaled for pixels
				const scaledGravity = bhConfig.gravity * 1000; // Increased from 1.0 to 1000
				const acceleration = scaledGravity / (distance * distance + 1);

				circle.vx += (dx / distance) * acceleration * deltaTime * 60;
				circle.vy += (dy / distance) * acceleration * deltaTime * 60;
			}
		}

		// Velocity Verlet integration for interactive circle
		circle.x += circle.vx * deltaTime * 60;
		circle.y += circle.vy * deltaTime * 60;

		// Add drag
		circle.vx *= 0.98;
		circle.vy *= 0.98;

		// Check for black hole absorption
		if (configRef.current.blackHole.isEnabled) {
			const bhX = canvas.width / 2;
			const bhY = canvas.height / 2;
			const dx = bhX - circle.x;
			const dy = bhY - circle.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			const eventHorizon = calculateSchwarzschildRadius();

			if (distance < eventHorizon) {
				circle.radius = Math.max(0, circle.radius - 0.5 * deltaTime * 60);
				if (circle.radius <= 1) {
					return null;
				}
			}
		}

		return circle;
	}, [calculateSchwarzschildRadius]);

	// Also update the initStars function to use simpler orbits
	// In EnhancedStarfield.tsx - REPLACE the initStars function (around line 430)
	const initStars = useCallback((canvas: HTMLCanvasElement) => {
		const stars: EnhancedStar[] = [];
		const config = configRef.current;

		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const minSafeDistance = 200; // Increased
		const maxOrbit = Math.min(canvas.width, canvas.height) * 0.8;

		for (let i = 0; i < config.starCount; i++) {
			// 50% chance to start off-screen
			const startOffscreen = Math.random() > 0.5;
			let orbitRadius;

			if (startOffscreen) {
				orbitRadius = maxOrbit + Math.random() * 300; // Beyond visible area
			} else {
				orbitRadius = minSafeDistance + Math.random() * (maxOrbit - minSafeDistance);
			}

			const orbitAngle = Math.random() * Math.PI * 2;

			// Calculate position on orbit
			const x = centerX + Math.cos(orbitAngle) * orbitRadius;
			const y = centerY + Math.sin(orbitAngle) * orbitRadius;

			// Calculate orbital velocity for stable orbit
			const G = config.blackHole.gravity * 0.01;
			const M = config.blackHole.mass;
			let orbitSpeed = 0;
			if (orbitRadius > 0 && isFinite(G) && isFinite(M)) {
				orbitSpeed = Math.sqrt(Math.abs(G * M / orbitRadius)) * 0.8;
			}

			// Add some randomness
			orbitSpeed *= (0.8 + Math.random() * 0.4);

			// Tangential velocity for orbital motion
			const vx = -Math.sin(orbitAngle) * orbitSpeed;
			const vy = Math.cos(orbitAngle) * orbitSpeed;

			const mass = 0.1 + Math.random() * 10;
			const size = Math.max(1, Math.log10(mass) * 4);

			const star: EnhancedStar = {
				id: i,
				x,
				y,
				z: Math.random() * (config.maxDepth - config.minDepth) + config.minDepth,
				size,
				originalSize: size,
				type: 'circle',
				color: generateStarColor(),
				rotation: Math.random() * Math.PI * 2,
				vx,
				vy,
				spinFactor: 0.5 + Math.random() * 0.5,
				hasPlanets: Math.random() < config.planetChance * 0.5,
				planets: [],
				glowIntensity: 0.3 + Math.random() * 0.7,
				life: 1.0,
				isActive: true,
				spawnTime: 0,
				shouldBeRespawned: false,
				mass,
				temperature: 2000 + Math.random() * 40000,
				orbitalParams: {
					semiMajorAxis: orbitRadius,
					eccentricity: Math.random() * 0.3,
					inclination: 0,
					longitudeOfAscendingNode: 0,
					argumentOfPeriapsis: Math.random() * Math.PI * 2,
					meanAnomaly: orbitAngle,
					period: 1000 + orbitRadius * 10,
					meanMotion: (2 * Math.PI) / (1000 + orbitRadius * 10)
				},
				trueAnomaly: orbitAngle,
				timeSincePeriapsis: 0,
				ax: 0,
				ay: 0,
				prevX: x,
				prevY: y,
				trail: [],
				lastTrailTime: 0
			};

			// Add planets with their own orbital mechanics
			if (star.hasPlanets) {
				const numPlanets = 1 + Math.floor(Math.random() * Math.min(3, config.maxPlanetsPerStar));
				for (let p = 0; p < numPlanets; p++) {
					const planetOrbitRadius = star.size * (3 + Math.random() * 4);
					const planetOrbitSpeed = Math.sqrt(star.mass) / (planetOrbitRadius * 0.5);

					const planet: ExtendedPlanet = {
						x: 0,
						y: 0,
						radius: Math.max(0.5, star.size * (0.1 + Math.random() * 0.2)),
						orbitRadius: planetOrbitRadius,
						orbitSpeed: planetOrbitSpeed * 0.1,
						color: generatePlanetColor(),
						angle: Math.random() * Math.PI * 2,
						parentStarId: i,
						independent: false
					};

					star.planets.push(planet);
				}
			}

			stars.push(star);
		}

		starsRef.current = stars;
		independentPlanetsRef.current = [];
	}, []);

	// Handle pointer interaction with orbital effects
	const handlePointerDown = useCallback((clientX: number, clientY: number) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;

		setIsPointerDown(true);
		mousePosRef.current = { x, y };

		// Start interactive trail
		interactiveTrailRef.current.isActive = true;
		interactiveTrailRef.current.points = [{ x, y, time: Date.now() }];

		// REDUCED interactive circle size (was 15, now 8)
		setInteractiveCircle({
			x,
			y,
			radius: 8, // Reduced from 15
			isActive: true,
			vx: 0,
			vy: 0,
			color: 'rgba(100, 200, 255, 0.4)', // More transparent
			life: 1.0
		});
	}, [setInteractiveCircle]);

	const handlePointerMove = useCallback((clientX: number, clientY: number) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;

		mousePosRef.current = { x, y };

		// Add to interactive trail
		if (interactiveTrailRef.current.isActive) {
			const points = interactiveTrailRef.current.points;
			points.push({ x, y, time: Date.now() });

			// Keep only recent points
			if (points.length > interactiveTrailRef.current.maxPoints) {
				points.shift();
			}

			// Apply gravitational interaction to nearby stars
			const stars = starsRef.current;
			stars.forEach(star => {
				const dx = star.x - x;
				const dy = star.y - y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				// Apply repulsive force if too close
				if (distance < 100 && distance > 0) {
					const force = 0.1 / (distance * distance);
					star.vx += (dx / distance) * force;
					star.vy += (dy / distance) * force;

					// Add trail point to star
					if (Date.now() - star.lastTrailTime > 50) {
						// Validate star position before adding trail
						if (isFinite(star.x) && isFinite(star.y)) {
							star.trail.push({
								x: star.x,
								y: star.y,
								life: 1.0,
								radius: Math.max(0.1, star.size * 0.5),
								color: star.color
							});
							star.lastTrailTime = Date.now();

							// Limit trail length
							if (star.trail.length > 20) {
								star.trail.shift();
							}
						}
					}
				}
			});
		}

		if (isPointerDown && interactiveCircle) {
			setInteractiveCircle({
				...interactiveCircle,
				x,
				y
			});
		}
	}, [isPointerDown, interactiveCircle, setInteractiveCircle]);

	const handlePointerUp = useCallback(() => {
		setIsPointerDown(false);
		mousePosRef.current = null;
		interactiveTrailRef.current.isActive = false;

		if (interactiveCircle) {
			setInteractiveCircle({ ...interactiveCircle, isActive: false });
		}
	}, [setInteractiveCircle, interactiveCircle]);

	// Release planets from star with proper orbital mechanics
	const releasePlanetsFromStar = useCallback((starId: number) => {
		const stars = starsRef.current;
		const star = stars.find(s => s.id === starId);

		if (!star || !star.hasPlanets) return;

		star.planets.forEach(planet => {
			const independentPlanet: IndependentPlanet = {
				...planet,
				originalRadius: planet.radius,
				life: 1.0,
				parentStarId: starId,
				trail: [],
				lastTrailTime: 0
			};

			independentPlanetsRef.current.push(independentPlanet);
		});

		star.planets = [];
		star.hasPlanets = false;
	}, []);

	// Update independent planets with orbital mechanics
	const updateIndependentPlanets = useCallback((canvas: HTMLCanvasElement, deltaTime: number) => {
		const bhConfig = configRef.current.blackHole;
		const bhX = canvas.width / 2;
		const bhY = canvas.height / 2;

		independentPlanetsRef.current = independentPlanetsRef.current.filter(planet => {
			// Calculate gravitational acceleration
			const dx = bhX - planet.x;
			const dy = bhY - planet.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance > 0) {
				// Apply gravitational acceleration (scaled)
				const scaledGravity = bhConfig.gravity * 0.00001;
				const acceleration = scaledGravity / (distance * distance + 1);

				// Update velocity (simple Euler for planets)
				const dirX = dx / distance;
				const dirY = dy / distance;
				planet.x += dirX * acceleration * 10 * deltaTime * 60;
				planet.y += dirY * acceleration * 10 * deltaTime * 60;
			}

			// Add trail
			if (Date.now() - planet.lastTrailTime > 100) {
				planet.trail.push({
					x: planet.x,
					y: planet.y,
					life: 1.0,
					radius: planet.radius * 0.3,
					color: planet.color
				});
				planet.lastTrailTime = Date.now();

				if (planet.trail.length > 10) {
					planet.trail.shift();
				}
			}

			// Update trail life
			planet.trail.forEach(point => point.life -= 0.05 * deltaTime * 60);
			planet.trail = planet.trail.filter(point => point.life > 0);

			// Check for black hole absorption
			const schwarzschildRadius = calculateSchwarzschildRadius();
			if (distance < schwarzschildRadius) {
				planet.life -= 0.01 * deltaTime * 60;
				planet.radius = Math.max(0.1, planet.originalRadius * planet.life);
			}

			return planet.radius > 0.1 && planet.life > 0;
		});
	}, [calculateSchwarzschildRadius]);

	// Update stars with simplified orbital mechanics
	// Update stars with proper orbital mechanics
	// In EnhancedStarfield.tsx - REPLACE the entire updateStars function starting at line 735
	const updateStars = useCallback((canvas: HTMLCanvasElement, deltaTime: number) => {
		const config = configRef.current;
		const stars = starsRef.current;
		const bhConfig = config.blackHole;
		const bhX = canvas.width / 2;
		const bhY = canvas.height / 2;

		// Handle star count changes
		const currentStarCount = stars.length;
		const targetStarCount = config.starCount;

		if (targetStarCount > currentStarCount) {
			for (let i = currentStarCount; i < targetStarCount; i++) {
				// Create new star OFF-SCREEN with proper orbital parameters
				const minOrbit = 200;
				const maxOrbit = Math.min(canvas.width, canvas.height) * 0.8;

				// Start off-screen about 50% of the time
				const startOffscreen = Math.random() > 0.5;
				let orbitRadius, startAngle;

				if (startOffscreen) {
					// Start beyond visible area
					orbitRadius = maxOrbit + Math.random() * 200;
					startAngle = Math.random() * Math.PI * 2;
				} else {
					// Start in visible orbit
					orbitRadius = minOrbit + Math.random() * (maxOrbit - minOrbit);
					startAngle = Math.random() * Math.PI * 2;
				}

				// Position on orbit
				const x = bhX + Math.cos(startAngle) * orbitRadius;
				const y = bhY + Math.sin(startAngle) * orbitRadius;

				// Calculate proper orbital velocity for elliptical orbit
				// v = sqrt(G*M * (2/r - 1/a)) - vis-viva equation simplified
				const G = 0.00001 * bhConfig.gravity; // Adjusted for pixels
				const M = bhConfig.mass * 1000; // Scale mass
				const r = orbitRadius;

				// For circular orbit approximation: v = sqrt(G*M/r)
				let orbitalSpeed = 0;
				if (r > 0 && isFinite(G) && isFinite(M)) {
					orbitalSpeed = Math.sqrt(Math.abs(G * M / r)) * 0.8;
				}

				// Add some randomness to orbital speed
				orbitalSpeed *= (0.8 + Math.random() * 0.4);

				// Tangential velocity direction (perpendicular to radial vector)
				// For clockwise orbits
				const vx = -Math.sin(startAngle) * orbitalSpeed;
				const vy = Math.cos(startAngle) * orbitalSpeed;

				const mass = 0.1 + Math.random() * 10;
				const size = Math.max(1, Math.log10(mass) * 4);

				const star: EnhancedStar = {
					id: i,
					x,
					y,
					z: Math.random() * (config.maxDepth - config.minDepth) + config.minDepth,
					size,
					originalSize: size,
					type: 'circle',
					color: generateStarColor(),
					rotation: Math.random() * Math.PI * 2,
					vx,
					vy,
					spinFactor: 0.5 + Math.random() * 0.5,
					hasPlanets: Math.random() < config.planetChance * 0.5,
					planets: [],
					glowIntensity: 0.3 + Math.random() * 0.7,
					life: 1.0,
					isActive: true,
					spawnTime: 0,
					shouldBeRespawned: false,
					mass,
					temperature: 2000 + Math.random() * 40000,
					orbitalParams: {
						semiMajorAxis: orbitRadius,
						eccentricity: Math.random() * 0.3, // Some elliptical orbits
						inclination: 0,
						longitudeOfAscendingNode: 0,
						argumentOfPeriapsis: Math.random() * Math.PI * 2,
						meanAnomaly: startAngle,
						period: 1000 + orbitRadius * 10,
						meanMotion: (2 * Math.PI) / (1000 + orbitRadius * 10)
					},
					trueAnomaly: startAngle,
					timeSincePeriapsis: 0,
					ax: 0,
					ay: 0,
					prevX: x,
					prevY: y,
					trail: [],
					lastTrailTime: 0
				};

				// Add planets if needed
				if (star.hasPlanets) {
					const numPlanets = 1 + Math.floor(Math.random() * Math.min(3, config.maxPlanetsPerStar));
					for (let p = 0; p < numPlanets; p++) {
						const planetOrbitRadius = star.size * (3 + Math.random() * 4);
						const planetOrbitSpeed = Math.sqrt(star.mass) / (planetOrbitRadius * 50);

						const planet: ExtendedPlanet = {
							x: 0,
							y: 0,
							radius: Math.max(0.5, star.size * (0.1 + Math.random() * 0.2)),
							orbitRadius: planetOrbitRadius,
							orbitSpeed: planetOrbitSpeed,
							color: generatePlanetColor(),
							angle: Math.random() * Math.PI * 2,
							parentStarId: i,
							independent: false
						};

						star.planets.push(planet);
					}
				}

				stars.push(star);
			}
		} else if (targetStarCount < currentStarCount) {
			starsRef.current = stars.slice(0, targetStarCount);
			return;
		}

		// Update each star with PROPER orbital mechanics
		stars.forEach(star => {
			if (!star.isActive) return;

			// Calculate distance to black hole
			const dx = bhX - star.x;
			const dy = bhY - star.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			// Skip if distance is invalid
			if (!isFinite(distance) || distance === 0) {
				star.x = bhX + 300;
				star.y = bhY;
				star.vx = 0;
				star.vy = 0.3;
				return;
			}

			// Apply gravitational attraction toward black hole
			if (bhConfig.isEnabled && distance > 0) {
				// Direction toward black hole
				const dirX = dx / distance;
				const dirY = dy / distance;

				// Centripetal force needed for circular orbit: F = m*v²/r
				// But we'll use simplified gravity
				const G = bhConfig.gravity * 0.01; // Adjusted for pixel scale
				const M = bhConfig.mass;

				// Gravitational acceleration: a = G*M/r²
				const acceleration = (G * M) / (distance * distance);

				// Add some angular momentum to maintain orbit
				// Calculate current angular momentum
				const currentSpeed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);

				// Add tangential velocity component to maintain orbit
				if (currentSpeed > 0) {
					// Normalize velocity
					const velX = star.vx / currentSpeed;
					const velY = star.vy / currentSpeed;

					// Add some centripetal acceleration
					const centripetalAccel = (currentSpeed * currentSpeed) / distance;
					star.ax += dirX * (acceleration - centripetalAccel * 0.1);
					star.ay += dirY * (acceleration - centripetalAccel * 0.1);
				} else {
					// Initial acceleration toward center
					star.ax += dirX * acceleration;
					star.ay += dirY * acceleration;
				}
			}

			// Update velocity with acceleration
			star.vx += star.ax * deltaTime * 60;
			star.vy += star.ay * deltaTime * 60;

			// Reset acceleration for next frame
			star.ax = 0;
			star.ay = 0;

			// Update position
			star.x += star.vx * deltaTime * 60;
			star.y += star.vy * deltaTime * 60;

			// Update rotation
			star.rotation += config.rotationSpeed * 0.01 * deltaTime * 60;

			// Add trail point periodically
			if (Date.now() - star.lastTrailTime > 200) {
				if (isFinite(star.x) && isFinite(star.y)) {
					star.trail.push({
						x: star.x,
						y: star.y,
						life: 1.0,
						radius: Math.max(0.1, star.size * 0.3),
						color: star.color
					});
					star.lastTrailTime = Date.now();

					if (star.trail.length > 10) {
						star.trail.shift();
					}
				}
			}

			// Update trail life
			star.trail.forEach(point => {
				point.life -= 0.02 * deltaTime * 60;
			});
			star.trail = star.trail.filter(point => point.life > 0);

			// Check if star needs respawning
			const buffer = 100; // Larger buffer for off-screen stars
			const isOutsideBounds = star.x < -buffer || star.x > canvas.width + buffer ||
				star.y < -buffer || star.y > canvas.height + buffer;

			const schwarzschildRadius = calculateSchwarzschildRadius();
			const isInsideBlackHole = distance < schwarzschildRadius * 1.5;

			// Only respawn if inside black hole or very far away
			if (isInsideBlackHole || (isOutsideBounds && distance > canvas.width * 2)) {
				// Respawn with new orbit starting OFF-SCREEN
				const startOffscreen = Math.random() > 0.7; // 70% chance to start off-screen
				let newOrbitRadius;

				if (startOffscreen) {
					newOrbitRadius = Math.min(canvas.width, canvas.height) * 0.8 + Math.random() * 300;
				} else {
					newOrbitRadius = 250 + Math.random() * (Math.min(canvas.width, canvas.height) * 0.45);
				}

				const angle = Math.random() * Math.PI * 2;

				// Calculate orbital velocity
				const G = 0.00001 * bhConfig.gravity;
				const M = bhConfig.mass * 1000;
				let orbitalSpeed = 0;
				if (newOrbitRadius > 0 && isFinite(G) && isFinite(M)) {
					orbitalSpeed = Math.sqrt(Math.abs(G * M / newOrbitRadius)) * 0.8;
				}

				star.x = bhX + Math.cos(angle) * newOrbitRadius;
				star.y = bhY + Math.sin(angle) * newOrbitRadius;
				star.vx = -Math.sin(angle) * orbitalSpeed;
				star.vy = Math.cos(angle) * orbitalSpeed;
				star.trail = [];
				star.orbitalParams.semiMajorAxis = newOrbitRadius;
				star.trueAnomaly = angle;
			}

			// Update planets around star
			star.planets.forEach(planet => {
				planet.angle += planet.orbitSpeed * deltaTime * 60;
				planet.x = star.x + Math.cos(planet.angle) * planet.orbitRadius;
				planet.y = star.y + Math.sin(planet.angle) * planet.orbitRadius;
			});
		});

		// Update independent planets
		updateIndependentPlanets(canvas, deltaTime);
	}, [updateIndependentPlanets, calculateSchwarzschildRadius]);

	// Draw black hole with accretion disk
	// In EnhancedStarfield.tsx - REPLACE the drawBlackHole function starting at line 893
	const drawBlackHole = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
		const bhConfig = configRef.current.blackHole;
		if (!bhConfig.isEnabled) return;

		const bhX = canvas.width / 2;
		const bhY = canvas.height / 2;
		const schwarzschildRadius = bhConfig.mass; // Use config value
		const pulse = Math.sin(time * bhConfig.pulseSpeed * 0.5) * 0.1 + 0.9;

		// Draw accretion disk with realistic orbital motion
		if (bhConfig.accretionDisk) {
			const diskRadius = schwarzschildRadius + (schwarzschildRadius * 0.5); // MAX: black hole + 1/4 diameter

			// Create rotating accretion disk
			const rotation = time * 0.1;

			// Draw fewer layers for performance
			for (let i = 0; i < Math.min(2, bhConfig.layers); i++) {
				const innerRadius = schwarzschildRadius * (1.05 + i * 0.1); // Start just outside black hole
				const outerRadius = Math.min(diskRadius, innerRadius + schwarzschildRadius * 0.08); // Thin rings

				// Only draw if within the 1/4 diameter limit
				if (outerRadius <= diskRadius) {
					const diskGradient = ctx.createRadialGradient(
						bhX, bhY, innerRadius,
						bhX, bhY, outerRadius
					);

					// Use color palette
					const colors = bhConfig.colorPalette;
					if (colors && colors.length > 0) {
						// Use first color with varying opacity
						const baseColor = colors[0];
						diskGradient.addColorStop(0, rgbaFromHex(baseColor, 0.15));
						diskGradient.addColorStop(0.5, rgbaFromHex(baseColor, 0.1));
						diskGradient.addColorStop(1, rgbaFromHex(baseColor, 0));
					} else {
						// Fallback colors
						diskGradient.addColorStop(0, 'rgba(255, 100, 0, 0.15)');
						diskGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
					}

					ctx.save();
					ctx.translate(bhX, bhY);
					ctx.rotate(rotation * (1 - i * 0.3));
					ctx.translate(-bhX, -bhY);

					ctx.fillStyle = diskGradient;
					ctx.beginPath();
					ctx.arc(bhX, bhY, outerRadius, 0, Math.PI * 2);
					ctx.fill();

					ctx.restore();
				}
			}
		}

		// Draw black hole core
		const coreGradient = ctx.createRadialGradient(
			bhX, bhY, 0,
			bhX, bhY, schwarzschildRadius * pulse
		);
		coreGradient.addColorStop(0, '#000000');
		coreGradient.addColorStop(0.9, '#050505');
		coreGradient.addColorStop(0.98, '#121212');
		coreGradient.addColorStop(0.99, '#202020');
		coreGradient.addColorStop(1, '#333');

		ctx.fillStyle = coreGradient;
		ctx.beginPath();
		ctx.arc(bhX, bhY, schwarzschildRadius * pulse, 0, Math.PI * 2);
		ctx.fill();

		// Draw event horizon
		ctx.strokeStyle = bhConfig.colorPalette && bhConfig.colorPalette.length > 0
			? rgbaFromHex(bhConfig.colorPalette[0], 0.6)
			: 'rgba(255, 100, 0, 0.2)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(bhX, bhY, schwarzschildRadius * 1.02, 0, Math.PI * 2);
		ctx.stroke();
	}, []);

	// Draw star trails
	// Draw star trails
	// Draw star trails
	// Draw star trails - simplified version without useCallback
	// Draw star trails - SIMPLIFIED and more efficient
	const drawStarTrails = (ctx: CanvasRenderingContext2D) => {
		const stars = starsRef.current;

		// Limit number of stars with trails to improve performance
		const maxStarsWithTrails = 30;
		const starsToDraw = Math.min(stars.length, maxStarsWithTrails);

		for (let s = 0; s < starsToDraw; s++) {
			const star = stars[s];
			if (star.trail.length < 2) continue;

			ctx.save();

			// Draw a single line for the entire trail (much faster)
			ctx.beginPath();
			ctx.moveTo(star.trail[0].x, star.trail[0].y);

			for (let i = 1; i < star.trail.length; i++) {
				const point = star.trail[i];
				// Validate coordinates
				if (isFinite(point.x) && isFinite(point.y)) {
					ctx.lineTo(point.x, point.y);
				}
			}

			// Simple white trail
			ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
			ctx.lineWidth = 1;
			ctx.lineCap = 'round';
			ctx.stroke();

			ctx.restore();
		}
	};

	// Update drawStars to not use useCallback either, or keep it simple
	// Draw stars with trails
	const drawStars = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
		const config = configRef.current;
		const stars = starsRef.current;

		// Draw star trails
		stars.forEach(star => {
			if (star.trail.length < 2) return;

			ctx.save();

			// Draw trail
			for (let i = 0; i < star.trail.length - 1; i++) {
				const point1 = star.trail[i];
				const point2 = star.trail[i + 1];

				// Validate coordinates are finite numbers
				if (!isFinite(point1.x) || !isFinite(point1.y) ||
					!isFinite(point2.x) || !isFinite(point2.y) ||
					!isFinite(point1.life) || !isFinite(point2.life) ||
					!isFinite(point1.radius) || point1.radius <= 0) {
					continue;
				}

				const alpha = point1.life * 0.3;

				// Create gradient
				try {
					const gradient = ctx.createLinearGradient(
						point1.x, point1.y,
						point2.x, point2.y
					);

					// Simple white trails with alpha
					gradient.addColorStop(0, `rgba(255, 255, 255, ${Math.max(0, Math.min(1, alpha))})`);
					gradient.addColorStop(1, `rgba(255, 255, 255, ${Math.max(0, Math.min(1, alpha * 0.5))})`);

					ctx.strokeStyle = gradient;
					ctx.lineWidth = Math.max(0.1, point1.radius * point1.life);
					ctx.lineCap = 'round';

					ctx.beginPath();
					ctx.moveTo(point1.x, point1.y);
					ctx.lineTo(point2.x, point2.y);
					ctx.stroke();
				} catch (error) {
					console.warn('Failed to create gradient for trail:', error);
					continue;
				}
			}

			ctx.restore();
		});

		// Draw independent planet trails
		independentPlanetsRef.current.forEach(planet => {
			if (planet.trail.length < 2) return;

			ctx.save();

			for (let i = 0; i < planet.trail.length - 1; i++) {
				const point1 = planet.trail[i];
				const point2 = planet.trail[i + 1];

				// Validate coordinates are finite numbers
				if (!isFinite(point1.x) || !isFinite(point1.y) ||
					!isFinite(point2.x) || !isFinite(point2.y) ||
					!isFinite(point1.life) || !isFinite(point2.life) ||
					!isFinite(point1.radius) || point1.radius <= 0) {
					continue;
				}

				const alpha = Math.max(0, Math.min(1, point1.life * 0.4));

				// Simple white trails with alpha
				ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
				ctx.lineWidth = Math.max(0.1, point1.radius * point1.life);
				ctx.lineCap = 'round';

				ctx.beginPath();
				ctx.moveTo(point1.x, point1.y);
				ctx.lineTo(point2.x, point2.y);
				ctx.stroke();
			}

			ctx.restore();
		});

		// Then draw stars and planets
		stars.forEach(star => {
			if (!star.isActive) return;

			// Validate star coordinates
			if (!isFinite(star.x) || !isFinite(star.y) || !isFinite(star.size) || star.size <= 0) {
				return;
			}

			// Don't draw stars that are too far off-screen
			if (star.x < -200 || star.x > canvas.width + 200 ||
				star.y < -200 || star.y > canvas.height + 200) {
				return;
			}

			ctx.save();
			ctx.translate(star.x, star.y);

			// Star glow
			if (config.glowIntensity > 0.01 && star.glowIntensity > 0) {
				const glowIntensity = star.glowIntensity * config.glowIntensity;
				ctx.shadowColor = star.color;
				ctx.shadowBlur = Math.max(0, star.size * glowIntensity * 15);
			}

			// Draw star
			ctx.globalAlpha = 1;
			ctx.fillStyle = star.color;
			ctx.beginPath();
			ctx.arc(0, 0, Math.max(0.1, star.size), 0, Math.PI * 2);
			ctx.fill();

			ctx.restore();
			ctx.globalAlpha = 1;

			// Draw planets
			star.planets.forEach(planet => {
				// Validate planet coordinates
				if (!isFinite(planet.x) || !isFinite(planet.y) || !isFinite(planet.radius) || planet.radius <= 0) {
					return;
				}

				ctx.save();
				ctx.translate(planet.x, planet.y);

				// Planet with slight glow
				ctx.shadowColor = planet.color;
				ctx.shadowBlur = 3;
				ctx.fillStyle = planet.color;
				ctx.globalAlpha = 1;
				ctx.beginPath();
				ctx.arc(0, 0, Math.max(0.1, planet.radius), 0, Math.PI * 2);
				ctx.fill();

				ctx.restore();
			});
		});

		// Draw independent planets
		independentPlanetsRef.current.forEach(planet => {
			// Validate planet coordinates
			if (!isFinite(planet.x) || !isFinite(planet.y) ||
				!isFinite(planet.radius) || planet.radius <= 0 ||
				!isFinite(planet.life) || planet.life <= 0) {
				return;
			}

			ctx.save();
			ctx.translate(planet.x, planet.y);

			ctx.globalAlpha = Math.max(0, Math.min(1, planet.life));
			ctx.shadowColor = planet.color;
			ctx.shadowBlur = 3 * planet.life;
			ctx.fillStyle = planet.color;
			ctx.beginPath();
			ctx.arc(0, 0, Math.max(0.1, planet.radius), 0, Math.PI * 2);
			ctx.fill();

			ctx.restore();
		});

		// Reset graphics state
		ctx.shadowBlur = 0;
		ctx.globalAlpha = 1;
	}, []); // Empty dependency array since we use refs

	// Draw interactive trail
	// Draw interactive trail
	// Draw interactive trail
	const drawInteractiveTrail = useCallback((ctx: CanvasRenderingContext2D) => {
		const trail = interactiveTrailRef.current;
		if (trail.points.length < 2 || !trail.isActive) return;

		ctx.save();

		for (let i = 0; i < trail.points.length - 1; i++) {
			const point1 = trail.points[i];
			const point2 = trail.points[i + 1];

			const age = (Date.now() - point1.time) / 1000;
			const alpha = Math.max(0, 0.4 - age * 2); // More transparent

			if (alpha <= 0) continue;

			const gradient = ctx.createLinearGradient(
				point1.x, point1.y,
				point2.x, point2.y
			);

			gradient.addColorStop(0, `rgba(100, 200, 255, ${alpha})`);
			gradient.addColorStop(1, `rgba(100, 200, 255, ${alpha * 0.3})`); // More fade

			ctx.strokeStyle = gradient;
			ctx.lineWidth = 2; // Thinner trail (was 3)
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			ctx.beginPath();
			ctx.moveTo(point1.x, point1.y);
			ctx.lineTo(point2.x, point2.y);
			ctx.stroke();
		}

		ctx.restore();

		// Clean up old trail points
		const now = Date.now();
		trail.points = trail.points.filter(point => now - point.time < 1000);
	}, []);

	// Draw connections between stars
	const drawConnections = useCallback((ctx: CanvasRenderingContext2D) => {
		const config = configRef.current;
		const stars = starsRef.current;
		const gridSize = 150;
		const grid: Record<string, EnhancedStar[]> = {};

		// Build spatial grid
		stars.forEach(star => {
			if (!star.isActive) return;

			const gridX = Math.floor(star.x / gridSize);
			const gridY = Math.floor(star.y / gridSize);
			const key = `${gridX},${gridY}`;
			if (!grid[key]) grid[key] = [];
			grid[key].push(star);
		});

		// Draw connections
		stars.forEach(star => {
			if (!star.isActive) return;

			const gridX = Math.floor(star.x / gridSize);
			const gridY = Math.floor(star.y / gridSize);

			for (let x = gridX - 1; x <= gridX + 1; x++) {
				for (let y = gridY - 1; y <= gridY + 1; y++) {
					const cellStars = grid[`${x},${y}`] || [];
					cellStars.forEach(otherStar => {
						if (star.id >= otherStar.id) return;

						const dx = star.x - otherStar.x;
						const dy = star.y - otherStar.y;
						const distanceSq = dx * dx + dy * dy;
						const maxDistSq = config.maxConnectionDistance * config.maxConnectionDistance;

						if (distanceSq < maxDistSq && Math.random() < config.connectionChance) {
							const distance = Math.sqrt(distanceSq);
							const alpha = 0.1 * (1 - distance / config.maxConnectionDistance);

							ctx.strokeStyle = `rgba(150, 200, 255, ${alpha})`;
							ctx.lineWidth = 0.5;
							ctx.beginPath();
							ctx.moveTo(star.x, star.y);
							ctx.lineTo(otherStar.x, otherStar.y);
							ctx.stroke();
						}
					});
				}
			}
		});
	}, []);

	// Draw interactive circle
	const drawInteractiveCircle = useCallback((ctx: CanvasRenderingContext2D, circle: InteractiveCircle) => {
		if (circle.life <= 0) return;

		ctx.save();

		const gradient = ctx.createRadialGradient(
			circle.x, circle.y, 0,
			circle.x, circle.y, circle.radius * 2
		);
		gradient.addColorStop(0, circle.color);
		gradient.addColorStop(1, 'transparent');

		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(circle.x, circle.y, circle.radius * 2, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = circle.color.replace('0.6', '0.8');
		ctx.beginPath();
		ctx.arc(circle.x, circle.y, circle.radius * 0.7, 0, Math.PI * 2);
		ctx.fill();

		const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
		ctx.strokeStyle = circle.color.replace('0.6', '0.9');
		ctx.lineWidth = 1.5 * pulse;
		ctx.beginPath();
		ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
		ctx.stroke();

		ctx.restore();
	}, []);

	// Animation loop
	// Animation loop with safety checks
	const animate = useCallback((timestamp: number) => {
		const canvas = canvasRef.current;
		const offscreenCtx = offscreenCtxRef.current;

		// Safety check - if no canvas, stop animation
		if (!canvas || !offscreenCtx) {
			console.error('Canvas not available, stopping animation');
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current);
				animationFrameId.current = null;
			}
			return;
		}

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			console.error('Canvas context not available');
			return;
		}

		const currentTime = timestamp * 0.001;
		const deltaTime = lastTimeRef.current ? Math.min(0.1, currentTime - lastTimeRef.current) : 0.016; // Cap deltaTime
		lastTimeRef.current = currentTime;

		// Cap timeRef to prevent overflow
		timeRef.current = (timeRef.current + deltaTime) % 1000;

		// REMOVE console logging - it's slowing things down
		// if (Math.floor(timeRef.current * 10) % 60 === 0) {
		//   console.log(`FPS: ${Math.round(1 / deltaTime)}, deltaTime: ${deltaTime.toFixed(4)}`);
		// }

		// Clear with trail effect
		offscreenCtx.fillStyle = `rgba(10, 10, 10, ${configRef.current.trailOpacity})`;
		offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);

		// Update interactive circle
		if (interactiveCircle) {
			const updatedCircle = updateInteractiveCircle(interactiveCircle, canvas, deltaTime);
			if (updatedCircle) {
				setInteractiveCircle(updatedCircle);
			} else {
				setInteractiveCircle(null);
			}
		}

		// Update interactive trail
		drawInteractiveTrail(offscreenCtx);

		// Update stars and planets - limit processing
		try {
			updateStars(canvas, deltaTime);
		} catch (error) {
			console.error('Error updating stars:', error);
			// Reinitialize stars on error
			initStars(canvas);
		}

		// Draw everything
		try {
			drawBlackHole(offscreenCtx, canvas, timeRef.current);
			drawConnections(offscreenCtx);
			drawStars(offscreenCtx, canvas);

			if (interactiveCircle) {
				drawInteractiveCircle(offscreenCtx, interactiveCircle);
			}
		} catch (error) {
			console.error('Error drawing:', error);
		}

		// Draw to main canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(offscreenCanvasRef.current!, 0, 0);

		// Limit frame rate to prevent infinite loops
		if (animationFrameId.current) {
			cancelAnimationFrame(animationFrameId.current);
		}
		animationFrameId.current = requestAnimationFrame(animate);
	}, [interactiveCircle, updateInteractiveCircle, updateStars, drawBlackHole, drawStars, drawConnections, drawInteractiveCircle, drawInteractiveTrail, setInteractiveCircle, initStars]);

	// Initialize and cleanup
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		console.log('Starfield useEffect triggered, isMobile:', isMobile());

		const handleResize = () => {
			console.log(`Resizing canvas to ${window.innerWidth}x${window.innerHeight}`);
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;

			if (!offscreenCanvasRef.current) {
				console.log('Creating offscreen canvas');
				offscreenCanvasRef.current = document.createElement('canvas');
				offscreenCtxRef.current = offscreenCanvasRef.current.getContext('2d');
			}

			offscreenCanvasRef.current.width = canvas.width;
			offscreenCanvasRef.current.height = canvas.height;

			console.log('Initializing stars after resize');
			initStars(canvas);
		};

		handleResize();
		window.addEventListener('resize', handleResize);


		const handleMouseDown = (e: MouseEvent) => handlePointerDown(e.clientX, e.clientY);
		const handleMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
		const handleMouseUp = () => handlePointerUp();

		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches.length > 0) {
				const touch = e.touches[0];
				handlePointerDown(touch.clientX, touch.clientY);
			}
		};
		const handleTouchMove = (e: TouchEvent) => {
			if (e.touches.length > 0 && isPointerDown) {
				const touch = e.touches[0];
				handlePointerMove(touch.clientX, touch.clientY);
			}
		};
		const handleTouchEnd = () => handlePointerUp();

		canvas.addEventListener('mousedown', handleMouseDown);
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		canvas.addEventListener('touchstart', handleTouchStart);
		canvas.addEventListener('touchmove', handleTouchMove);
		canvas.addEventListener('touchend', handleTouchEnd);

		if (!isMobile() || window.innerWidth > 768) {
			animationFrameId.current = requestAnimationFrame(animate);
		}

		return () => {
			window.removeEventListener('resize', handleResize);
			canvas.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			canvas.removeEventListener('touchstart', handleTouchStart);
			canvas.removeEventListener('touchmove', handleTouchMove);
			canvas.removeEventListener('touchend', handleTouchEnd);

			// Proper cleanup of animation frame
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current);
				animationFrameId.current = null;
			}

			// Clean up offscreen canvas
			if (offscreenCanvasRef.current) {
				offscreenCanvasRef.current = null;
				offscreenCtxRef.current = null;
			}
		};
	}, [initStars, animate, handlePointerDown, handlePointerMove, handlePointerUp, isPointerDown]);

	// Update config ref when config changes
	useEffect(() => {
		configRef.current = config;

		const canvas = canvasRef.current;
		if (canvas && starsRef.current.length > 0) {
			const currentCount = starsRef.current.length;
			const targetCount = config.starCount;

			if (Math.abs(targetCount - currentCount) > 10) {
				initStars(canvas);
			}
		}
	}, [config, initStars]);

	return (
		<canvas
			ref={canvasRef}
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				zIndex: 0,
				pointerEvents: 'auto',
				backgroundColor: canvasBg
			}}
		/>
	);
};

export default EnhancedStarfield;