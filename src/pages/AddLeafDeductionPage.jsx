import * as Device from 'expo-device';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  IconButton,
  SegmentedButtons,
  Snackbar,
  Text,
  TextInput,
  useTheme as usePaperTheme
} from 'react-native-paper';
import { deductionApi, supplierApi } from '../api/leafApi';
import { useAuth } from '../context/AuthContext';
import { useLeafData } from '../context/LeafDataContext';
import { getCurrentDate, getCurrentMonth } from '../utils/dateUtils';
import {
  isTablet,
  moderateScale,
  responsiveFontSize,
  responsiveSpacing
} from '../utils/responsiveUtils';

// ===== MOVED COMPONENTS OUTSIDE MAIN FUNCTION =====

const DateHeader = ({ paperTheme, month }) => {
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

const InputRow = ({ 
  label, 
  value, 
  onChange, 
  icon, 
  totalLabel, 
  totalValue, 
  totalColor, 
  disabled = false,
  inputRef = null,
  returnKeyType = 'next',
  onSubmitEditing = null,
  paperTheme // Added paperTheme as prop
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
        keyboardType="numeric"
        left={<TextInput.Icon icon={icon} color={paperTheme.colors.primary} />}
        style={styles.smallInput}
        dense={true}
        outlineStyle={styles.inputOutline}
        returnKeyType={returnKeyType}
        blurOnSubmit={false}
        onSubmitEditing={onSubmitEditing}
        maxLength={5}
        selectTextOnFocus={true}
      />
    </View>
    <View style={[styles.totalContainer, { flex: 0.8 }]}>
      <Text style={[styles.totalLabel, { color: paperTheme.colors.textSecondary }]}>{totalLabel}</Text>
      <Text style={[styles.totalValue, { color: totalColor }]}>
        {totalValue} kg
      </Text>
    </View>
  </View>
);
const SearchModal = ({ 
  visible, 
  onClose, 
  searchQuery, 
  onSearchChange, 
  searchResults, 
  searchLoading, 
  onSelectSupplier,
  onPerformSearch, // Add this prop
  paperTheme,
  searchInputRef
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <KeyboardAvoidingView 
      style={styles.modalOverlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <TouchableOpacity 
        style={styles.modalBackdrop} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View 
          style={[styles.modalContent, { backgroundColor: paperTheme.colors.surface }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: paperTheme.colors.primary }]}>
              Search Suppliers
            </Text>
            <IconButton 
              icon="close" 
              size={24} 
              onPress={onClose}
              iconColor={paperTheme.colors.error}
            />
          </View>

          <View style={styles.modalSearchContainer}>
            <TextInput
              ref={searchInputRef}
              placeholder="Type registration number or name..."
              value={searchQuery}
              onChangeText={onSearchChange}
              mode="outlined"
              left={<TextInput.Icon icon="magnify" />}
              right={searchLoading ? <ActivityIndicator size="small" /> : null}
              style={styles.modalSearchInput}
              autoFocus={true}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (searchQuery.length >= 1) {
                  onPerformSearch(searchQuery); // Use the prop instead of direct call
                }
              }}
            />
          </View>

          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => {
                const key = item?.RegNo?.toString() || item?.regNo?.toString() || `item-${index}`;
                return key;
              }}
              renderItem={({ item }) => {
                const regNo = item?.RegNo || item?.regNo || 'N/A';
                const supplierName = item?.SupplierName || item?.supplierName || item?.name || 'Unknown';
                const route = item?.Route || item?.route || '';
                
                return (
                  <TouchableOpacity
                    style={[styles.searchResultItem, { borderBottomColor: paperTheme.colors.border }]}
                    onPress={() => onSelectSupplier({
                      RegNo: regNo,
                      SupplierName: supplierName,
                      Route: route
                    })}
                  >
                    <View style={styles.searchResultLeft}>
                      <Text style={[styles.searchResultRegNo, { color: paperTheme.colors.primary }]}>
                        #{regNo}
                      </Text>
                      <Text style={[styles.searchResultName, { color: paperTheme.colors.text }]}>
                        {supplierName}
                      </Text>
                      {route ? (
                        <Text style={[styles.searchResultRoute, { color: paperTheme.colors.textSecondary }]}>
                          Route: {route}
                        </Text>
                      ) : null}
                    </View>
                    <IconButton icon="chevron-right" size={20} iconColor={paperTheme.colors.primary} />
                  </TouchableOpacity>
                );
              }}
              style={styles.searchResultsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.searchResultsContent}
            />
          ) : searchQuery.length > 0 && !searchLoading ? (
            <View style={styles.noResultsContainer}>
              <Text style={[styles.noResultsText, { color: paperTheme.colors.textSecondary }]}>
                No suppliers found
              </Text>
            </View>
          ) : null}
          
          {/* Add some bottom padding for keyboard */}
          <View style={{ height: Platform.OS === 'ios' ? 20 : 10 }} />
        </View>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  </Modal>
);
// ===== MAIN COMPONENT =====

export default function AddLeafDeductionPage({ navigation }) {
  const paperTheme = usePaperTheme();
  const { addLeafDeduction } = useLeafData();
  const { user } = useAuth();
  const isTabletDevice = isTablet();

  // Create refs for each input field
  const bagWeightRef = useRef(null);
  const coarceRef = useRef(null);
  const waterRef = useRef(null);
  const boiledRef = useRef(null);
  const rejectedRef = useRef(null);
  const regNoRef = useRef(null);
  const searchInputRef = useRef(null);

  // Create timer refs for auto-focus delay
  const bagWeightTimerRef = useRef(null);
  const coarceTimerRef = useRef(null);
  const waterTimerRef = useRef(null);
  const boiledTimerRef = useRef(null);
  const searchTimerRef = useRef(null);
  const regNoSearchTimerRef = useRef(null);

  const [date] = useState(getCurrentDate());
  const [month] = useState(getCurrentMonth());
  const [regNo, setRegNo] = useState('');
  const [route, setRoute] = useState('');
  const [name, setName] = useState('');
  const [leafType, setLeafType] = useState('Normal');
  
  // Summary totals from database
  const [summaryTotals, setSummaryTotals] = useState({
    bags: '0',
    gross: '0',
    bagWeight: '0',
    coarce: '0',
    water: '0',
    boiled: '0',
    rejected: '0',
    netWeight: '0'
  });
  
  // Current input values
  const [currentBagWeight, setCurrentBagWeight] = useState('');
  const [currentCoarce, setCurrentCoarce] = useState('');
  const [currentWater, setCurrentWater] = useState('');
  const [currentBoiled, setCurrentBoiled] = useState('');
  const [currentRejected, setCurrentRejected] = useState('');

  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    bagWeight: '',
    coarce: '',
    water: '',
    boiled: '',
    rejected: ''
  });

  // Search modal state
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // State to track if we're currently searching
  const [isSearchingRegNo, setIsSearchingRegNo] = useState(false);
  const [lastSearchedRegNo, setLastSearchedRegNo] = useState('');

  // Clear all timers on unmount
  useEffect(() => {
    return () => {
      if (bagWeightTimerRef.current) clearTimeout(bagWeightTimerRef.current);
      if (coarceTimerRef.current) clearTimeout(coarceTimerRef.current);
      if (waterTimerRef.current) clearTimeout(waterTimerRef.current);
      if (boiledTimerRef.current) clearTimeout(boiledTimerRef.current);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (regNoSearchTimerRef.current) clearTimeout(regNoSearchTimerRef.current);
    };
  }, []);

  // Search suppliers as user types in modal
  const handleSearchInputChange = (text) => {
    setSearchQuery(text);
    
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    if (text.length >= 1) {
      setSearchLoading(true);
      searchTimerRef.current = setTimeout(() => {
        performSearch(text);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const performSearch = async (query) => {
    try {
      console.log('🔍 Searching suppliers with query:', query);
      const response = await supplierApi.searchSuppliers(query);
      console.log('✅ Search results:', response.data);
      
      if (response.data.success) {
        setSearchResults(response.data.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('❌ Error searching suppliers:', error);
      setSearchResults([]);
      setSnackbarMessage('Failed to search suppliers');
      setSnackbarVisible(true);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle registration number input
  const handleRegNoChange = (text) => {
    // Allow only numeric
    const numericText = text.replace(/[^0-9]/g, '');
    setRegNo(numericText);
    
    if (regNoSearchTimerRef.current) {
      clearTimeout(regNoSearchTimerRef.current);
    }
    
    if (!numericText.trim()) {
      setName('');
      setRoute('');
      return;
    }
    
    regNoSearchTimerRef.current = setTimeout(() => {
      searchSupplierByRegNo(numericText);
    }, 800);
  };

  // Search supplier by registration number
  const searchSupplierByRegNo = async (regNoValue) => {
    if (lastSearchedRegNo === regNoValue || !regNoValue.trim()) {
      return;
    }

    setIsSearchingRegNo(true);
    setLastSearchedRegNo(regNoValue);

    try {
      console.log('🔍 Searching for RegNo:', regNoValue);
      const response = await supplierApi.getSupplierByRegNo(regNoValue);
      console.log('✅ Search response:', response.data);
      
      if (response.data.success && response.data.data) {
        setName(response.data.data.supplierName || '');
        setRoute(response.data.data.route || '');
      }
    } catch (error) {
      if (error?.response?.status !== 404) {
        console.error('❌ Error searching supplier:', error);
      }
      if (regNo === regNoValue) {
        setName('');
        setRoute('');
      }
    } finally {
      setIsSearchingRegNo(false);
    }
  };

  // Open search modal
  const openSearchModal = () => {
    setSearchModalVisible(true);
    setSearchQuery('');
    setSearchResults([]);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // Select supplier from search results
  const selectSupplier = (supplier) => {
    const regNo = supplier.RegNo || supplier.regNo;
    const supplierName = supplier.SupplierName || supplier.supplierName || supplier.name;
    const route = supplier.Route || supplier.route || '';
    
    setRegNo(regNo?.toString() || '');
    setName(supplierName || '');
    setRoute(route);
    setLastSearchedRegNo(regNo?.toString() || '');
    setSearchModalVisible(false);
    setSnackbarMessage(`Selected: ${supplierName || 'Supplier'}`);
    setSnackbarVisible(true);
    
    // Auto-load summary after selection
    setTimeout(() => {
      handleLoadSummary();
    }, 500);
  };

  // Handle manual search
  const handleManualSearch = async () => {
    if (!regNo.trim()) {
      setSnackbarMessage('Please enter registration number');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Manually searching for RegNo:', regNo);
      const response = await supplierApi.getSupplierByRegNo(regNo);
      console.log('✅ Search response:', response.data);
      
      if (response.data.success && response.data.data) {
        setName(response.data.data.supplierName);
        setRoute(response.data.data.route || '');
        setLastSearchedRegNo(regNo);
        setSnackbarMessage(`Supplier found: ${response.data.data.supplierName}`);
        setSnackbarVisible(true);
        
        // Auto-load summary
        setTimeout(() => {
          handleLoadSummary();
        }, 500);
      } else {
        setSnackbarMessage('Supplier not found. Please check registration number.');
        setSnackbarVisible(true);
        setName('');
        setRoute('');
      }
    } catch (error) {
      console.error('❌ Error searching supplier:', error);
      setSnackbarMessage('Supplier not found. Please check registration number.');
      setSnackbarVisible(true);
      setName('');
      setRoute('');
    } finally {
      setLoading(false);
    }
  };

  // Load summary - THIS IS CRITICAL FOR GROSS VALUE
  const handleLoadSummary = async () => {
    if (!regNo.trim()) {
      setSnackbarMessage('Please select a supplier first');
      setSnackbarVisible(true);
      return;
    }

    if (!name) {
      setSnackbarMessage('Please search and select a supplier first');
      setSnackbarVisible(true);
      return;
    }

    setLoadingSummary(true);
    try {
      console.log('📊 Loading summary for RegNo:', regNo, 'LeafType:', leafType);
      const response = await deductionApi.getSummary(regNo, leafType);
      console.log('✅ Summary response:', response.data);
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // Set summary totals from database
        setSummaryTotals({
          bags: data.TotalBags?.toString() || '0',
          gross: data.TotalGross?.toString() || '0',
          bagWeight: Math.round(data.TotalBagWeight || 0).toString(),
          coarce: Math.round(data.TotalCoarse || 0).toString(),
          water: Math.round(data.TotalWater || 0).toString(),
          boiled: Math.round(data.TotalBoiled || 0).toString(),
          rejected: Math.round(data.TotalRejected || 0).toString(),
          netWeight: data.TotalNetWeight?.toString() || '0'
        });
        
        // Reset current input values and original values
        setCurrentBagWeight('');
        setCurrentCoarce('');
        setCurrentWater('');
        setCurrentBoiled('');
        setCurrentRejected('');
        
        setOriginalValues({
          bagWeight: '',
          coarce: '',
          water: '',
          boiled: '',
          rejected: ''
        });
        
        setSnackbarMessage(`Summary loaded - Gross: ${data.TotalGross || 0} kg, Net: ${data.TotalNetWeight || 0} kg`);
        setSnackbarVisible(true);
        
        // Focus on bag weight
        setTimeout(() => bagWeightRef.current?.focus(), 500);
      } else {
        // Reset to zero if no data
        setSummaryTotals({
          bags: '0',
          gross: '0',
          bagWeight: '0',
          coarce: '0',
          water: '0',
          boiled: '0',
          rejected: '0',
          netWeight: '0'
        });
        setCurrentBagWeight('');
        setCurrentCoarce('');
        setCurrentWater('');
        setCurrentBoiled('');
        setCurrentRejected('');
        
        setOriginalValues({
          bagWeight: '',
          coarce: '',
          water: '',
          boiled: '',
          rejected: ''
        });
        
        setSnackbarMessage(`No ${leafType} leaf transactions found for today`);
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('❌ Error loading summary:', error);
      setSnackbarMessage('Failed to load summary');
      setSnackbarVisible(true);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Handle input changes with numeric only - WORKING AUTO-FOCUS VERSION
  const handleBagWeightChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setCurrentBagWeight(numericText);
    
    if (bagWeightTimerRef.current) {
      clearTimeout(bagWeightTimerRef.current);
    }
    
    // Only auto-focus if there is text, but don't block typing
    if (numericText.length > 0) {
      bagWeightTimerRef.current = setTimeout(() => {
        if (coarceRef.current) {
          coarceRef.current.focus();
        }
      }, 800);
    }
  };

  const handleCoarceChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setCurrentCoarce(numericText);
    
    if (coarceTimerRef.current) {
      clearTimeout(coarceTimerRef.current);
    }
    
    if (numericText.length > 0) {
      coarceTimerRef.current = setTimeout(() => {
        if (waterRef.current) {
          waterRef.current.focus();
        }
      }, 800);
    }
  };

  const handleWaterChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setCurrentWater(numericText);
    
    if (waterTimerRef.current) {
      clearTimeout(waterTimerRef.current);
    }
    
    if (numericText.length > 0) {
      waterTimerRef.current = setTimeout(() => {
        if (boiledRef.current) {
          boiledRef.current.focus();
        }
      }, 800);
    }
  };

  const handleBoiledChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setCurrentBoiled(numericText);
    
    if (boiledTimerRef.current) {
      clearTimeout(boiledTimerRef.current);
    }
    
    if (numericText.length > 0) {
      boiledTimerRef.current = setTimeout(() => {
        if (rejectedRef.current) {
          rejectedRef.current.focus();
        }
      }, 800);
    }
  };

  const handleRejectedChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setCurrentRejected(numericText);
  };

  // Display values
  const displayedBagWeight = (parseFloat(summaryTotals.bagWeight) + (parseFloat(currentBagWeight) || 0)).toString();
  const displayedCoarce = (parseFloat(summaryTotals.coarce) + (parseFloat(currentCoarce) || 0)).toString();
  const displayedWater = (parseFloat(summaryTotals.water) + (parseFloat(currentWater) || 0)).toString();
  const displayedBoiled = (parseFloat(summaryTotals.boiled) + (parseFloat(currentBoiled) || 0)).toString();
  const displayedRejected = (parseFloat(summaryTotals.rejected) + (parseFloat(currentRejected) || 0)).toString();

  // Calculate net weight for UI display only - DB will store 0 for deduction entries
  const calculateNetWeight = () => {
    const baseNetWeight = parseFloat(summaryTotals.netWeight) || 0;
    
    // Calculate total current deductions for net weight update
    const currentBagWeightVal = parseFloat(currentBagWeight) || 0;
    const currentCoarceVal = parseFloat(currentCoarce) || 0;
    const currentWaterVal = parseFloat(currentWater) || 0;
    const currentBoiledVal = parseFloat(currentBoiled) || 0;
    const currentRejectedVal = parseFloat(currentRejected) || 0;

    const totalCurrentDeductions = currentBagWeightVal + currentCoarceVal + currentWaterVal + 
                                   currentBoiledVal + currentRejectedVal;
    
    const netWeight = baseNetWeight - totalCurrentDeductions;
    
    return Math.max(0, netWeight).toFixed(2);
  };
  
  const displayedNetWeight = calculateNetWeight();

  // Check if a value has changed from original
  const hasValueChanged = () => {
    const bagWeightChanged = parseFloat(currentBagWeight || 0) !== parseFloat(originalValues.bagWeight || 0);
    const coarceChanged = parseFloat(currentCoarce || 0) !== parseFloat(originalValues.coarce || 0);
    const waterChanged = parseFloat(currentWater || 0) !== parseFloat(originalValues.water || 0);
    const boiledChanged = parseFloat(currentBoiled || 0) !== parseFloat(originalValues.boiled || 0);
    const rejectedChanged = parseFloat(currentRejected || 0) !== parseFloat(originalValues.rejected || 0);

    return bagWeightChanged || coarceChanged || waterChanged || boiledChanged || rejectedChanged;
  };

  const handleSave = async () => {
    clearTimeout(bagWeightTimerRef.current);
    clearTimeout(coarceTimerRef.current);
    clearTimeout(waterTimerRef.current);
    clearTimeout(boiledTimerRef.current);

    if (!regNo || !name) {
      setSnackbarMessage('Please select a supplier first');
      setSnackbarVisible(true);
      return;
    }

    if (!currentBagWeight && !currentCoarce && !currentWater && !currentBoiled && !currentRejected) {
      setSnackbarMessage('Please enter at least one deduction value');
      setSnackbarVisible(true);
      return;
    }

    // Check if any values have changed from original
    if (!hasValueChanged()) {
      setSnackbarMessage('No changes to save');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);

    // Get the logged-in username from AuthContext
    const loggedInUserName = user?.username || 'mobile_user';
    
    // Get device name using expo-device (synchronous)
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
    
    // Set mode to 'App' as requested
    const mode = 'App';

    console.log('💾 Logged in user:', loggedInUserName, 'Mode:', mode, 'Device:', pcName);

    // Rest of your handleSave code remains the same...
    // Calculate current deduction values
    const currentBagWeightVal = parseFloat(currentBagWeight) || 0;
    const currentCoarceVal = parseFloat(currentCoarce) || 0;
    const currentWaterVal = parseFloat(currentWater) || 0;
    const currentBoiledVal = parseFloat(currentBoiled) || 0;
    const currentRejectedVal = parseFloat(currentRejected) || 0;

    // Prepare deduction data
    const deductionData = {
      regNo: parseInt(regNo),
      supplierName: name,
      route,
      leafType,
      Gross: 0,
      NetWeight: 0,
      userName: loggedInUserName,
      month,
      mode: mode,
      pcName: pcName
    };

    // Add deduction fields if they have values
    if (currentBagWeightVal > 0) deductionData.BagWeight = currentBagWeightVal;
    if (currentCoarceVal > 0) deductionData.Coarse = currentCoarceVal;
    if (currentWaterVal > 0) deductionData.Water = currentWaterVal;
    if (currentBoiledVal > 0) deductionData.Boild = currentBoiledVal;
    if (currentRejectedVal > 0) deductionData.Rejected = currentRejectedVal;

    console.log('💾 Saving deduction with username:', deductionData.userName, 'Mode:', deductionData.mode, 'Device:', deductionData.pcName);
    console.log('💾 Deduction data:', deductionData);

    try {
      const response = await deductionApi.saveDeduction(deductionData);
      console.log('✅ Save response:', response.data);
      
      if (response.data.success) {
        addLeafDeduction({
          ...deductionData,
          ind: response.data.data?.ind,
          timestamp: new Date().toISOString(),
        });
        
        setSnackbarMessage('Deduction saved successfully');
        setSnackbarVisible(true);
        
        // Reset all fields
        setRegNo('');
        setName('');
        setRoute('');
        setLastSearchedRegNo('');
        
        setSummaryTotals({
          bags: '0',
          gross: '0',
          bagWeight: '0',
          coarce: '0',
          water: '0',
          boiled: '0',
          rejected: '0',
          netWeight: '0'
        });
        
        setCurrentBagWeight('');
        setCurrentCoarce('');
        setCurrentWater('');
        setCurrentBoiled('');
        setCurrentRejected('');
        
        setOriginalValues({
          bagWeight: '',
          coarce: '',
          water: '',
          boiled: '',
          rejected: ''
        });
        
        setTimeout(() => regNoRef.current?.focus(), 500);
      } else {
        setSnackbarMessage(response.data.message || 'Failed to save deduction');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('❌ Error saving deduction:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to save deduction. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    clearTimeout(bagWeightTimerRef.current);
    clearTimeout(coarceTimerRef.current);
    clearTimeout(waterTimerRef.current);
    clearTimeout(boiledTimerRef.current);

    setCurrentBagWeight('');
    setCurrentCoarce('');
    setCurrentWater('');
    setCurrentBoiled('');
    setCurrentRejected('');
    
    // Reset original values to empty
    setOriginalValues({
      bagWeight: '',
      coarce: '',
      water: '',
      boiled: '',
      rejected: ''
    });
    
    if (bagWeightRef.current) {
      bagWeightRef.current.focus();
    }
  };

  const handleResetSupplier = () => {
    setRegNo('');
    setName('');
    setRoute('');
    setSummaryTotals({
      bags: '0',
      gross: '0',
      bagWeight: '0',
      coarce: '0',
      water: '0',
      boiled: '0',
      rejected: '0',
      netWeight: '0'
    });
    setCurrentBagWeight('');
    setCurrentCoarce('');
    setCurrentWater('');
    setCurrentBoiled('');
    setCurrentRejected('');
    setOriginalValues({
      bagWeight: '',
      coarce: '',
      water: '',
      boiled: '',
      rejected: ''
    });
    setLastSearchedRegNo('');
    regNoRef.current?.focus();
  };

  const handleLeafTypeChange = (value) => {
    setLeafType(value);
    if (regNo && name) {
      setTimeout(() => {
        handleLoadSummary();
      }, 100);
    }
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <DateHeader paperTheme={paperTheme} month={month} />

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
              
              {/* Registration Number with Search Button */}
              <View style={styles.regNoRow}>
                <View style={styles.regNoInputContainer}>
                  <TextInput
                    ref={regNoRef}
                    label="Registration Number"
                    value={regNo}
                    onChangeText={handleRegNoChange}
                    mode="outlined"
                    keyboardType="number-pad"
                    left={<TextInput.Icon icon="card-account-details" color={paperTheme.colors.primary} />}
                    style={styles.fullWidthInput}
                    dense={true}
                    outlineStyle={styles.inputOutline}
                    theme={{ colors: { primary: paperTheme.colors.primary } }}
                    returnKeyType="search"
                    onSubmitEditing={handleManualSearch}
                    right={regNo ? (
                      <TextInput.Icon 
                        icon="close" 
                        onPress={handleResetSupplier}
                        color={paperTheme.colors.error}
                      />
                    ) : null}
                  />
                </View>
                <Button
                  mode="contained"
                  onPress={openSearchModal}
                  style={styles.searchButton}
                  buttonColor={paperTheme.colors.primary}
                  icon="magnify"
                >
                  Browse
                </Button>
              </View>

              {/* Name Field */}
              <TextInput
                label="Name"
                value={name}
                mode="outlined"
                disabled
                left={<TextInput.Icon icon="account" color={paperTheme.colors.textSecondary} />}
                style={[
                  styles.fullWidthInput, 
                  styles.disabledInput, 
                  { backgroundColor: paperTheme.colors.disabled + '20' }
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
                  { backgroundColor: paperTheme.colors.disabled + '20' }
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
                onValueChange={handleLeafTypeChange}
                buttons={[
                  { 
                    value: 'Super', 
                    label: 'Super Leaf',
                    icon: 'star',
                    style: leafType === 'Super' ? styles.selectedSegment : {}
                  },
                  { 
                    value: 'Normal', 
                    label: 'Normal Leaf',
                    icon: 'leaf',
                    style: leafType === 'Normal' ? styles.selectedSegment : {}
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

              {/* Load Summary Button - MUST CLICK THIS FIRST */}
              <Button
                mode="contained"
                onPress={handleLoadSummary}
                loading={loadingSummary}
                disabled={loadingSummary || !regNo || !name}
                style={styles.loadSummaryButton}
                icon="calculator"
                buttonColor={paperTheme.colors.secondary}
              >
                Load Deduction Summary
              </Button>
            </View>

            {/* Bags and Gross Row - This will show 9 after loading summary */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { 
                backgroundColor: paperTheme.colors.primary + '10',
                borderColor: paperTheme.colors.primary + '20'
              }]}>
                <IconButton icon="sack" size={24} iconColor={paperTheme.colors.primary} style={styles.statIcon} />
                <View>
                  <Text style={[styles.statLabel, { color: paperTheme.colors.textSecondary }]}>Total Bags</Text>
                  <Text style={[styles.statValue, { color: paperTheme.colors.primary }]}>{summaryTotals.bags}</Text>
                </View>
              </View>
              <View style={[styles.statBox, { 
                backgroundColor: paperTheme.colors.success + '10',
                borderColor: paperTheme.colors.success + '20'
              }]}>
                <IconButton icon="weight" size={24} iconColor={paperTheme.colors.success} style={styles.statIcon} />
                <View>
                  <Text style={[styles.statLabel, { color: paperTheme.colors.textSecondary }]}>Gross (kg)</Text>
                  <Text style={[styles.statValue, { color: paperTheme.colors.success }]}>{summaryTotals.gross}</Text>
                </View>
              </View>
            </View>

            <Divider style={[styles.divider, { backgroundColor: paperTheme.colors.border }]} />

            {/* Deductions Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: paperTheme.colors.primary }]}>Deductions</Text>
              
              <InputRow
                label="Bag Weight"
                value={currentBagWeight}
                onChange={handleBagWeightChange}
                icon="weight-kilogram"
                totalLabel="Total Bag Weight"
                totalValue={displayedBagWeight}
                totalColor={paperTheme.colors.primary}
                inputRef={bagWeightRef}
                returnKeyType="next"
                onSubmitEditing={() => {
                  clearTimeout(bagWeightTimerRef.current);
                  coarceRef.current?.focus();
                }}
                paperTheme={paperTheme}
              />

              <InputRow
                label="Coarce"
                value={currentCoarce}
                onChange={handleCoarceChange}
                icon="leaf-off"
                totalLabel="Total Coarce"
                totalValue={displayedCoarce}
                totalColor={paperTheme.colors.error}
                inputRef={coarceRef}
                returnKeyType="next"
                onSubmitEditing={() => {
                  clearTimeout(coarceTimerRef.current);
                  waterRef.current?.focus();
                }}
                paperTheme={paperTheme}
              />

              <InputRow
                label="Water"
                value={currentWater}
                onChange={handleWaterChange}
                icon="water"
                totalLabel="Total Water"
                totalValue={displayedWater}
                totalColor={paperTheme.colors.info}
                inputRef={waterRef}
                returnKeyType="next"
                onSubmitEditing={() => {
                  clearTimeout(waterTimerRef.current);
                  boiledRef.current?.focus();
                }}
                paperTheme={paperTheme}
              />

              <InputRow
                label="Boiled"
                value={currentBoiled}
                onChange={handleBoiledChange}
                icon="fire"
                totalLabel="Total Boiled"
                totalValue={displayedBoiled}
                totalColor={paperTheme.colors.warning}
                inputRef={boiledRef}
                returnKeyType="next"
                onSubmitEditing={() => {
                  clearTimeout(boiledTimerRef.current);
                  rejectedRef.current?.focus();
                }}
                paperTheme={paperTheme}
              />

              <InputRow
                label="Rejected"
                value={currentRejected}
                onChange={handleRejectedChange}
                icon="close-circle"
                totalLabel="Total Rejected"
                totalValue={displayedRejected}
                totalColor={paperTheme.colors.error}
                inputRef={rejectedRef}
                returnKeyType="done"
                onSubmitEditing={handleSave}
                paperTheme={paperTheme}
              />
            </View>

            <Divider style={[styles.divider, { backgroundColor: paperTheme.colors.border }]} />

            {/* Net Weight - UI Display Only */}
            <View style={[styles.netWeightContainer, { 
              backgroundColor: paperTheme.colors.success + '10',
              borderColor: paperTheme.colors.success + '30'
            }]}>
              <View style={styles.netWeightLeft}>
                <IconButton icon="scale" size={28} iconColor={paperTheme.colors.success} />
                <Text style={[styles.netWeightLabel, { color: paperTheme.colors.text }]}>Net Weight</Text>
              </View>
              <Text style={[styles.netWeightValue, { color: paperTheme.colors.success }]}>
                {displayedNetWeight} kg
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
                loading={loading}
                disabled={loading || !hasValueChanged()}
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
                disabled={loading}
              >
                Clear
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

     <SearchModal
  visible={searchModalVisible}
  onClose={() => setSearchModalVisible(false)}
  searchQuery={searchQuery}
  onSearchChange={handleSearchInputChange}
  searchResults={searchResults}
  searchLoading={searchLoading}
  onSelectSupplier={selectSupplier}
  onPerformSearch={performSearch} // Add this line
  paperTheme={paperTheme}
  searchInputRef={searchInputRef}
/>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
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
    marginBottom: responsiveSpacing.md,
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
  noteText: {
    fontSize: responsiveFontSize(12),
    textAlign: 'center',
    marginBottom: responsiveSpacing.md,
    fontStyle: 'italic'
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
  regNoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveSpacing.sm,
    marginBottom: responsiveSpacing.sm,
  },
  regNoInputContainer: {
    flex: 1,
  },
  searchButton: {
    height: moderateScale(52),
    justifyContent: 'center',
    borderRadius: moderateScale(12),
    minWidth: responsiveSpacing.xxl,
  },
  loadSummaryButton: {
    marginTop: responsiveSpacing.sm,
    marginBottom: responsiveSpacing.md,
    borderRadius: moderateScale(12),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    padding: responsiveSpacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing.md,
  },
  modalTitle: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
  },
  modalSearchContainer: {
    marginBottom: responsiveSpacing.md,
  },
  modalSearchInput: {
    height: moderateScale(52),
  },
  searchResultsList: {
    maxHeight: responsiveSpacing.xxxl * 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: responsiveSpacing.md,
    borderBottomWidth: 1,
  },
  searchResultLeft: {
    flex: 1,
  },
  searchResultRegNo: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
  },
  searchResultName: {
    fontSize: responsiveFontSize(16),
    marginTop: responsiveSpacing.xs,
  },
  searchResultRoute: {
    fontSize: responsiveFontSize(12),
    marginTop: responsiveSpacing.xs,
  },
  noResultsContainer: {
    padding: responsiveSpacing.xl,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: responsiveFontSize(16),
  },
  modalBackdrop: {
  flex: 1,
  justifyContent: 'flex-end',
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContent: {
  borderTopLeftRadius: moderateScale(24),
  borderTopRightRadius: moderateScale(24),
  padding: responsiveSpacing.lg,
  maxHeight: '90%', // Increased from 80% to give more space
  width: '100%',
},
searchResultsContent: {
  paddingBottom: responsiveSpacing.md,
},
});