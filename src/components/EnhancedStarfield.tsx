'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useToken } from '@chakra-ui/react';
import { useStarfield, StarfieldConfig, Star, Planet, InteractiveCircle } from '@/contexts/StarfieldContext';

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
	const colors = [
		'rgba(255, 255, 255, 0.9)', // White
		'rgba(255, 200, 100, 0.8)', // Yellow
		'rgba(100, 180, 255, 0.8)', // Blue
		'rgba(255, 100, 100, 0.8)', // Red
	];
	return colors[Math.floor(Math.random() * colors.length)];
}

function generatePlanetColor(): string {
	const colors = [
		'rgba(100, 200, 255, 0.7)', // Blue
		'rgba(150, 255, 150, 0.7)', // Green
		'rgba(255, 200, 100, 0.7)', // Yellow
		'rgba(255, 150, 150, 0.7)', // Pink
		'rgba(200, 150, 255, 0.7)', // Purple
	];
	return colors[Math.floor(Math.random() * colors.length)];
}

// Add interface for independent planets
interface IndependentPlanet extends Planet {
	originalRadius: number;
	life: number;
	parentStarId: number | null;
}

const EnhancedStarfield: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { config, interactiveCircle, setInteractiveCircle } = useStarfield();
	const configRef = useRef(config);

	// Get theme colors
	const [bgPrimaryHex] = useToken('colors', ['neutral.light.bg-primary']);
	const canvasBg = 'rgba(31,31,31, 1)';

	// State for mouse/touch
	const [isPointerDown, setIsPointerDown] = useState(false);
	const mousePosRef = useRef<{ x: number; y: number } | null>(null);

	// Refs for animation
	const starsRef = useRef<Star[]>([]);
	const independentPlanetsRef = useRef<IndependentPlanet[]>([]); // New: track planets independent of stars
	const animationFrameId = useRef<number | null>(null);
	const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);
	const timeRef = useRef(0);
	const lastScrollYRef = useRef(0);
	const momentumRef = useRef(0);

	// Initialize stars
	const initStars = useCallback((canvas: HTMLCanvasElement) => {
		const stars: Star[] = [];
		const config = configRef.current;

		for (let i = 0; i < config.starCount; i++) {
			const star: Star = {
				id: i,
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				z: Math.random() * (config.maxDepth - config.minDepth) + config.minDepth,
				size: Math.random() * (config.maxSize - config.minSize) + config.minSize,
				originalSize: Math.random() * (config.maxSize - config.minSize) + config.minSize, // Add originalSize
				type: Math.random() > 0.66 ? 'circle' : Math.random() > 0.33 ? 'circle' : 'circle',
				color: generateStarColor(),
				rotation: Math.random() * Math.PI * 2,
				vx: 0,
				vy: 0,
				spinFactor: 0.5 + Math.random() * 0.5,
				hasPlanets: Math.random() < config.planetChance,
				planets: [],
				glowIntensity: 0.3 + Math.random() * 0.7,
				consumed: false, // Add consumed state
				life: 1.0 // Add life for fading effect
			};

			// Add planets if star has planets
			if (star.hasPlanets) {
				const numPlanets = 1 + Math.floor(Math.random() * config.maxPlanetsPerStar);
				for (let p = 0; p < numPlanets; p++) {
					star.planets.push({
						x: 0,
						y: 0,
						radius: star.size * (0.3 + Math.random() * 0.4),
						originalRadius: star.size * (0.3 + Math.random() * 0.4), // Store original radius
						orbitRadius: star.size * (3 + Math.random() * 4),
						orbitSpeed: 0.001 + Math.random() * 0.003,
						color: generatePlanetColor(),
						angle: Math.random() * Math.PI * 2,
						parentStarId: i,
						independent: false // Track if planet is independent
					});
				}
			}

			stars.push(star);
		}

		starsRef.current = stars;
		independentPlanetsRef.current = []; // Clear independent planets on init
	}, []);

	// Handle pointer events
	const handlePointerDown = useCallback((clientX: number, clientY: number) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;

		setIsPointerDown(true);
		mousePosRef.current = { x, y };

		// Create interactive circle
		setInteractiveCircle({
			x,
			y,
			radius: 15,
			isActive: true,
			vx: 0,
			vy: 0,
			color: 'rgba(100, 200, 255, 0.6)',
			life: 1.0
		});
	}, [setInteractiveCircle]);

	const handlePointerMove = useCallback((clientX: number, clientY: number) => {
		if (!isPointerDown) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;

		mousePosRef.current = { x, y };
	}, [isPointerDown]);

	const handlePointerUp = useCallback(() => {
		setIsPointerDown(false);
		mousePosRef.current = null;

		// Start fading out the interactive circle
		setInteractiveCircle(prev =>
			prev ? { ...prev, isActive: false } : null
		);
	}, [setInteractiveCircle]);

	// Update interactive circle
	const updateInteractiveCircle = useCallback((circle: InteractiveCircle, canvas: HTMLCanvasElement) => {
		if (!circle.isActive && circle.life > 0) {
			circle.life -= 0.02;
			if (circle.life <= 0) {
				return null;
			}
		}

		// Apply black hole gravity
		const bhConfig = configRef.current.blackHole;
		if (bhConfig.isEnabled) {
			const bhX = canvas.width / 2;
			const bhY = canvas.height / 2;
			const dx = bhX - circle.x;
			const dy = bhY - circle.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < bhConfig.attractionRadius) {
				const force = bhConfig.gravity * (1 - distance / bhConfig.attractionRadius);
				circle.vx += (dx / distance) * force;
				circle.vy += (dy / distance) * force;
			}
		}

		// Update position
		circle.x += circle.vx;
		circle.y += circle.vy;

		// Apply friction
		circle.vx *= 0.98;
		circle.vy *= 0.98;

		// If close to black hole, absorb it
		if (bhConfig.isEnabled) {
			const bhX = canvas.width / 2;
			const bhY = canvas.height / 2;
			const dx = bhX - circle.x;
			const dy = bhY - circle.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < bhConfig.mass * 2) {
				circle.radius = Math.max(0, circle.radius - 0.5);
				if (circle.radius <= 1) {
					return null;
				}
			}
		}

		return circle;
	}, []);

	// Make planets independent when star is consumed
	const releasePlanetsFromStar = useCallback((starId: number) => {
		const stars = starsRef.current;
		const star = stars.find(s => s.id === starId);

		if (!star || !star.hasPlanets) return;

		star.planets.forEach(planet => {
			// Create independent planet
			const independentPlanet: IndependentPlanet = {
				...planet,
				originalRadius: planet.radius,
				life: 1.0,
				parentStarId: starId
			};

			independentPlanetsRef.current.push(independentPlanet);
		});

		// Clear planets from star
		star.planets = [];
		star.hasPlanets = false;
	}, []);

	// Update independent planets
	const updateIndependentPlanets = useCallback((canvas: HTMLCanvasElement) => {
		const bhConfig = configRef.current.blackHole;
		const bhX = canvas.width / 2;
		const bhY = canvas.height / 2;

		// Update existing independent planets
		independentPlanetsRef.current = independentPlanetsRef.current.filter(planet => {
			// Calculate distance to black hole
			const dx = bhX - planet.x;
			const dy = bhY - planet.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			// Apply gravity toward black hole
			const gravityForce = bhConfig.gravity * 2; // Stronger gravity for planets
			const dirX = dx / distance;
			const dirY = dy / distance;

			// Move toward black hole
			planet.x += dirX * gravityForce * 2;
			planet.y += dirY * gravityForce * 2;

			// Shrink planet as it gets closer to black hole
			const shrinkDistance = bhConfig.mass * 3;
			if (distance < shrinkDistance) {
				// Shrink proportionally to distance
				const shrinkFactor = distance / shrinkDistance;
				planet.radius = planet.originalRadius * shrinkFactor * planet.life;

				// Fade out
				planet.life -= 0.01;
			}

			// Remove if too small or dead
			return planet.radius > 0.5 && planet.life > 0;
		});
	}, []);

	// Update stars and planets
	const updateStars = useCallback((canvas: HTMLCanvasElement) => {
		const config = configRef.current;
		const stars = starsRef.current;
		const momentum = momentumRef.current;
		const bhConfig = config.blackHole;
		const bhX = canvas.width / 2;
		const bhY = canvas.height / 2;

		stars.forEach(star => {
			// Calculate distance to black hole
			const dx = bhX - star.x;
			const dy = bhY - star.y;
			const distanceSq = dx * dx + dy * dy;
			const distance = Math.sqrt(distanceSq);
			const bhMassSq = bhConfig.mass * bhConfig.mass;
			const bhAttractionRadiusSq = bhConfig.attractionRadius * bhConfig.attractionRadius;

			// If star is already being consumed
			if (star.consumed) {
				// Continue shrinking
				star.life -= 0.02;
				star.size = star.originalSize * star.life;

				// Move toward black hole faster
				const dirX = dx / distance;
				const dirY = dy / distance;
				star.x += dirX * bhConfig.gravity * 3;
				star.y += dirY * bhConfig.gravity * 3;

				// Release planets if not already done
				if (star.hasPlanets && star.life < 0.8) {
					releasePlanetsFromStar(star.id);
				}

				// Remove star if too small
				if (star.life <= 0 || star.size < 0.5) {
					// Respawn star at edge
					const angle = Math.random() * Math.PI * 2;
					const respawnDistance = Math.random() * canvas.width * 0.3 + canvas.width * 0.2;
					star.x = bhX + Math.cos(angle) * respawnDistance;
					star.y = bhY + Math.sin(angle) * respawnDistance;
					star.size = star.originalSize;
					star.life = 1.0;
					star.consumed = false;
					star.vx = 0;
					star.vy = 0;
				}

				return;
			}

			// Apply black hole gravity if within attraction radius
			if (distanceSq < bhAttractionRadiusSq) {
				const dirX = dx / distance;
				const dirY = dy / distance;

				const sizeInfluenceFactor = star.size / config.maxSize;
				const gravityInfluence = (1 - (distance / bhConfig.attractionRadius)) * sizeInfluenceFactor;

				const gravityForce = gravityInfluence * bhConfig.gravity;
				star.vx += dirX * gravityForce;
				star.vy += dirY * gravityForce;

				// Apply orbital spin
				const spinForce = gravityForce * bhConfig.spin * star.spinFactor;
				star.vx += -dirY * spinForce;
				star.vy += dirX * spinForce;
			}

			// Check if star should start being consumed (close to event horizon)
			const eventHorizonRadius = bhConfig.mass * 1.5;
			if (distance < eventHorizonRadius) {
				star.consumed = true;
				return;
			}

			// Apply base movement with momentum
			star.vy += (config.baseSpeed + momentum) * star.z;

			// Apply friction
			star.vx *= 0.99;
			star.vy *= 0.99;

			// Update position
			star.x += star.vx;
			star.y += star.vy;
			star.rotation += config.rotationSpeed;

			// Update planet positions (only if star is not consumed)
			star.planets.forEach(planet => {
				planet.angle += planet.orbitSpeed;
				planet.x = star.x + Math.cos(planet.angle) * planet.orbitRadius;
				planet.y = star.y + Math.sin(planet.angle) * planet.orbitRadius;
			});

			// Wrap around screen
			const buffer = star.size * 3;
			if (star.y > canvas.height + buffer) {
				star.y = -buffer;
				star.x = Math.random() * canvas.width;
				star.vx = 0;
				star.vy = 0;
			} else if (star.y < -buffer) {
				star.y = canvas.height + buffer;
				star.x = Math.random() * canvas.width;
				star.vx = 0;
				star.vy = 0;
			}
			if (star.x > canvas.width + buffer) {
				star.x = -buffer;
				star.y = Math.random() * canvas.height;
				star.vx = 0;
				star.vy = 0;
			} else if (star.x < -buffer) {
				star.x = canvas.width + buffer;
				star.y = Math.random() * canvas.height;
				star.vx = 0;
				star.vy = 0;
			}
		});

		// Update independent planets
		updateIndependentPlanets(canvas);
	}, [releasePlanetsFromStar, updateIndependentPlanets]);

	// Draw black hole with enhanced visuals
	const drawBlackHole = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
		const bhConfig = configRef.current.blackHole;
		if (!bhConfig.isEnabled) return;

		const bhX = canvas.width / 2;
		const bhY = canvas.height / 2;
		const bhRadius = bhConfig.mass;
		const pulse = Math.sin(time * bhConfig.pulseSpeed) * 0.1 + 0.9;

		// Draw multiple layers for artistic effect
		for (let i = bhConfig.layers; i > 0; i--) {
			const layerRadius = bhRadius * (1 + i * 0.2) * pulse;
			const opacity = 0.1 + (i / bhConfig.layers) * 0.3;
			const colorIndex = i % bhConfig.colorPalette.length;

			const gradient = ctx.createRadialGradient(
				bhX, bhY, layerRadius * 0.3,
				bhX, bhY, layerRadius * 1.5
			);

			gradient.addColorStop(0, rgbaFromHex(bhConfig.colorPalette[colorIndex], opacity * 0.8));
			gradient.addColorStop(0.5, rgbaFromHex(bhConfig.colorPalette[(colorIndex + 1) % bhConfig.colorPalette.length], opacity * 0.4));
			gradient.addColorStop(1, 'transparent');

			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(bhX, bhY, layerRadius, 0, Math.PI * 2);
			ctx.fill();
		}

		// Draw accretion disk
		if (bhConfig.accretionDisk) {
			const diskGradient = ctx.createRadialGradient(
				bhX, bhY, bhRadius * 1.05,
				bhX, bhY, bhRadius * 1.4
			);

			bhConfig.colorPalette.forEach((color, index) => {
				diskGradient.addColorStop(index / bhConfig.colorPalette.length, rgbaFromHex(color, 0.1));
			});
			diskGradient.addColorStop(1, 'transparent');

			ctx.fillStyle = diskGradient;
			ctx.beginPath();
			ctx.arc(bhX, bhY, bhRadius * 2, 0, Math.PI * 2);
			ctx.fill();
		}

		// Draw black hole core
		const coreGradient = ctx.createRadialGradient(
			bhX, bhY, 0,
			bhX, bhY, bhRadius
		);
		coreGradient.addColorStop(0, '#000000');
		coreGradient.addColorStop(0.7, '#111111');
		coreGradient.addColorStop(1, '#222222');

		ctx.fillStyle = coreGradient;
		ctx.beginPath();
		ctx.arc(bhX, bhY, bhRadius, 0, Math.PI * 2);
		ctx.fill();

		// Draw event horizon glow
		ctx.strokeStyle = rgbaFromHex(bhConfig.colorPalette[0], 0.6);
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(bhX, bhY, bhRadius * 1.05, 0, Math.PI * 2);
		ctx.stroke();
	}, []);

	// Draw stars with glow and planets
	const drawStars = useCallback((ctx: CanvasRenderingContext2D) => {
		const config = configRef.current;
		const stars = starsRef.current;

		stars.forEach(star => {
			// Skip drawing if star is consumed and very small
			if (star.consumed && star.size < 1) return;

			ctx.save();
			ctx.translate(star.x, star.y);
			ctx.rotate(star.rotation);

			// Draw star glow (reduced for consumed stars)
			if (config.glowIntensity > 0.01 && star.glowIntensity > 0) {
				const glowIntensity = star.consumed ? star.glowIntensity * star.life : star.glowIntensity;
				ctx.shadowColor = star.color;
				ctx.shadowBlur = star.size * config.glowIntensity * glowIntensity * 3;
			}

			// Draw star based on type with fading for consumed stars
			const alpha = star.consumed ? star.life : 1;
			ctx.globalAlpha = alpha;
			ctx.fillStyle = star.color;

			if (star.type === 'cross') {
				const armLength = star.size;
				const armWidth = star.size * 0.25;
				ctx.fillRect(-armWidth / 2, -armLength / 2, armWidth, armLength);
				ctx.fillRect(-armLength / 2, -armWidth / 2, armLength, armWidth);
			} else if (star.type === 'star') {
				const points = 8;
				const outerRadius = star.size;
				const innerRadius = star.size * 0.4;
				ctx.beginPath();
				for (let i = 0; i < points * 2; i++) {
					const radius = i % 2 === 0 ? outerRadius : innerRadius;
					const angle = (Math.PI / points) * i;
					const x = radius * Math.cos(angle);
					const y = radius * Math.sin(angle);
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.closePath();
				ctx.fill();
			} else {
				// Circle star
				ctx.beginPath();
				ctx.arc(0, 0, star.size, 0, Math.PI * 2);
				ctx.fill();
			}

			ctx.restore();
			ctx.globalAlpha = 1;

			// Draw planets (only if star is not consumed)
			if (!star.consumed) {
				star.planets.forEach(planet => {
					ctx.save();
					ctx.translate(planet.x, planet.y);

					// Planet with slight glow
					ctx.shadowColor = planet.color;
					ctx.shadowBlur = 5;
					ctx.fillStyle = planet.color;
					ctx.beginPath();
					ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
					ctx.fill();

					// Planet orbit line (faint)
					ctx.restore();
					ctx.save();
					ctx.translate(star.x, star.y);
					ctx.strokeStyle = rgbaFromHex('#FFFFFF', 0.1);
					ctx.lineWidth = 0.5;
					ctx.beginPath();
					ctx.arc(0, 0, planet.orbitRadius, 0, Math.PI * 2);
					ctx.stroke();
					ctx.restore();
				});
			}
		});

		// Draw independent planets
		independentPlanetsRef.current.forEach(planet => {
			ctx.save();
			ctx.translate(planet.x, planet.y);

			// Fade out as life decreases
			ctx.globalAlpha = planet.life;

			// Planet with glow
			ctx.shadowColor = planet.color;
			ctx.shadowBlur = 5 * planet.life;
			ctx.fillStyle = planet.color;
			ctx.beginPath();
			ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
			ctx.fill();

			ctx.restore();
		});

		// Reset shadow and alpha
		ctx.shadowBlur = 0;
		ctx.globalAlpha = 1;
	}, []);

	// Draw connections between stars
	const drawConnections = useCallback((ctx: CanvasRenderingContext2D) => {
		const config = configRef.current;
		const stars = starsRef.current;
		const gridSize = 200;
		const grid: Record<string, Star[]> = {};

		// Build spatial grid
		stars.forEach(star => {
			if (star.consumed) return; // Skip consumed stars

			const gridX = Math.floor(star.x / gridSize);
			const gridY = Math.floor(star.y / gridSize);
			const key = `${gridX},${gridY}`;
			if (!grid[key]) grid[key] = [];
			grid[key].push(star);
		});

		// Draw connections
		stars.forEach(star => {
			if (star.consumed) return; // Skip consumed stars

			const gridX = Math.floor(star.x / gridSize);
			const gridY = Math.floor(star.y / gridSize);

			for (let x = gridX - 1; x <= gridX + 1; x++) {
				for (let y = gridY - 1; y <= gridY + 1; y++) {
					const cellStars = grid[`${x},${y}`] || [];
					cellStars.forEach(otherStar => {
						if (star.id >= otherStar.id) return; // Avoid duplicate connections

						const dx = star.x - otherStar.x;
						const dy = star.y - otherStar.y;
						const distanceSq = dx * dx + dy * dy;
						const maxDistSq = config.maxConnectionDistance * config.maxConnectionDistance;

						if (distanceSq < maxDistSq && Math.random() < config.connectionChance) {
							const distance = Math.sqrt(distanceSq);
							const alpha = 0.15 * (1 - distance / config.maxConnectionDistance);

							ctx.strokeStyle = `rgba(150, 200, 255, ${alpha})`;
							ctx.lineWidth = 0.8;
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

		// Outer glow
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

		// Inner circle
		ctx.fillStyle = circle.color.replace('0.6', '0.8');
		ctx.beginPath();
		ctx.arc(circle.x, circle.y, circle.radius * 0.7, 0, Math.PI * 2);
		ctx.fill();

		// Pulsing effect
		const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 0.8;
		ctx.strokeStyle = circle.color.replace('0.6', '0.9');
		ctx.lineWidth = 2 * pulse;
		ctx.beginPath();
		ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
		ctx.stroke();

		ctx.restore();
	}, []);

	// Animation loop
	const animate = useCallback(() => {
		const canvas = canvasRef.current;
		const offscreenCtx = offscreenCtxRef.current;
		if (!canvas || !offscreenCtx) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		timeRef.current += 0.016; // ~60fps

		// Clear with trail effect
		offscreenCtx.fillStyle = `rgba(31, 31, 31, ${configRef.current.trailOpacity})`;
		offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);

		// Update momentum from scroll
		momentumRef.current *= configRef.current.momentumDecay;

		// Update interactive circle
		if (interactiveCircle) {
			const updatedCircle = updateInteractiveCircle(interactiveCircle, canvas);
			if (updatedCircle) {
				setInteractiveCircle(updatedCircle);
			} else {
				setInteractiveCircle(null);
			}
		}

		// Update stars and planets
		updateStars(canvas);

		// Draw everything to offscreen canvas
		drawBlackHole(offscreenCtx, canvas, timeRef.current);
		drawConnections(offscreenCtx);
		drawStars(offscreenCtx);

		if (interactiveCircle) {
			drawInteractiveCircle(offscreenCtx, interactiveCircle);
		}

		// Draw offscreen canvas to main canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(offscreenCanvasRef.current!, 0, 0);

		animationFrameId.current = requestAnimationFrame(animate);
	}, [interactiveCircle, updateInteractiveCircle, updateStars, drawBlackHole, drawStars, drawConnections, drawInteractiveCircle]);

	// Initialize and cleanup
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Set up canvas
		const handleResize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;

			if (!offscreenCanvasRef.current) {
				offscreenCanvasRef.current = document.createElement('canvas');
				offscreenCtxRef.current = offscreenCanvasRef.current.getContext('2d');
			}

			offscreenCanvasRef.current.width = canvas.width;
			offscreenCanvasRef.current.height = canvas.height;

			// Reinitialize stars on resize
			initStars(canvas);
		};

		handleResize();
		window.addEventListener('resize', handleResize);

		// Handle scroll for momentum
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			const scrollDelta = (lastScrollYRef.current - currentScrollY) * configRef.current.scrollSensitivity;
			momentumRef.current += scrollDelta;
			lastScrollYRef.current = currentScrollY;
		};
		window.addEventListener('scroll', handleScroll);

		// Pointer events
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

		// Start animation
		if (!isMobile() || window.innerWidth > 768) {
			animate();
		}

		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('scroll', handleScroll);

			canvas.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);

			canvas.removeEventListener('touchstart', handleTouchStart);
			canvas.removeEventListener('touchmove', handleTouchMove);
			canvas.removeEventListener('touchend', handleTouchEnd);

			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current);
			}
		};
	}, [initStars, animate, handlePointerDown, handlePointerMove, handlePointerUp, isPointerDown]);

	// Update config ref when config changes
	useEffect(() => {
		configRef.current = config;
	}, [config]);

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