'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Flex, Heading, Text, SimpleGrid, Button, VStack, HStack, Icon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  useDisclosure, Tag, Link, useColorModeValue, useToken,
  Image, IconButton, Container, useBreakpointValue
} from '@chakra-ui/react';
import { FaGithub, FaExternalLinkAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { projectsData, Project } from '@/data/projectsData';

const MotionBox = motion(Box);

function getScreenshotSrc(id: string, isMobile: boolean = true) {
  const device = isMobile ? 'mobile' : 'desktop';
  return `/projects/${id}.${device}.png`;
}

interface DeviceScreenshotProps {
  projectId: string;
}

const DeviceScreenshot: React.FC<DeviceScreenshotProps> = ({ projectId }) => {
  const bgColor = useColorModeValue('neutral.light.bg-card', 'neutral.dark.bg-card');
  const lightGray = useToken('colors', 'gray.200');

  const mobileDeviceStyles = {
    width: { base: '80px', sm: '90px', md: '110px', lg: '120px' },
    height: { base: '150px', sm: '170px', md: '190px', lg: '200px' },
    borderRadius: '2xl',
    overflow: 'hidden',
    border: '2px solid',
    borderColor: lightGray,
    position: 'relative' as const,
    _before: {
      content: '""',
      position: 'absolute' as const,
      top: { base: '6px', md: '8px' },
      left: '50%',
      transform: 'translateX(-50%)',
      width: { base: '3px', md: '4px' },
      height: { base: '3px', md: '4px' },
      bg: bgColor,
      borderRadius: 'full',
      zIndex: 11,
    },
    _after: {
      content: '""',
      position: 'absolute' as const,
      top: { base: '6px', md: '8px' },
      left: 'calc(50% + 10px)',
      transform: 'translateX(-50%)',
      width: { base: '24px', md: '30px' },
      height: { base: '2px', md: '3px' },
      bg: bgColor,
      borderRadius: 'md',
      zIndex: 11,
    },
  };

  return (
    <Box
      width="100%"
      height={{ base: '150px', sm: '170px', md: '190px', lg: '200px' }}
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box {...mobileDeviceStyles}>
        <Image
          src={getScreenshotSrc(projectId, true)}
          alt={`${projectId} mobile screenshot`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          fallbackSrc='/projects/placeholder.png'
        />
      </Box>
    </Box>
  );
};

function ProjectModal({ project, isOpen, onClose }: { project: Project; isOpen: boolean; onClose: () => void }) {
  const textPrimaryToken = useColorModeValue('neutral.light.text-primary', 'neutral.dark.text-primary');
  const textSecondaryToken = useColorModeValue('neutral.light.text-secondary', 'neutral.dark.text-secondary');
  const bgCardToken = useColorModeValue('neutral.light.bg-card', 'neutral.dark.bg-card');
  const borderToken = useColorModeValue('neutral.light.border-color', 'neutral.dark.border-color');
  const accentRgba = useToken('colors', 'accent.500');
  const tagTint = useToken('colors', 'brand.900');
  const lightGray = useToken('colors', 'gray.200');

  const mobileDeviceStyles = {
    width: { base: '180px', sm: '220px', md: '250px' },
    height: { base: '320px', sm: '360px', md: '400px' },
    borderRadius: '2xl',
    overflow: 'hidden',
    border: '3px solid',
    borderColor: lightGray,
    position: 'relative' as const,
    _before: {
      content: '""',
      position: 'absolute' as const,
      top: { base: '10px', md: '12px' },
      left: '50%',
      transform: 'translateX(-50%)',
      width: { base: '5px', md: '6px' },
      height: { base: '5px', md: '6px' },
      bg: bgCardToken,
      borderRadius: 'full',
      zIndex: 11,
    },
    _after: {
      content: '""',
      position: 'absolute' as const,
      top: { base: '10px', md: '12px' },
      left: 'calc(50% + 15px)',
      transform: 'translateX(-50%)',
      width: { base: '35px', md: '40px' },
      height: { base: '3px', md: '4px' },
      bg: bgCardToken,
      borderRadius: 'md',
      zIndex: 11,
    },
  };

  const glassCardProps = {
    bg: 'neutral.light.bg-card',
    backdropFilter: 'blur(12px) saturate(160%)',
    border: '1px solid',
    borderColor: borderToken,
    boxShadow: 'md',
    borderRadius: 'xl',
  } as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '4xl' }} isCentered>
      <ModalOverlay bg="#ffffff99" backdropFilter="blur(10px)" />
      <ModalContent
        {...glassCardProps}
        mx={{ base: 2, md: 4 }}
        maxW="90vw"
      >
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading as="h3" size={{ base: 'md', md: 'lg' }} color={textPrimaryToken}>
                {project.name}
              </Heading>
              {project.role && (
                <Text color={accentRgba} fontSize="sm">
                  Role: {project.role}
                </Text>
              )}
            </VStack>
            <ModalCloseButton />
          </Flex>
        </ModalHeader>

        <ModalBody pb={6}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
            {/* Left: Mobile Screenshot */}
            <Box position="relative" display="flex" alignItems="center" justifyContent="center">
              <Box {...mobileDeviceStyles}>
                <Image
                  src={getScreenshotSrc(project.id, true)}
                  alt={`${project.name} mobile view`}
                  objectFit="cover"
                  w="full"
                  h="full"
                  fallbackSrc='/projects/placeholder.png'
                />
              </Box>
            </Box>

            {/* Right: Details */}
            <Box>
              {project.longDescription && (
                <Text color={textPrimaryToken} mb={4} fontSize={{ base: 'sm', md: 'md' }}>
                  {project.longDescription}
                </Text>
              )}

              {project.tech && (
                <Flex wrap="wrap" gap={2} mt={4} mb={4}>
                  {project.tech.map((tech) => (
                    <Tag
                      key={tech}
                      size={{ base: 'sm', md: 'md' }}
                      variant="subtle"
                      bg={tagTint}
                      color={textPrimaryToken}
                    >
                      {tech}
                    </Tag>
                  ))}
                </Flex>
              )}

              {project.links && project.links.length > 0 && (
                <VStack align="start" spacing={3} mb={4}>
                  <Text color={accentRgba} fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>
                    Links:
                  </Text>
                  {project.links.map((link, idx) => (
                    <Link
                      key={idx}
                      href={link.url}
                      isExternal
                      color={textPrimaryToken}
                      _hover={{ color: accentRgba }}
                      fontSize={{ base: 'sm', md: 'md' }}
                    >
                      <HStack>
                        <Icon as={FaExternalLinkAlt} />
                        <Text>{link.label}</Text>
                        {link.note && (
                          <Text fontSize="sm" color={textSecondaryToken}>
                            ({link.note})
                          </Text>
                        )}
                      </HStack>
                    </Link>
                  ))}
                </VStack>
              )}

              <HStack spacing={3} mt={6}>
                {project.repo && (
                  <Button
                    as="a"
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    leftIcon={<FaGithub />}
                    size={{ base: 'sm', md: 'md' }}
                    variant="outline"
                    color={textPrimaryToken}
                  >
                    View Code
                  </Button>
                )}
              </HStack>
            </Box>
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

interface PublicProjectsProps {
  className?: string;
  variant?: 'grid' | 'carousel';
  title?: string;
  subtitle?: string;
  maxProjects?: number; // Optional limit for home page
}

const PublicProjects: React.FC<PublicProjectsProps> = ({
  className,
  variant = 'grid',
  title = 'My Work',
  subtitle = 'Select a project to see details, links, and demo credentials.',
  maxProjects
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const textPrimaryToken = useColorModeValue('neutral.light.text-primary', 'neutral.dark.text-primary');
  const textSecondaryToken = useColorModeValue('neutral.light.text-secondary', 'neutral.dark.text-secondary');
  const bgCardToken = useColorModeValue('neutral.light.bg-card', 'neutral.dark.bg-card');
  const borderToken = useColorModeValue('neutral.light.border-color', 'neutral.dark.border-color');
  const accentRgba = useToken('colors', 'accent.500');
  const tagTint = useToken('colors', 'brand.900');

  const glassCardProps = {
    bg: bgCardToken,
    backdropFilter: 'blur(12px) saturate(160%)',
    border: '1px solid',
    borderColor: borderToken,
    boxShadow: 'md',
    borderRadius: 'xl',
    transition: 'all 0.25s ease-in-out',
    _hover: { transform: 'translateY(-5px)', boxShadow: 'lg' }
  } as const;

  // Responsive slides per view
  const slidesPerView = useBreakpointValue({
    base: 1,    // Mobile: 1 project
    sm: 1.5,    // Small mobile: 1.5 projects (partial view)
    md: 2,      // Tablet: 2 projects
    lg: 3,      // Desktop: 3 projects
    xl: 3       // Large desktop: 3 projects
  }) || 1;

  // Filter projects if maxProjects is specified (for home page)
  const displayedProjects = maxProjects
    ? projectsData.slice(0, maxProjects)
    : projectsData;

  const totalSlides = displayedProjects.length;
  const maxSlideIndex = Math.max(0, totalSlides - slidesPerView);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    onOpen();
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev >= maxSlideIndex ? 0 : prev + 1));
  }, [maxSlideIndex]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev <= 0 ? maxSlideIndex : prev - 1));
  }, [maxSlideIndex]);

  // Auto-rotate carousel on home page
  useEffect(() => {
    if (variant === 'carousel') {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [variant, nextSlide, currentSlide]);

  useEffect(() => {
    if (carouselRef.current) {
      const scrollAmount = currentSlide * (100 / slidesPerView);
      carouselRef.current.style.transform = `translateX(-${scrollAmount}%)`;
    }
  }, [currentSlide, slidesPerView]);

  const ProjectCard = ({ project, isCarousel = false }: { project: Project; isCarousel?: boolean }) => (
    <MotionBox
      key={project.id}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
      flex={isCarousel ? `0 0 ${100 / slidesPerView}%` : 'auto'}
      px={isCarousel ? { base: 2, sm: 3, md: 4 } : 0}
      minWidth={isCarousel ? '0' : 'auto'}
    >
      <Box
        {...glassCardProps}
        p={0}
        overflow="hidden"
        cursor="pointer"
        onClick={() => handleProjectClick(project)}
        height="100%"
        width="100%"
        mx="auto"
        maxW={{ base: '320px', sm: '400px', md: 'full' }}
      >
        <Flex direction={{ base: 'column', sm: 'row' }}>
          {/* Phone View - Mobile: full width, Desktop: 40% */}
          <Box
            width={{ base: '100%', sm: '40%' }}
            p={{ base: 3, md: 4 }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={{ base: '150px', sm: 'auto' }}
          >
            <DeviceScreenshot projectId={project.id} />
          </Box>

          {/* Description - Mobile: full width, Desktop: 60% */}
          <Box
            p={{ base: 3, md: 4 }}
            flex={1}
            width={{ base: '100%', sm: '60%' }}
          >
            <Heading as="h3" size={{ base: 'sm', md: 'md' }} color={textPrimaryToken} mb={2}>
              {project.name}
            </Heading>

            {project.shortDescription && (
              <Text
                color={textSecondaryToken}
                fontSize={{ base: 'xs', sm: 'sm' }}
                mb={3}
                noOfLines={{ base: 2, sm: 3 }}
              >
                {project.shortDescription}
              </Text>
            )}

            <Flex wrap="wrap" gap={1} mb={2}>
              {project.tech?.slice(0, 3).map((tech) => (
                <Tag
                  key={tech}
                  size={{ base: 'xs', sm: 'sm' }}
                  variant="subtle"
                  bg={tagTint}
                  color={textPrimaryToken}
                >
                  {tech}
                </Tag>
              ))}
              {project.tech && project.tech.length > 3 && (
                <Tag size={{ base: 'xs', sm: 'sm' }} variant="subtle" color={textSecondaryToken}>
                  +{project.tech.length - 3}
                </Tag>
              )}
            </Flex>

            {project.year && (
              <Text color={textSecondaryToken} fontSize={{ base: 'xs', sm: 'sm' }} mt={2}>
                {project.year}
              </Text>
            )}
          </Box>
        </Flex>
      </Box>
    </MotionBox>
  );

  // For grid layout on mobile, show 1 column
  const gridColumns = useBreakpointValue({
    base: 1,
    sm: 1,
    md: 2,
    lg: 2
  }) || 1;

  return (
    <Box className={className} mb={20} ref={containerRef}>
      <VStack spacing={2} mb={8} textAlign="center" px={{ base: 4, md: 0 }}>
        <Text color={accentRgba} fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>
          PUBLIC PROJECTS
        </Text>
        <Heading as="h2" size={{ base: 'lg', md: 'xl' }} color={textPrimaryToken}>
          {title}
        </Heading>
        <Text
          color={textSecondaryToken}
          maxW="2xl"
          textAlign="center"
          fontSize={{ base: 'sm', md: 'md' }}
          px={{ base: 2, md: 0 }}
        >
          {subtitle}
        </Text>
      </VStack>

      {variant === 'grid' ? (
        // Grid Layout (for Projects Page)
        <Box px={{ base: 4, md: 0 }}>
          <SimpleGrid
            columns={gridColumns}
            spacing={{ base: 4, md: 6 }}
            maxW="container.xl"
            mx="auto"
          >
            {displayedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </SimpleGrid>
        </Box>
      ) : (
        // Carousel Layout (for Home Page)
        <Box position="relative" overflow="hidden" width="100%">
          <Box
            ref={carouselRef}
            display="flex"
            transition="transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            gap={{ base: 3, sm: 4, md: 6 }}
            px={{ base: 4, sm: 6, md: 8, lg: 12 }}
          >
            {displayedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} isCarousel />
            ))}
          </Box>

          {/* Navigation Buttons - Hide on mobile when only 1 slide */}
          {totalSlides > slidesPerView && (
            <>
              <IconButton
                aria-label="Previous slide"
                icon={<FaChevronLeft />}
                position="absolute"
                left={{ base: 1, sm: 2, md: 4 }}
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
                bg="rgba(0,0,0,0.5)"
                color="white"
                _hover={{ bg: "rgba(0,0,0,0.7)" }}
                onClick={prevSlide}
                isRound
                size={{ base: 'sm', md: 'md' }}
                display={{ base: slidesPerView >= totalSlides ? 'none' : 'flex', sm: 'flex' }}
              />
              <IconButton
                aria-label="Next slide"
                icon={<FaChevronRight />}
                position="absolute"
                right={{ base: 1, sm: 2, md: 4 }}
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
                bg="rgba(0,0,0,0.5)"
                color="white"
                _hover={{ bg: "rgba(0,0,0,0.7)" }}
                onClick={nextSlide}
                isRound
                size={{ base: 'sm', md: 'md' }}
                display={{ base: slidesPerView >= totalSlides ? 'none' : 'flex', sm: 'flex' }}
              />
            </>
          )}

          {/* Dots Indicator - Only show if there are multiple slides */}
          {maxSlideIndex > 0 && (
            <Flex justify="center" mt={{ base: 4, md: 6 }} gap={2}>
              {Array.from({ length: maxSlideIndex + 1 }).map((_, index) => (
                <Box
                  key={index}
                  w={{ base: 2, md: 3 }}
                  h={{ base: 2, md: 3 }}
                  borderRadius="full"
                  bg={currentSlide === index ? accentRgba : "gray.300"}
                  cursor="pointer"
                  onClick={() => setCurrentSlide(index)}
                  _hover={{ bg: currentSlide === index ? accentRgba : "gray.400" }}
                  transition="all 0.2s"
                />
              ))}
            </Flex>
          )}
        </Box>
      )}

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </Box>
  );
};

export default PublicProjects;