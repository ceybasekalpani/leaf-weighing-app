import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { isTablet, moderateScale } from '../src/utils/responsiveUtils';

const { width } = Dimensions.get('window');

const ResponsiveCard = ({ children, style, ...props }) => {
  const theme = useTheme();
  const isTabletDevice = isTablet();

  const getCardWidth = () => {
    if (isTabletDevice) {
      return width * 0.45;
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
          marginHorizontal: isTabletDevice ? moderateScale(8) : moderateScale(16),
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