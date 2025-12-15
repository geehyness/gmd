'use client';
import React, { useState } from 'react';
import {
  Box, Flex, Heading, Text, SimpleGrid, Button, VStack, HStack, Icon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  useDisclosure, Tag, Link, useColorModeValue, useToken,
  Image, IconButton
} from '@chakra-ui/react';
import { FaGithub, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
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
    width: '120px',
    height: '200px',
    borderRadius: '2xl',
    overflow: 'hidden',
    border: '2px solid',
    borderColor: lightGray,
    position: 'relative' as const,
    _before: {
      content: '""',
      position: 'absolute' as const,
      top: '8px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '4px',
      height: '4px',
      bg: bgColor,
      borderRadius: 'full',
      zIndex: 11,
    },
    _after: {
      content: '""',
      position: 'absolute' as const,
      top: '8px',
      left: 'calc(50% + 10px)',
      transform: 'translateX(-50%)',
      width: '30px',
      height: '3px',
      bg: bgColor,
      borderRadius: 'md',
      zIndex: 11,
    },
  };

  return (
    <Box
      width="100%"
      height="200px"
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
  const tagTint = useToken('colors', 'brand.50');
  const lightGray = useToken('colors', 'gray.200');

  const mobileDeviceStyles = {
    width: '250px',
    height: '400px',
    borderRadius: '2xl',
    overflow: 'hidden',
    border: '3px solid',
    borderColor: lightGray,
    position: 'relative' as const,
    _before: {
      content: '""',
      position: 'absolute' as const,
      top: '12px',
      left: '50%',
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
      top: '12px',
      left: 'calc(50% + 15px)',
      transform: 'translateX(-50%)',
      width: '40px',
      height: '4px',
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
                <Text color={textPrimaryToken} mb={4}>
                  {project.longDescription}
                </Text>
              )}

              {project.tech && (
                <Flex wrap="wrap" gap={2} mt={4} mb={4}>
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
                    size="md"
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
    boxShadow: 'md',
    borderRadius: 'xl',
    transition: 'all 0.25s ease-in-out',
    _hover: { transform: 'translateY(-5px)', boxShadow: 'lg' }
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

      <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={6}>
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
            >
              <Flex direction="row">
                {/* Left: Phone View */}
                <Box width="40%" p={4} display="flex" alignItems="center" justifyContent="center">
                  <DeviceScreenshot projectId={project.id} />
                </Box>

                {/* Right: Description */}
                <Box p={4} flex={1} width="60%">
                  <Heading as="h3" size="md" color={textPrimaryToken} mb={2}>
                    {project.name}
                  </Heading>

                  {project.shortDescription && (
                    <Text color={textSecondaryToken} fontSize="sm" mb={4}>
                      {project.shortDescription}
                    </Text>
                  )}

                  <Flex wrap="wrap" gap={1} mb={2}>
                    {project.tech?.slice(0, 3).map((tech) => (
                      <Tag
                        key={tech}
                        size="xs"
                        variant="subtle"
                        bg={tagTint}
                        color={textPrimaryToken}
                      >
                        {tech}
                      </Tag>
                    ))}
                    {project.tech && project.tech.length > 3 && (
                      <Tag size="xs" variant="subtle" color={textSecondaryToken}>
                        +{project.tech.length - 3}
                      </Tag>
                    )}
                  </Flex>

                  {project.year && (
                    <Text color={textSecondaryToken} fontSize="xs" mt={2}>
                      {project.year}
                    </Text>
                  )}
                </Box>
              </Flex>
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