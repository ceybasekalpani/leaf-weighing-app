import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { isTablet, responsiveSpacing } from '../src/utils/responsiveUtils';

const ResponsiveContainer = ({ 
  children, 
  scroll = true, 
  style,
  contentContainerStyle 
}) => {
  const theme = useTheme();
  const isTabletDevice = isTablet();

  const Container = scroll ? ScrollView : View;

  return (
    <Container
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ]}
      contentContainerStyle={[
        styles.contentContainer,
        isTabletDevice && styles.tabletContentContainer,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={true}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: responsiveSpacing.md,
  },
  tabletContentContainer: {
    padding: responsiveSpacing.lg,
    alignItems: 'center',
  },
});

export default ResponsiveContainer;