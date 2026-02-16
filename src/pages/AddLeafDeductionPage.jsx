import { useEffect, useRef, useState } from 'react'; // Add useEffect import
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
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

  // Create refs for each input field
  const bagWeightRef = useRef(null);
  const coarceRef = useRef(null);
  const waterRef = useRef(null);
  const boiledRef = useRef(null);
  const rejectedRef = useRef(null);

  // Create timer refs for auto-focus delay
  const bagWeightTimerRef = useRef(null);
  const coarceTimerRef = useRef(null);
  const waterTimerRef = useRef(null);
  const boiledTimerRef = useRef(null);

  const [date] = useState(getCurrentDate());
  const [month] = useState(getCurrentMonth());
  const [regNo, setRegNo] = useState('');
  const [route] = useState('Hapugastenna');
  const [name] = useState('Supplier Name'); // This would come from database based on regNo
  const [leafType, setLeafType] = useState('green');
  const [bags] = useState('5');
  const [gross] = useState('250');
  const [bagWeight, setBagWeight] = useState('');
  const [coarce, setCoarce] = useState('');
  const [water, setWater] = useState('');
  const [boiled, setBoiled] = useState('');
  const [rejected, setRejected] = useState('');

  // Clear all timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(bagWeightTimerRef.current);
      clearTimeout(coarceTimerRef.current);
      clearTimeout(waterTimerRef.current);
      clearTimeout(boiledTimerRef.current);
    };
  }, []);

  // Handle auto-focus after a delay (500ms) of no typing
  const handleBagWeightChange = (text) => {
    setBagWeight(text);
    
    // Clear existing timer
    if (bagWeightTimerRef.current) {
      clearTimeout(bagWeightTimerRef.current);
    }
    
    // Set new timer to move to next field after 500ms of no typing
    // Only if there's a value and it's not the last character being deleted
    if (text.length > 0) {
      bagWeightTimerRef.current = setTimeout(() => {
        if (coarceRef.current) {
          coarceRef.current.focus();
        }
      }, 500); // 500ms delay
    }
  };

  const handleCoarceChange = (text) => {
    setCoarce(text);
    
    // Clear existing timer
    if (coarceTimerRef.current) {
      clearTimeout(coarceTimerRef.current);
    }
    
    // Set new timer to move to next field after 500ms of no typing
    if (text.length > 0) {
      coarceTimerRef.current = setTimeout(() => {
        if (waterRef.current) {
          waterRef.current.focus();
        }
      }, 500);
    }
  };

  const handleWaterChange = (text) => {
    setWater(text);
    
    // Clear existing timer
    if (waterTimerRef.current) {
      clearTimeout(waterTimerRef.current);
    }
    
    // Set new timer to move to next field after 500ms of no typing
    if (text.length > 0) {
      waterTimerRef.current = setTimeout(() => {
        if (boiledRef.current) {
          boiledRef.current.focus();
        }
      }, 500);
    }
  };

  const handleBoiledChange = (text) => {
    setBoiled(text);
    
    // Clear existing timer
    if (boiledTimerRef.current) {
      clearTimeout(boiledTimerRef.current);
    }
    
    // Set new timer to move to next field after 500ms of no typing
    if (text.length > 0) {
      boiledTimerRef.current = setTimeout(() => {
        if (rejectedRef.current) {
          rejectedRef.current.focus();
        }
      }, 500);
    }
  };

  const handleRejectedChange = (text) => {
    setRejected(text);
    // No timer for last field, but you could add one to auto-save if needed
  };

  // Calculate totals (without decimals)
  const totalBagWeight = bagWeight ? (parseInt(bags) * parseInt(bagWeight || 0)).toString() : '0';
  const totalCoarce = coarce ? (parseInt(bags) * parseInt(coarce || 0)).toString() : '0';
  const totalWater = water ? (parseInt(bags) * parseInt(water || 0)).toString() : '0';
  const totalBoiled = boiled ? (parseInt(bags) * parseInt(boiled || 0)).toString() : '0';
  const totalRejected = rejected ? (parseInt(bags) * parseInt(rejected || 0)).toString() : '0';
  
  const calculateNetWeight = () => {
    const grossWeight = parseInt(gross) || 0;
    const totalBagWt = parseInt(totalBagWeight) || 0;
    const totalCoarceWt = parseInt(totalCoarce) || 0;
    const totalWaterWt = parseInt(totalWater) || 0;
    const totalBoiledWt = parseInt(totalBoiled) || 0;
    const totalRejectedWt = parseInt(totalRejected) || 0;
    
    return (grossWeight - totalBagWt - totalCoarceWt - totalWaterWt - totalBoiledWt - totalRejectedWt).toString();
  };

  const handleSave = () => {
    // Clear any pending timers when saving
    clearTimeout(bagWeightTimerRef.current);
    clearTimeout(coarceTimerRef.current);
    clearTimeout(waterTimerRef.current);
    clearTimeout(boiledTimerRef.current);

    const deductionData = {
      date,
      month,
      regNo,
      name,
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
    // Clear any pending timers when clearing
    clearTimeout(bagWeightTimerRef.current);
    clearTimeout(coarceTimerRef.current);
    clearTimeout(waterTimerRef.current);
    clearTimeout(boiledTimerRef.current);

    setRegNo('');
    setBagWeight('');
    setCoarce('');
    setWater('');
    setBoiled('');
    setRejected('');
    setLeafType('green');
    
    // Optionally focus on first input after clearing
    if (bagWeightRef.current) {
      bagWeightRef.current.focus();
    }
  };

  // Enhanced Date Header with Today's date and Current month styling
  const DateHeader = () => {
    const currentDate = new Date();
    const dayName = currentDate.toLocaleString('default', { weekday: 'short' });
    
    return (
      <View style={styles.dateHeaderContainer}>
        <View style={[styles.dateBox, { 
          backgroundColor: paperTheme.colors.surface, 
          borderColor: paperTheme.colors.primary + '30',
          borderWidth: 1.5,
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }]}>
          <View style={[styles.dateIconContainer, { backgroundColor: paperTheme.colors.primary + '15' }]}>
            <IconButton 
              icon="calendar" 
              size={22} 
              iconColor={paperTheme.colors.primary}
            />
          </View>
          <View style={styles.dateTextContainer}>
            <Text style={[styles.dateLabel, { color: paperTheme.colors.textSecondary }]}>Today's Date</Text>
            <View style={styles.dateValueRow}>
              <Text style={[styles.dateValue, { color: paperTheme.colors.primary }]}>
                {currentDate.getDate()}
              </Text>
              <Text style={[styles.dateDayName, { color: paperTheme.colors.textSecondary }]}>
                {dayName}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.dateBox, { 
          backgroundColor: paperTheme.colors.surface, 
          borderColor: paperTheme.colors.secondary + '30',
          borderWidth: 1.5,
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }]}>
          <View style={[styles.dateIconContainer, { backgroundColor: paperTheme.colors.secondary + '15' }]}>
            <IconButton 
              icon="calendar-month" 
              size={22} 
              iconColor={paperTheme.colors.secondary} 
            />
          </View>
          <View style={styles.dateTextContainer}>
            <Text style={[styles.dateLabel, { color: paperTheme.colors.textSecondary }]}>Current Month</Text>
            <Text style={[styles.dateValue, { color: paperTheme.colors.secondary }]}>
              {month}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Input Row Component with ref support
  const InputRow = ({ 
    label, 
    value, 
    onChange, 
    icon, 
    totalLabel, 
    totalValue, 
    totalColor, 
    keyboardType = 'default', 
    disabled = false,
    inputRef = null,
    onSubmitEditing = null,
    returnKeyType = 'next'
  }) => (
    <View style={styles.inputRow}>
      <View style={[styles.inputContainer, { flex: 1.2 }]}>
        <TextInput
          ref={inputRef}
          label={label}
          value={value}
          onChangeText={onChange}
          mode="outlined"
          disabled={disabled}
          keyboardType={keyboardType}
          left={<TextInput.Icon icon={icon} color={paperTheme.colors.primary} />}
          style={styles.smallInput}
          dense={true}
          outlineStyle={styles.inputOutline}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          blurOnSubmit={false}
          theme={{ 
            colors: { 
              primary: paperTheme.colors.primary,
              text: paperTheme.colors.text,
              placeholder: paperTheme.colors.textSecondary,
              background: paperTheme.colors.surface
            } 
          }}
        />
      </View>
      <View style={[styles.totalContainer, { flex: 0.8 }]}>
        <Text style={[styles.totalLabel, { color: paperTheme.colors.textSecondary }]}>{totalLabel}</Text>
        <Text style={[styles.totalValue, { color: totalColor }]}>{totalValue} kg</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <DateHeader />

        <Card style={[styles.card, { 
          backgroundColor: paperTheme.colors.surface,
          shadowColor: paperTheme.colors.primary
        }]}>
          <Card.Content>
            <View style={styles.headerContainer}>
              <View style={[styles.headerIcon, { backgroundColor: paperTheme.colors.primary + '15' }]}>
                <IconButton icon="leaf" size={30} iconColor={paperTheme.colors.primary} />
              </View>
              <View>
                <Text variant="titleLarge" style={[styles.title, { color: paperTheme.colors.primary }]}>
                  New Deduction
                </Text>
                <Text style={[styles.subtitle, { color: paperTheme.colors.textSecondary }]}>
                  Enter deduction details below
                </Text>
              </View>
            </View>

            {/* Farmer Details Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: paperTheme.colors.primary }]}>Farmer Details</Text>
              
              {/* Registration Number */}
              <TextInput
                label="Registration Number"
                value={regNo}
                onChangeText={setRegNo}
                mode="outlined"
                left={<TextInput.Icon icon="card-account-details" color={paperTheme.colors.primary} />}
                style={styles.fullWidthInput}
                dense={true}
                outlineStyle={styles.inputOutline}
                theme={{ colors: { primary: paperTheme.colors.primary } }}
                returnKeyType="next"
                onSubmitEditing={() => bagWeightRef.current?.focus()}
              />

              {/* Name Field - Same style as Route */}
            <TextInput
  label="Name"
  value={name}
  mode="outlined"
  disabled
  left={<TextInput.Icon icon="account" color={paperTheme.colors.textSecondary} />}
  style={[
    styles.fullWidthInput, 
    styles.disabledInput, 
    { backgroundColor: paperTheme.colors.disabled + '20' } // Add dynamic background
  ]}
  dense={true}
  outlineStyle={[styles.inputOutline, { borderColor: paperTheme.colors.border }]}
  theme={{ colors: { text: paperTheme.colors.text } }}
/>

{/* Route - Display Only */}
<TextInput
  label="Route"
  value={route}
  mode="outlined"
  disabled
  left={<TextInput.Icon icon="map-marker" color={paperTheme.colors.textSecondary} />}
  style={[
    styles.fullWidthInput, 
    styles.disabledInput,
    { backgroundColor: paperTheme.colors.disabled + '20' } // Add dynamic background
  ]}
  dense={true}
  outlineStyle={[styles.inputOutline, { borderColor: paperTheme.colors.border }]}
/>
            </View>

            {/* Leaf Type Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: paperTheme.colors.primary }]}>Leaf Information</Text>
              
              <SegmentedButtons
                value={leafType}
                onValueChange={setLeafType}
                buttons={[
                  { 
                    value: 'super', 
                    label: 'Super Leaf',
                    icon: 'star',
                    style: leafType === 'super' ? styles.selectedSegment : {}
                  },
                  { 
                    value: 'normal', 
                    label: 'Normal Leaf',
                    icon: 'leaf',
                    style: leafType === 'normal' ? styles.selectedSegment : {}
                  },
                ]}
                style={styles.segmentedButtons}
                theme={{ 
                  colors: { 
                    secondaryContainer: paperTheme.colors.primary,
                    onSecondaryContainer: '#FFFFFF',
                  } 
                }}
              />
            </View>

            {/* Bags and Gross Row */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { 
                backgroundColor: paperTheme.colors.primary + '10',
                borderColor: paperTheme.colors.primary + '20'
              }]}>
                <IconButton icon="sack" size={24} iconColor={paperTheme.colors.primary} style={styles.statIcon} />
                <View>
                  <Text style={[styles.statLabel, { color: paperTheme.colors.textSecondary }]}>Total Bags</Text>
                  <Text style={[styles.statValue, { color: paperTheme.colors.primary }]}>{bags}</Text>
                </View>
              </View>
              <View style={[styles.statBox, { 
                backgroundColor: paperTheme.colors.success + '10',
                borderColor: paperTheme.colors.success + '20'
              }]}>
                <IconButton icon="weight" size={24} iconColor={paperTheme.colors.success} style={styles.statIcon} />
                <View>
                  <Text style={[styles.statLabel, { color: paperTheme.colors.textSecondary }]}>Gross (kg)</Text>
                  <Text style={[styles.statValue, { color: paperTheme.colors.success }]}>{gross}</Text>
                </View>
              </View>
            </View>

            <Divider style={[styles.divider, { backgroundColor: paperTheme.colors.border }]} />

            {/* Deductions Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: paperTheme.colors.primary }]}>Deductions</Text>
              
              <InputRow
                label="Bag Weight"
                value={bagWeight}
                onChange={handleBagWeightChange}
                icon="weight-kilogram"
                totalLabel="Total Bag Weight"
                totalValue={totalBagWeight}
                totalColor={paperTheme.colors.primary}
                keyboardType="numeric"
                inputRef={bagWeightRef}
                returnKeyType="next"
                onSubmitEditing={() => {
                  // Clear timer and manually move to next field when Next button is pressed
                  clearTimeout(bagWeightTimerRef.current);
                  coarceRef.current?.focus();
                }}
              />

              <InputRow
                label="Coarce"
                value={coarce}
                onChange={handleCoarceChange}
                icon="leaf-off"
                totalLabel="Total Coarce"
                totalValue={totalCoarce}
                totalColor={paperTheme.colors.error}
                keyboardType="numeric"
                inputRef={coarceRef}
                returnKeyType="next"
                onSubmitEditing={() => {
                  clearTimeout(coarceTimerRef.current);
                  waterRef.current?.focus();
                }}
              />

              <InputRow
                label="Water"
                value={water}
                onChange={handleWaterChange}
                icon="water"
                totalLabel="Total Water"
                totalValue={totalWater}
                totalColor={paperTheme.colors.info}
                keyboardType="numeric"
                inputRef={waterRef}
                returnKeyType="next"
                onSubmitEditing={() => {
                  clearTimeout(waterTimerRef.current);
                  boiledRef.current?.focus();
                }}
              />

              <InputRow
                label="Boiled"
                value={boiled}
                onChange={handleBoiledChange}
                icon="fire"
                totalLabel="Total Boiled"
                totalValue={totalBoiled}
                totalColor={paperTheme.colors.warning}
                keyboardType="numeric"
                inputRef={boiledRef}
                returnKeyType="next"
                onSubmitEditing={() => {
                  clearTimeout(boiledTimerRef.current);
                  rejectedRef.current?.focus();
                }}
              />

              <InputRow
                label="Rejected"
                value={rejected}
                onChange={handleRejectedChange}
                icon="close-circle"
                totalLabel="Total Rejected"
                totalValue={totalRejected}
                totalColor={paperTheme.colors.error}
                keyboardType="numeric"
                inputRef={rejectedRef}
                returnKeyType="done"
                onSubmitEditing={handleSave} // Save when done is pressed on last field
              />
            </View>

            <Divider style={[styles.divider, { backgroundColor: paperTheme.colors.border }]} />

            {/* Net Weight */}
            <View style={[styles.netWeightContainer, { 
              backgroundColor: paperTheme.colors.success + '10',
              borderColor: paperTheme.colors.success + '30'
            }]}>
              <View style={styles.netWeightLeft}>
                <IconButton icon="scale" size={28} iconColor={paperTheme.colors.success} />
                <Text style={[styles.netWeightLabel, { color: paperTheme.colors.text }]}>Net Weight</Text>
              </View>
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
                labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
                contentStyle={styles.buttonContent}
              >
                Save
              </Button>
              <Button 
                mode="outlined" 
                onPress={handleClear}
                style={[styles.button, styles.clearButton]}
                icon="close"
                textColor={paperTheme.colors.error}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
              >
                Clear
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        {/* Add extra space at bottom for better scrolling */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: responsiveSpacing.md,
  },
  bottomSpacing: {
    height: responsiveSpacing.lg,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    paddingHorizontal: responsiveSpacing.md,
    paddingTop: responsiveSpacing.md,
    gap: responsiveSpacing.md,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing.sm,
    borderRadius: moderateScale(12),
    borderWidth: 1.5,
  },
  dateIconContainer: {
    borderRadius: moderateScale(10),
    marginRight: responsiveSpacing.xs,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: responsiveFontSize(10),
    marginBottom: 2,
  },
  dateValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: responsiveSpacing.xs,
  },
  dateValue: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
  },
  dateDayName: {
    fontSize: responsiveFontSize(12),
    fontWeight: '500',
  },
  card: {
    margin: responsiveSpacing.md,
    borderRadius: moderateScale(24),
    elevation: 5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing.lg,
  },
  headerIcon: {
    borderRadius: moderateScale(16),
    marginRight: responsiveSpacing.md,
  },
  title: {
    fontWeight: 'bold',
    fontSize: responsiveFontSize(22),
  },
  subtitle: {
    fontSize: responsiveFontSize(13),
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: responsiveSpacing.lg,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
    marginBottom: responsiveSpacing.sm,
    letterSpacing: 0.5,
  },
  fullWidthInput: {
    marginBottom: responsiveSpacing.sm,
    height: moderateScale(52),
  },
  inputOutline: {
    borderRadius: moderateScale(12),
    borderWidth: 1.5,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    opacity: 0.9,
  },
  segmentedButtons: {
    marginBottom: responsiveSpacing.md,
  },
  selectedSegment: {
    borderWidth: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveSpacing.md,
    gap: responsiveSpacing.sm,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing.md,
    borderRadius: moderateScale(16),
    borderWidth: 1,
  },
  statIcon: {
    margin: 0,
    marginRight: responsiveSpacing.xs,
  },
  statLabel: {
    fontSize: responsiveFontSize(12),
  },
  statValue: {
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing.sm,
    gap: responsiveSpacing.sm,
  },
  inputContainer: {
    flex: 1.2,
  },
  smallInput: {
    height: moderateScale(52),
    fontSize: responsiveFontSize(16),
  },
  totalContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: responsiveSpacing.sm,
    paddingVertical: responsiveSpacing.xs,
    height: moderateScale(52),
  },
  totalLabel: {
    fontSize: responsiveFontSize(15),
    fontWeight: '500',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: responsiveFontSize(20),
    fontWeight: '600',
  },
  divider: {
    marginVertical: responsiveSpacing.lg,
    height: 1,
  },
  netWeightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing.lg,
    padding: responsiveSpacing.md,
    borderRadius: moderateScale(16),
    borderWidth: 1,
  },
  netWeightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  netWeightLabel: {
    fontSize: responsiveFontSize(18),
    fontWeight: '600',
    marginLeft: responsiveSpacing.xs,
  },
  netWeightValue: {
    fontSize: responsiveFontSize(28),
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: responsiveSpacing.md,
    marginTop: responsiveSpacing.sm,
  },
  button: {
    flex: 1,
    borderRadius: moderateScale(30),
  },
  saveButton: {
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  clearButton: {
    borderWidth: 2,
  },
  buttonContent: {
    paddingVertical: responsiveSpacing.sm,
  },
  buttonLabel: {
    fontSize: responsiveFontSize(15),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});