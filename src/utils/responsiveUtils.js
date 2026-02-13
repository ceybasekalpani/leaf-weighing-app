import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base width for scaling (iPhone 11 Pro Max)
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// Responsive scaling functions
export const scale = (size) => {
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size * scaleFactor);
};

export const verticalScale = (size) => {
  const scaleFactor = SCREEN_HEIGHT / BASE_HEIGHT;
  return Math.round(size * scaleFactor);
};

export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Check device type
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  return (Math.sqrt(adjustedWidth * adjustedWidth + adjustedHeight * adjustedHeight) / pixelDensity) >= 7;
};

export const isPhone = () => !isTablet();

// Get responsive font size
export const responsiveFontSize = (size) => {
  if (isTablet()) {
    return moderateScale(size, 0.3);
  }
  return scale(size);
};

// Get responsive spacing
export const responsiveSpacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(40),
};

// Grid system for responsive layouts
export const getGridColumns = () => {
  if (isTablet()) {
    return SCREEN_WIDTH > 800 ? 3 : 2;
  }
  return 1;
};

// Responsive table settings
export const getTableMinWidth = () => {
  if (isTablet()) {
    return SCREEN_WIDTH - moderateScale(32);
  }
  return SCREEN_WIDTH * 1.5;
};

// Responsive card width
export const getCardWidth = () => {
  if (isTablet()) {
    return SCREEN_WIDTH * 0.9;
  }
  return SCREEN_WIDTH - moderateScale(32);
};