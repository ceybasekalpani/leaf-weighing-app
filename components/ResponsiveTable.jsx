import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { DataTable, useTheme, Text } from 'react-native-paper';
import { isTablet, getTableMinWidth, responsiveFontSize } from '../src/utils/responsiveUtils';

const { width } = Dimensions.get('window');

const ResponsiveTable = ({ 
  columns, 
  data, 
  page, 
  onPageChange, 
  itemsPerPage, 
  totalItems,
  loading 
}) => {
  const theme = useTheme();
  const isTabletDevice = isTablet();
  const tableMinWidth = getTableMinWidth();

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal={!isTabletDevice} 
        showsHorizontalScrollIndicator={true}
        style={styles.horizontalScroll}
      >
        <ScrollView 
          style={styles.verticalScroll} 
          showsVerticalScrollIndicator={true}
        >
          <DataTable style={[styles.table, { minWidth: tableMinWidth }]}>
            {/* Header */}
            <DataTable.Header style={[styles.header, { backgroundColor: theme.colors.primary }]}>
              {columns.map((column, index) => (
                <DataTable.Title
                  key={index}
                  numeric={column.numeric}
                  style={[styles.column, column.style]}
                  textStyle={[styles.headerText, { color: '#FFFFFF' }, column.textStyle]}
                >
                  {column.title}
                </DataTable.Title>
              ))}
            </DataTable.Header>

            {/* Rows */}
            {data.map((row, rowIndex) => (
              <DataTable.Row 
                key={row.id || rowIndex}
                style={[
                  styles.row,
                  { backgroundColor: rowIndex % 2 === 0 ? theme.colors.surface : theme.colors.background }
                ]}
              >
                {columns.map((column, colIndex) => (
                  <DataTable.Cell
                    key={colIndex}
                    numeric={column.numeric}
                    style={[styles.cell, column.cellStyle]}
                    textStyle={[
                      { color: theme.colors.text, fontSize: responsiveFontSize(14) },
                      column.cellTextStyle
                    ]}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </DataTable.Cell>
                ))}
              </DataTable.Row>
            ))}

            {/* Pagination */}
            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(totalItems / itemsPerPage)}
              onPageChange={onPageChange}
              label={`${page * itemsPerPage + 1}-${Math.min((page + 1) * itemsPerPage, totalItems)} of ${totalItems}`}
              showFastPaginationControls
              numberOfItemsPerPage={itemsPerPage}
              style={[styles.pagination, { backgroundColor: theme.colors.surface }]}
              labelStyle={{ color: theme.colors.text, fontSize: responsiveFontSize(12) }}
            />
          </DataTable>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    height: 56,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: responsiveFontSize(14),
  },
  column: {
    paddingHorizontal: 8,
  },
  row: {
    minHeight: 48,
  },
  cell: {
    paddingHorizontal: 8,
  },
  pagination: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

export default ResponsiveTable;