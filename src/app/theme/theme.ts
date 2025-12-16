import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#F5F5F5',
    100: '#E0E0E0',
    200: '#C2C2C2',
    300: '#A3A3A3',
    400: '#858585',
    500: '#666666',
    600: '#474747',
    700: '#333333',
    800: '#1F1F1F',
    900: '#0A0A0A',
  },
  accent: {
    50: '#FFF2EC',
    100: '#FFD6C2',
    200: '#FFB999',
    300: '#FF9C70',
    400: '#FF7F47',
    500: '#FF3F00',
    600: '#E04600',
    700: '#C23D00',
    800: '#A33400',
    900: '#852B00',
  },
  neutral: {
    light: {
      'bg-primary': '#151515',
      'bg-secondary': '#1A1A1A',
      'bg-header': '#1F1F1F',
      'bg-card': 'rgba(14, 14, 14, 0.85)', // This is key - semi-transparent dark
      'text-primary': '#FFFFFF',
      'text-secondary': '#A0A0A0',
      'border-color': 'rgba(64, 64, 64, 0.8)',
      'input-bg': '#FFFFFF',
      'input-border': '#E0E0E0',
      'placeholder-color': '#C2C2C2',
      'tag-bg': '#2D2D2D', // Changed from #EFEFEF to dark
      'tag-color': '#CCCCCC', // Changed from #474747 to light
    },
    dark: {
      'bg-primary': '#151515',
      'bg-secondary': '#1A1A1A',
      'bg-header': '#1F1F1F',
      'bg-card': 'rgba(14, 14, 14, 0.85)',
      'text-primary': '#FFFFFF',
      'text-secondary': '#A0A0A0',
      'border-color': 'rgba(64, 64, 64, 0.8)',
    }
  },
  'secondary-glow': 'rgba(224,70,0,0.18)',
};

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const styles = {
  global: {
    'html, body': {
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    body: {
      bg: colors.neutral.light['bg-primary'], // #151515
      color: colors.neutral.light['text-primary'],
      position: 'relative',
      overflowX: 'hidden',
    },
    '#__next': {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    },
    'canvas': {
      display: 'block',
    },
    '::selection': {
      bg: 'rgba(255, 63, 0, 0.2)',
    },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'lg',
      _focus: {
        boxShadow: '0 0 0 3px rgba(102, 102, 102, 0.2)',
      },
      transition: 'all 0.2s ease',
    },
    variants: {
      solid: {
        bg: 'brand.600',
        color: 'white',
        _hover: {
          bg: 'brand.700',
          transform: 'translateY(-1px)',
          boxShadow: 'md',
        },
        _active: {
          bg: 'brand.800',
          transform: 'translateY(0)',
        },
      },
      outline: {
        borderColor: 'brand.600',
        color: 'brand.600',
        _hover: {
          bg: 'brand.50',
          borderColor: 'brand.700',
          color: 'brand.700',
        },
      },
      ghost: {
        color: 'neutral.light.text-secondary',
        _hover: {
          bg: 'neutral.light.tag-bg', // Now dark
          color: 'neutral.light.text-primary',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'neutral.light.bg-card', // Semi-transparent dark
        backdropFilter: 'blur(12px) saturate(160%)',
        border: '1px solid',
        borderColor: 'neutral.light.border-color',
        borderRadius: 'xl',
        boxShadow: 'md',
        transition: 'all 0.25s ease-in-out',
        _hover: {
          transform: 'translateY(-4px)',
          boxShadow: 'lg',
        },
      },
    },
  },
  Tag: {
    baseStyle: {
      container: {
        borderRadius: 'md',
        fontWeight: 'medium',
        transition: 'all 0.2s ease',
      },
    },
    variants: {
      subtle: {
        container: {
          bg: 'neutral.light.tag-bg', // Dark background
          color: 'neutral.light.tag-color', // Light text
        },
      },
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  styles,
  components,
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)', // Darker shadows
    md: '0 4px 6px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)',
    lg: '0 10px 15px rgba(0,0,0,0.8), 0 4px 6px rgba(0,0,0,0.6)',
    xl: '0 20px 25px rgba(0,0,0,0.9), 0 10px 10px rgba(0,0,0,0.7)',
  },
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
});

export default theme;