import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  SegmentedButtons, 
  Divider,
  useTheme as usePaperTheme,
  IconButton
} from 'react-native-paper';
import { useLeafData } from '../context/LeafDataContext';
import ResponsiveDateHeader from '../../components/ResponsiveDateHeader';
import ResponsiveCard from '../../components/ResponsiveCard';
import { getCurrentDate, getCurrentMonth } from '../utils/dateUtils';
import { 
  isTablet, 
  moderateScale, 
  responsiveFontSize,
  responsiveSpacing 
} from '../utils/responsiveUtils';

export default function AddLeafDeductionPage({ navigation }) {
  const paperTheme = usePaperTheme();
  const { addLeafDeduction } = useLeafData();
  const isTabletDevice = isTablet();

  const [date] = useState(getCurrentDate());
  const [month] = useState(getCurrentMonth());
  const [regNo, setRegNo] = useState('');
  const [route] = useState('Hapugastenna');
  const [leafType, setLeafType] = useState('green');
  const [bags] = useState('5');
  const [gross] = useState('250');
  const [bagWeight, setBagWeight] = useState('');
  const [coarce, setCoarce] = useState('');
  const [water, setWater] = useState('');
  const [boiled, setBoiled] = useState('');
  const [rejected] = useState('0');

  // Calculate totals
  const totalBagWeight = bagWeight ? (parseInt(bags) * parseFloat(bagWeight)).toFixed(2) : '0.00';
  const totalCoarce = coarce ? (parseInt(bags) * parseFloat(coarce)).toFixed(2) : '0.00';
  const totalWater = water ? (parseInt(bags) * parseFloat(water)).toFixed(2) : '0.00';
  const totalBoiled = boiled ? (parseInt(bags) * parseFloat(boiled)).toFixed(2) : '0.00';
  const totalRejected = '0.00';
  
  const calculateNetWeight = () => {
    const grossWeight = parseFloat(gross) || 0;
    const totalBagWt = parseFloat(totalBagWeight) || 0;
    const totalCoarceWt = parseFloat(totalCoarce) || 0;
    const totalWaterWt = parseFloat(totalWater) || 0;
    const totalBoiledWt = parseFloat(totalBoiled) || 0;
    const totalRejectedWt = parseFloat(totalRejected) || 0;
    
    return (grossWeight - totalBagWt - totalCoarceWt - totalWaterWt - totalBoiledWt - totalRejectedWt).toFixed(2);
  };

  const handleSave = () => {
    const deductionData = {
      date,
      month,
      regNo,
      route,
      leafType,
      bags,
      gross,
      bagWeight,
      totalBagWeight,
      coarce,
      totalCoarce,
      water,
      totalWater,
      boiled,
      totalBoiled,
      rejected,
      totalRejected,
      netWeight: calculateNetWeight(),
      timestamp: new Date().toISOString(),
    };
    
    addLeafDeduction(deductionData);
    handleClear();
  };

  const handleClear = () => {
    setRegNo('');
    setBagWeight('');
    setCoarce('');
    setWater('');
    setBoiled('');
    setLeafType('green');
  };

  // Responsive layout for tablet
  const renderFormFields = () => {
    if (isTabletDevice) {
      return (
        <View style={styles.tabletRow}>
          <View style={styles.tabletColumn}>
            <TextInput
              label="Registration Number"
              value={regNo}
              onChangeText={setRegNo}
              mode="outlined"
              left={<TextInput.Icon icon="card-account-details" />}
              style={styles.input}
            />
            
            <TextInput
              label="Route"
              value={route}
              mode="outlined"
              disabled
              left={<TextInput.Icon icon="map-marker" />}
              style={styles.input}
            />

            <Text variant="titleMedium" style={[styles.sectionTitle, { color: paperTheme.colors.text }]}>
              Leaf Type
            </Text>
            <SegmentedButtons
              value={leafType}
              onValueChange={setLeafType}
              buttons={[
                { value: 'green', label: '🍃 Green' },
                { value: 'black', label: '🖤 Black' },
                { value: 'mixed', label: '🔄 Mixed' },
              ]}
              style={styles.segmentedButtons}
            />

            <View style={styles.row}>
              <TextInput
                label="Bags"
                value={bags}
                mode="outlined"
                disabled
                left={<TextInput.Icon icon="sack" />}
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Gross (kg)"
                value={gross}
                mode="outlined"
                disabled
                left={<TextInput.Icon icon="weight" />}
                style={[styles.input, styles.halfInput]}
              />
            </View>
          </View>

          <View style={styles.tabletColumn}>
            <View style={styles.row}>
              <TextInput
                label="Bag Weight (kg)"
                value={bagWeight}
                onChangeText={setBagWeight}
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="weight-kilogram" />}
                style={[styles.input, styles.halfInput]}
              />
              <View style={styles.displayField}>
                <Text variant="bodySmall" style={{ color: paperTheme.colors.textSecondary }}>Total Bag Weight</Text>
                <Text variant="headlineSmall" style={{ color: paperTheme.colors.primary, fontWeight: 'bold' }}>
                  {totalBagWeight} kg
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <TextInput
                label="Coarce (kg)"
                value={coarce}
                onChangeText={setCoarce}
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="leaf-off" />}
                style={[styles.input, styles.halfInput]}
              />
              <View style={styles.displayField}>
                <Text variant="bodySmall" style={{ color: paperTheme.colors.textSecondary }}>Total Coarce</Text>
                <Text variant="headlineSmall" style={{ color: paperTheme.colors.error, fontWeight: 'bold' }}>
                  {totalCoarce} kg
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <TextInput
                label="Water (kg)"
                value={water}
                onChangeText={setWater}
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="water" />}
                style={[styles.input, styles.halfInput]}
              />
              <View style={styles.displayField}>
                <Text variant="bodySmall" style={{ color: paperTheme.colors.textSecondary }}>Total Water</Text>
                <Text variant="headlineSmall" style={{ color: paperTheme.colors.info, fontWeight: 'bold' }}>
                  {totalWater} kg
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <TextInput
                label="Boiled/Other (kg)"
                value={boiled}
                onChangeText={setBoiled}
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="fire" />}
                style={[styles.input, styles.halfInput]}
              />
              <View style={styles.displayField}>
                <Text variant="bodySmall" style={{ color: paperTheme.colors.textSecondary }}>Total Boiled</Text>
                <Text variant="headlineSmall" style={{ color: paperTheme.colors.warning, fontWeight: 'bold' }}>
                  {totalBoiled} kg
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <TextInput
                label="Rejected (kg)"
                value={rejected}
                mode="outlined"
                disabled
                left={<TextInput.Icon icon="close-circle" />}
                style={[styles.input, styles.halfInput]}
              />
              <View style={styles.displayField}>
                <Text variant="bodySmall" style={{ color: paperTheme.colors.textSecondary }}>Total Rejected</Text>
                <Text variant="headlineSmall" style={{ color: paperTheme.colors.error, fontWeight: 'bold' }}>
                  {totalRejected} kg
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    } else {
      // Mobile layout
      return (
        <>
          <TextInput
            label="Registration Number"
            value={regNo}
            onChangeText={setRegNo}
            mode="outlined"
            left={<TextInput.Icon icon="card-account-details" />}
            style={styles.input}
          />

          <TextInput
            label="Route"
            value={route}
            mode="outlined"
            disabled
            left={<TextInput.Icon icon="map-marker" />}
            style={styles.input}
          />

          <Text variant="titleMedium" style={[styles.sectionTitle, { color: paperTheme.colors.text }]}>
            Leaf Type
          </Text>
          <SegmentedButtons
            value={leafType}
            onValueChange={setLeafType}
            buttons={[
              { value: 'green', label: '🍃 Green' },
              { value: 'black', label: '🖤 Black' },
              { value: 'mixed', label: '🔄 Mixed' },
            ]}
            style={styles.segmentedButtons}
          />

          <View style={styles.row}>
            <TextInput
              label="Bags"
              value={bags}
              mode="outlined"
              disabled
              left={<TextInput.Icon icon="sack" />}
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="Gross (kg)"
              value={gross}
              mode="outlined"
              disabled
              left={<TextInput.Icon icon="weight" />}
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="Bag Weight (kg)"
              value={bagWeight}
              onChangeText={setBagWeight}
              mode="outlined"
              keyboardType="numeric"
              left={<TextInput.Icon icon="weight-kilogram" />}
              style={[styles.input, styles.halfInput]}
            />
            <View style={styles.displayField}>
              <Text variant="bodySmall" style={{ color: paperTheme.colors.textSecondary }}>Total Bag Weight</Text>
              <Text variant="headlineSmall" style={{ color: paperTheme.colors.primary, fontWeight: 'bold' }}>
                {totalBagWeight} kg
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <TextInput
              label="Coarce (kg)"
              value={coarce}
              onChangeText={setCoarce}
              mode="outlined"
              keyboardType="numeric"
              left={<TextInput.Icon icon="leaf-off" />}
              style={[styles.input, styles.halfInput]}
            />
            <View style={styles.displayField}>
              <Text variant="bodySmall" style={{ color: paperTheme.colors.textSecondary }}>Total Coarce</Text>
              <Text variant="headlineSmall" style={{ color: paperTheme.colors.error, fontWeight: 'bold' }}>
                {totalCoarce} kg
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <TextInput
              label="Water (kg)"
              value={water}
              onChangeText={setWater}
              mode="outlined"
              keyboardType="numeric"
              left={<TextInput.Icon icon="water" />}
              style={[styles.input, styles.halfInput]}
            />
            <View style={styles.displayField}>
              <Text variant="bodySmall" style={{ color: paperTheme.colors.textSecondary }}>Total Water</Text>
              <Text variant="headlineSmall" style={{ color: paperTheme.colors.info, fontWeight: 'bold' }}>
                {totalWater} kg
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <TextInput
              label="Boiled/Other (kg)"
              value={boiled}
              onChangeText={setBoiled}
              mode="outlined"
              keyboardType="numeric"
              left={<TextInput.Icon icon="fire" />}
              style={[styles.input, styles.halfInput]}
            />
            <View style={styles.displayField}>
              <Text variant="bodySmall" style={{ color: paperTheme.colors.textSecondary }}>Total Boiled</Text>
              <Text variant="headlineSmall" style={{ color: paperTheme.colors.warning, fontWeight: 'bold' }}>
                {totalBoiled} kg
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <TextInput
              label="Rejected (kg)"
              value={rejected}
              mode="outlined"
              disabled
              left={<TextInput.Icon icon="close-circle" />}
              style={[styles.input, styles.halfInput]}
            />
            <View style={styles.displayField}>
              <Text variant="bodySmall" style={{ color: paperTheme.colors.textSecondary }}>Total Rejected</Text>
              <Text variant="headlineSmall" style={{ color: paperTheme.colors.error, fontWeight: 'bold' }}>
                {totalRejected} kg
              </Text>
            </View>
          </View>
        </>
      );
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
      showsVerticalScrollIndicator={true}
    >
      <ResponsiveDateHeader />
      
      <ResponsiveCard>
        <Card.Content>
          <View style={styles.headerContainer}>
            <IconButton 
              icon="leaf" 
              size={isTabletDevice ? 40 : 32} 
              iconColor={paperTheme.colors.primary} 
            />
            <Text 
              variant={isTabletDevice ? "displaySmall" : "headlineSmall"} 
              style={[styles.title, { color: paperTheme.colors.primary }]}
            >
              Add Leaf Deduction
            </Text>
          </View>

          {renderFormFields()}

          <Divider style={[styles.divider, { backgroundColor: paperTheme.colors.border }]} />

          <View style={styles.netWeightContainer}>
            <Text variant={isTabletDevice ? "displaySmall" : "titleLarge"} style={{ color: paperTheme.colors.text }}>
              Net Weight
            </Text>
            <Text 
              variant={isTabletDevice ? "displayMedium" : "displaySmall"} 
              style={{ color: paperTheme.colors.success, fontWeight: 'bold' }}
            >
              {calculateNetWeight()} kg
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
              icon="content-save"
              buttonColor={paperTheme.colors.primary}
              labelStyle={[styles.buttonLabel, { fontSize: responsiveFontSize(16) }]}
              contentStyle={styles.buttonContent}
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
              contentStyle={styles.buttonContent}
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
  input: {
    marginBottom: responsiveSpacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveSpacing.md,
  },
  halfInput: {
    flex: 1,
    marginRight: responsiveSpacing.sm,
  },
  displayField: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: responsiveSpacing.sm,
  },
  sectionTitle: {
    marginBottom: responsiveSpacing.sm,
  },
  segmentedButtons: {
    marginBottom: responsiveSpacing.md,
  },
  divider: {
    marginVertical: responsiveSpacing.lg,
  },
  netWeightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    paddingVertical: responsiveSpacing.xs,
  },
  buttonContent: {
    paddingVertical: responsiveSpacing.xs,
  },
  // Tablet specific styles
  tabletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabletColumn: {
    flex: 1,
    marginHorizontal: responsiveSpacing.sm,
  },
});