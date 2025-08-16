// src/app/theme/theme.ts
import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

/**
 * Professional Portfolio Light Theme:
 * - Fully light mode
 * - Indigo for brand (headings/buttons)
 * - Teal accent for highlights
 * - Slate / gray for UI
 * - Light neutrals for backgrounds
 */

const colors = {
  brand: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#4F46E5', // primary brand
    600: '#4338CA',
    700: '#3730A3',
    800: '#312E81',
    900: '#2B2A72',
  },
  accent: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6', // accent
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B', // muted slate for UI
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F1724',
  },
  programmingLang: {
    500: '#1E3A8A', // Dark blue for programming languages
    600: '#152C66'  // Slightly darker variant
  },
  neutral: {
    light: {
      'bg-primary': '#F8FAFC',
      'bg-secondary': '#FFFFFF',
      'bg-header': '#FFFFFF',
      'bg-card': '#FFFFFF',
      'text-primary': '#0F172A',
      'text-secondary': '#475569',
      'border-color': '#E6EEF3',
      'input-bg': '#FFFFFF',
      'input-border': '#E6EEF3',
      'placeholder-color': '#94A3B8',
      'tag-bg': '#EEF2FF',
      'tag-color': '#0F172A',
      'status-green': '#10B981',
      'status-orange': '#F59E0B',
      'status-red': '#EF4444',
      'status-purple': '#7C3AED',
    },
  },
  'secondary-glow': 'rgba(20,184,166,0.18)',
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
      color: colors.brand[500],
      _hover: { textDecoration: 'underline', color: colors.brand[600] },
    },
    '::-webkit-scrollbar': { width: '8px' },
    '::-webkit-scrollbar-track': { background: colors.neutral.light['bg-primary'] },
    '::-webkit-scrollbar-thumb': { background: colors.brand[500], borderRadius: '4px' },
  }),
};

const components = {
  Button: {
    baseStyle: { fontWeight: 'semibold', borderRadius: 'lg', _focus: { boxShadow: 'outline' }, _active: { transform: 'scale(0.98)' }, transition: 'all 0.18s ease-in-out' },
    variants: {
      solid: { bg: colors.brand[500], color: 'white', _hover: { bg: colors.brand[600], boxShadow: 'md' }, _active: { bg: colors.brand[700] } },
      outline: { borderColor: colors.brand[500], color: colors.brand[500], _hover: { bg: colors.brand[50], boxShadow: 'sm' } },
      ghost: { color: colors.neutral.light['text-secondary'], _hover: { bg: colors.neutral.light['tag-bg'], color: colors.neutral.light['text-primary'] } },
    },
  },
  Card: {
    baseStyle: { container: { bg: colors.neutral.light['bg-card'], borderRadius: '2xl', boxShadow: 'md', borderColor: colors.neutral.light['border-color'], borderWidth: '1px', transition: 'transform 0.2s ease, box-shadow 0.2s ease', _hover: { transform: 'translateY(-4px)', boxShadow: 'lg' } } },
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
          _focusVisible: { borderColor: colors.brand[500], boxShadow: `0 0 0 2px ${colors.brand[200]}` },
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
    outline: '0 0 0 3px rgba(79,70,229,0.12)',
  },
  fonts: { heading: `'Inter', sans-serif`, body: `'Inter', sans-serif` },
});

export default theme;
