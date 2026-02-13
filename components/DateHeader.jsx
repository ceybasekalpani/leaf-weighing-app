import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { getCurrentDate, getCurrentMonth } from '../src/utils/dateUtils';

const DateHeader = ({ showMonth = true, showDate = true }) => {
  const theme = useTheme();
  const date = getCurrentDate();
  const month = getCurrentMonth();

  return (
    <View style={styles.container}>
      {showDate && (
        <Card style={[styles.dateCard, { backgroundColor: theme.colors.surface, elevation: 2 }]}>
          <Card.Content style={styles.dateCardContent}>
            <IconButton icon="calendar" size={24} iconColor={theme.colors.primary} />
            <View style={styles.dateTextContainer}>
              <Text variant="titleMedium" style={{ color: theme.colors.textSecondary }}>Date</Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                {date}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}
      
      {showMonth && (
        <Card style={[styles.dateCard, { backgroundColor: theme.colors.surface, elevation: 2 }]}>
          <Card.Content style={styles.dateCardContent}>
            <IconButton icon="calendar-month" size={24} iconColor={theme.colors.secondary} />
            <View style={styles.dateTextContainer}>
              <Text variant="titleMedium" style={{ color: theme.colors.textSecondary }}>Month</Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  dateCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  dateCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateTextContainer: {
    marginLeft: 8,
  },
});

export default DateHeader;