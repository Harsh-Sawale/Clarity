export const Colors = {
  background: '#000000',
  surface: '#121214',
  surfaceElevated: '#1C1C1E',
  surfaceActive: '#2C2C2E',
  border: '#27272A',
  borderLight: '#3F3F46',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  accent: '#E4E4E7',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  overlay: 'rgba(0, 0, 0, 0.82)',
  transparent: 'transparent',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  titleLarge: {
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.8,
    color: Colors.textPrimary,
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.4,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    color: Colors.textMuted,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
};
