import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from '@react-navigation/native';
import * as Device from 'expo-device';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Button,
  Card,
  Divider,
  IconButton,
  Menu,
  Text,
  TextInput,
  useTheme as usePaperTheme
} from 'react-native-paper';
import useKeyboardAutoScroll from '../../hooks/useKeyboardAutoScroll';
import { leafCountApi } from '../api/leafApi';
import { useAuth } from '../context/AuthContext';
import { getLeafCountDateRules, isLeafCountPeriodAllowed } from '../utils/leafCountDateUtils';
import {
  moderateScale,
  responsiveFontSize,
  responsiveSpacing
} from '../utils/responsiveUtils';

export default function AddLeafCountPage() {
  const paperTheme = usePaperTheme();
  const headerHeight = useHeaderHeight();
  const { inputFocusProps, scrollViewProps } = useKeyboardAutoScroll();
  const { user } = useAuth();
 
  // Create refs for each input field
  const bestLeafRef = useRef(null);
  const bellowBestRef = useRef(null);
  const poorRef = useRef(null);

  // Create timer refs for auto-focus delay
  const bestLeafTimerRef = useRef(null);
  const bellowBestTimerRef = useRef(null);
  
  const [dateRules, setDateRules] = useState(getLeafCountDateRules);
  const { date, month } = dateRules;
  const [route, setRoute] = useState('');
  const [routeMenuVisible, setRouteMenuVisible] = useState(false);
  const [bestLeaf, setBestLeaf] = useState('');
  const [bellowBest, setBellowBest] = useState('');
  const [poor, setPoor] = useState('');

  const qualityPercentages = [bestLeaf, bellowBest, poor].map(value => Number(value || 0));
  const totalQualityPercentage = qualityPercentages.reduce((total, value) => total + value, 0);
  const isQualityDistributionValid = qualityPercentages.every(value => Number.isFinite(value) && value >= 0 && value <= 100)
    && totalQualityPercentage === 100;
  
  // States for dynamic routes and route total weight
  const [routes, setRoutes] = useState([]);
  const [routeTotalWeight, setRouteTotalWeight] = useState('0.00');
  const [loadingRouteWeight, setLoadingRouteWeight] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [loading, setLoading] = useState(false);

  // Calculate weights based on percentages
  const calculateWeight = (percentage) => {
    const totalWeight = parseFloat(routeTotalWeight) || 0;
    const percentValue = parseFloat(percentage) || 0;
    return ((totalWeight * percentValue) / 100).toFixed(2);
  };

  const bestLeafWeight = calculateWeight(bestLeaf);
  const bellowBestWeight = calculateWeight(bellowBest);
  const poorWeight = calculateWeight(poor);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (bestLeafTimerRef.current) clearTimeout(bestLeafTimerRef.current);
      if (bellowBestTimerRef.current) clearTimeout(bellowBestTimerRef.current);
    };
  }, []);

  // Fetch routes when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Screen focused - refreshing routes');
      fetchRoutes();
      return () => {
        // cleanup if needed
      };
    }, [])
  );

  // Fetch routes from database
  const fetchRoutes = async () => {
    setLoadingRoutes(true);
    try {
      console.log('🔍 Fetching routes...');
      const response = await leafCountApi.getRoutes();
      console.log('📥 Routes response:', JSON.stringify(response, null, 2));
      
      let routesData = [];
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          routesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          routesData = response.data.data;
        } else if (response.data.routes && Array.isArray(response.data.routes)) {
          routesData = response.data.routes;
        }
        
        const routeNames = routesData.map(item => {
          if (typeof item === 'string') {
            return item;
          } else if (item && typeof item === 'object') {
            return item.routeName || item.name || item.Route || item.route || JSON.stringify(item);
          }
          return String(item);
        }).filter(route => route && route.trim() !== '');
        
        console.log('✅ Processed routes:', routeNames);
        setRoutes(routeNames);
      } else {
        console.log('⚠️ Invalid response format');
        setRoutes([]);
      }
    } catch (error) {
      console.error('❌ Error fetching routes:', error);
      Alert.alert('Error', 'Failed to load routes. Please check your connection.');
      setRoutes([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

  // Fetch route total weight - UPDATED with 2 decimal formatting
  const fetchRouteTotalWeight = async (selectedRoute) => {
    if (!selectedRoute || !date || !month) {
      console.log('⚠️ Cannot fetch weight - missing route, date, or month:', { selectedRoute, date, month });
      setRouteTotalWeight('0.00');
      return;
    }
    
    setLoadingRouteWeight(true);
    try {
      console.log('🔍 Fetching weight for:', { route: selectedRoute, date, month });
      
      const response = await leafCountApi.getRouteTotalWeight(selectedRoute, date, month);
      console.log('📥 Weight response:', JSON.stringify(response, null, 2));
      
      if (response && response.data) {
        let weight = 0;
        
        if (response.data.success && response.data.data) {
          weight = response.data.data.totalWeight || 0;
          console.log('✅ Route total weight calculated:', weight);
        } else if (response.data.totalWeight !== undefined) {
          weight = response.data.totalWeight;
        } else if (response.data.weight !== undefined) {
          weight = response.data.weight;
        } else if (typeof response.data === 'number') {
          weight = response.data;
        }
        
        // Format to 2 decimal places
        const formattedWeight = parseFloat(weight).toFixed(2);
        console.log('✅ Formatted weight (2 decimals):', formattedWeight);
        setRouteTotalWeight(formattedWeight);
      } else {
        console.log('⚠️ Invalid response format');
        setRouteTotalWeight('0.00');
      }
    } catch (error) {
      console.error('❌ Error fetching route total weight:', error);
      setRouteTotalWeight('0.00');
    } finally {
      setLoadingRouteWeight(false);
    }
  };

  // Auto-fetch when route, date, or month changes
  useEffect(() => {
    console.log('🔄 Route, date, or month changed:', { route, date, month });
    if (route && date && month) {
      fetchRouteTotalWeight(route);
    } else {
      setRouteTotalWeight('0.00');
    }
  }, [route, date, month]);

    
  const refreshDateRules = React.useCallback(() => {
    const nextRules = getLeafCountDateRules();
    setDateRules(previous => previous.key === nextRules.key ? previous : nextRules);
    return nextRules;
  }, []);
    
  // Refresh at midnight/06:00 and when returning from the background or another tab.
  useFocusEffect(React.useCallback(() => {
    let boundaryTimer;
    const refreshAndSchedule = () => {
      clearTimeout(boundaryTimer);
      const rules = refreshDateRules();
      boundaryTimer = setTimeout(refreshAndSchedule, Math.max(1, rules.nextChangeAt - Date.now() + 50));
    };
    refreshAndSchedule();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refreshAndSchedule();
    });
    return () => {
      clearTimeout(boundaryTimer);
      subscription.remove();
    };
  }, [refreshDateRules]));


  const dismissDropdownMenus = () => {
    setRouteMenuVisible(false);
  };

  const handleScreenTouch = () => {
    if (routeMenuVisible) {
      dismissDropdownMenus();
    }

    // Observe touches without taking them away from inputs or scrolling.
    // Menu items render in Paper's Portal, outside this screen's touch tree.
    return false;
  };

  // Handle Best Leaf change with auto-focus
  const handleBestLeafChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setBestLeaf(numericText);
    
    if (bestLeafTimerRef.current) {
      clearTimeout(bestLeafTimerRef.current);
    }
    
    if (numericText.length > 0) {
      bestLeafTimerRef.current = setTimeout(() => {
        if (bellowBestRef.current) {
          bellowBestRef.current.focus();
        }
      }, 500);
    }
  };

  // Handle Below Best change with auto-focus
  const handleBellowBestChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setBellowBest(numericText);
    
    if (bellowBestTimerRef.current) {
      clearTimeout(bellowBestTimerRef.current);
    }
    
    if (numericText.length > 0) {
      bellowBestTimerRef.current = setTimeout(() => {
        if (poorRef.current) {
          poorRef.current.focus();
        }
      }, 500);
    }
  };

  // Handle Poor change
  const handlePoorChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setPoor(numericText);
  };

 // Handle Save - UPDATED to correctly get username from login
const handleSave = async () => {
  if (bestLeafTimerRef.current) clearTimeout(bestLeafTimerRef.current);
  if (bellowBestTimerRef.current) clearTimeout(bellowBestTimerRef.current);

  if (!route || !date || !month) {
    Alert.alert('Error', 'Please select a route');
    return;
  }

  if (!isLeafCountPeriodAllowed(date, month)) {
    refreshDateRules();
    Alert.alert('Date Updated', 'The date and month have been updated automatically. Please review them and save again.');
    return;
  }

  if (!isQualityDistributionValid) {
    Alert.alert(
      'Invalid Quality Distribution',
      `Best Leaf % + Below Best % + Poor % must equal exactly 100%. Current total: ${totalQualityPercentage}%.`
    );
    return;
  }

  setLoading(true);

  try {
    const getDeviceName = () => {
      try {
        if (Platform.OS === 'web') {
          return window.location.hostname || 'Web Browser';
        } else if (Platform.OS === 'android') {
          const deviceName = Device.deviceName;
          const modelName = Device.modelName;
          const brand = Device.brand;
          
          if (deviceName) {
            return deviceName;
          } else if (brand && modelName) {
            const formattedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
            return `${formattedBrand} ${modelName}`;
          } else {
            return `Android ${Device.osVersion || ''}`;
          }
        } else if (Platform.OS === 'ios') {
          const deviceName = Device.deviceName;
          const modelName = Device.modelName;
          
          if (deviceName) {
            return deviceName;
          } else if (modelName) {
            return `iPhone ${modelName}`;
          } else {
            return `iOS ${Device.osVersion || ''}`;
          }
        } else {
          return 'Mobile App';
        }
      } catch (error) {
        console.error('Error getting device name:', error);
        return Platform.OS === 'android' ? 'Android Device' : 
               Platform.OS === 'ios' ? 'iOS Device' : 
               'Mobile App';
      }
    };

    const pcName = getDeviceName();
    const mode = 'App';
    
    // IMPORTANT FIX: Get the actual logged-in username from user object
    // The user object comes from AuthContext after login
    const loggedInUserName = user?.username || user?.name || 'unknown_user';
    
    console.log('👤 Current logged in user:', {
      username: loggedInUserName,
      fullUserObject: user
    });

    if (!loggedInUserName || loggedInUserName === 'unknown_user') {
      console.warn('⚠️ Username not found in user object:', user);
      Alert.alert(
        'Warning', 
        'Username not found. Please log out and log in again.'
      );
    }

    const leafCountData = {
      date,
      month,
      route,
      bestLeaf: bestLeaf || '0',
      bellowBest: bellowBest || '0',
      poor: poor || '0',
      userName: loggedInUserName, // This will now contain the actual username from login
      mode: mode,
      pcName: pcName
    };

    console.log('💾 Saving leaf count data:', leafCountData);
    
    const response = await leafCountApi.saveLeafCount(leafCountData);
    console.log('📥 Save response:', JSON.stringify(response, null, 2));
    
    if (response && response.data) {
      if (response.data.success || response.data.message?.includes('success')) {
        Alert.alert('Success', 'Leaf count saved successfully');
        handleClear();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save');
      }
    } else {
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  } catch (error) {
    console.error('❌ Error saving leaf count:', error);
    const message = error.response?.status === 403
      ? 'You do not have permission to add leaf counts.'
      : error.response?.data?.message || 'Failed to save. Please try again.';
    Alert.alert('Error', message);
  } finally {
    setLoading(false);
  }
};
  // Handle Clear - UPDATED with '0.00'
  const handleClear = () => {
    if (bestLeafTimerRef.current) clearTimeout(bestLeafTimerRef.current);
    if (bellowBestTimerRef.current) clearTimeout(bellowBestTimerRef.current);

    refreshDateRules();
    setRoute('');
    setBestLeaf('');
    setBellowBest('');
    setPoor('');
    setRouteTotalWeight('0.00');
  };

  // Handle Route Selection
  const handleRouteSelect = (selectedRoute) => {
    console.log('✅ Route selected:', selectedRoute);
    setRoute(selectedRoute);
    setRouteMenuVisible(false);
  };

  // Date Header Component
  const DateHeader = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('en-US', { month: 'short' });
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
      onStartShouldSetResponderCapture={handleScreenTouch}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      <ScrollView 
        {...scrollViewProps}
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

            {/* Date and month are fixed by the 06:00 business-day cutoff. */}
            <View pointerEvents="none">
              <TextInput
                label="Date"
                value={date}
                mode="outlined"
                left={<TextInput.Icon icon="calendar" />}
                style={styles.input}
                dense={true}
                editable={false}
                showSoftInputOnFocus={false}
              />
              <TextInput
                label="Month"
                value={month}
                mode="outlined"
                left={<TextInput.Icon icon="calendar-month" />}
                style={styles.input}
                dense={true}
                editable={false}
                showSoftInputOnFocus={false}
              />
            </View>

            {/* Route Dropdown with Refresh Option in Menu */}
          <View style={styles.routeRow}>
            <View style={styles.routeInputContainer}>
              <Menu
                visible={routeMenuVisible}
                onDismiss={dismissDropdownMenus}
                anchor={
                  <TouchableOpacity onPress={() => setRouteMenuVisible(true)} activeOpacity={0.7}>
                    <View pointerEvents="none">
                      <TextInput
                        label="Route Name"
                        value={route}
                        mode="outlined"
                        placeholder={loadingRoutes ? "Loading routes..." : "Select Route"}
                        left={<TextInput.Icon icon="map-marker" />}
                        right={
                          loadingRoutes ? 
                            <TextInput.Icon icon={() => <ActivityIndicator size="small" />} /> : 
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
                    title="Loading routes..."
                    disabled
                  />
                ) : (
                  <>
                    <Menu.Item
                      title=" Refresh Routes"
                      onPress={() => {
                        fetchRoutes();
                        // Keep menu open to show refreshed results
                      }}
                      leadingIcon="refresh"
                    />
                    <Divider />
                    
                    {routes.length > 0 ? (
                      routes.map((routeName, index) => (
                        <Menu.Item
                          key={`${routeName}-${index}`}
                          onPress={() => handleRouteSelect(routeName)}
                          title={routeName}
                        />
                      ))
                    ) : (
                      <Menu.Item
                        title="No routes found"
                        disabled
                      />
                    )}
                  </>
                )}
              </Menu>
            </View>
          </View>

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
                        Total Net Weight
                      </Text>
                      {loadingRouteWeight ? (
                        <ActivityIndicator size="small" color={paperTheme.colors.primary} />
                      ) : (
                        <Text style={[styles.routeWeightValue, { color: paperTheme.colors.primary }]}>
                          {routeTotalWeight} kg
                        </Text>
                      )}
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
                  {...inputFocusProps}
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
                {/* Best Leaf Weight Display with Label */}
                {routeTotalWeight !== '0.00' && bestLeaf ? (
                  <View style={styles.weightDisplayContainer}>
                    <Text style={[styles.weightDisplayLabel, { color: paperTheme.colors.textSecondary }]}>
                      Best Leaf Weight:
                    </Text>
                    <Text style={[styles.weightDisplayValue, { color: paperTheme.colors.success }]}>
                      {bestLeafWeight} kg
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.percentageContainer}>
                <Text style={[styles.percentageLabel, { color: paperTheme.colors.warning }]}>Below Best</Text>
                <TextInput
                  ref={bellowBestRef}
                  {...inputFocusProps}
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
                {/* Below Best Weight Display with Label */}
                {routeTotalWeight !== '0.00' && bellowBest ? (
                  <View style={styles.weightDisplayContainer}>
                    <Text style={[styles.weightDisplayLabel, { color: paperTheme.colors.textSecondary }]}>
                      Below Best Weight:
                    </Text>
                    <Text style={[styles.weightDisplayValue, { color: paperTheme.colors.warning }]}>
                      {bellowBestWeight} kg
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.percentageContainer}>
                <Text style={[styles.percentageLabel, { color: paperTheme.colors.error }]}>Poor</Text>
                <TextInput
                  ref={poorRef}
                  {...inputFocusProps}
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
                {/* Poor Weight Display with Label */}
                {routeTotalWeight !== '0.00' && poor ? (
                  <View style={styles.weightDisplayContainer}>
                    <Text style={[styles.weightDisplayLabel, { color: paperTheme.colors.textSecondary }]}>
                      Poor Weight:
                    </Text>
                    <Text style={[styles.weightDisplayValue, { color: paperTheme.colors.error }]}>
                      {poorWeight} kg
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>



            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button 
                mode="contained" 
                onPress={handleSave}
                style={[styles.button, styles.saveButton]}
                icon={loading
                  ? ({ color, size }) => <ActivityIndicator color={color} size={size} />
                  : "content-save"}
                buttonColor={paperTheme.colors.primary}
                disabled={!route || !date || !month || !isQualityDistributionValid || loading}
              >
                Save
              </Button>
              <Button 
                mode="outlined" 
                onPress={handleClear}
                style={styles.button}
                icon="close"
                textColor={paperTheme.colors.error}
                disabled={loading}
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
 routeRow: {
  marginBottom: responsiveSpacing.md,
},
routeInputContainer: {
  width: '100%',
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
  // Updated styles for weight display with label
  weightDisplayContainer: {
    marginTop: responsiveSpacing.xs,
    paddingVertical: responsiveSpacing.xs,
    paddingHorizontal: responsiveSpacing.sm,
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  weightDisplayLabel: {
    fontSize: responsiveFontSize(10),
    marginBottom: 2,
  },
  weightDisplayValue: {
    fontSize: responsiveFontSize(14),
    fontWeight: '700',
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
