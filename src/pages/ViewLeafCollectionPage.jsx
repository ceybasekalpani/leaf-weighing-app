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
import { useLeafData } from '../context/LeafDataContext';
import { getCurrentDate, getCurrentMonth } from '../utils/dateUtils';
import {
    isTablet,
    moderateScale,
    responsiveFontSize,
    responsiveSpacing
} from '../utils/responsiveUtils';

export default function ViewLeafCollectionPage({ navigation }) {
  const paperTheme = usePaperTheme();
  const { leafCollections, leafDeductions } = useLeafData();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [stats, setStats] = useState({ total: 0, netWeight: 0 });

  const isTabletDevice = isTablet();

  // Date Header
  const DateHeader = () => {
    const date = getCurrentDate();
    const month = getCurrentMonth();
    
    return (
      <View style={styles.dateHeaderContainer}>
        <View style={[styles.dateBox, { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.border }]}>
          <IconButton icon="calendar" size={18} iconColor={paperTheme.colors.primary} />
          <View>
            <Text style={[styles.dateLabel, { color: paperTheme.colors.textSecondary }]}>Date</Text>
            <Text style={[styles.dateValue, { color: paperTheme.colors.primary }]}>{date}</Text>
          </View>
        </View>
        <View style={[styles.dateBox, { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.border }]}>
          <IconButton icon="calendar-month" size={18} iconColor={paperTheme.colors.secondary} />
          <View>
            <Text style={[styles.dateLabel, { color: paperTheme.colors.textSecondary }]}>Month</Text>
            <Text style={[styles.dateValue, { color: paperTheme.colors.secondary }]}>{month}</Text>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    });
    return unsubscribe;
  }, [navigation]);

  // Combine all collections
  const allCollections = [...leafCollections, ...leafDeductions].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const filteredCollections = allCollections.filter(item =>
    item.regNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.route?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const total = filteredCollections.length;
    const net = filteredCollections.reduce((sum, item) => 
      sum + (parseFloat(item.netWeight) || 0), 0
    );
    setStats({ total, netWeight: net });
  }, [filteredCollections]);

  const handleRowPress = (item) => {
    setSelectedItem(item);
    setDialogVisible(true);
  };

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredCollections.length);

  if (loading) {
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
        
        <Searchbar
          placeholder="Search by registration or route"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: paperTheme.colors.background }]}
          iconColor={paperTheme.colors.primary}
          inputStyle={{ color: paperTheme.colors.text }}
          placeholderTextColor={paperTheme.colors.textSecondary}
        />
        
        <View style={styles.statsContainer}>
          <Chip 
            icon="leaf" 
            style={[styles.chip, { backgroundColor: paperTheme.colors.primary + '15' }]}
            textStyle={{ color: paperTheme.colors.primary, fontSize: responsiveFontSize(12), fontWeight: '600' }}
          >
            Total: {stats.total}
          </Chip>
          <Chip 
            icon="weight" 
            style={[styles.chip, { backgroundColor: paperTheme.colors.success + '15' }]}
            textStyle={{ color: paperTheme.colors.success, fontSize: responsiveFontSize(12), fontWeight: '600' }}
          >
            Net: {stats.netWeight.toFixed(2)} kg
          </Chip>
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
              {filteredCollections.slice(from, to).map((item, index) => (
                <View 
                  key={item.id || index}
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
                    Sup {item.regNo?.slice(-4) || '001'}
                  </Text>
                  <Text style={[styles.dataCell, styles.smallColumn, { color: paperTheme.colors.text }]}>
                    {item.bags || '0'}
                  </Text>
                  <Text style={[styles.dataCell, styles.mediumColumn, { color: paperTheme.colors.text }]}>
                    {item.gross || '0'}
                  </Text>
                  <Text style={[styles.dataCell, styles.mediumColumn, { color: paperTheme.colors.text }]}>
                    {item.totalBagWeight || '0.00'}
                  </Text>
                  <Text style={[styles.dataCell, styles.mediumColumn, { color: paperTheme.colors.text }]}>
                    {item.totalCoarce || '0.00'}
                  </Text>
                  <Text style={[styles.dataCell, styles.mediumColumn, { color: paperTheme.colors.text }]}>
                    {item.totalWater || '0.00'}
                  </Text>
                  <Text style={[styles.dataCell, styles.mediumColumn, { color: paperTheme.colors.text }]}>
                    {item.totalBoiled || '0.00'}
                  </Text>
                  <Text style={[styles.dataCell, styles.mediumColumn, { color: paperTheme.colors.text }]}>
                    {item.totalRejected || '0.00'}
                  </Text>
                  <Text style={[styles.dataCell, styles.routeColumn, { color: paperTheme.colors.text }]}>
                    {item.route || 'N/A'}
                  </Text>
                  <Text style={[styles.dataCell, styles.mediumColumn, styles.lastColumn, { color: paperTheme.colors.success, fontWeight: '600' }]}>
                    {item.netWeight || '0.00'}
                  </Text>
                </View>
              ))}
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
                  'Route': selectedItem.route,
                  'Date': `${selectedItem.date} ${selectedItem.month}`,
                  'Bags': selectedItem.bags,
                  'Gross Weight': `${selectedItem.gross} kg`,
                  'Bag Weight': `${selectedItem.totalBagWeight} kg`,
                  'Coarce': `${selectedItem.totalCoarce} kg`,
                  'Water': `${selectedItem.totalWater} kg`,
                  'Boiled': `${selectedItem.totalBoiled} kg`,
                  'Rejected': `${selectedItem.totalRejected} kg`,
                  'Net Weight': `${selectedItem.netWeight} kg`
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

const styles = StyleSheet.create({
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
    gap: responsiveSpacing.sm,
    marginBottom: responsiveSpacing.sm,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing.xs,
    borderRadius: moderateScale(8),
    borderWidth: 1,
  },
  dateLabel: {
    fontSize: responsiveFontSize(11),
  },
  dateValue: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
  },
  searchbar: {
    marginVertical: responsiveSpacing.sm,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: responsiveSpacing.sm,
  },
  chip: {
    height: moderateScale(32),
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
});