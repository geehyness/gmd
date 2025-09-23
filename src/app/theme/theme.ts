import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

/**
 * Professional Portfolio Light Theme:
 * - Fully light mode
 * - Various shades of gray for brand/UI (headings/buttons)
 * - Vibrant Orange accent for highlights
 * - Light neutrals for backgrounds
 */

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
    500: '#FF3F00', // Primary accent color - vibrant orange
    600: '#E04600',
    700: '#C23D00',
    800: '#A33400',
    900: '#852B00',
  },
  secondary: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280', // muted gray for UI
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  programmingLang: {
    500: '#1F2937', // Dark gray for programming languages
    600: '#111827'  // Slightly darker variant
  },
  neutral: {
    light: {
      'bg-primary': '#F7F7F7',
      'bg-secondary': '#FFFFFF',
      'bg-header': '#FFFFFF',
      'bg-card': 'rgba(255, 255, 255, 0)',
      'text-primary': '#1F1F1F',
      'text-secondary': '#6B7280',
      'border-color': '#E5E5E5',
      'input-bg': '#FFFFFF',
      'input-border': '#E0E0E0',
      'placeholder-color': '#C2C2C2',
      'tag-bg': '#EFEFEF',
      'tag-color': '#474747',
      'status-green': '#00A36C',
      'status-orange': '#FF4F00',
      'status-red': '#EF4444',
      'status-purple': '#7C3AED',
    },
  },
  'secondary-glow': 'rgba(224,70,0,0.18)',
};

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const styles = {
  global: (props: Record<string, any>) => ({
    body: {
      bg: colors.neutral.light['bg-primary'],
      color: colors.neutral.light['text-primary'],
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      fontFeatureSettings: '"kern"',
    },
    'html, #__next': {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },
    a: {
      color: colors.brand[600],
      _hover: { textDecoration: 'underline', color: colors.brand[700] },
    },
    '::-webkit-scrollbar': { width: '8px' },
    '::-webkit-scrollbar-track': { background: colors.neutral.light['bg-primary'] },
    '::-webkit-scrollbar-thumb': { background: colors.brand[600], borderRadius: '4px' },
  }),
};

const components = {
  Button: {
    baseStyle: { fontWeight: 'semibold', borderRadius: 'lg', _focus: { boxShadow: 'outline' }, _active: { transform: 'scale(0.98)' }, transition: 'all 0.18s ease-in-out' },
    variants: {
      solid: { bg: colors.brand[600], color: 'white', _hover: { bg: colors.brand[700], boxShadow: 'md' }, _active: { bg: colors.brand[800] } },
      outline: { borderColor: colors.brand[600], color: colors.brand[600], _hover: { bg: colors.brand[50], boxShadow: 'sm' } },
      ghost: { color: colors.neutral.light['text-secondary'], _hover: { bg: colors.neutral.light['tag-bg'], color: colors.neutral.light['text-primary'] } },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: colors.neutral.light['bg-card'],
        borderRadius: '2xl',
        boxShadow: `0 0 15px ${colors.accent[500]}`, // Added orange glow effect
        borderColor: colors.neutral.light['border-color'],
        borderWidth: '1px',
        backdropFilter: 'blur(8px)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        _hover: {
          transform: 'translateY(-4px)',
          boxShadow: `0 0 25px ${colors.accent[500]}`, // Enhanced glow on hover
        }
      }
    },
  },
  Tag: {
    baseStyle: { container: { bg: colors.neutral.light['tag-bg'], color: colors.neutral.light['tag-color'], borderRadius: 'md', fontWeight: 'medium' } },
  },
  Input: {
    variants: {
      outline: {
        field: {
          bg: colors.neutral.light['input-bg'],
          borderColor: colors.neutral.light['input-border'],
          _hover: { borderColor: colors.brand[300] },
          _focusVisible: { borderColor: colors.brand[600], boxShadow: `0 0 0 2px ${colors.brand[200]}` },
          _placeholder: { color: colors.neutral.light['placeholder-color'] },
        },
      },
    },
  },
  Table: {
    baseStyle: {
      th: { fontWeight: 'bold', textTransform: 'capitalize', color: colors.neutral.light['text-primary'], borderColor: colors.neutral.light['border-color'] },
      td: { color: colors.neutral.light['text-primary'], borderColor: colors.neutral.light['border-color'] },
      container: { bg: colors.neutral.light['bg-card'], borderRadius: 'xl', boxShadow: 'md', border: '1px solid', borderColor: colors.neutral.light['border-color'] },
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  styles,
  components,
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
    md: '0 4px 6px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
    lg: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
    xl: '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)',
    outline: '0 0 0 3px rgba(71,71,71,0.12)',
  },
  fonts: { heading: `'Inter', sans-serif`, body: `'Inter', sans-serif` },
});

export default theme;