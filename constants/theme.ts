export const COLORS = {
  // Ana renkler
  primary: '#6B46C1', // Koyu mor
  primaryDark: '#553C9A',
  primaryLight: '#9F7AEA',
  
  // Arka plan renkleri
  background: '#0F0F23', // Koyu siyah-mor
  surface: '#1A1A2E',
  surfaceLight: '#16213E',
  
  // Metin renkleri
  text: '#FFFFFF',
  textSecondary: '#A0AEC0',
  textMuted: '#718096',
  
  // Durum renkleri
  success: '#48BB78',
  warning: '#ED8936',
  error: '#F56565',
  info: '#4299E1',
  
  // Gradient renkleri
  gradientStart: '#6B46C1',
  gradientEnd: '#2D3748',
  
  // Sosyal medya renkleri
  instagram: '#E4405F',
  tiktok: '#000000',
  youtube: '#FF0000',
  
  // Şeffaflık
  overlay: 'rgba(0, 0, 0, 0.5)',
  cardOverlay: 'rgba(107, 70, 193, 0.1)',
};

export const SIZES = {
  // Font boyutları
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Boşluklar
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
};
