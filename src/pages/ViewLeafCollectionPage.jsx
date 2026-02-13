import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Text, 
  Searchbar,
  Chip,
  Surface,
  useTheme as usePaperTheme,
  ActivityIndicator
} from 'react-native-paper';
import { useLeafData } from '../context/LeafDataContext';
import ResponsiveDateHeader from '../../components/ResponsiveDateHeader';
import ResponsiveTable from '../../components/ResponsiveTable';
import { getCurrentDate, getCurrentMonth } from '../utils/dateUtils';

export default function ViewLeafCollectionPage({ navigation }) {
  const paperTheme = usePaperTheme();
  const { leafCollections, leafDeductions } = useLeafData();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const [date] = useState(getCurrentDate());
  const [month] = useState(getCurrentMonth());

  // Combine all collections
  const allCollections = [...leafCollections, ...leafDeductions].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const filteredCollections = allCollections.filter(item =>
    item.regNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.route?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    });
    return unsubscribe;
  }, [navigation]);

  // Table columns configuration
  const columns = [
    { title: 'Reg No', key: 'regNo', numeric: false },
    { title: 'Name', key: 'name', numeric: false, render: (row) => `Supplier ${row.regNo?.slice(-4) || '001'}` },
    { title: 'Bags', key: 'bags', numeric: true },
    { title: 'Gross', key: 'gross', numeric: true },
    { title: 'Bag Wt', key: 'totalBagWeight', numeric: true },
    { title: 'Coarce', key: 'totalCoarce', numeric: true, cellTextStyle: { color: paperTheme.colors.error } },
    { title: 'Water', key: 'totalWater', numeric: true, cellTextStyle: { color: paperTheme.colors.info } },
    { title: 'Boiled', key: 'totalBoiled', numeric: true, cellTextStyle: { color: paperTheme.colors.warning } },
    { title: 'Rejected', key: 'totalRejected', numeric: true, cellTextStyle: { color: paperTheme.colors.error } },
    { title: 'Route', key: 'route', numeric: false },
    { title: 'Net', key: 'netWeight', numeric: true, cellTextStyle: { color: paperTheme.colors.success, fontWeight: 'bold' } },
    { title: 'User', key: 'user', numeric: false, render: () => 'Admin' },
  ];

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: paperTheme.colors.background }]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text style={{ marginTop: 16, color: paperTheme.colors.textSecondary }}>Loading collections...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
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
            textStyle={{ color: '#FFFFFF' }}
          >
            Total: {filteredCollections.length}
          </Chip>
          <Chip 
            icon="weight" 
            style={[styles.chip, { backgroundColor: paperTheme.colors.success }]}
            textStyle={{ color: '#FFFFFF' }}
          >
            Net: {filteredCollections.reduce((sum, item) => sum + (parseFloat(item.netWeight) || 0), 0).toFixed(2)} kg
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
      />
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
  header: {
    padding: 16,
  },
  searchbar: {
    marginTop: 8,
    marginBottom: 12,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
  },
});