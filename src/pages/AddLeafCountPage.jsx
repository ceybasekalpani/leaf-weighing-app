import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Button,
  Card,
  Dialog,
  Divider,
  IconButton,
  Menu,
  Portal,
  Text,
  TextInput,
  useTheme as usePaperTheme
} from 'react-native-paper';
import { leafCountApi } from '../api/leafCountApi';
import { useAuth } from '../context/AuthContext';
import {
  moderateScale,
  responsiveFontSize,
  responsiveSpacing
} from '../utils/responsiveUtils';

export default function AddLeafCountPage() {
  const paperTheme = usePaperTheme();
  const { user } = useAuth();
  
  // Create refs for each input field
  const bestLeafRef = useRef(null);
  const bellowBestRef = useRef(null);
  const poorRef = useRef(null);

  // Create timer refs for auto-focus delay
  const bestLeafTimerRef = useRef(null);
  const bellowBestTimerRef = useRef(null);
  
  const [date, setDate] = useState('');
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [month, setMonth] = useState('');
  const [route, setRoute] = useState('');
  const [routeMenuVisible, setRouteMenuVisible] = useState(false);
  const [bestLeaf, setBestLeaf] = useState('');
  const [bellowBest, setBellowBest] = useState('');
  const [poor, setPoor] = useState('');
  
  // New states for dynamic routes and route total weight
  const [routes, setRoutes] = useState([]);
  const [routeTotalWeight, setRouteTotalWeight] = useState(0);
  const [loadingRouteWeight, setLoadingRouteWeight] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (bestLeafTimerRef.current) clearTimeout(bestLeafTimerRef.current);
      if (bellowBestTimerRef.current) clearTimeout(bellowBestTimerRef.current);
    };
  }, []);

  // Fetch routes from database on component mount
  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoadingRoutes(true);
    try {
      const response = await leafCountApi.getRoutes();
      if (response && response.success) {
        setRoutes(response.data || []);
      } else {
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      Alert.alert('Error', 'Failed to load routes. Please check your connection.');
      setRoutes([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

const fetchRouteTotalWeight = async (selectedRoute) => {
  if (!selectedRoute || !date) {
    console.log('⚠️ Cannot fetch weight - missing route or date:', { selectedRoute, date });
    return;
  }
  
  setLoadingRouteWeight(true);
  try {
    console.log('🔍 Fetching weight for:', { route: selectedRoute, date });
    
    const response = await leafCountApi.getRouteTotalWeight(selectedRoute, date);
    console.log('📥 API Response:', response);
    
    if (response && response.success) {
      setRouteTotalWeight(response.data?.totalWeight || 0);
      console.log('✅ Weight set to:', response.data?.totalWeight);
    } else {
      console.log('⚠️ API returned unsuccessful:', response);
      setRouteTotalWeight(0);
    }
  } catch (error) {
    console.error('❌ Error fetching route total weight:', error);
    setRouteTotalWeight(0);
  } finally {
    setLoadingRouteWeight(false);
  }
};

// Add this useEffect to watch for changes
useEffect(() => {
  console.log('🔄 Route or date changed:', { route, date });
  if (route && date) {
    fetchRouteTotalWeight(route);
  } else {
    setRouteTotalWeight(0);
  }
}, [route, date]);

  // Generate months dynamically (current month and previous months only)
  const generateMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    // Generate current month and previous months (no future months)
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      months.push(`${monthName}-${year}`);
    }
    
    return months;
  };

  const months = generateMonths();

  const [monthMenuVisible, setMonthMenuVisible] = useState(false);

  // Handle auto-focus with delay for Best Leaf
  const handleBestLeafChange = (text) => {
    // Allow only numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setBestLeaf(numericText);
    
    // Clear existing timer
    if (bestLeafTimerRef.current) {
      clearTimeout(bestLeafTimerRef.current);
    }
    
    // Set new timer to move to next field after 500ms of no typing
    if (numericText.length > 0) {
      bestLeafTimerRef.current = setTimeout(() => {
        if (bellowBestRef.current) {
          bellowBestRef.current.focus();
        }
      }, 500);
    }
  };

  // Handle auto-focus with delay for Below Best
  const handleBellowBestChange = (text) => {
    // Allow only numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setBellowBest(numericText);
    
    // Clear existing timer
    if (bellowBestTimerRef.current) {
      clearTimeout(bellowBestTimerRef.current);
    }
    
    // Set new timer to move to next field after 500ms of no typing
    if (numericText.length > 0) {
      bellowBestTimerRef.current = setTimeout(() => {
        if (poorRef.current) {
          poorRef.current.focus();
        }
      }, 500);
    }
  };

  // Handle Poor field change (no auto-focus as it's the last field)
  const handlePoorChange = (text) => {
    // Allow only numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setPoor(numericText);
  };

  const handleSave = async () => {
    // Clear any pending timers when saving
    if (bestLeafTimerRef.current) clearTimeout(bestLeafTimerRef.current);
    if (bellowBestTimerRef.current) clearTimeout(bellowBestTimerRef.current);

    if (!route || !date || !month) {
      Alert.alert('Error', 'Please select date, month and route');
      return;
    }

    if (!bestLeaf && !bellowBest && !poor) {
      Alert.alert('Error', 'Please enter at least one leaf count value');
      return;
    }

    try {
      const leafCountData = {
        date,
        month,
        route,
        bestLeaf: bestLeaf || '0',
        bellowBest: bellowBest || '0',
        poor: poor || '0'
      };

      const response = await leafCountApi.saveLeafCount(leafCountData, user);
      
      if (response && response.success) {
        Alert.alert('Success', 'Leaf count saved successfully');
        handleClear();
      } else {
        Alert.alert('Error', response?.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving leaf count:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  };

  const handleClear = () => {
    // Clear any pending timers when clearing
    if (bestLeafTimerRef.current) clearTimeout(bestLeafTimerRef.current);
    if (bellowBestTimerRef.current) clearTimeout(bellowBestTimerRef.current);

    setDate('');
    setMonth('');
    setRoute('');
    setBestLeaf('');
    setBellowBest('');
    setPoor('');
    setSelectedDay('');
    setRouteTotalWeight(0);
  };

  const handleRouteSelect = (selectedRoute) => {
    setRoute(selectedRoute);
    setRouteMenuVisible(false);
    fetchRouteTotalWeight(selectedRoute);
  };

  const openDateDialog = () => {
    setSelectedDay(date);
    setShowDateDialog(true);
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };

  const handleDateConfirm = () => {
    if (selectedDay) {
      setDate(selectedDay);
      setShowDateDialog(false);
    } else {
      Alert.alert('Select Date', 'Please select a day');
    }
  };

  // Generate days for the calendar (1-31)
  const renderDayButtons = () => {
    const days = [];
    const today = new Date().getDate();
    
    for (let i = 1; i <= 31; i++) {
      const isSelected = selectedDay === i.toString();
      const isToday = i === today;
      
      days.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleDaySelect(i.toString())}
          style={[
            styles.dayButton,
            isSelected && styles.selectedDayButton,
            isToday && !isSelected && styles.todayButton,
            { 
              backgroundColor: isSelected 
                ? paperTheme.colors.primary 
                : isToday && !isSelected 
                  ? paperTheme.colors.primary + '20'
                  : 'transparent',
              borderColor: isToday && !isSelected 
                ? paperTheme.colors.primary 
                : '#E0E0E0',
            }
          ]}
        >
          <Text 
            style={[
              styles.dayButtonText,
              isSelected && styles.selectedDayButtonText,
              isToday && !isSelected && styles.todayButtonText,
              { color: isSelected ? 'white' : isToday && !isSelected ? paperTheme.colors.primary : paperTheme.colors.text }
            ]}
          >
            {i}
          </Text>
          {isToday && !isSelected && (
            <View style={[styles.todayDot, { backgroundColor: paperTheme.colors.primary }]} />
          )}
        </TouchableOpacity>
      );
    }
    return days;
  };

  // Date Header Component
  const DateHeader = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'short' });
    const currentYear = currentDate.getFullYear();
    const dayName = currentDate.toLocaleString('default', { weekday: 'short' });
    
    return (
      <View style={styles.dateHeaderContainer}>
        <View style={[styles.dateBox, { 
          backgroundColor: paperTheme.colors.surface, 
          borderColor: paperTheme.colors.primary + '30',
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
              {`${currentMonth} ${currentYear}`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <DateHeader />

        <Card style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}>
          <Card.Content>
            <View style={styles.headerContainer}>
              <View style={[styles.headerIconContainer, { backgroundColor: paperTheme.colors.primary + '15' }]}>
                <IconButton icon="leaf-circle" size={28} iconColor={paperTheme.colors.primary} />
              </View>
              <Text variant="titleLarge" style={[styles.title, { color: paperTheme.colors.primary }]}>
                Add Leaf Count
              </Text>
            </View>

            {/* Date Input with Dialog */}
            <TouchableOpacity onPress={openDateDialog} activeOpacity={0.7}>
              <View pointerEvents="none">
                <TextInput
                  label="Date"
                  value={date}
                  mode="outlined"
                  placeholder="Select Date"
                  left={<TextInput.Icon icon="calendar" />}
                  style={styles.input}
                  dense={true}
                  editable={false}
                />
              </View>
            </TouchableOpacity>

            <Portal>
              <Dialog 
                visible={showDateDialog} 
                onDismiss={() => setShowDateDialog(false)} 
                style={[styles.dateDialog, { backgroundColor: paperTheme.colors.surface }]}
              >
                <Dialog.Title>Select Date</Dialog.Title>
                <Dialog.ScrollArea style={styles.dialogScrollArea}>
                  <View style={styles.simpleCalendarContainer}>
                    {renderDayButtons()}
                  </View>
                </Dialog.ScrollArea>
                <Dialog.Actions>
                  <Button onPress={() => setShowDateDialog(false)}>Cancel</Button>
                  <Button onPress={handleDateConfirm}>OK</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            {/* Month Dropdown */}
            <Menu
              visible={monthMenuVisible}
              onDismiss={() => setMonthMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMonthMenuVisible(true)} activeOpacity={0.7}>
                  <View pointerEvents="none">
                    <TextInput
                      label="Month"
                      value={month}
                      mode="outlined"
                      placeholder="Select Month"
                      left={<TextInput.Icon icon="calendar-month" />}
                      right={<TextInput.Icon icon="chevron-down" />}
                      style={styles.input}
                      dense={true}
                      editable={false}
                    />
                  </View>
                </TouchableOpacity>
              }
            >
              {months.map((m) => (
                <Menu.Item
                  key={m}
                  onPress={() => {
                    setMonth(m);
                    setMonthMenuVisible(false);
                  }}
                  title={m}
                />
              ))}
            </Menu>

            {/* Route Dropdown */}
            <Menu
              visible={routeMenuVisible}
              onDismiss={() => setRouteMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setRouteMenuVisible(true)} activeOpacity={0.7}>
                  <View pointerEvents="none">
                    <TextInput
                      label="Route Name"
                      value={route}
                      mode="outlined"
                      placeholder={loadingRoutes ? "Loading routes..." : "Select Route"}
                      left={<TextInput.Icon icon="map-marker" />}
                      right={loadingRoutes ? 
                        <TextInput.Icon icon="loading" /> : 
                        <TextInput.Icon icon="chevron-down" />
                      }
                      style={styles.input}
                      dense={true}
                      editable={false}
                    />
                  </View>
                </TouchableOpacity>
              }
            >
              {loadingRoutes ? (
                <Menu.Item
                  title="Loading..."
                  disabled
                />
              ) : routes.length > 0 ? (
                routes.map((r) => (
                  <Menu.Item
                    key={r}
                    onPress={() => handleRouteSelect(r)}
                    title={r}
                  />
                ))
              ) : (
                <Menu.Item
                  title="No routes found"
                  disabled
                />
              )}
            </Menu>

            {/* Route Total Weight Display */}
            {route ? (
              <Card style={[styles.routeWeightCard, { 
                backgroundColor: paperTheme.colors.surfaceVariant || paperTheme.colors.surface,
              }]}>
                <Card.Content style={styles.routeWeightContent}>
                  <View style={styles.routeWeightLeft}>
                    <IconButton icon="scale" size={24} iconColor={paperTheme.colors.primary} />
                    <View>
                      <Text style={[styles.routeWeightLabel, { color: paperTheme.colors.textSecondary }]}>
                        Today's Total Weight
                      </Text>
                      <Text style={[styles.routeWeightValue, { color: paperTheme.colors.primary }]}>
                        {loadingRouteWeight ? 'Loading...' : `${routeTotalWeight} kg`}
                      </Text>
                    </View>
                  </View>
                  <IconButton 
                    icon="refresh" 
                    size={20} 
                    onPress={() => fetchRouteTotalWeight(route)}
                    iconColor={paperTheme.colors.primary}
                  />
                </Card.Content>
              </Card>
            ) : null}

            <Divider style={[styles.divider, { backgroundColor: paperTheme.colors.border }]} />

            {/* Quality Distribution */}
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: paperTheme.colors.primary }]}>
              Quality Distribution
            </Text>

            <View style={styles.percentageRow}>
              <View style={styles.percentageContainer}>
                <Text style={[styles.percentageLabel, { color: paperTheme.colors.success }]}>Best Leaf</Text>
                <TextInput
                  ref={bestLeafRef}
                  value={bestLeaf}
                  onChangeText={handleBestLeafChange}
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="0"
                  style={styles.percentageInput}
                  dense={true}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    if (bestLeafTimerRef.current) clearTimeout(bestLeafTimerRef.current);
                    bellowBestRef.current?.focus();
                  }}
                />
              </View>

              <View style={styles.percentageContainer}>
                <Text style={[styles.percentageLabel, { color: paperTheme.colors.warning }]}>Below Best</Text>
                <TextInput
                  ref={bellowBestRef}
                  value={bellowBest}
                  onChangeText={handleBellowBestChange}
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="0"
                  style={styles.percentageInput}
                  dense={true}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    if (bellowBestTimerRef.current) clearTimeout(bellowBestTimerRef.current);
                    poorRef.current?.focus();
                  }}
                />
              </View>

              <View style={styles.percentageContainer}>
                <Text style={[styles.percentageLabel, { color: paperTheme.colors.error }]}>Poor</Text>
                <TextInput
                  ref={poorRef}
                  value={poor}
                  onChangeText={handlePoorChange}
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="0"
                  style={styles.percentageInput}
                  dense={true}
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button 
                mode="contained" 
                onPress={handleSave}
                style={[styles.button, styles.saveButton]}
                icon="content-save"
                buttonColor={paperTheme.colors.primary}
                disabled={!route || !date || !month}
              >
                Save
              </Button>
              <Button 
                mode="outlined" 
                onPress={handleClear}
                style={styles.button}
                icon="close"
                textColor={paperTheme.colors.error}
              >
                Clear
              </Button>
            </View>
          </Card.Content>
        </Card>
        
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
  },
  bottomSpacing: {
    height: responsiveSpacing.lg,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    padding: responsiveSpacing.md,
    gap: responsiveSpacing.md,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing.sm,
    borderRadius: moderateScale(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    borderRadius: moderateScale(16),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing.lg,
  },
  headerIconContainer: {
    borderRadius: moderateScale(12),
    marginRight: responsiveSpacing.sm,
  },
  title: {
    fontWeight: 'bold',
    fontSize: responsiveFontSize(20),
  },
  input: {
    marginBottom: responsiveSpacing.md,
    height: moderateScale(48),
    backgroundColor: 'transparent',
  },
  divider: {
    marginVertical: responsiveSpacing.md,
    height: 1,
  },
  sectionTitle: {
    marginBottom: responsiveSpacing.md,
    fontWeight: 'bold',
    fontSize: responsiveFontSize(18),
  },
  percentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: responsiveSpacing.sm,
    marginBottom: responsiveSpacing.xl,
  },
  percentageContainer: {
    flex: 1,
  },
  percentageLabel: {
    fontSize: responsiveFontSize(18),
    marginBottom: responsiveSpacing.xs,
    marginTop: responsiveSpacing.sm,
    fontWeight: '600',
  },
  percentageInput: {
    height: moderateScale(48),
    fontSize: responsiveFontSize(15),
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: responsiveSpacing.md,
    marginTop: responsiveSpacing.md,
  },
  button: {
    flex: 1,
    borderRadius: moderateScale(25),
  },
  saveButton: {
    elevation: 4,
  },
  dateDialog: {
    maxHeight: '80%',
    borderRadius: moderateScale(20),
  },
  dialogScrollArea: {
    maxHeight: 400,
    paddingHorizontal: 0,
  },
  simpleCalendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: responsiveSpacing.md,
  },
  dayButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(8),
    borderWidth: 1.5,
    marginHorizontal: 2,
    marginVertical: 2,
    position: 'relative',
  },
  selectedDayButton: {
    borderWidth: 0,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    transform: [{ scale: 1.05 }],
  },
  todayButton: {
    borderWidth: 1.5,
  },
  dayButtonText: {
    fontSize: responsiveFontSize(15),
    fontWeight: '500',
  },
  selectedDayButtonText: {
    fontWeight: '700',
    color: 'white',
  },
  todayButtonText: {
    fontWeight: '600',
  },
  todayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  routeWeightCard: {
    marginTop: responsiveSpacing.xs,
    marginBottom: responsiveSpacing.md,
    elevation: 2,
    borderRadius: moderateScale(12),
  },
  routeWeightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: responsiveSpacing.xs,
  },
  routeWeightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeWeightLabel: {
    fontSize: responsiveFontSize(12),
    marginBottom: 2,
  },
  routeWeightValue: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
  },
});