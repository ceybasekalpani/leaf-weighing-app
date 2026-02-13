import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';

const routes = [
  'Hapugastenna',
  'Nawalapitiya',
  'Ginigathhena',
  'Hatton',
  'Dickoya',
  'Maskeliya',
  'Talawakele',
  'Bogawantalawa',
  'Norwood',
  'Watawala',
];

const RoutePicker = ({ selectedRoute, onRouteChange, label = "Route Name" }) => {
  const theme = useTheme();

  return (
    <Surface style={[styles.container, { 
      backgroundColor: theme.colors.surface, 
      borderColor: theme.colors.border,
      elevation: 1
    }]}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <Picker
        selectedValue={selectedRoute}
        onValueChange={onRouteChange}
        style={[
          styles.picker,
          { color: theme.colors.text }
        ]}
        dropdownIconColor={theme.colors.primary}
      >
        <Picker.Item 
          label="Select Route" 
          value="" 
          color={theme.colors.textSecondary}
        />
        {routes.map((route, index) => (
          <Picker.Item 
            key={index} 
            label={route} 
            value={route}
            color={theme.colors.text}
          />
        ))}
      </Picker>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  label: {
    marginTop: 8,
    marginLeft: 8,
  },
  picker: {
    height: Platform.OS === 'ios' ? 120 : 50,
    width: '100%',
  },
});

export default RoutePicker;