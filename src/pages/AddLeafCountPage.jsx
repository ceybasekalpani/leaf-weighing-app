import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  Surface,
  useTheme as usePaperTheme,
  IconButton
} from 'react-native-paper';
import RoutePicker from '../../components/RoutePicker';
import ResponsiveCard from '../../components/ResponsiveCard';
import { moderateScale, responsiveSpacing } from '../utils/responsiveUtils';

export default function AddLeafCountPage() {
  const paperTheme = usePaperTheme();
  const [date, setDate] = useState('');
  const [month, setMonth] = useState('');
  const [route, setRoute] = useState('');
  const [bestLeaf, setBestLeaf] = useState('');
  const [bellowBest, setBellowBest] = useState('');
  const [poor, setPoor] = useState('');

  const handleSave = () => {
    const leafCount = {
      date,
      month,
      route,
      bestLeaf,
      bellowBest,
      poor,
      timestamp: new Date().toISOString(),
    };
    console.log('Saving leaf count:', leafCount);
    handleClear();
  };

  const handleClear = () => {
    setDate('');
    setMonth('');
    setRoute('');
    setBestLeaf('');
    setBellowBest('');
    setPoor('');
  };

  const totalPercentage = (parseFloat(bestLeaf) || 0) + (parseFloat(bellowBest) || 0) + (parseFloat(poor) || 0);
  const isValidTotal = totalPercentage === 100;

  return (
    <ScrollView style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <ResponsiveCard>
        <Card.Content>
          <View style={styles.headerContainer}>
            <IconButton icon="leaf-circle" size={40} iconColor={paperTheme.colors.primary} />
            <Text variant="headlineSmall" style={[styles.title, { color: paperTheme.colors.primary }]}>
              Add Leaf Count
            </Text>
          </View>

          <View style={styles.row}>
            <TextInput
              label="Date"
              value={date}
              onChangeText={setDate}
              mode="outlined"
              placeholder="13"
              keyboardType="numeric"
              left={<TextInput.Icon icon="calendar" />}
              style={[styles.input, styles.halfInput]}
              theme={{ colors: { primary: paperTheme.colors.primary } }}
            />
            <TextInput
              label="Month"
              value={month}
              onChangeText={setMonth}
              mode="outlined"
              placeholder="Feb-2026"
              left={<TextInput.Icon icon="calendar-month" />}
              style={[styles.input, styles.halfInput]}
              theme={{ colors: { primary: paperTheme.colors.primary } }}
            />
          </View>

          <RoutePicker 
            selectedRoute={route}
            onRouteChange={setRoute}
            label="Route Name"
          />

          <Card style={[styles.percentageCard, { backgroundColor: paperTheme.colors.background }]}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: paperTheme.colors.primary }]}>
                Quality Distribution
              </Text>
              
              <View style={styles.percentageRow}>
                <View style={styles.percentageInputContainer}>
                  <Text variant="bodySmall" style={{ color: paperTheme.colors.success, marginBottom: 4 }}>
                    Best Leaf %
                  </Text>
                  <TextInput
                    value={bestLeaf}
                    onChangeText={setBestLeaf}
                    mode="outlined"
                    keyboardType="numeric"
                    placeholder="0"
                    right={<TextInput.Affix text="%" />}
                    style={styles.percentageInput}
                    theme={{ colors: { primary: paperTheme.colors.success } }}
                  />
                </View>
                
                <View style={styles.percentageInputContainer}>
                  <Text variant="bodySmall" style={{ color: paperTheme.colors.warning, marginBottom: 4 }}>
                    Below Best %
                  </Text>
                  <TextInput
                    value={bellowBest}
                    onChangeText={setBellowBest}
                    mode="outlined"
                    keyboardType="numeric"
                    placeholder="0"
                    right={<TextInput.Affix text="%" />}
                    style={styles.percentageInput}
                    theme={{ colors: { primary: paperTheme.colors.warning } }}
                  />
                </View>
                
                <View style={styles.percentageInputContainer}>
                  <Text variant="bodySmall" style={{ color: paperTheme.colors.error, marginBottom: 4 }}>
                    Poor %
                  </Text>
                  <TextInput
                    value={poor}
                    onChangeText={setPoor}
                    mode="outlined"
                    keyboardType="numeric"
                    placeholder="0"
                    right={<TextInput.Affix text="%" />}
                    style={styles.percentageInput}
                    theme={{ colors: { primary: paperTheme.colors.error } }}
                  />
                </View>
              </View>

              {(bestLeaf || bellowBest || poor) && (
                <Surface 
                  style={[
                    styles.totalContainer, 
                    { 
                      backgroundColor: isValidTotal ? paperTheme.colors.success : paperTheme.colors.error,
                      elevation: 2
                    }
                  ]}
                >
                  <Text variant="bodyMedium" style={{ color: '#FFFFFF' }}>Total Percentage</Text>
                  <Text variant="titleLarge" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                    {totalPercentage.toFixed(1)}%
                  </Text>
                </Surface>
              )}
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
              icon="content-save"
              buttonColor={paperTheme.colors.primary}
              labelStyle={styles.buttonLabel}
              disabled={!route || !date || !month || !isValidTotal}
            >
              Save
            </Button>
            <Button 
              mode="outlined" 
              onPress={handleClear}
              style={styles.button}
              icon="close"
              textColor={paperTheme.colors.error}
              labelStyle={styles.buttonLabel}
            >
              Clear
            </Button>
          </View>
        </Card.Content>
      </ResponsiveCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing.xl,
  },
  title: {
    fontWeight: 'bold',
    marginLeft: responsiveSpacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveSpacing.md,
  },
  input: {
    marginBottom: responsiveSpacing.md,
  },
  halfInput: {
    flex: 1,
    marginRight: responsiveSpacing.sm,
  },
  percentageCard: {
    marginVertical: responsiveSpacing.md,
    borderRadius: moderateScale(12),
  },
  sectionTitle: {
    marginBottom: responsiveSpacing.md,
    fontWeight: 'bold',
  },
  percentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  percentageInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  percentageInput: {
    height: 60,
  },
  totalContainer: {
    marginTop: responsiveSpacing.lg,
    padding: responsiveSpacing.md,
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: responsiveSpacing.xl,
  },
  button: {
    flex: 1,
    marginHorizontal: responsiveSpacing.sm,
    borderRadius: moderateScale(30),
  },
  saveButton: {
    elevation: 4,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
});