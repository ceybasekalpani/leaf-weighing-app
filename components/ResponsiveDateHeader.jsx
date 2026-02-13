import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { getCurrentDate, getCurrentMonth } from '../src/utils/dateUtils';
import { isTablet, moderateScale, responsiveFontSize } from '../src/utils/responsiveUtils';

const { width } = Dimensions.get('window');

const ResponsiveDateHeader = ({ showMonth = true, showDate = true }) => {
  const theme = useTheme();
  const date = getCurrentDate();
  const month = getCurrentMonth();
  const isTabletDevice = isTablet();

  return (
    <View style={[
      styles.container,
      { 
        flexDirection: isTabletDevice ? 'row' : 'column',
        padding: moderateScale(16),
      }
    ]}>
      {showDate && (
        <Card style={[
          styles.dateCard, 
          { 
            backgroundColor: theme.colors.surface,
            marginBottom: isTabletDevice ? 0 : moderateScale(8),
            marginRight: isTabletDevice ? moderateScale(8) : 0,
            width: isTabletDevice ? width * 0.45 : width - moderateScale(32),
          }
        ]}>
          <Card.Content style={styles.dateCardContent}>
            <IconButton 
              icon="calendar" 
              size={isTabletDevice ? 28 : 24} 
              iconColor={theme.colors.primary} 
            />
            <View style={styles.dateTextContainer}>
              <Text 
                variant={isTabletDevice ? "titleLarge" : "titleMedium"} 
                style={{ color: theme.colors.textSecondary }}
              >
                Date
              </Text>
              <Text 
                variant={isTabletDevice ? "displaySmall" : "headlineSmall"} 
                style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: responsiveFontSize(24) }}
              >
                {date}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}
      
      {showMonth && (
        <Card style={[
          styles.dateCard, 
          { 
            backgroundColor: theme.colors.surface,
            width: isTabletDevice ? width * 0.45 : width - moderateScale(32),
          }
        ]}>
          <Card.Content style={styles.dateCardContent}>
            <IconButton 
              icon="calendar-month" 
              size={isTabletDevice ? 28 : 24} 
              iconColor={theme.colors.secondary} 
            />
            <View style={styles.dateTextContainer}>
              <Text 
                variant={isTabletDevice ? "titleLarge" : "titleMedium"} 
                style={{ color: theme.colors.textSecondary }}
              >
                Month
              </Text>
              <Text 
                variant={isTabletDevice ? "displaySmall" : "headlineSmall"} 
                style={{ color: theme.colors.secondary, fontWeight: 'bold', fontSize: responsiveFontSize(24) }}
              >
                {month}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateCard: {
    borderRadius: moderateScale(12),
    elevation: 2,
  },
  dateCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(12),
  },
  dateTextContainer: {
    marginLeft: moderateScale(8),
  },
});

export default ResponsiveDateHeader;