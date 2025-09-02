// src/app/homepage/HomePageClient.tsx
'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Flex, Heading, Text, Container, SimpleGrid, Button,
  VStack, HStack, Icon, Divider, Tag,
  IconButton, Slider, SliderTrack,
  SliderFilledTrack, SliderThumb, FormControl, FormLabel, Collapse,
  Switch, useDisclosure, useColorModeValue, useTheme, useToken
} from '@chakra-ui/react';
import { FaChevronDown, FaRocket, FaTimes, FaCog, FaArrowRight } from 'react-icons/fa';
import { FiMail, FiPhone, FiGithub, FiLinkedin } from 'react-icons/fi';

const DEFAULT_CONFIG = {
  starCount: 50,
  minSize: 2,
  maxSize: 10,
  minDepth: 0.1,
  maxDepth: 50.0,
  baseSpeed: 0.000008,
  momentumDecay: 0.8,
  scrollSensitivity: 0.001,
  glowIntensity: 0,
  connectionChance: 0.3,
  maxConnectionDistance: 100,
  rotationSpeed: 0.001,
  trailOpacity: 0.2, // Reduced opacity for light background
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

/** Helpers **/

const isMobile = () => {
  if (typeof window === "undefined") {
    return false; // Prevents issues on the server side (SSR frameworks like Next.js)
  }
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
};

function hexToRgb(hex: string) {
  if (!hex) return null;
  // If the token is already an rgba string, return parsed values
  if (hex.startsWith('rgba')) {
    const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
    if (!match) return null;
    return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: match[4] ? Number(match[4]) : 1 };
  }
  // Normalize #RRGGBB or #RGB
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

const HomePageClient: React.FC = () => {
  const theme = useTheme();

  // Token strings for Chakra props
  const bgPrimaryToken = useColorModeValue('neutral.light.bg-primary', 'neutral.dark.bg-primary');
  const bgSecondaryToken = useColorModeValue('neutral.light.bg-secondary', 'neutral.dark.bg-secondary');
  const bgCardToken = useColorModeValue('neutral.light.bg-card', 'neutral.dark.bg-card');
  const textPrimaryToken = useColorModeValue('neutral.light.text-primary', 'neutral.dark.text-primary');
  const textSecondaryToken = useColorModeValue('neutral.light.text-secondary', 'neutral.dark.text-secondary');
  const borderToken = useColorModeValue('neutral.light.border-color', 'neutral.dark.border-color');

  // Raw values (hex/rgba) for computed styles (shadows, glows, canvas)
  const [
    brandHex,
    accentHex,
    neutralLightBgCardHex,
    neutralDarkBgCardHex,
    neutralLightBgPrimaryHex,
    neutralDarkBgPrimaryHex,
    borderHex,
    secondaryGlowRaw
  ] = useToken('colors', [
    'brand.500',
    'accent.500',
    'neutral.light.bg-card',
    'neutral.dark.bg-card',
    'neutral.light.bg-primary',
    'neutral.dark.bg-primary',
    'neutral.light.border-color',
    'secondary-glow'
  ]);

  // Resolve actual hex for current color mode
  const bgPrimaryHex = useColorModeValue(neutralLightBgPrimaryHex, neutralDarkBgPrimaryHex);
  const cardBgHex = useColorModeValue(neutralLightBgCardHex, neutralDarkBgCardHex);
  const borderHexResolved = borderHex || '#000000';

  // computed colors
  const brandGlow = useToken('colors', 'brand.200');
  const brandGlowStrong = useToken('colors', 'brand.300');
  const accentRgba = useToken('colors', 'accent.500');
  const tagTint = useToken('colors', 'brand.50');
  const canvasBg = bgPrimaryHex || '#F8FAFC'; // Always use light background

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentSectionRef = useRef<HTMLDivElement>(null);
  const { isOpen: controlsOpen, onToggle: toggleControls } = useDisclosure();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const configRef = useRef(config);

  // Glass card props — use chakra tokens for consistent look
  const glassCardProps = {
    bg: bgCardToken,
    backdropFilter: 'blur(12px) saturate(160%)',
    border: '1px solid',
    borderColor: borderToken,
    boxShadow: useColorModeValue('md', 'dark-md'),
    borderRadius: 'xl',
    transition: 'all 0.25s ease-in-out',
    _hover: { transform: 'translateY(-5px)', boxShadow: useColorModeValue('lg', 'dark-lg') }
  } as const;

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

    // Update glow gradient colors here
    const glowGradient = ctx.createRadialGradient(
      bhX, bhY, bhRadius * 0.5,
      bhX, bhY, bhRadius * 3.5
    );
    glowGradient.addColorStop(0, rgbaFromHex(brandHex || '#6366F1', 0.9));

    // Changed from dark to light colors
    glowGradient.addColorStop(0.3, 'rgba(230, 230, 250, 0.4)'); // Light lavender
    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Fade to white

    bhGlowGradientRef.current = glowGradient;

    if (configRef.current.blackHole.accretionDisk) {
      const diskGradient = ctx.createRadialGradient(
        bhX, bhY, bhRadius * 1.01,
        bhX, bhY, bhRadius * 1.3
      );

      // Update accretion disk colors here
      diskGradient.addColorStop(0, rgbaFromHex(accentHex || '#14B8A6', 0));
      diskGradient.addColorStop(0.25, rgbaFromHex(accentHex || '#14B8A6', 0.4)); // Increased opacity
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
              this.vx = 0;
              this.vy = 0;
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

        // Darker stars for better visibility on light background
        const starColor = 'rgba(51, 65, 85, 0.46)';

        if (configRef.current.glowIntensity > 0.01) {
          ctx.shadowColor = 'rgba(15, 23, 42, 0.5)'; // slate-900 with opacity
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

      drawCircle(ctx: CanvasRenderingContext2D, color: string) {
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
      // Lighter trail effect for light background
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
            bhX - bhRadius * 4,
            bhY - bhRadius * 4,
            bhRadius * 8,
            bhRadius * 8
          );
        }

        if (bhConfig.accretionDisk && bhDiskGradientRef.current) {
          offscreenCtx.fillStyle = bhDiskGradientRef.current;
          offscreenCtx.beginPath();
          offscreenCtx.arc(bhX, bhY, bhRadius * 2.5, 0, Math.PI * 2);
          offscreenCtx.fill();
        }

        offscreenCtx.fillStyle = '#ffffffff'; // Darker black hole for contrast
        offscreenCtx.beginPath();
        offscreenCtx.arc(bhX, bhY, bhRadius, 0, Math.PI * 2);
        offscreenCtx.fill();

        offscreenCtx.strokeStyle = 'rgba(100, 116, 139, 0.25)'; // Lighter border
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
                offscreenCtx.strokeStyle = `rgba(71, 85, 105, ${alpha})`; // slate-600 with alpha
                offscreenCtx.beginPath();
                offscreenCtx.moveTo(star.x, star.y);
                offscreenCtx.lineTo(otherStar.x, otherStar.y);
                offscreenCtx.stroke();
              }
            });
          }
        }
      });

      stars.forEach(star => {
        star.update(canvas, momentum);
        star.draw(offscreenCtx);
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offscreenCanvas, 0, 0);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [updateBlackHoleGradients]);

  const scrollToContent = () => {
    if (contentSectionRef.current) {
      contentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleConfigChange = (key: string, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleBlackHoleConfigChange = (key: string, value: number | boolean) => {
    setConfig(prev => ({
      ...prev,
      blackHole: {
        ...prev.blackHole,
        [key]: value
      }
    }));
  };

  const contactInfo = [
    { icon: FiPhone, text: "+268 7934 2380", url: "tel:+26879342380" },
    { icon: FiGithub, text: "github.com/geehyness/", url: "https://github.com/geehyness" },
    { icon: FiMail, text: "godlinessdongorere@gmail.com", url: "mailto:godlinessdongorere@gmail.com" },
    { icon: FiLinkedin, text: "linkedin.com/in/gdongorere", url: "https://linkedin.com/in/gdongorere" }
  ];

  const skills = [
    {
      category: "Programming Languages",
      items: ["Java", "Python", "C++", "JavaScript (ExpressJS)"]
    },
    {
      category: "Frameworks & Tools",
      items: ["OutSystems", "TIA Portal", "SCADA Ignition", "Git"]
    },
    {
      category: "AI & Machine Learning",
      items: ["Data analysis", "AI-driven problem-solving", "Process optimization"]
    },
    {
      category: "3D Design & Visualization",
      items: ["3D modeling", "Prototyping", "3D printing", "3D visualization tools"]
    },
    {
      category: "Hardware & Automation",
      items: ["Siemens PLC programming", "Profinet integration"]
    },
    {
      category: "Soft Skills",
      items: ["Problem-solving", "Teamwork", "Adaptability", "Time management"]
    },
  ];

  const experience = [
    {
      company: "The Luke Commission, Sidvokodvo, eSwatini",
      position: "Systems Engineer",
      period: "May 2023 – PRESENT",
      achievements: [
        "Designed Oxygen Plant Dashboard (SCADA Ignition), improving product gas quality",
        "Programmed Siemens PLCs using TIA Portal and integrated Profinet slaves",
        "Developed applications using OutSystems for organizational processes",
        "Created custom 3D-printed solutions for hospital IT settings",
        "Modeled and printed replacement parts for broken equipment",
        "Utilized AI tools to analyze data and optimize processes"
      ]
    },
    {
      company: "Ka-Zakhali Private School, Manzini, eSwatini",
      position: "Technical Assistant Intern",
      period: "March 2022 – December 2022",
      achievements: [
        "Developed custom reporting system for school reports",
        "Taught Computer Application Technology to students",
        "Provided ICT support and troubleshooting"
      ]
    }
  ];

  const education = {
    institution: "University of Johannesburg, South Africa",
    degree: "BSc in Computer Sciences and Informatics",
    period: "Graduated December 2020"
  };

  const projects = [
    {
      title: "Oxygen Plant Dashboard",
      description: "SCADA Ignition dashboard to monitor and improve oxygen plant operations",
      technologies: ["SCADA Ignition", "Siemens PLC", "Data Visualization"]
    },
    {
      title: "3D-Printed Healthcare Solutions",
      description: "Custom camera mounts, Ankle-Foot Orthoses, and replacement parts",
      technologies: ["3D Modeling", "Prototyping", "CAD"]
    },
    {
      title: "AI-Driven Solutions",
      description: "Applied AI tools for data analysis and process optimization",
      technologies: ["Python", "Machine Learning", "Automation"]
    },
    {
      title: "School Reporting System",
      description: "Custom system for Ka-Zakhali Private School",
      technologies: ["JavaScript", "ExpressJS", "Database Design"]
    }
  ];

  const interests = [
    "Exploring emerging technologies (AI, 3D printing)",
    "Open-source software development",
    "Healthcare innovation",
    "3D visualization and prototyping",
  ];

  return (
    <Box
      position="relative"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      overflowX="hidden"
      bg={bgPrimaryToken}
      minH="100vh"
      sx={{ fontSmoothing: 'antialiased' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          backgroundColor: canvasBg
        }}
      />

      <Box
        position="fixed"
        bottom={4}
        right={4}
        zIndex={60}
        p={3}
        width="320px"
        {...glassCardProps}
      >
        <Flex justify="space-between" align="center" mb={controlsOpen ? 3 : 0}>
          <HStack spacing={2}>
            {/*<Icon as={FaCog} color={accentRgba} />*/}
            <Text color={textPrimaryToken} fontWeight="bold">Starfield Controls</Text>
          </HStack>
          <IconButton
            aria-label={controlsOpen ? "Close controls" : "Open controls"}
            icon={controlsOpen ? <FaTimes /> : <FaCog />}
            size="sm"
            variant="ghost"
            color={accentRgba}
            onClick={toggleControls}
          />
        </Flex>

        <Collapse in={controlsOpen} animateOpacity>
          <VStack spacing={4} align="stretch" maxH="70vh" overflowY="auto" pr={2} mt={2}>
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
                    onChange={(e) => handleBlackHoleConfigChange('isEnabled', e.target.checked)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimaryToken} fontSize="sm">Mass (Size)</FormLabel>
                  <Slider value={config.blackHole.mass} min={5} max={300} step={1} onChange={(val) => handleBlackHoleConfigChange('mass', val)}>
                    <SliderTrack bg="transparent"><SliderFilledTrack bg={accentRgba} /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text color={textSecondaryToken} fontSize="sm" textAlign="right">{config.blackHole.mass}px</Text>
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimaryToken} fontSize="sm">Gravity</FormLabel>
                  <Slider value={config.blackHole.gravity} min={0} max={0.5} step={0.001} onChange={(val) => handleBlackHoleConfigChange('gravity', val)}>
                    <SliderTrack bg="transparent"><SliderFilledTrack bg={accentRgba} /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text color={textSecondaryToken} fontSize="sm" textAlign="right">{config.blackHole.gravity.toFixed(3)}</Text>
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimaryToken} fontSize="sm">Attraction Radius</FormLabel>
                  <Slider value={config.blackHole.attractionRadius} min={100} max={1600} step={10} onChange={(val) => handleBlackHoleConfigChange('attractionRadius', val)}>
                    <SliderTrack bg="transparent"><SliderFilledTrack bg={accentRgba} /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text color={textSecondaryToken} fontSize="sm" textAlign="right">{config.blackHole.attractionRadius}px</Text>
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimaryToken} fontSize="sm">Orbital Spin</FormLabel>
                  <Slider value={config.blackHole.spin} min={0} max={4} step={0.01} onChange={(val) => handleBlackHoleConfigChange('spin', val)}>
                    <SliderTrack bg="transparent"><SliderFilledTrack bg={accentRgba} /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text color={textSecondaryToken} fontSize="sm" textAlign="right">{config.blackHole.spin.toFixed(2)}</Text>
                </FormControl>

                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel htmlFor="bh-accretion" color={textPrimaryToken} fontSize="sm" mb="0">
                    Accretion Disk
                  </FormLabel>
                  <Switch
                    id="bh-accretion"
                    colorScheme="brand"
                    isChecked={config.blackHole.accretionDisk}
                    onChange={(e) => handleBlackHoleConfigChange('accretionDisk', e.target.checked)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimaryToken} fontSize="sm">Escape Momentum Threshold</FormLabel>
                  <Slider value={config.blackHole.escapeMomentumThreshold} min={0} max={200} step={1} onChange={(val) => handleBlackHoleConfigChange('escapeMomentumThreshold', val)}>
                    <SliderTrack bg="transparent"><SliderFilledTrack bg={accentRgba} /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text color={textSecondaryToken} fontSize="sm" textAlign="right">{config.blackHole.escapeMomentumThreshold}px/frame</Text>
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            <Box>
              <Text color={accentRgba} fontWeight="bold" mb={2}>Connection Settings</Text>
              <VStack spacing={3}>
                <FormControl>
                  <FormLabel color={textPrimaryToken} fontSize="sm">Connection Chance</FormLabel>
                  <Slider
                    value={config.connectionChance}
                    min={0}
                    max={0.5}
                    step={0.01}
                    onChange={(val) => handleConfigChange('connectionChance', val)}
                  >
                    <SliderTrack bg="transparent"><SliderFilledTrack bg={accentRgba} /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text color={textSecondaryToken} fontSize="sm" textAlign="right">
                    {Math.round(config.connectionChance * 100)}%
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimaryToken} fontSize="sm">Max Connection Distance</FormLabel>
                  <Slider
                    value={config.maxConnectionDistance}
                    min={50}
                    max={500}
                    step={1}
                    onChange={(val) => handleConfigChange('maxConnectionDistance', val)}
                  >
                    <SliderTrack bg="transparent"><SliderFilledTrack bg={accentRgba} /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text color={textSecondaryToken} fontSize="sm" textAlign="right">
                    {config.maxConnectionDistance}px
                  </Text>
                </FormControl>
              </VStack>
            </Box>

            <Box>
              <Text color={accentRgba} fontWeight="bold" mb={2}>Motion Settings</Text>
              <VStack spacing={3}>
                <FormControl>
                  <FormLabel color={textPrimaryToken} fontSize="sm">Base Speed</FormLabel>
                  <Slider
                    value={config.baseSpeed}
                    min={0}
                    max={0.2}
                    step={0.00001}
                    onChange={(val) => handleConfigChange('baseSpeed', val)}
                  >
                    <SliderTrack bg="transparent"><SliderFilledTrack bg={accentRgba} /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text color={textSecondaryToken} fontSize="sm" textAlign="right">
                    {config.baseSpeed.toFixed(6)}
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimaryToken} fontSize="sm">Momentum Decay</FormLabel>
                  <Slider
                    value={config.momentumDecay}
                    min={0.5}
                    max={0.995}
                    step={0.001}
                    onChange={(val) => handleConfigChange('momentumDecay', val)}
                  >
                    <SliderTrack bg="transparent"><SliderFilledTrack bg={accentRgba} /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text color={textSecondaryToken} fontSize="sm" textAlign="right">
                    {config.momentumDecay.toFixed(3)}
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimaryToken} fontSize="sm">Scroll Sensitivity</FormLabel>
                  <Slider
                    value={config.scrollSensitivity}
                    min={0.0001}
                    max={0.1}
                    step={0.0001}
                    onChange={(val) => handleConfigChange('scrollSensitivity', val)}
                  >
                    <SliderTrack bg="transparent"><SliderFilledTrack bg={accentRgba} /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text color={textSecondaryToken} fontSize="sm" textAlign="right">
                    {config.scrollSensitivity.toFixed(4)}
                  </Text>
                </FormControl>
              </VStack>
            </Box>

            <Box>
              <Text color={accentRgba} fontWeight="bold" mb={2}>Visual Settings</Text>
              <VStack spacing={3}>
                <FormControl>
                  <FormLabel color={textPrimaryToken} fontSize="sm">Star Count</FormLabel>
                  <Slider
                    value={config.starCount}
                    min={10}
                    max={500}
                    step={10}
                    onChange={(val) => handleConfigChange('starCount', val)}
                  >
                    <SliderTrack bg="transparent"><SliderFilledTrack bg={accentRgba} /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text color={textSecondaryToken} fontSize="sm" textAlign="right">
                    {config.starCount} stars
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimaryToken} fontSize="sm">Glow Intensity</FormLabel>
                  <Slider
                    value={config.glowIntensity}
                    min={0.0}
                    max={1}
                    step={0.01}
                    onChange={(val) => handleConfigChange('glowIntensity', val)}
                  >
                    <SliderTrack bg="transparent"><SliderFilledTrack bg={accentRgba} /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text color={textSecondaryToken} fontSize="sm" textAlign="right">
                    {config.glowIntensity.toFixed(2)}
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimaryToken} fontSize="sm">Trail Opacity</FormLabel>
                  <Slider
                    value={config.trailOpacity}
                    min={0.01}
                    max={0.95}
                    step={0.01}
                    onChange={(val) => handleConfigChange('trailOpacity', val)}
                  >
                    <SliderTrack bg="transparent"><SliderFilledTrack bg={accentRgba} /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text color={textSecondaryToken} fontSize="sm" textAlign="right">
                    {config.trailOpacity.toFixed(2)}
                  </Text>
                </FormControl>
              </VStack>
            </Box>

            <Button
              colorScheme="brand"
              size="sm"
              onClick={() => setConfig(DEFAULT_CONFIG)}
            >
              Reset to Defaults
            </Button>
          </VStack>
        </Collapse>
      </Box>

      <Box height="100vh" width="100%"
        as="section"
        position="relative"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        px={4}
        py={{ base: 8, md: 16 }}
        zIndex={10}
      >
        <VStack spacing={16} textAlign="center" zIndex={20}>
          <MotionBox
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          >
            <Heading
              as="h1"
              size={{ base: "lg", md: "xl" }}
              fontWeight="extrabold"
              letterSpacing="tight"
              color={textPrimaryToken}
              textShadow={`0 6px 26px ${brandGlow}`}
            >
              Godliness <Box as="span" color={accentRgba} display="inline-block" textShadow={`0 8px 30px ${brandGlowStrong}`}>Dongorere</Box>
            </Heading><br />
            <hr />
            <HStack spacing={4} mb={6} justify="center">
              <IconButton
                aria-label="GitHub"
                icon={<FiGithub size="24px" />}
                variant="solid"
                size="lg"
                borderRadius="full"
                bg={bgCardToken}
                color={accentRgba}
                _hover={{ bg: accentRgba, color: "white", transform: "scale(1.1)" }}
                as="a"
                href="https://github.com/gdongorere"
                target="_blank"
                boxShadow="md"
                transition="all 0.2s ease"
              />
              <IconButton
                aria-label="LinkedIn"
                icon={<FiLinkedin size="24px" />}
                variant="solid"
                size="lg"
                borderRadius="full"
                bg={bgCardToken}
                color={accentRgba}
                _hover={{ bg: accentRgba, color: "white", transform: "scale(1.1)" }}
                as="a"
                href="https://linkedin.com/in/gdongorere"
                target="_blank"
                boxShadow="md"
                transition="all 0.2s ease"
              />
              <IconButton
                aria-label="Email"
                icon={<FiMail size="24px" />}
                variant="solid"
                size="lg"
                borderRadius="full"
                bg={bgCardToken}
                color={accentRgba}
                _hover={{ bg: accentRgba, color: "white", transform: "scale(1.1)" }}
                as="a"
                href="mailto:godlinessdongorere@gmail.com"
                boxShadow="md"
                transition="all 0.2s ease"
              />
            </HStack>
            <Text fontSize={{ base: "sm", md: "md" }} color={textSecondaryToken} mt={4}>
              Software Developer<br />& AI/3D Solutions Specialist
            </Text>
          </MotionBox>
          <MotionBox
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
          >
            <Button
              variant="ghost"
              color={textPrimaryToken}
              _hover={{ color: accentRgba, transform: "translateY(4px)" }}
              onClick={scrollToContent}
              aria-label="Scroll to content"
            >
              <Icon as={FaChevronDown} boxSize={8} />
            </Button>
          </MotionBox>
        </VStack>
      </Box>

      <Container maxW="container.xl" py={20} ref={contentSectionRef} zIndex={10}>
        <SimpleGrid mt={10} columns={{ base: 1, md: 2 }} spacing={6} mb={10}>
          {contactInfo.map((contact, index) => {
            const isPhoneNumber = contact.url.startsWith("tel:");
            const handleContactClick = () => {
              if (isPhoneNumber && isMobile()) {
                window.open(contact.url);
              } else if (!isPhoneNumber) {
                window.open(contact.url, "_blank");
              }
            };

            return (
              <Flex
                key={index}
                align="center"
                justifyContent="center"
                p={4}
                cursor="pointer"
                onClick={handleContactClick}
                {...glassCardProps}
              >
                <Icon as={contact.icon} color={accentRgba} boxSize={6} mr={3} />
                <Text color={textPrimaryToken} fontSize="lg">{contact.text}</Text>
              </Flex>
            );
          })}
        </SimpleGrid>

        <Box mb={20} {...glassCardProps} p={8} borderRadius="2xl">
          <VStack spacing={2} mb={8} textAlign="center">
            <Text color={accentRgba} fontWeight="bold">SKILLS & EXPERTISE</Text>
            <Heading as="h2" size="xl" color={textPrimaryToken}>Technical Proficiencies</Heading>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {skills.map((skillGroup, index) => (
              <VStack key={index} align="start" spacing={3}>
                <Heading as="h3" size="md" color={accentRgba}>{skillGroup.category}</Heading>
                <Flex wrap="wrap">
                  {skillGroup.items.map((skill, idx) => (
                    <Tag
                      key={idx}
                      size="md"
                      variant="subtle"
                      bg={tagTint}
                      color={textPrimaryToken}
                      m={1}
                      borderRadius="md"
                    >
                      {skill}
                    </Tag>
                  ))}
                </Flex>
              </VStack>
            ))}
          </SimpleGrid>
        </Box>

        <Box mb={20}>
          <VStack spacing={2} mb={8} textAlign="center">
            <Text color={accentRgba} fontWeight="bold">PROFESSIONAL EXPERIENCE</Text>
            <Heading as="h2" size="xl" color={textPrimaryToken}>Work History</Heading>
          </VStack>

          <VStack spacing={8} align="stretch">
            {experience.map((exp, index) => (
              <Box key={index} {...glassCardProps} p={8} borderRadius="2xl">
                <Flex justify="space-between" direction={{ base: "column", md: "row" }} mb={4}>
                  <Heading as="h3" size="lg" color={textPrimaryToken}>{exp.position}</Heading>
                  <Text color={accentRgba} fontSize="lg" fontWeight="bold">{exp.period}</Text>
                </Flex>
                <Text color={brandHex ? `rgba(${hexToRgb(brandHex)!.r}, ${hexToRgb(brandHex)!.g}, ${hexToRgb(brandHex)!.b}, 0.95)` : 'brand.500'} fontSize="xl" mb={6}>{exp.company}</Text>

                <VStack align="start" spacing={3}>
                  <Text color={accentRgba} fontWeight="bold">Key Achievements:</Text>
                  {exp.achievements.map((achievement, idx) => (
                    <HStack key={idx} align="flex-start">
                      <Icon as={FaRocket} color={accentRgba} mt={1} />
                      <Text color={textPrimaryToken}>{achievement}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box mb={20} {...glassCardProps} p={8} borderRadius="2xl">
          <VStack spacing={2} mb={6} textAlign="center">
            <Text color={accentRgba} fontWeight="bold">EDUCATION</Text>
            <Heading as="h2" size="xl" color={textPrimaryToken}>Academic Background</Heading>
          </VStack>

          <Box>
            <Heading as="h3" size="lg" color={textPrimaryToken} mb={2}>{education.degree}</Heading>
            <Text color={brandHex ? `rgba(${hexToRgb(brandHex)!.r}, ${hexToRgb(brandHex)!.g}, ${hexToRgb(brandHex)!.b}, 0.95)` : 'brand.500'} fontSize="xl" mb={3}>{education.institution}</Text>
            <Text color={accentRgba}>{education.period}</Text>
          </Box>
        </Box>

        <Box mb={20}>
          <VStack spacing={2} mb={8} textAlign="center">
            <Text color={accentRgba} fontWeight="bold">KEY PROJECTS</Text>
            <Heading as="h2" size="xl" color={textPrimaryToken}>Technical Portfolio</Heading>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {projects.map((project, index) => (
              <MotionBox
                key={index}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <Flex
                  direction="column"
                  height="100%"
                  {...glassCardProps}
                  p={6}
                  borderRadius="2xl"
                >
                  <Heading as="h3" size="lg" mb={3} color={textPrimaryToken}>
                    {project.title}
                  </Heading>
                  <Text color={textPrimaryToken} mb={4}>
                    {project.description}
                  </Text>
                  <Flex wrap="wrap" mb={4}>
                    {project.technologies.map((tech, idx) => (
                      <Tag
                        key={idx}
                        size="sm"
                        variant="subtle"
                        bg={tagTint}
                        color={accentRgba}
                        m={1}
                      >
                        {tech}
                      </Tag>
                    ))}
                  </Flex>
                </Flex>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Box>

        <Box mb={20} {...glassCardProps} p={8} borderRadius="2xl">
          <VStack spacing={2} mb={6} textAlign="center">
            <Text color={accentRgba} fontWeight="bold">INTERESTS</Text>
            <Heading as="h2" size="xl" color={textPrimaryToken}>Personal Interests</Heading>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {interests.map((interest, index) => (
              <HStack key={index} align="flex-start" spacing={3}>
                <Icon as={FaRocket} color={accentRgba} mt={1} />
                <Text color={textPrimaryToken} fontSize="lg">{interest}</Text>
              </HStack>
            ))}
          </SimpleGrid>
        </Box>

        <Flex
          justify="center"
          p={10}
          borderRadius="2xl"
          bgGradient={`linear-gradient(135deg, ${rgbaFromHex(accentRgba || '#878787ff', 1)}, ${rgbaFromHex(textPrimaryToken || '#ce5b31ff', 0.9)})`}
          mb={20}
        >
          <Button
            colorScheme="whiteAlpha"
            bg="white"
            color={"#222222"}
            size="lg"
            _hover={{ bg: "gray.100" }}
            rightIcon={<FaArrowRight />}
            as="a"
            href="/Godliness Dongorere Resume.pdf"
            download
          >
            Download Full Resume
          </Button>
        </Flex>


      </Container>
    </Box>
  );
};

export default HomePageClient;
