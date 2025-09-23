'use client';
import React, { useState } from 'react';
import {
  Box, Flex, Heading, Text, SimpleGrid, Button, VStack, HStack, Icon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  useDisclosure, Tag, Link, useColorModeValue, useToken, useBreakpointValue,
  Image, IconButton
} from '@chakra-ui/react';
import { FaExternalLinkAlt, FaGithub, FaCopy, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { projectsData, Project } from '@/data/projectsData';

const MotionBox = motion(Box);

function getScreenshotSrc(id: string, isMobile: boolean) {
  const device = isMobile ? 'mobile' : 'desktop';
  return `/projects/${id}.${device}.png`;
}

interface DeviceScreenshotProps {
  projectId: string;
}

const DeviceScreenshot: React.FC<DeviceScreenshotProps> = ({ projectId }) => {
  const borderColor = useColorModeValue('neutral.light.border-color', 'neutral.dark.border-color');
  const bgColor = useColorModeValue('neutral.light.bg-card', 'neutral.dark.bg-card');
  const lightGray = useToken('colors', 'gray.200');

  const desktopStyles = {
    _before: {
      content: '""',
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
      pointerEvents: 'none',
      bg: 'transparent',
      borderColor: lightGray,
      borderWidth: '2px',
      borderRadius: 'lg',
      borderTopRadius: '2xl',
      borderBottomWidth: '8px',
      _after: {
        content: '""',
        position: 'absolute' as const,
        bottom: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '50%',
        height: '8px',
        bg: bgColor,
        borderBottomRadius: 'xl',
        borderColor: lightGray,
        borderWidth: '2px',
        borderTopWidth: 0,
      },
    },
  };

  const mobileDeviceStyles = {
    position: 'absolute' as const,
    width: '150px',
    height: '250px',
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '3',
    borderRadius: '3xl',
    overflow: 'hidden',
    border: '3px solid',
    borderColor: lightGray,
    _before: {
      content: '""',
      position: 'absolute' as const,
      top: '10px',
      left: 'calc(50% - 20px)',
      transform: 'translateX(-50%)',
      width: '6px',
      height: '6px',
      bg: bgColor,
      borderRadius: 'full',
      zIndex: 11,
    },
    _after: {
      content: '""',
      position: 'absolute' as const,
      top: '10px',
      left: 'calc(50% + 5px)',
      transform: 'translateX(-50%)',
      width: '40px',
      height: '4px',
      bg: bgColor,
      borderRadius: 'md',
      zIndex: 11,
    },
  };

  return (
    <Box
      width="100%"
      height="250px"
      position="relative"
      bg="gray.100"
      overflow="hidden"
    >
      <Box
        position="relative"
        width="100%"
        height="100%"
        {...desktopStyles}
      >
        <Image
          src={getScreenshotSrc(projectId, false)}
          alt={`${projectId} desktop screenshot`}
          width="100%"
          height="100%"
          objectFit="cover"
          borderTopRadius="2xl"
          borderRadius="lg"
          fallbackSrc='/projects/placeholder.png'
        />
      </Box>

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
  const tagTint = useToken('colors', 'brand.50');
  const lightGray = useToken('colors', 'gray.200');
  const [currentSlide, setCurrentSlide] = useState(0);

  const desktopStyles = {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    borderRadius: 'lg',
    overflow: 'hidden',
    _before: {
      content: '""',
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
      pointerEvents: 'none',
      bg: 'transparent',
      borderColor: lightGray,
      borderWidth: '2px',
      borderRadius: 'lg',
      borderTopRadius: '2xl',
      borderBottomWidth: '8px',
    },
    _after: {
      content: '""',
      position: 'absolute' as const,
      bottom: '-8px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '50%',
      height: '8px',
      bg: bgCardToken,
      borderBottomRadius: 'xl',
      borderColor: lightGray,
      borderWidth: '2px',
      borderTopWidth: 0,
    },
  };

  const mobileDeviceStyles = {
    width: '150px',
    height: '250px',
    borderRadius: '3xl',
    overflow: 'hidden',
    border: '3px solid',
    borderColor: lightGray,
    _before: {
      content: '""',
      position: 'absolute' as const,
      top: '10px',
      left: 'calc(50% - 20px)',
      transform: 'translateX(-50%)',
      width: '6px',
      height: '6px',
      bg: bgCardToken,
      borderRadius: 'full',
      zIndex: 11,
    },
    _after: {
      content: '""',
      position: 'absolute' as const,
      top: '10px',
      left: 'calc(50% + 5px)',
      transform: 'translateX(-50%)',
      width: '40px',
      height: '4px',
      bg: bgCardToken,
      borderRadius: 'md',
      zIndex: 11,
    },
  };


  const slides = [
    {
      label: 'Combined View',
      content: (
        <Box
          position="relative"
          w="full"
          height="250px"
          bg="gray.100"
          overflow="hidden"
        >
          <Box {...desktopStyles}>
            <Image
              src={getScreenshotSrc(project.id, false)}
              alt={`${project.name} desktop view`}
              objectFit="cover"
              w="full"
              h="full"
              fallbackSrc='/projects/placeholder.png'
            />
          </Box>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={2}
            {...mobileDeviceStyles}
          >
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
      )
    },
    {
      label: 'Desktop View',
      content: (
        <Box
          w="full"
          h="250px"
          position="relative"
          bg="gray.100"
          overflow="hidden"
        >
          <Box {...desktopStyles}>
            <Image
              src={getScreenshotSrc(project.id, false)}
              alt={`${project.name} desktop view`}
              objectFit="cover"
              w="full"
              h="full"
              fallbackSrc='/projects/placeholder.png'
            />
          </Box>
        </Box>
      )
    },
    {
      label: 'Mobile View',
      content: (
        <Box
          mx="auto"
          position="relative"
          {...mobileDeviceStyles}
        >
          <Image
            src={getScreenshotSrc(project.id, true)}
            alt={`${project.name} mobile view`}
            objectFit="cover"
            w="full"
            h="full"
            fallbackSrc='/projects/placeholder.png'
          />
        </Box>
      )
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const glassCardProps = {
    bg: bgCardToken,
    backdropFilter: 'blur(12px) saturate(160%)',
    border: '1px solid',
    borderColor: borderToken,
    boxShadow: useColorModeValue('md', 'dark-md'),
    borderRadius: 'xl',
  } as const;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay bg="#ffffff99" backdropFilter="blur(10px)" />
      <ModalContent
        {...glassCardProps}
        mx={4}
        maxW="90vw"
      >
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading as="h3" size="lg" color={textPrimaryToken}>
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
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box position="relative">
              {slides[currentSlide].content}
              <Flex justify="space-between" position="absolute" top="50%" w="100%" transform="translateY(-50%)" px={2}>
                <IconButton
                  aria-label="Previous slide"
                  icon={<FaChevronLeft />}
                  onClick={prevSlide}
                  size="sm"
                  variant="ghost"
                />
                <IconButton
                  aria-label="Next slide"
                  icon={<FaChevronRight />}
                  onClick={nextSlide}
                  size="sm"
                  variant="ghost"
                />
              </Flex>
              <Flex justify="center" mt={2} gap={2}>
                {slides.map((_, index) => (
                  <Button
                    key={index}
                    size="xs"
                    variant={index === currentSlide ? 'solid' : 'outline'}
                    onClick={() => setCurrentSlide(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </Flex>
              {project.tech && (
                <Flex wrap="wrap" gap={2} mt={4}>
                  {project.tech.map((tech) => (
                    <Tag
                      key={tech}
                      size="sm"
                      variant="subtle"
                      bg={tagTint}
                      color={textPrimaryToken}
                    >
                      {tech}
                    </Tag>
                  ))}
                </Flex>
              )}
            </Box>

            <Box>
              {project.longDescription && (
                <Text color={textPrimaryToken} mb={4}>
                  {project.longDescription}
                </Text>
              )}

              {project.links && project.links.length > 0 && (
                <VStack align="start" spacing={3} mb={4}>
                  <Text color={accentRgba} fontWeight="bold">Links:</Text>
                  {project.links.map((link, idx) => (
                    <Link
                      key={idx}
                      href={link.url}
                      isExternal
                      color={textPrimaryToken}
                      _hover={{ color: accentRgba }}
                    >
                      <HStack>
                        <Text>{link.label}</Text>
                        {link.note && (
                          <Text fontSize="sm" color={textSecondaryToken}>
                            ({link.note})
                          </Text>
                        )}
                        <Icon as={FiExternalLink} />
                      </HStack>
                    </Link>
                  ))}
                </VStack>
              )}

              {project.credentials && (
                <Box mb={4} p={3} borderRadius="md" bg="blackAlpha.100">
                  <Text color={accentRgba} fontWeight="bold" mb={2}>
                    Demo Credentials:
                  </Text>
                  <VStack align="start" spacing={1}>
                    {project.credentials.username && (
                      <HStack>
                        <Text color={textPrimaryToken} fontSize="sm">
                          Username: {project.credentials.username}
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => copyToClipboard(project.credentials!.username!)}
                        >
                          <Icon as={FaCopy} />
                        </Button>
                      </HStack>
                    )}
                    {project.credentials.password && (
                      <HStack>
                        <Text color={textPrimaryToken} fontSize="sm">
                          Password: {project.credentials.password}
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => copyToClipboard(project.credentials!.password!)}
                        >
                          <Icon as={FaCopy} />
                        </Button>
                      </HStack>
                    )}
                    {project.credentials.note && (
                      <Text color={textSecondaryToken} fontSize="xs">
                        {project.credentials.note}
                      </Text>
                    )}
                  </VStack>
                </Box>
              )}

              <HStack spacing={3}>
                {project.repo && (
                  <Button
                    as="a"
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    leftIcon={<FaGithub />}
                    size="sm"
                    variant="outline"
                    color={textPrimaryToken}
                  >
                    View Code
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="solid"
                  colorScheme="brand"
                  onClick={() => {
                    const url = project.links?.[0]?.url || project.repo || '';
                    copyToClipboard(`${project.name} - ${url}`);
                  }}
                >
                  Copy Quick Link
                </Button>
              </HStack>
            </Box>
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

const PublicProjects: React.FC<{ className?: string }> = ({ className }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const textPrimaryToken = useColorModeValue('neutral.light.text-primary', 'neutral.dark.text-primary');
  const textSecondaryToken = useColorModeValue('neutral.light.text-secondary', 'neutral.dark.text-secondary');
  const bgCardToken = useColorModeValue('neutral.light.bg-card', 'neutral.dark.bg-card');
  const borderToken = useColorModeValue('neutral.light.border-color', 'neutral.dark.border-color');
  const accentRgba = useToken('colors', 'accent.500');
  const tagTint = useToken('colors', 'brand.50');

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

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    onOpen();
  };

  return (
    <Box className={className} mb={20}>
      <VStack spacing={2} mb={8} textAlign="center">
        <Text color={accentRgba} fontWeight="bold">PUBLIC PROJECTS</Text>
        <Heading as="h2" size="xl" color={textPrimaryToken}>My Work</Heading>
        <Text color={textSecondaryToken} maxW="2xl" textAlign="center">
          Select a project to see details, links, and demo credentials.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {projectsData.map((project) => (
          <MotionBox
            key={project.id}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Box
              {...glassCardProps}
              p={0}
              overflow="hidden"
              cursor="pointer"
              onClick={() => handleProjectClick(project)}
              height="100%"
              display="flex"
              flexDirection="column"
            >
              <Box
                width="100%"
                height="250px"
                position="relative"
                overflow="hidden"
              >
                <DeviceScreenshot projectId={project.id} />
              </Box>

              <Box p={6} flex={1} display="flex" flexDirection="column">
                <Heading as="h3" size="md" color={textPrimaryToken} mb={2}>
                  {project.name}
                </Heading>

                {project.shortDescription && (
                  <Text color={textSecondaryToken} fontSize="sm" mb={4} flex={1}>
                    {project.shortDescription}
                  </Text>
                )}

                <Flex justify="space-between" align="center" mt="auto">
                  <Flex wrap="wrap" gap={1}>
                    {project.tech?.slice(0, 2).map((tech) => (
                      <Tag
                        key={tech}
                        size="sm"
                        variant="subtle"
                        bg={tagTint}
                        color={textPrimaryToken}
                      >
                        {tech}
                      </Tag>
                    ))}
                    {project.tech && project.tech.length > 2 && (
                      <Tag size="sm" variant="subtle" color={textSecondaryToken}>
                        +{project.tech.length - 2}
                      </Tag>
                    )}
                  </Flex>

                  {project.year && (
                    <Text color={textSecondaryToken} fontSize="sm">
                      {project.year}
                    </Text>
                  )}
                </Flex>
              </Box>
            </Box>
          </MotionBox>
        ))}
      </SimpleGrid>

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