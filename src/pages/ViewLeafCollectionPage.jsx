import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
    Button,
    Chip,
    Dialog,
    Portal,
    Searchbar,
    Surface,
    Text,
    useTheme as usePaperTheme
} from 'react-native-paper';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import ResponsiveDateHeader from '../../components/ResponsiveDateHeader';
import ResponsiveTable from '../../components/ResponsiveTable';
import { useLeafData } from '../context/LeafDataContext';
import {
    getModalWidth,
    isTablet,
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
    // Calculate stats
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

  // Table columns configuration
  const columns = [
    { 
      title: 'Reg No', 
      key: 'regNo', 
      width: isTabletDevice ? 100 : 80,
    },
    { 
      title: 'Name', 
      key: 'name', 
      render: (row) => `Supplier ${row.regNo?.slice(-4) || '001'}`,
      width: isTabletDevice ? 120 : 100,
    },
    { 
      title: 'Bags', 
      key: 'bags', 
      numeric: true,
      width: isTabletDevice ? 80 : 60,
    },
    { 
      title: 'Gross', 
      key: 'gross', 
      numeric: true,
      width: isTabletDevice ? 80 : 60,
    },
    { 
      title: 'Bag Wt', 
      key: 'totalBagWeight', 
      numeric: true,
      width: isTabletDevice ? 80 : 60,
    },
    { 
      title: 'Coarce', 
      key: 'totalCoarce', 
      numeric: true, 
      cellTextStyle: { color: paperTheme.colors.error },
      width: isTabletDevice ? 80 : 60,
    },
    { 
      title: 'Water', 
      key: 'totalWater', 
      numeric: true, 
      cellTextStyle: { color: paperTheme.colors.info },
      width: isTabletDevice ? 80 : 60,
    },
    { 
      title: 'Boiled', 
      key: 'totalBoiled', 
      numeric: true, 
      cellTextStyle: { color: paperTheme.colors.warning },
      width: isTabletDevice ? 80 : 60,
    },
    { 
      title: 'Rejected', 
      key: 'totalRejected', 
      numeric: true, 
      cellTextStyle: { color: paperTheme.colors.error },
      width: isTabletDevice ? 80 : 60,
    },
    { 
      title: 'Route', 
      key: 'route',
      width: isTabletDevice ? 120 : 100,
    },
    { 
      title: 'Net', 
      key: 'netWeight', 
      numeric: true, 
      cellTextStyle: { color: paperTheme.colors.success, fontWeight: 'bold' },
      width: isTabletDevice ? 80 : 60,
    },
    { 
      title: 'User', 
      key: 'user', 
      render: () => 'Admin',
      width: isTabletDevice ? 80 : 70,
    },
  ];

  return (
    <ResponsiveContainer>
      <Surface style={[styles.header, { backgroundColor: paperTheme.colors.surface, elevation: 4 }]}>
        <ResponsiveDateHeader />
        
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
            style={[styles.chip, { backgroundColor: paperTheme.colors.primary }]}
            textStyle={{ color: '#FFFFFF', fontSize: responsiveFontSize(12) }}
          >
            Total: {stats.total}
          </Chip>
          <Chip 
            icon="weight" 
            style={[styles.chip, { backgroundColor: paperTheme.colors.success }]}
            textStyle={{ color: '#FFFFFF', fontSize: responsiveFontSize(12) }}
          >
            Net: {stats.netWeight.toFixed(2)} kg
          </Chip>
        </View>
      </Surface>

      <ResponsiveTable
        columns={columns}
        data={filteredCollections}
        page={page}
        onPageChange={setPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredCollections.length}
        loading={loading}
        onRowPress={handleRowPress}
        emptyMessage="No leaf collections found"
      />

      {/* Details Dialog */}
      <Portal>
        <Dialog 
          visible={dialogVisible} 
          onDismiss={() => setDialogVisible(false)}
          style={[styles.dialog, { width: getModalWidth() }]}
        >
          <Dialog.Title style={styles.dialogTitle}>
            Collection Details
          </Dialog.Title>
          <Dialog.Content>
            {selectedItem && (
              <View style={styles.dialogContent}>
                <View style={styles.dialogRow}>
                  <Text style={styles.dialogLabel}>Registration No:</Text>
                  <Text style={styles.dialogValue}>{selectedItem.regNo}</Text>
                </View>
                <View style={styles.dialogRow}>
                  <Text style={styles.dialogLabel}>Route:</Text>
                  <Text style={styles.dialogValue}>{selectedItem.route}</Text>
                </View>
                <View style={styles.dialogRow}>
                  <Text style={styles.dialogLabel}>Date:</Text>
                  <Text style={styles.dialogValue}>{selectedItem.date} {selectedItem.month}</Text>
                </View>
                <View style={styles.dialogRow}>
                  <Text style={styles.dialogLabel}>Bags:</Text>
                  <Text style={styles.dialogValue}>{selectedItem.bags}</Text>
                </View>
                <View style={styles.dialogRow}>
                  <Text style={styles.dialogLabel}>Gross Weight:</Text>
                  <Text style={styles.dialogValue}>{selectedItem.gross} kg</Text>
                </View>
                <View style={styles.dialogRow}>
                  <Text style={styles.dialogLabel}>Bag Weight:</Text>
                  <Text style={styles.dialogValue}>{selectedItem.totalBagWeight} kg</Text>
                </View>
                <View style={styles.dialogRow}>
                  <Text style={styles.dialogLabel}>Coarce:</Text>
                  <Text style={[styles.dialogValue, { color: paperTheme.colors.error }]}>
                    {selectedItem.totalCoarce} kg
                  </Text>
                </View>
                <View style={styles.dialogRow}>
                  <Text style={styles.dialogLabel}>Water:</Text>
                  <Text style={[styles.dialogValue, { color: paperTheme.colors.info }]}>
                    {selectedItem.totalWater} kg
                  </Text>
                </View>
                <View style={styles.dialogRow}>
                  <Text style={styles.dialogLabel}>Boiled:</Text>
                  <Text style={[styles.dialogValue, { color: paperTheme.colors.warning }]}>
                    {selectedItem.totalBoiled} kg
                  </Text>
                </View>
                <View style={styles.dialogRow}>
                  <Text style={styles.dialogLabel}>Rejected:</Text>
                  <Text style={[styles.dialogValue, { color: paperTheme.colors.error }]}>
                    {selectedItem.totalRejected} kg
                  </Text>
                </View>
                <View style={[styles.dialogRow, styles.netRow]}>
                  <Text style={styles.dialogLabel}>Net Weight:</Text>
                  <Text style={[styles.dialogValue, { color: paperTheme.colors.success, fontWeight: 'bold' }]}>
                    {selectedItem.netWeight} kg
                  </Text>
                </View>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: responsiveSpacing.md,
    marginBottom: responsiveSpacing.sm,
  },
  searchbar: {
    marginTop: responsiveSpacing.sm,
    marginBottom: responsiveSpacing.md,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: responsiveSpacing.sm,
  },
  chip: {
    marginRight: responsiveSpacing.xs,
    marginBottom: responsiveSpacing.xs,
  },
  dialog: {
    alignSelf: 'center',
  },
  dialogTitle: {
    textAlign: 'center',
  },
  dialogContent: {
    paddingVertical: responsiveSpacing.sm,
  },
  dialogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: responsiveSpacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  netRow: {
    marginTop: responsiveSpacing.md,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  dialogLabel: {
    fontSize: responsiveFontSize(14),
    color: '#757575',
  },
  dialogValue: {
    fontSize: responsiveFontSize(14),
    fontWeight: '500',
  },
});