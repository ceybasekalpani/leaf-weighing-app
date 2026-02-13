import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, DataTable, Text, useTheme } from 'react-native-paper';
import {
    getTableMinWidth,
    isTablet,
    moderateScale,
    responsiveFontSize,
    responsiveSpacing
} from '../src/utils/responsiveUtils';

const { width, height } = Dimensions.get('window');

const ResponsiveTable = ({ 
  columns, 
  data, 
  page, 
  onPageChange, 
  itemsPerPage, 
  totalItems,
  loading,
  onRowPress,
  emptyMessage = "No data available"
}) => {
  const theme = useTheme();
  const isTabletDevice = isTablet();
  const tableMinWidth = getTableMinWidth();
  const [tableHeight, setTableHeight] = useState(height * 0.6);

  useEffect(() => {
    // Adjust table height based on device
    if (isTabletDevice) {
      setTableHeight(height * 0.7);
    } else {
      setTableHeight(height * 0.5);
    }
  }, [isTabletDevice]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading data...
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, totalItems);

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal={!isTabletDevice} 
        showsHorizontalScrollIndicator={true}
        style={styles.horizontalScroll}
      >
        <ScrollView 
          style={[styles.verticalScroll, { maxHeight: tableHeight }]} 
          showsVerticalScrollIndicator={true}
        >
          <DataTable style={[styles.table, { minWidth: tableMinWidth }]}>
            {/* Header */}
            <DataTable.Header style={[styles.header, { backgroundColor: theme.colors.primary }]}>
              {columns.map((column, index) => (
                <DataTable.Title
                  key={index}
                  numeric={column.numeric}
                  style={[
                    styles.column, 
                    column.style,
                    { width: column.width || 'auto' }
                  ]}
                  textStyle={[
                    styles.headerText, 
                    { color: '#FFFFFF' }, 
                    column.textStyle
                  ]}
                >
                  {column.title}
                </DataTable.Title>
              ))}
            </DataTable.Header>

            {/* Rows */}
            {data.slice(from, to).map((row, rowIndex) => (
              <DataTable.Row 
                key={row.id || rowIndex}
                onPress={() => onRowPress && onRowPress(row)}
                style={[
                  styles.row,
                  { 
                    backgroundColor: rowIndex % 2 === 0 ? theme.colors.surface : theme.colors.background,
                    minHeight: moderateScale(48),
                  },
                  onRowPress && styles.clickableRow,
                ]}
              >
                {columns.map((column, colIndex) => (
                  <DataTable.Cell
                    key={colIndex}
                    numeric={column.numeric}
                    style={[
                      styles.cell, 
                      column.cellStyle,
                      { width: column.width || 'auto' }
                    ]}
                    textStyle={[
                      { 
                        color: theme.colors.text, 
                        fontSize: responsiveFontSize(14) 
                      },
                      column.cellTextStyle
                    ]}
                  >
                    {column.render ? column.render(row) : row[column.key] || 'N/A'}
                  </DataTable.Cell>
                ))}
              </DataTable.Row>
            ))}
          </DataTable>
        </ScrollView>
      </ScrollView>

      {/* Pagination */}
      {totalItems > 0 && (
        <View style={[styles.paginationContainer, { backgroundColor: theme.colors.surface }]}>
          <DataTable.Pagination
            page={page}
            numberOfPages={Math.ceil(totalItems / itemsPerPage)}
            onPageChange={onPageChange}
            label={`${from + 1}-${to} of ${totalItems}`}
            showFastPaginationControls
            numberOfItemsPerPage={itemsPerPage}
            style={styles.pagination}
            labelStyle={{ color: theme.colors.text, fontSize: responsiveFontSize(12) }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveSpacing.xl,
  },
  loadingText: {
    marginTop: responsiveSpacing.md,
    fontSize: responsiveFontSize(16),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveSpacing.xl,
  },
  emptyText: {
    fontSize: responsiveFontSize(16),
    textAlign: 'center',
  },
  horizontalScroll: {
    flex: 1,
  },
  verticalScroll: {
    flex: 1,
  },
  table: {
    flex: 1,
  },
  header: {
    height: moderateScale(56),
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: responsiveFontSize(14),
  },
  column: {
    paddingHorizontal: responsiveSpacing.sm,
  },
  row: {
    minHeight: moderateScale(48),
  },
  clickableRow: {
    cursor: 'pointer',
  },
  cell: {
    paddingHorizontal: responsiveSpacing.sm,
  },
  paginationContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: responsiveSpacing.xs,
  },
  pagination: {
    paddingHorizontal: responsiveSpacing.md,
  },
});

export default ResponsiveTable;