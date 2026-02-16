import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Divider,
  IconButton,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme as usePaperTheme
} from 'react-native-paper';
import { useLeafData } from '../context/LeafDataContext';
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
  const [rejected, setRejected] = useState('');

  // Calculate totals
  const totalBagWeight = bagWeight ? (parseInt(bags) * parseFloat(bagWeight)).toFixed(2) : '0.00';
  const totalCoarce = coarce ? (parseInt(bags) * parseFloat(coarce)).toFixed(2) : '0.00';
  const totalWater = water ? (parseInt(bags) * parseFloat(water)).toFixed(2) : '0.00';
  const totalBoiled = boiled ? (parseInt(bags) * parseFloat(boiled)).toFixed(2) : '0.00';
  const totalRejected = rejected ? (parseInt(bags) * parseFloat(rejected)).toFixed(2) : '0.00';
  
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
    setRejected('');
    setLeafType('green');
  };

  // Date Header Component
  const DateHeader = () => (
    <View style={styles.dateHeaderContainer}>
      <View style={[styles.dateBox, { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.border }]}>
        <IconButton icon="calendar" size={20} iconColor={paperTheme.colors.primary} />
        <View>
          <Text style={[styles.dateLabel, { color: paperTheme.colors.textSecondary }]}>Date</Text>
          <Text style={[styles.dateValue, { color: paperTheme.colors.primary }]}>{date}</Text>
        </View>
      </View>
      <View style={[styles.dateBox, { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.border }]}>
        <IconButton icon="calendar-month" size={20} iconColor={paperTheme.colors.secondary} />
        <View>
          <Text style={[styles.dateLabel, { color: paperTheme.colors.textSecondary }]}>Month</Text>
          <Text style={[styles.dateValue, { color: paperTheme.colors.secondary }]}>{month}</Text>
        </View>
      </View>
    </View>
  );

  // Input Row Component
  const InputRow = ({ label, value, onChange, icon, totalLabel, totalValue, totalColor, keyboardType = 'default', disabled = false }) => (
    <View style={styles.inputRow}>
      <View style={styles.inputContainer}>
        <TextInput
          label={label}
          value={value}
          onChangeText={onChange}
          mode="outlined"
          disabled={disabled}
          keyboardType={keyboardType}
          left={icon ? <TextInput.Icon icon={icon} /> : null}
          style={styles.smallInput}
          dense={true}
          theme={{ 
            colors: { 
              primary: paperTheme.colors.primary,
              text: paperTheme.colors.text,
              placeholder: paperTheme.colors.placeholder,
              background: paperTheme.colors.surface
            } 
          }}
        />
      </View>
      <View style={styles.totalContainer}>
        <Text style={[styles.totalLabel, { color: paperTheme.colors.textSecondary }]}>{totalLabel}</Text>
        <Text style={[styles.totalValue, { color: totalColor }]}>{totalValue}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <DateHeader />

      <Card style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}>
        <Card.Content>
          <View style={styles.headerContainer}>
            <IconButton icon="leaf" size={28} iconColor={paperTheme.colors.primary} />
            <Text variant="titleLarge" style={[styles.title, { color: paperTheme.colors.primary }]}>
              Add Leaf Deduction
            </Text>
          </View>

          {/* Registration Number */}
          <TextInput
            label="Registration Number"
            value={regNo}
            onChangeText={setRegNo}
            mode="outlined"
            left={<TextInput.Icon icon="card-account-details" />}
            style={styles.fullWidthInput}
            dense={true}
            theme={{ colors: { primary: paperTheme.colors.primary } }}
          />

          {/* Route (Display Only) */}
          <TextInput
            label="Route"
            value={route}
            mode="outlined"
            disabled
            left={<TextInput.Icon icon="map-marker" />}
            style={styles.fullWidthInput}
            dense={true}
          />

          {/* Leaf Type */}
          <Text variant="bodyMedium" style={[styles.sectionLabel, { color: paperTheme.colors.text }]}>
            Leaf Type
          </Text>
          <SegmentedButtons
          value={leafType}
          onValueChange={setLeafType}
          buttons={[
            { value: 'super', label: '⭐ Super Leaf' },
            { value: 'normal', label: '🌿 Normal Leaf' },
          ]}
          style={styles.segmentedButtons}
          theme={{ 
            colors: { 
              secondaryContainer: paperTheme.colors.primary,
              onSecondaryContainer: paperTheme.colors.background, 
            } 
          }}
        />

          {/* Bags and Gross Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: paperTheme.colors.textSecondary }]}>Bags</Text>
              <Text style={[styles.statValue, { color: paperTheme.colors.text }]}>{bags}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: paperTheme.colors.textSecondary }]}>Gross (kg)</Text>
              <Text style={[styles.statValue, { color: paperTheme.colors.text }]}>{gross}</Text>
            </View>
          </View>

          <Divider style={[styles.divider, { backgroundColor: paperTheme.colors.border }]} />

          {/* Input Rows */}
          <InputRow
            label="Bag Weight"
            value={bagWeight}
            onChange={setBagWeight}
            icon="weight-kilogram"
            totalLabel="Total Bag Weight"
            totalValue={`${totalBagWeight} kg`}
            totalColor={paperTheme.colors.primary}
            keyboardType="numeric"
          />

          <InputRow
            label="Coarce"
            value={coarce}
            onChange={setCoarce}
            icon="leaf-off"
            totalLabel="Total Coarce"
            totalValue={`${totalCoarce} kg`}
            totalColor={paperTheme.colors.error}
            keyboardType="numeric"
          />

          <InputRow
            label="Water"
            value={water}
            onChange={setWater}
            icon="water"
            totalLabel="Total Water"
            totalValue={`${totalWater} kg`}
            totalColor={paperTheme.colors.info}
            keyboardType="numeric"
          />

          <InputRow
            label="Boiled"
            value={boiled}
            onChange={setBoiled}
            icon="fire"
            totalLabel="Total Boiled"
            totalValue={`${totalBoiled} kg`}
            totalColor={paperTheme.colors.warning}
            keyboardType="numeric"
          />

          <InputRow
            label="Rejected"
            value={rejected}
            onChange={setRejected}
            icon="close-circle"
            totalLabel="Total Rejected"
            totalValue={`${totalRejected} kg`}
            totalColor={paperTheme.colors.error}
            keyboardType="numeric"
          />

          <Divider style={[styles.divider, { backgroundColor: paperTheme.colors.border }]} />

          {/* Net Weight */}
          <View style={styles.netWeightContainer}>
            <Text style={[styles.netWeightLabel, { color: paperTheme.colors.text }]}>Net Weight</Text>
            <Text style={[styles.netWeightValue, { color: paperTheme.colors.success }]}>
              {calculateNetWeight()} kg
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
              icon="content-save"
              buttonColor={paperTheme.colors.primary}
              labelStyle={styles.buttonLabel}
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
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    padding: responsiveSpacing.md,
    gap: responsiveSpacing.sm,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing.sm,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    elevation: 2,
  },
  dateLabel: {
    fontSize: responsiveFontSize(12),
  },
  dateValue: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
  },
  card: {
    margin: responsiveSpacing.md,
    borderRadius: moderateScale(12),
    elevation: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing.lg,
  },
  title: {
    fontWeight: 'bold',
    marginLeft: responsiveSpacing.sm,
  },
  fullWidthInput: {
    marginBottom: responsiveSpacing.md,
    height: moderateScale(48),
  },
  sectionLabel: {
    marginBottom: responsiveSpacing.xs,
  },
  segmentedButtons: {
    marginBottom: responsiveSpacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveSpacing.md,
  },
  statBox: {
    flex: 1,
    padding: responsiveSpacing.sm,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: responsiveSpacing.xs,
  },
  statLabel: {
    fontSize: responsiveFontSize(12),
  },
  statValue: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing.md,
    gap: responsiveSpacing.sm,
  },
  inputContainer: {
    flex: 1,
  },
  smallInput: {
    height: moderateScale(44),
  },
  totalContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: responsiveSpacing.sm,
  },
  totalLabel: {
    fontSize: responsiveFontSize(11),
  },
  totalValue: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: responsiveSpacing.md,
  },
  netWeightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing.lg,
    paddingHorizontal: responsiveSpacing.sm,
  },
  netWeightLabel: {
    fontSize: responsiveFontSize(16),
  },
  netWeightValue: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: responsiveSpacing.md,
  },
  button: {
    flex: 1,
    borderRadius: moderateScale(25),
  },
  saveButton: {
    elevation: 4,
  },
  buttonLabel: {
    fontSize: responsiveFontSize(14),
    paddingVertical: responsiveSpacing.xs,
  },
});
