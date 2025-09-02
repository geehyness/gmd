// src/app/theme/theme.ts
import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

/**
 * Professional Portfolio Light Theme:
 * - Fully light mode
 * - Navy Blue for brand (headings/buttons)
 * - Jade Green accent for highlights
 * - Slate / gray for UI
 * - Light neutrals for backgrounds
 */

const colors = {
  brand: {
    50: '#E5EAF0',
    100: '#BFCAD9',
    200: '#97A9C0',
    300: '#6E86A8',
    400: '#4D6992',
    500: '#2F4E7B',
    600: '#102E4A',
    700: '#0D273B',
    800: '#0A2031',
    900: '#071927',
  },
  accent: {
    50: '#E5F5EF',
    100: '#BFEAE0',
    200: '#99DED0',
    300: '#73D3C1',
    400: '#4DC8B2',
    500: '#26BD9E',
    600: '#00A36C',
    700: '#008256',
    800: '#006141',
    900: '#00402B',
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
    500: '#102E4A', // Dark blue for programming languages
    600: '#0D273B'  // Slightly darker variant
  },
  neutral: {
    light: {
      'bg-primary': '#F0F5F9',
      'bg-secondary': '#FFFFFF',
      'bg-header': '#FFFFFF',
      'bg-card': '#FFFFFF',
      'text-primary': '#102E4A',
      'text-secondary': '#475569',
      'border-color': '#E5EAF0',
      'input-bg': '#FFFFFF',
      'input-border': '#E5EAF0',
      'placeholder-color': '#BFCAD9',
      'tag-bg': '#E5EAF0',
      'tag-color': '#102E4A',
      'status-green': '#00A36C',
      'status-orange': '#F59E0B',
      'status-red': '#EF4444',
      'status-purple': '#7C3AED',
    },
  },
  'secondary-glow': 'rgba(0,163,108,0.18)',
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
    outline: '0 0 0 3px rgba(16,46,74,0.12)',
  },
  fonts: { heading: `'Inter', sans-serif`, body: `'Inter', sans-serif` },
});

export default theme;