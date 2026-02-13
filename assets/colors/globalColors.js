// Global colors for both light and dark modes
export const globalColors = {
  light: {
    primary: '#2E7D32', // Dark green - tea leaf color
    primaryLight: '#4CAF50',
    primaryDark: '#1B5E20',
    secondary: '#FF8F00', // Amber - for accents
    accent: '#795548', // Brown - tea color
    background: '#F5F5F5',
    surface: '#FFFFFF',
    error: '#B71C1C',
    success: '#388E3C',
    warning: '#FFA000',
    info: '#0288D1',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
    card: '#FFFFFF',
    disabled: '#BDBDBD',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0,0,0,0.5)',
    notification: '#F57C00',
  },
  dark: {
    primary: '#66BB6A', // Lighter green for dark mode
    primaryLight: '#81C784',
    primaryDark: '#388E3C',
    secondary: '#FFB74D',
    accent: '#8D6E63', // Light brown
    background: '#121212',
    surface: '#1E1E1E',
    error: '#EF5350',
    success: '#4CAF50',
    warning: '#FFB74D',
    info: '#4FC3F7',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#333333',
    card: '#242424',
    disabled: '#757575',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0,0,0,0.8)',
    notification: '#FFA726',
  }
};

export const getThemeColors = (isDarkMode) => {
  return isDarkMode ? globalColors.dark : globalColors.light;
};