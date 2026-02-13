import { Dimensions, StyleSheet } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { isTablet, moderateScale, responsiveSpacing } from '../src/utils/responsiveUtils';

const { width } = Dimensions.get('window');

const ResponsiveCard = ({ 
  children, 
  style, 
  noPadding = false,
  ...props 
}) => {
  const theme = useTheme();
  const isTabletDevice = isTablet();

  const getCardWidth = () => {
    if (isTabletDevice) {
      return width * 0.9;
    }
    return width - moderateScale(32);
  };

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          width: getCardWidth(),
          marginVertical: responsiveSpacing.sm,
          padding: noPadding ? 0 : responsiveSpacing.md,
        },
        style,
      ]}
      elevation={isTabletDevice ? 2 : 4}
      {...props}
    >
      {children}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: moderateScale(16),
    alignSelf: 'center',
  },
});

export default ResponsiveCard;