import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Divider,
    IconButton,
    SegmentedButtons,
    Text, // ✅ Comma added here
    TextInput,
    useTheme as usePaperTheme
} from 'react-native-paper';
import ResponsiveCard from '../../components/ResponsiveCard';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import ResponsiveDateHeader from '../../components/ResponsiveDateHeader';
import ResponsiveGrid from '../../components/ResponsiveGrid';
import { useLeafData } from '../context/LeafDataContext';
import { getCurrentDate, getCurrentMonth } from '../utils/dateUtils';
import {
    getButtonHeight,
    getInputHeight,
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

  const renderInputField = (label, value, onChange, icon, keyboardType = 'default', disabled = false) => (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChange}
      mode="outlined"
      disabled={disabled}
      keyboardType={keyboardType}
      left={icon ? <TextInput.Icon icon={icon} /> : null}
      style={[
        styles.input,
        { height: getInputHeight() }
      ]}
      theme={{ colors: { primary: paperTheme.colors.primary } }}
    />
  );

  const renderDisplayField = (label, value, color) => (
    <View style={styles.displayField}>
      <Text variant="bodySmall" style={{ color: paperTheme.colors.textSecondary }}>
        {label}
      </Text>
      <Text 
        variant={isTabletDevice ? "titleLarge" : "headlineSmall"} 
        style={{ color, fontWeight: 'bold', fontSize: responsiveFontSize(18) }}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <ResponsiveContainer>
      <ResponsiveDateHeader />
      
      <ResponsiveCard>
        <Card.Content>
          <View style={styles.headerContainer}>
            <IconButton 
              icon="leaf" 
              size={isTabletDevice ? 48 : 32} 
              iconColor={paperTheme.colors.primary} 
            />
            <Text 
              variant={isTabletDevice ? "displaySmall" : "headlineSmall"} 
              style={[styles.title, { color: paperTheme.colors.primary }]}
            >
              Add Leaf Deduction
            </Text>
          </View>

          <ResponsiveGrid>
            {/* Registration Number */}
            {renderInputField("Registration Number", regNo, setRegNo, "card-account-details")}

            {/* Route */}
            {renderInputField("Route", route, null, "map-marker", 'default', true)}

            {/* Leaf Type */}
            <View style={styles.sectionContainer}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: paperTheme.colors.text }]}>
                Leaf Type
              </Text>
              <SegmentedButtons
                value={leafType}
                onValueChange={setLeafType}
                buttons={[
                  { 
                    value: 'green', 
                    label: '🍃 Green',
                    style: { 
                      backgroundColor: leafType === 'green' ? paperTheme.colors.primary : paperTheme.colors.surface,
                    }
                  },
                  { 
                    value: 'black', 
                    label: '🖤 Black',
                    style: { 
                      backgroundColor: leafType === 'black' ? paperTheme.colors.primary : paperTheme.colors.surface,
                    }
                  },
                  { 
                    value: 'mixed', 
                    label: '🔄 Mixed',
                    style: { 
                      backgroundColor: leafType === 'mixed' ? paperTheme.colors.primary : paperTheme.colors.surface,
                    }
                  },
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            {/* Bags and Gross */}
            <View style={styles.row}>
              {renderInputField("Bags", bags, null, "sack", 'default', true)}
              {renderInputField("Gross (kg)", gross, null, "weight", 'default', true)}
            </View>

            {/* Bag Weight */}
            <View style={styles.row}>
              {renderInputField("Bag Weight (kg)", bagWeight, setBagWeight, "weight-kilogram", 'numeric')}
              {renderDisplayField("Total Bag Weight", `${totalBagWeight} kg`, paperTheme.colors.primary)}
            </View>

            {/* Coarce */}
            <View style={styles.row}>
              {renderInputField("Coarce (kg)", coarce, setCoarce, "leaf-off", 'numeric')}
              {renderDisplayField("Total Coarce", `${totalCoarce} kg`, paperTheme.colors.error)}
            </View>

            {/* Water */}
            <View style={styles.row}>
              {renderInputField("Water (kg)", water, setWater, "water", 'numeric')}
              {renderDisplayField("Total Water", `${totalWater} kg`, paperTheme.colors.info)}
            </View>

            {/* Boiled */}
            <View style={styles.row}>
              {renderInputField("Boiled/Other (kg)", boiled, setBoiled, "fire", 'numeric')}
              {renderDisplayField("Total Boiled", `${totalBoiled} kg`, paperTheme.colors.warning)}
            </View>

            {/* Rejected */}
            <View style={styles.row}>
              {renderInputField("Rejected (kg)", rejected, null, "close-circle", 'default', true)}
              {renderDisplayField("Total Rejected", `${totalRejected} kg`, paperTheme.colors.error)}
            </View>
          </ResponsiveGrid>

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
              contentStyle={{ height: getButtonHeight() }}
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
  sectionContainer: {
    marginBottom: responsiveSpacing.md,
  },
  sectionTitle: {
    marginBottom: responsiveSpacing.sm,
  },
  input: {
    marginBottom: responsiveSpacing.md,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing.md,
    width: '100%',
  },
  displayField: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: responsiveSpacing.sm,
    minHeight: moderateScale(56),
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
    paddingHorizontal: responsiveSpacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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