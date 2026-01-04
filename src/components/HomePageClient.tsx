'use client';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Flex, Heading, Text, Container, SimpleGrid, Button,
  VStack, HStack, Icon, Tag, IconButton, useColorModeValue, useToken
} from '@chakra-ui/react';
import { FaChevronDown, FaRocket, FaArrowRight } from 'react-icons/fa';
import { FiMail, FiPhone, FiGithub, FiLinkedin } from 'react-icons/fi';
import PublicProjects from '@/components/PublicProjects';
import StarfieldControls from '@/components/StarfieldControls';

const MotionBox = motion(Box);

const HomePageClient: React.FC = () => {
  const contentSectionRef = useRef<HTMLDivElement>(null);

  // Get token names for color mode
  const bgCardTokenName = useColorModeValue('neutral.light.bg-card', 'neutral.dark.bg-card');
  const textPrimaryTokenName = useColorModeValue('neutral.light.text-primary', 'neutral.dark.text-primary');
  const textSecondaryTokenName = useColorModeValue('neutral.light.text-secondary', 'neutral.dark.text-secondary');
  const borderTokenName = useColorModeValue('neutral.light.border-color', 'neutral.dark.border-color');

  // Get actual color values from tokens
  const [
    accentRgba,
    tagTint,
    bgCardValue,
    textPrimaryValue,
    textSecondaryValue,
    borderColorValue
  ] = useToken('colors', [
    'accent.500',
    'brand.900',
    bgCardTokenName,
    textPrimaryTokenName,
    textSecondaryTokenName,
    borderTokenName
  ]);

  const glassCardProps = {
    bg: bgCardValue,
    backdropFilter: 'blur(12px) saturate(160%)',
    border: '1px solid',
    borderColor: borderColorValue,
    boxShadow: 'md',
    borderRadius: 'xl',
    transition: 'all 0.25s ease-in-out',
    _hover: { transform: 'translateY(-5px)', boxShadow: 'lg' }
  } as const;

  const scrollToContent = () => {
    if (contentSectionRef.current) {
      contentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
      company: "Synapse Digital",
      position: "Software Developer, FullStack Solutions",
      period: "January 2025 – present",
      achievements: [
        "Developing full-stack applications",
        "Implementing responsive UI designs",
        "Integrating third-party APIs",
        "Optimizing application performance"
      ]
    },
    {
      company: "The Luke Commission, Sidvokodvo, eSwatini",
      position: "Systems Engineer",
      period: "May 2023 – September 2025",
      achievements: [
        "Designed Oxygen Plant Dashboard (SCADA Ignition), improving product gas quality",
        "Programmed Siemens PLCs using TIA Portal and integrated Profinet slaves",
        "Developed applications using OutSystems for organizational processes",
        "Created custom 3D-printed solutions for hospital IT settings"
      ]
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
      minH="100vh"
    >
      {/* Starfield is now provided by EnhancedStarfield in providers.tsx */}
      <StarfieldControls />

      {/* Hero Section */}
      <Box
        height="100vh"
        width="100%"
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
              size={{ base: "2xl", md: "3xl" }}
              fontWeight="extrabold"
              letterSpacing="tight"
              color={textPrimaryValue}
              mb={2}
            >
              Godliness
            </Heading>
            <Heading
              as="h1"
              size={{ base: "2xl", md: "3xl" }}
              fontWeight="extrabold"
              letterSpacing="tight"
              color={accentRgba}
              mb={6}
            >
              Dongorere
            </Heading>

            <HStack spacing={4} mb={6} justify="center">
              <IconButton
                aria-label="GitHub"
                icon={<FiGithub size="24px" />}
                variant="solid"
                size="lg"

                {...glassCardProps}
                color={accentRgba}
                _hover={{ bg: accentRgba, color: "white", transform: "scale(1.1)" }}
                as="a"
                href="https://github.com/geehyness"
                target="_blank"
              />
              <IconButton
                aria-label="LinkedIn"
                icon={<FiLinkedin size="24px" />}
                variant="solid"
                size="lg"

                {...glassCardProps}
                color={accentRgba}
                _hover={{ bg: accentRgba, color: "white", transform: "scale(1.1)" }}
                as="a"
                href="https://linkedin.com/in/gdongorere"
                target="_blank"
              />
              <IconButton
                aria-label="Email"
                icon={<FiMail size="24px" />}
                variant="solid"
                size="lg"

                {...glassCardProps}
                color={accentRgba}
                _hover={{ bg: accentRgba, color: "white", transform: "scale(1.1)" }}
                as="a"
                href="mailto:godlinessdongorere@gmail.com"
              />
            </HStack>

            <Text fontSize={{ base: "md", md: "lg" }} color={textSecondaryValue} mt={4}>
              Software Developer | FullStack Solutions
            </Text>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
          >
            <Button
              variant="ghost"
              color={textPrimaryValue}
              _hover={{ color: accentRgba, transform: "translateY(4px)" }}
              onClick={scrollToContent}
              aria-label="Scroll to content"
            >
              <Icon as={FaChevronDown} boxSize={8} />
            </Button>
          </MotionBox>
        </VStack>
      </Box>

      {/* Content Section */}
      <Container maxW="container.xl" py={20} ref={contentSectionRef} zIndex={10}>
        {/* Contact Info */}
        <SimpleGrid mt={10} columns={{ base: 1, md: 2 }} spacing={6} mb={10}>
          {contactInfo.map((contact, index) => (
            <Flex
              key={index}
              align="center"
              justifyContent="center"
              p={4}
              cursor="pointer"
              onClick={() => window.open(contact.url, contact.url.startsWith('tel:') ? '_self' : '_blank')}
              {...glassCardProps}
            >
              <Icon as={contact.icon} color={accentRgba} boxSize={6} mr={3} />
              <Text color={textPrimaryValue} fontSize="lg">{contact.text}</Text>
            </Flex>
          ))}
        </SimpleGrid>

        {/* Public Projects Section */}
        <Box mb={20} id="projects">
          <PublicProjects
            variant="carousel"
            maxProjects={6}
            title="Featured Projects"
            subtitle="Explore my latest work. Click on any project for detailed information."
          />
        </Box>

        {/* Skills Section */}
        <Box mb={20} {...glassCardProps} p={8}>
          <VStack spacing={2} mb={8} textAlign="center">
            <Text color={accentRgba} fontWeight="bold">SKILLS & EXPERTISE</Text>
            <Heading as="h2" size="xl" color={textPrimaryValue}>Technical Proficiencies</Heading>
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
                      color={textPrimaryValue}
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

        {/* Experience Section */}
        <Box mb={20}>
          <VStack spacing={2} mb={8} textAlign="center">
            <Text color={accentRgba} fontWeight="bold">PROFESSIONAL EXPERIENCE</Text>
            <Heading as="h2" size="xl" color={textPrimaryValue}>Work History</Heading>
          </VStack>

          <VStack spacing={8} align="stretch">
            {experience.map((exp, index) => (
              <Box key={index} {...glassCardProps} p={8}>
                <Flex justify="space-between" direction={{ base: "column", md: "row" }} mb={4}>
                  <Heading as="h3" size="lg" color={textPrimaryValue}>{exp.position}</Heading>
                  <Text color={accentRgba} fontSize="lg" fontWeight="bold">{exp.period}</Text>
                </Flex>
                <Text color={accentRgba} fontSize="xl" mb={6}>{exp.company}</Text>

                <VStack align="start" spacing={3}>
                  {exp.achievements.map((achievement, idx) => (
                    <HStack key={idx} align="flex-start">
                      <Icon as={FaRocket} color={accentRgba} mt={1} />
                      <Text color={textPrimaryValue}>{achievement}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Interests Section */}
        <Box mb={20} {...glassCardProps} p={8}>
          <VStack spacing={2} mb={6} textAlign="center">
            <Text color={accentRgba} fontWeight="bold">INTERESTS</Text>
            <Heading as="h2" size="xl" color={textPrimaryValue}>Personal Interests</Heading>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {interests.map((interest, index) => (
              <HStack key={index} align="flex-start" spacing={3}>
                <Icon as={FaRocket} color={accentRgba} mt={1} />
                <Text color={textPrimaryValue} fontSize="lg">{interest}</Text>
              </HStack>
            ))}
          </SimpleGrid>
        </Box>

        {/* Resume Download */}
        <Flex
          justify="center"
          p={10}
          bgGradient={`linear-gradient(135deg, ${accentRgba}40, ${accentRgba}80)`}
          mb={20}
          {...glassCardProps}
        >
          <Button
            colorScheme="whiteAlpha"
            bg="#202020"
            color={"#fff"}
            size="lg"
            _hover={{ bg: "gray.900" }}
            rightIcon={<FaArrowRight />}
            as="a"
            href="/Godliness_Dongorere_Resume_Systems.pdf"
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