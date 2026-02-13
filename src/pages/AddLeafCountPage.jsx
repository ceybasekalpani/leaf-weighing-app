import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    IconButton,
    Surface,
    Text,
    TextInput,
    useTheme as usePaperTheme
} from 'react-native-paper';
import ResponsiveCard from '../../components/ResponsiveCard';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import ResponsiveGrid from '../../components/ResponsiveGrid';
import RoutePicker from '../../components/RoutePicker';
import {
    getButtonHeight,
    getInputHeight,
    isTablet,
    moderateScale,
    responsiveFontSize,
    responsiveSpacing
} from '../utils/responsiveUtils';

export default function AddLeafCountPage() {
  const paperTheme = usePaperTheme();
  const isTabletDevice = isTablet();
  
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

  const renderPercentageInput = (label, value, onChange, color) => (
    <View style={styles.percentageInputContainer}>
      <Text variant="bodySmall" style={{ color, marginBottom: responsiveSpacing.xs }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        mode="outlined"
        keyboardType="numeric"
        placeholder="0"
        right={<TextInput.Affix text="%" />}
        style={[styles.percentageInput, { height: getInputHeight() }]}
        theme={{ colors: { primary: color } }}
      />
    </View>
  );

  return (
    <ResponsiveContainer>
      <ResponsiveCard>
        <Card.Content>
          <View style={styles.headerContainer}>
            <IconButton 
              icon="leaf-circle" 
              size={isTabletDevice ? 48 : 40} 
              iconColor={paperTheme.colors.primary} 
            />
            <Text 
              variant={isTabletDevice ? "displaySmall" : "headlineSmall"} 
              style={[styles.title, { color: paperTheme.colors.primary }]}
            >
              Add Leaf Count
            </Text>
          </View>

          <ResponsiveGrid>
            <View style={styles.row}>
              <TextInput
                label="Date"
                value={date}
                onChangeText={setDate}
                mode="outlined"
                placeholder="13"
                keyboardType="numeric"
                left={<TextInput.Icon icon="calendar" />}
                style={[styles.input, styles.halfInput, { height: getInputHeight() }]}
                theme={{ colors: { primary: paperTheme.colors.primary } }}
              />
              <TextInput
                label="Month"
                value={month}
                onChangeText={setMonth}
                mode="outlined"
                placeholder="Feb-2026"
                left={<TextInput.Icon icon="calendar-month" />}
                style={[styles.input, styles.halfInput, { height: getInputHeight() }]}
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
                
                <ResponsiveGrid>
                  {renderPercentageInput("Best Leaf %", bestLeaf, setBestLeaf, paperTheme.colors.success)}
                  {renderPercentageInput("Below Best %", bellowBest, setBellowBest, paperTheme.colors.warning)}
                  {renderPercentageInput("Poor %", poor, setPoor, paperTheme.colors.error)}
                </ResponsiveGrid>

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
          </ResponsiveGrid>

          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
              icon="content-save"
              buttonColor={paperTheme.colors.primary}
              labelStyle={[styles.buttonLabel, { fontSize: responsiveFontSize(16) }]}
              contentStyle={{ height: getButtonHeight() }}
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
              labelStyle={[styles.buttonLabel, { fontSize: responsiveFontSize(16) }]}
              contentStyle={{ height: getButtonHeight() }}
            >
              Clear
            </Button>
          </View>
        </Card.Content>
      </ResponsiveCard>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
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
    width: '100%',
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
    width: '100%',
  },
  sectionTitle: {
    marginBottom: responsiveSpacing.md,
    fontWeight: 'bold',
  },
  percentageInputContainer: {
    flex: 1,
    marginHorizontal: responsiveSpacing.xs,
    marginBottom: responsiveSpacing.sm,
  },
  percentageInput: {
    width: '100%',
  },
  totalContainer: {
    marginTop: responsiveSpacing.lg,
    padding: responsiveSpacing.md,
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: responsiveSpacing.xl,
    gap: responsiveSpacing.md,
  },
  button: {
    flex: 1,
    borderRadius: moderateScale(30),
  },
  saveButton: {
    elevation: 4,
  },
  buttonLabel: {
    paddingVertical: responsiveSpacing.xs,
  },
});