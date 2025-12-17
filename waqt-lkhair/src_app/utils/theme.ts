export const colors = {
  primary: '#2D5A3D',
  primaryLight: '#4A7C59',
  primaryDark: '#1E3D2A',
  secondary: '#D4A574',
  secondaryLight: '#E8C9A8',
  accent: '#C9A227',
  background: '#FEFDF8',
  backgroundAlt: '#F5F0E8',
  card: '#FFFFFF',
  cardAlt: '#FAF8F3',
  text: '#2C2C2C',
  textSecondary: '#6B6B6B',
  textLight: '#9A9A9A',
  textInverse: '#FFFFFF',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#E53935',
  border: '#E8E4DC',
  borderLight: '#F0EDE6',
  shadow: 'rgba(45, 90, 61, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
  ramadan: '#1E5631',
  eid: '#C9A227',
  winter: '#5B7C99',
  neighborhood: '#8B6914',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export default theme;
