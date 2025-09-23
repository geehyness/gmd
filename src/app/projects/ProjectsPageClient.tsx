'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Box, Flex, Heading, Text, Container,
    useColorModeValue, useToken, useTheme
} from '@chakra-ui/react';
import PublicProjects from '@/components/PublicProjects';
import { Project } from '@/types/sanity';

const DEFAULT_CONFIG = {
  starCount: 80,
  minSize: 2,
  maxSize: 10,
  minDepth: 0.1,
  maxDepth: 50.0,
  baseSpeed: 0.000008,
  momentumDecay: 0.5,
  scrollSensitivity: 0.002,
  glowIntensity: 0,
  connectionChance: 0.5,
  maxConnectionDistance: 150,
  rotationSpeed: 0.001,
  trailOpacity: 0.6,
  blackHole: {
    isEnabled: false,
    mass: 150,
    gravity: 0.18,
    attractionRadius: 800,
    spin: 1,
    accretionDisk: true,
    escapeMomentumThreshold: 20,
  }
};

const MotionBox = motion(Box);

// Helper functions (copied from HomePageClient)
const isMobile = () => {
    if (typeof window === "undefined") {
        return false;
    }
    return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        )
    );
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

interface ProjectsPageClientProps {
    projects: Project[];
}

const ProjectsPageClient: React.FC<ProjectsPageClientProps> = ({ projects }) => {
    const theme = useTheme();
    const bgPrimaryToken = useColorModeValue('neutral.light.bg-primary', 'neutral.dark.bg-primary');
    const textPrimaryToken = useColorModeValue('neutral.light.text-primary', 'neutral.dark.text-primary');
    const accentRgba = useToken('colors', 'accent.500');

    const [
        brandHex,
        accentHex,
        neutralLightBgPrimaryHex,
        neutralDarkBgPrimaryHex,
    ] = useToken('colors', [
        'brand.500',
        'accent.500',
        'neutral.light.bg-primary',
        'neutral.dark.bg-primary'
    ]);

    const bgPrimaryHex = useColorModeValue(neutralLightBgPrimaryHex, neutralDarkBgPrimaryHex);
    const canvasBg = bgPrimaryHex || '#F8FAFC';

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const configRef = useRef(config);

    const bhGlowGradientRef = useRef<CanvasGradient | null>(null);
    const bhDiskGradientRef = useRef<CanvasGradient | null>(null);
    const initStarsRef = useRef<(() => void) | null>(null);

    const updateBlackHoleGradients = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bhX = canvas.width / 2;
        const bhY = canvas.height / 2;
        const bhRadius = configRef.current.blackHole.mass;

        const glowGradient = ctx.createRadialGradient(
            bhX, bhY, bhRadius * 0.5,
            bhX, bhY, bhRadius * 3.5
        );
        glowGradient.addColorStop(0, rgbaFromHex(brandHex || '#6366F1', 0.9));
        glowGradient.addColorStop(0.3, 'rgba(230, 230, 250, 0.4)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        bhGlowGradientRef.current = glowGradient;

        if (configRef.current.blackHole.accretionDisk) {
            const diskGradient = ctx.createRadialGradient(
                bhX, bhY, bhRadius * 1.01,
                bhX, bhY, bhRadius * 1.3
            );
            diskGradient.addColorStop(0, rgbaFromHex(accentHex || '#14B8A6', 0));
            diskGradient.addColorStop(0.25, rgbaFromHex(accentHex || '#14B8A6', 0.4));
            diskGradient.addColorStop(1, rgbaFromHex(accentHex || '#14B8A6', 0));
            bhDiskGradientRef.current = diskGradient;
        } else {
            bhDiskGradientRef.current = null;
        }
    }, [brandHex, accentHex]);

    useEffect(() => {
        configRef.current = config;
        if (initStarsRef.current) initStarsRef.current();
    }, [config]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        class Star {
            x: number;
            y: number;
            z: number;
            size: number;
            rotation: number;
            type: 'cross' | 'star';
            vx: number;
            vy: number;
            spinFactor: number;

            constructor(canvas: HTMLCanvasElement) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.z = Math.random() * (configRef.current.maxDepth - configRef.current.minDepth) + configRef.current.minDepth;
                this.size = Math.random() * (configRef.current.maxSize - configRef.current.minSize) + configRef.current.minSize;
                this.rotation = Math.random() * Math.PI * 2;
                this.type = Math.random() > 0.5 ? 'cross' : 'star';
                this.vx = 0;
                this.vy = 0;
                this.spinFactor = 0.5 + Math.random() * 0.5;
            }

            update(canvas: HTMLCanvasElement, momentum: number) {
                const bhConfig = configRef.current.blackHole;
                if (bhConfig.isEnabled) {
                    const bhX = canvas.width / 2;
                    const bhY = canvas.height / 2;
                    const dx = bhX - this.x;
                    const dy = bhY - this.y;
                    const distanceSq = dx * dx + dy * dy;
                    const bhMassSq = bhConfig.mass * bhConfig.mass;
                    const bhAttractionRadiusSq = bhConfig.attractionRadius * bhConfig.attractionRadius;

                    if (distanceSq < bhMassSq) {
                        if (Math.random() < 0.2) {
                            this.x = Math.random() * canvas.width;
                            this.y = -this.size * 2 - Math.random() * canvas.height * 0.5;
                            this.z = Math.random() * (configRef.current.maxDepth - configRef.current.minDepth) + configRef.current.minDepth;
                            this.size = Math.random() * (configRef.current.maxSize - configRef.current.minSize) + configRef.current.minSize;
                            this.rotation = Math.random() * Math.PI * 2;
                            this.vx = 0; this.vy = 0;
                        }
                    }
                    if (distanceSq < bhAttractionRadiusSq) {
                        const distance = Math.sqrt(distanceSq);
                        const dirX = dx / distance;
                        const dirY = dy / distance;
                        const sizeInfluenceFactor = this.size / configRef.current.maxSize;
                        const gravityInfluence = (1 - (distance / bhConfig.attractionRadius)) * sizeInfluenceFactor;
                        const gravityForce = gravityInfluence * bhConfig.gravity;
                        this.vx += dirX * gravityForce;
                        this.vy += dirY * gravityForce;
                        const spinForce = gravityForce * bhConfig.spin * this.spinFactor;
                        this.vx += -dirY * spinForce;
                        this.vy += dirX * spinForce;
                    }
                }
                this.vy += (configRef.current.baseSpeed + momentum) * this.z;
                this.vx *= 0.985;
                this.vy *= 0.985;
                this.x += this.vx;
                this.y += this.vy;
                this.rotation += configRef.current.rotationSpeed;
                const buffer = this.size * 2;
                if (this.y > canvas.height + buffer) {
                    this.y = -buffer;
                    this.x = Math.random() * canvas.width;
                    this.vx = 0; this.vy = 0;
                } else if (this.y < -buffer) {
                    this.y = canvas.height + buffer;
                    this.x = Math.random() * canvas.width;
                    this.vx = 0; this.vy = 0;
                }
                if (this.x > canvas.width + buffer) {
                    this.x = -buffer;
                    this.y = Math.random() * canvas.height;
                    this.vx = 0; this.vy = 0;
                } else if (this.x < -buffer) {
                    this.x = canvas.width + buffer;
                    this.y = Math.random() * canvas.height;
                    this.vx = 0; this.vy = 0;
                }
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                const starColor = 'rgba(51, 65, 85, 0.46)';
                if (configRef.current.glowIntensity > 0.01) {
                    ctx.shadowColor = 'rgba(15, 23, 42, 0.5)';
                    ctx.shadowBlur = this.size * configRef.current.glowIntensity * 2;
                } else {
                    ctx.shadowBlur = 0;
                }
                if (this.type === 'cross') {
                    this.drawCross(ctx, starColor);
                } else {
                    this.drawStar(ctx, starColor);
                }
                ctx.restore();
            }

            drawCross(ctx: CanvasRenderingContext2D, color: string) {
                const armLength = this.size;
                const armWidth = this.size * 0.25;
                ctx.fillStyle = color;
                ctx.fillRect(-armWidth / 2, -armLength / 2, armWidth, armLength);
                ctx.fillRect(-armLength / 2, -armWidth / 2, armLength, armWidth);
            }
            drawStar(ctx: CanvasRenderingContext2D, color: string) {
                const points = 8;
                const outerRadius = this.size;
                const innerRadius = this.size * 0.4;
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
                ctx.fillStyle = color;
                ctx.fill();
            }
        }

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            updateBlackHoleGradients();
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        let stars: Star[] = [];
        const initStars = () => {
            stars = [];
            for (let i = 0; i < configRef.current.starCount; i++) {
                stars.push(new Star(canvas));
            }
        };
        initStarsRef.current = initStars;
        initStars();

        let momentum = 0;
        let lastScrollY = window.scrollY;
        let animationFrameId: number;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDelta = (lastScrollY - currentScrollY) * configRef.current.scrollSensitivity;
            momentum += scrollDelta;
            lastScrollY = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll);

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        if (!offscreenCtx) return;

        updateBlackHoleGradients();

        const animate = () => {
            offscreenCtx.fillStyle = `rgba(248, 250, 252, ${configRef.current.trailOpacity})`;
            offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);
            momentum *= configRef.current.momentumDecay;
            const bhConfig = configRef.current.blackHole;

            if (bhConfig.isEnabled) {
                const bhX = canvas.width / 2;
                const bhY = canvas.height / 2;
                const bhRadius = bhConfig.mass;
                if (bhGlowGradientRef.current) {
                    offscreenCtx.fillStyle = bhGlowGradientRef.current;
                    offscreenCtx.fillRect(
                        bhX - bhRadius * 4, bhY - bhRadius * 4, bhRadius * 8, bhRadius * 8
                    );
                }
                if (bhConfig.accretionDisk && bhDiskGradientRef.current) {
                    offscreenCtx.fillStyle = bhDiskGradientRef.current;
                    offscreenCtx.beginPath();
                    offscreenCtx.arc(bhX, bhY, bhRadius * 2.5, 0, Math.PI * 2);
                    offscreenCtx.fill();
                }
                offscreenCtx.fillStyle = '#ffffffff';
                offscreenCtx.beginPath();
                offscreenCtx.arc(bhX, bhY, bhRadius, 0, Math.PI * 2);
                offscreenCtx.fill();
                offscreenCtx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
                offscreenCtx.lineWidth = 1;
                offscreenCtx.beginPath();
                offscreenCtx.arc(bhX, bhY, bhRadius * 1.1, 0, Math.PI * 2);
                offscreenCtx.stroke();
            }

            const gridSize = 200;
            const grid: Record<string, Star[]> = {};
            stars.forEach(star => {
                const gridX = Math.floor(star.x / gridSize);
                const gridY = Math.floor(star.y / gridSize);
                const key = `${gridX},${gridY}`;
                if (!grid[key]) grid[key] = [];
                grid[key].push(star);
            });

            stars.forEach(star => {
                star.update(canvas, momentum);
                const gridX = Math.floor(star.x / gridSize);
                const gridY = Math.floor(star.y / gridSize);
                for (let x = gridX - 1; x <= gridX + 1; x++) {
                    for (let y = gridY - 1; y <= gridY + 1; y++) {
                        const cellStars = grid[`${x},${y}`] || [];
                        cellStars.forEach(otherStar => {
                            if (star === otherStar) return;
                            const dx = star.x - otherStar.x;
                            const dy = star.y - otherStar.y;
                            const distanceSq = dx * dx + dy * dy;
                            if (distanceSq < configRef.current.maxConnectionDistance * configRef.current.maxConnectionDistance && Math.random() < configRef.current.connectionChance) {
                                const distance = Math.sqrt(distanceSq);
                                const alpha = 0.1 * (1 - distance / configRef.current.maxConnectionDistance);
                                offscreenCtx.strokeStyle = `rgba(71, 85, 105, ${alpha})`;
                                offscreenCtx.lineWidth = 0.5;
                                offscreenCtx.beginPath();
                                offscreenCtx.moveTo(star.x, star.y);
                                offscreenCtx.lineTo(otherStar.x, otherStar.y);
                                offscreenCtx.stroke();
                            }
                        });
                    }
                }
            });
            stars.forEach(star => star.draw(offscreenCtx));
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(offscreenCanvas, 0, 0);
            animationFrameId = requestAnimationFrame(animate);
        };

        if (!isMobile()) {
            animate();
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [updateBlackHoleGradients, bgPrimaryHex]);

    return (
        <Box position="relative" w="100%" minH="100vh">
            {!isMobile() && (
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: -1,
                        backgroundColor: canvasBg,
                    }}
                />
            )}
            <Container maxW="container.xl" pt={20} pb={20} position="relative" zIndex={1}>
                <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    textAlign="center"
                    minH={{ base: '40vh', md: '50vh' }}
                    mb={{ base: 10, md: 20 }}
                >
                    <Heading
                        as="h1"
                        size={{ base: '2xl', md: '3xl', lg: '4xl' }}
                        color={textPrimaryToken}
                        fontWeight="extrabold"
                        letterSpacing="tight"
                    >
                        Our Projects
                    </Heading>
                    <Text
                        mt={4}
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
