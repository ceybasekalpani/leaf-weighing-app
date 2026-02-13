import React from 'react';
import { View, StyleSheet } from 'react-native';
import { isTablet, getGridColumns, responsiveSpacing } from '../src/utils/responsiveUtils';

const ResponsiveGrid = ({ children, spacing = responsiveSpacing.sm }) => {
  const isTabletDevice = isTablet();
  const columns = getGridColumns();

  if (!isTabletDevice) {
    return <View style={styles.mobileContainer}>{children}</View>;
  }

  // For tablet, arrange children in grid
  const rows = [];
  for (let i = 0; i < React.Children.count(children); i += columns) {
    const rowChildren = [];
    for (let j = 0; j < columns; j++) {
      if (i + j < React.Children.count(children)) {
        rowChildren.push(
          <View key={j} style={[styles.gridItem, { width: `${100 / columns}%` }]}>
            {React.Children.toArray(children)[i + j]}
          </View>
        );
      }
    }
    rows.push(
      <View key={i} style={[styles.row, { marginBottom: spacing }]}>
        {rowChildren}
      </View>
    );
  }

  return <View style={styles.gridContainer}>{rows}</View>;
};

const styles = StyleSheet.create({
  mobileContainer: {
    width: '100%',
  },
  gridContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    paddingHorizontal: responsiveSpacing.xs,
  },
});

export default ResponsiveGrid;