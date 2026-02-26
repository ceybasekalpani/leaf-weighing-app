import { IconButton, useTheme } from 'react-native-paper';
import { useTheme as useAppTheme } from '../src/context/ThemeContext';

const ThemeToggle = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();

  return (
    <IconButton
      icon={isDarkMode ? 'weather-sunny' : 'weather-night'}
      iconColor="#D3D3D3"
      size={24}
      onPress={toggleTheme}
      style={{ marginRight: 8 }}
    />
  );
};

export default ThemeToggle;