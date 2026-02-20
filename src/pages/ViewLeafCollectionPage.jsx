import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  DataTable,
  Dialog,
  IconButton,
  Portal,
  Searchbar,
  Surface,
  Text,
  useTheme as usePaperTheme
} from 'react-native-paper';
import { collectionViewApi } from '../api/leafApi'; // Add this import
import { getCurrentDate, getCurrentMonth } from '../utils/dateUtils';
import {
  isTablet,
  moderateScale,
  responsiveFontSize,
  responsiveSpacing
} from '../utils/responsiveUtils';

export default function ViewLeafCollectionPage({ navigation }) {
  const paperTheme = usePaperTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [stats, setStats] = useState({ total: 0, netWeight: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const isTabletDevice = isTablet();

  // Enhanced Date Header with Today's date and Current month styling
  const DateHeader = () => {
    const date = getCurrentDate();
    const month = getCurrentMonth();
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

  // Fetch collections from API
  const fetchCollections = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching today\'s collections from API');
      const response = await collectionViewApi.getTodayCollections();
      
      if (response.data.success) {
        console.log(`✅ Received ${response.data.data.length} grouped collections`);
        setCollections(response.data.data);
      } else {
        console.error('❌ API returned success: false');
        setCollections([]);
      }
    } catch (error) {
      console.error('❌ Error fetching collections:', error);
      setCollections([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCollections();
    });
    return unsubscribe;
  }, [navigation]);

  // Filter collections based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCollections(collections);
    } else {
      const searchLower = searchQuery.toLowerCase();
      const filtered = collections.filter(item => {
        const regNoStr = item.regNo?.toString() || '';
        const routeStr = item.route?.toString() || '';
        const nameStr = item.supplierName?.toString() || '';
        
        return regNoStr.toLowerCase().includes(searchLower) ||
               routeStr.toLowerCase().includes(searchLower) ||
               nameStr.toLowerCase().includes(searchLower);
      });
      setFilteredCollections(filtered);
    }
  }, [searchQuery, collections]);

  // Update stats when filtered collections change
  useEffect(() => {
    const total = filteredCollections.length;
    const net = filteredCollections.reduce((sum, item) => 
      sum + (parseInt(item.netWeight) || 0), 0
    );
    setStats({ total, netWeight: net });
  }, [filteredCollections]);

  const handleRowPress = (item) => {
    setSelectedItem(item);
    setDialogVisible(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCollections();
  };

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredCollections.length);

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: paperTheme.colors.background }]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text style={[styles.loadingText, { color: paperTheme.colors.textSecondary }]}>Loading collections...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Surface style={[styles.header, { backgroundColor: paperTheme.colors.surface, elevation: 4 }]}>
        <DateHeader />
        
        {/* Search bar with icon - simplified */}
        <Searchbar
          placeholder="Search by registration or route"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: paperTheme.colors.background }]}
          iconColor={paperTheme.colors.primary}
          inputStyle={{ color: paperTheme.colors.text }}
          placeholderTextColor={paperTheme.colors.textSecondary}
        />
        
        {/* Stats with refresh icon on the right */}
        <View style={styles.statsContainer}>
          <View style={styles.statsWrapper}>
            <Chip 
              icon="leaf" 
              style={[styles.chip, { backgroundColor: paperTheme.colors.primary + '15' }]}
              textStyle={{ color: paperTheme.colors.primary, fontSize: responsiveFontSize(16), fontWeight: '700' }}
            >
              Total: {stats.total}
            </Chip>
            <Chip 
              icon="weight" 
              style={[styles.chip, { backgroundColor: paperTheme.colors.success + '15' }]}
              textStyle={{ color: paperTheme.colors.success, fontSize: responsiveFontSize(16), fontWeight: '700' }}
            >
              Net: {stats.netWeight} kg
            </Chip>
          </View>
          <IconButton
            icon="refresh"
            size={24}
            onPress={handleRefresh}
            iconColor={paperTheme.colors.primary}
            style={styles.refreshButton}
            disabled={refreshing}
          />
        </View>
      </Surface>

      {/* Table with Borders */}
      <View style={styles.tableWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          style={styles.horizontalScroll}
        >
          <View style={styles.tableContainer}>
            {/* Header Row */}
            <View style={[styles.headerRow, { backgroundColor: paperTheme.colors.primary + '15' }]}>
              <Text style={[styles.headerCell, styles.regNoColumn, { color: paperTheme.colors.primary }]}>Reg No</Text>
              <Text style={[styles.headerCell, styles.nameColumn, { color: paperTheme.colors.primary }]}>Name</Text>
              <Text style={[styles.headerCell, styles.smallColumn, { color: paperTheme.colors.primary }]}>Bags</Text>
              <Text style={[styles.headerCell, styles.mediumColumn, { color: paperTheme.colors.primary }]}>Gross</Text>
              <Text style={[styles.headerCell, styles.mediumColumn, { color: paperTheme.colors.primary }]}>Bag Wt</Text>
              <Text style={[styles.headerCell, styles.mediumColumn, { color: paperTheme.colors.primary }]}>Coarce</Text>
              <Text style={[styles.headerCell, styles.mediumColumn, { color: paperTheme.colors.primary }]}>Water</Text>
              <Text style={[styles.headerCell, styles.mediumColumn, { color: paperTheme.colors.primary }]}>Boiled</Text>
              <Text style={[styles.headerCell, styles.mediumColumn, { color: paperTheme.colors.primary }]}>Rejected</Text>
              <Text style={[styles.headerCell, styles.routeColumn, { color: paperTheme.colors.primary }]}>Route</Text>
              <Text style={[styles.headerCell, styles.mediumColumn, styles.lastColumn, { color: paperTheme.colors.primary }]}>Net</Text>
            </View>

            {/* Data Rows */}
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={true}>
              {filteredCollections.length > 0 ? (
                filteredCollections.slice(from, to).map((item, index) => (
                  <View 
                    key={item.regNo || index}
                    style={[
                      styles.dataRow,
                      { backgroundColor: index % 2 === 0 ? paperTheme.colors.surface : paperTheme.colors.background }
                    ]}
                    onTouchEnd={() => handleRowPress(item)}
                  >
                    <Text style={[styles.dataCell, styles.regNoColumn, { color: paperTheme.colors.text }]}>
                      {item.regNo || 'N/A'}
                    </Text>
                    <Text style={[styles.dataCell, styles.nameColumn, { color: paperTheme.colors.text }]}>
                      {item.supplierName || `Sup ${item.regNo?.toString().slice(-4) || '001'}`}
                    </Text>
                    <Text style={[styles.dataCell, styles.smallColumn, { color: paperTheme.colors.text }]}>
                      {item.bags || '0'}
                    </Text>
                    <Text style={[styles.dataCell, styles.mediumColumn, { color: paperTheme.colors.text }]}>
                      {item.gross || '0'}
                    </Text>
                    <Text style={[styles.dataCell, styles.mediumColumn, { color: paperTheme.colors.text }]}>
                      {item.totalBagWeight || '0'}
                    </Text>
                    <Text style={[styles.dataCell, styles.mediumColumn, { color: paperTheme.colors.text }]}>
                      {item.totalCoarce || '0'}
                    </Text>
                    <Text style={[styles.dataCell, styles.mediumColumn, { color: paperTheme.colors.text }]}>
                      {item.totalWater || '0'}
                    </Text>
                    <Text style={[styles.dataCell, styles.mediumColumn, { color: paperTheme.colors.text }]}>
                      {item.totalBoiled || '0'}
                    </Text>
                    <Text style={[styles.dataCell, styles.mediumColumn, { color: paperTheme.colors.text }]}>
                      {item.totalRejected || '0'}
                    </Text>
                    <Text style={[styles.dataCell, styles.routeColumn, { color: paperTheme.colors.text }]}>
                      {item.route || 'N/A'}
                    </Text>
                    <Text style={[styles.dataCell, styles.mediumColumn, styles.lastColumn, { color: paperTheme.colors.success, fontWeight: '600' }]}>
                      {item.netWeight || '0'}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={[styles.noDataText, { color: paperTheme.colors.textSecondary }]}>
                    No collections found for today
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Pagination */}
      {filteredCollections.length > 0 && (
        <DataTable.Pagination
          page={page}
          numberOfPages={Math.ceil(filteredCollections.length / itemsPerPage)}
          onPageChange={setPage}
          label={`${from + 1}-${to} of ${filteredCollections.length}`}
          showFastPaginationControls
          numberOfItemsPerPage={itemsPerPage}
          style={[styles.pagination, { backgroundColor: paperTheme.colors.surface, borderTopColor: paperTheme.colors.border }]}
          labelStyle={{ color: paperTheme.colors.text }}
        />
      )}

      {/* Details Dialog */}
      <Portal>
        <Dialog 
          visible={dialogVisible} 
          onDismiss={() => setDialogVisible(false)}
          style={[styles.dialog, { backgroundColor: paperTheme.colors.surface }]}
        >
          <Dialog.Title style={[styles.dialogTitle, { color: paperTheme.colors.primary }]}>
            Collection Details
          </Dialog.Title>
          <Dialog.Content>
            {selectedItem && (
              <View style={styles.dialogContent}>
                {Object.entries({
                  'Registration No': selectedItem.regNo,
                  'Supplier Name': selectedItem.supplierName,
                  'Route': selectedItem.route,
                  'Date': `${selectedItem.date} ${selectedItem.month}`,
                  'Bags': selectedItem.bags,
                  'Gross Weight': `${selectedItem.gross} kg`,
                  'Bag Weight': `${selectedItem.totalBagWeight} kg`,
                  'Coarce': `${selectedItem.totalCoarce} kg`,
                  'Water': `${selectedItem.totalWater} kg`,
                  'Boiled': `${selectedItem.totalBoiled} kg`,
                  'Rejected': `${selectedItem.totalRejected} kg`,
                  'Net Weight': `${selectedItem.netWeight} kg`,
                  'Collections': selectedItem.collectionCount || 'N/A',
                  'Deductions': selectedItem.deductionCount || 'N/A'
                }).map(([label, value], index) => (
                  <View key={index} style={[styles.dialogRow, { borderBottomColor: paperTheme.colors.border }]}>
                    <Text style={[styles.dialogLabel, { color: paperTheme.colors.textSecondary }]}>{label}:</Text>
                    <Text style={[
                      styles.dialogValue, 
                      { color: label === 'Net Weight' ? paperTheme.colors.success : paperTheme.colors.text }
                    ]}>
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

// Add this new style to your existing styles
const styles = StyleSheet.create({
  // ... keep all your existing styles exactly as they are ...
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: responsiveSpacing.md,
    fontSize: responsiveFontSize(14),
  },
  header: {
    padding: responsiveSpacing.md,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    gap: responsiveSpacing.md,
    marginBottom: responsiveSpacing.md,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing.sm,
    borderRadius: moderateScale(12),
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
  searchbar: {
    marginVertical: responsiveSpacing.sm,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: responsiveSpacing.xs,
  },
  statsWrapper: {
    flex: 1,
    flexDirection: 'row',
    gap: responsiveSpacing.sm,
  },
  chip: {
    height: moderateScale(36),
  },
  tableWrapper: {
    flex: 1,
    margin: responsiveSpacing.sm,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  horizontalScroll: {
    flex: 1,
  },
  tableContainer: {
    minWidth: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerCell: {
    paddingVertical: responsiveSpacing.md,
    paddingHorizontal: responsiveSpacing.sm,
    fontSize: responsiveFontSize(13),
    fontWeight: '700',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    textAlign: 'center',
  },
  dataCell: {
    paddingVertical: responsiveSpacing.sm,
    paddingHorizontal: responsiveSpacing.sm,
    fontSize: responsiveFontSize(12),
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    textAlign: 'center',
  },
  // Column widths for consistent alignment
  regNoColumn: {
    width: moderateScale(100),
    textAlign: 'center',
  },
  nameColumn: {
    width: moderateScale(100),
    textAlign: 'center',
  },
  smallColumn: {
    width: moderateScale(60),
    textAlign: 'center',
  },
  mediumColumn: {
    width: moderateScale(80),
    textAlign: 'center',
  },
  routeColumn: {
    width: moderateScale(100),
    textAlign: 'center',
  },
  lastColumn: {
    borderRightWidth: 0,
  },
  pagination: {
    paddingHorizontal: responsiveSpacing.md,
    borderTopWidth: 1,
  },
  dialog: {
    borderRadius: moderateScale(12),
  },
  dialogTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dialogContent: {
    paddingVertical: responsiveSpacing.sm,
  },
  dialogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: responsiveSpacing.xs,
    borderBottomWidth: 1,
  },
  dialogLabel: {
    fontSize: responsiveFontSize(13),
  },
  dialogValue: {
    fontSize: responsiveFontSize(13),
    fontWeight: '500',
  },
  refreshButton: {
    margin: 0,
    marginLeft: responsiveSpacing.sm,
  },
});