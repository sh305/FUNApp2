export const COLORS = {
  background: '#0B0D19',
  surface: '#15192D',
  surfaceLight: '#1F243F',
  card: '#1A1F36',
  cardBorder: '#2E355B',

  primary: '#7C3AED',       // Luxury Purple
  primaryLight: '#9061F9',
  accent: '#FF007A',        // YoYo Hot Pink
  secondary: '#00F0FF',     // Neon Cyan
  gold: '#FFD700',          // Luxury Gold
  goldGlow: 'rgba(255, 215, 0, 0.4)',
  
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  
  seatEmpty: 'rgba(255, 255, 255, 0.08)',
  seatBorder: 'rgba(255, 255, 255, 0.15)',
  seatActive: '#00FF88'
};

export const SHADOWS = {
  glow: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  neon: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  }
};
