import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  useTheme as usePaperTheme,
} from 'react-native-paper';
import {
  moderateScale,
  responsiveFontSize,
  responsiveSpacing
} from '../utils/responsiveUtils';

export default function AddLeafCountPage() {
  const paperTheme = usePaperTheme();
  
  const [date, setDate] = useState('');
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [month, setMonth] = useState('');
  const [route, setRoute] = useState('');
  const [routeMenuVisible, setRouteMenuVisible] = useState(false);
  const [bestLeaf, setBestLeaf] = useState('');
  const [bellowBest, setBellowBest] = useState('');
  const [poor, setPoor] = useState('');

  const routes = [
    'Hapugastenna',
    'Nawalapitiya',
    'Ginigathhena',
    'Hatton',
    'Dickoya',
    'Maskeliya',
    'Talawakele',
    'Bogawantalawa',
    'Norwood',
    'Watawala',
  ];

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

  const handleSave = () => {
    const leafCount = {
      date,
      month,
      route,
      bestLeaf,
      bellowBest,
      poor,
      timestamp: new Date().toISOString(),
    };
    console.log('Saving leaf count:', leafCount);
    // Here you would save to your context/storage
    handleClear();
  };

  const handleClear = () => {
    setDate('');
    setMonth('');
    setRoute('');
    setBestLeaf('');
    setBellowBest('');
    setPoor('');
    setSelectedDay('');
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
    for (let i = 1; i <= 31; i++) {
      days.push(
        <Button
          key={i}
          mode={selectedDay === i.toString() ? "contained" : "outlined"}
          onPress={() => handleDaySelect(i.toString())}
          style={styles.dayButton}
          labelStyle={styles.dayButtonLabel}
          buttonColor={selectedDay === i.toString() ? paperTheme.colors.primary : undefined}
          textColor={selectedDay === i.toString() ? 'white' : paperTheme.colors.primary}
          compact={true}
        >
          {i}
        </Button>
      );
    }
    return days;
  };

  // Date Header Component
  const DateHeader = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'short' });
    const currentYear = currentDate.getFullYear();
    
    return (
      <View style={styles.dateHeaderContainer}>
        <View style={[styles.dateBox, { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.border }]}>
          <IconButton 
            icon="calendar" 
            size={20} 
            iconColor={paperTheme.colors.primary}
          />
          <View>
            <Text style={[styles.dateLabel, { color: paperTheme.colors.textSecondary }]}>Today's Date</Text>
            <Text style={[styles.dateValue, { color: paperTheme.colors.primary }]}>
              {currentDate.getDate().toString()}
            </Text>
          </View>
        </View>
        <View style={[styles.dateBox, { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.border }]}>
          <IconButton icon="calendar-month" size={20} iconColor={paperTheme.colors.secondary} />
          <View>
            <Text style={[styles.dateLabel, { color: paperTheme.colors.textSecondary }]}>Current Month</Text>
            <Text style={[styles.dateValue, { color: paperTheme.colors.secondary }]}>
              {`${currentMonth}-${currentYear}`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <DateHeader />

      <Card style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}>
        <Card.Content>
          <View style={styles.headerContainer}>
            <IconButton icon="leaf-circle" size={28} iconColor={paperTheme.colors.primary} />
            <Text variant="titleLarge" style={[styles.title, { color: paperTheme.colors.primary }]}>
              Add Leaf Count
            </Text>
          </View>

          {/* Date Input with Dialog */}
          <TouchableOpacity onPress={openDateDialog}>
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
                theme={{ colors: { primary: paperTheme.colors.primary, text: paperTheme.colors.text } }}
              />
            </View>
          </TouchableOpacity>

          <Portal>
            <Dialog visible={showDateDialog} onDismiss={() => setShowDateDialog(false)} style={styles.dateDialog}>
              <Dialog.Title>Select Day</Dialog.Title>
              <Dialog.Content style={styles.dialogContent}>
                <View style={styles.calendarContainer}>
                  {renderDayButtons()}
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setShowDateDialog(false)}>Cancel</Button>
                <Button onPress={handleDateConfirm}>OK</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>

          {/* Month Dropdown - Current and Previous Months Only */}
          <Menu
            visible={monthMenuVisible}
            onDismiss={() => setMonthMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMonthMenuVisible(true)}>
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
                    theme={{ colors: { primary: paperTheme.colors.primary, text: paperTheme.colors.text } }}
                  />
                </View>
              </TouchableOpacity>
            }
            style={{ backgroundColor: paperTheme.colors.surface }}
          >
            {months.map((m) => (
              <Menu.Item
                key={m}
                onPress={() => {
                  setMonth(m);
                  setMonthMenuVisible(false);
                }}
                title={m}
                titleStyle={{ color: paperTheme.colors.text }}
              />
            ))}
          </Menu>

          {/* Route Dropdown */}
          <Menu
            visible={routeMenuVisible}
            onDismiss={() => setRouteMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setRouteMenuVisible(true)}>
                <View pointerEvents="none">
                  <TextInput
                    label="Route Name"
                    value={route}
                    mode="outlined"
                    placeholder="Select Route"
                    left={<TextInput.Icon icon="map-marker" />}
                    right={<TextInput.Icon icon="chevron-down" />}
                    style={styles.input}
                    dense={true}
                    editable={false}
                    theme={{ colors: { primary: paperTheme.colors.primary, text: paperTheme.colors.text } }}
                  />
                </View>
              </TouchableOpacity>
            }
            style={{ backgroundColor: paperTheme.colors.surface }}
          >
            {routes.map((r) => (
              <Menu.Item
                key={r}
                onPress={() => {
                  setRoute(r);
                  setRouteMenuVisible(false);
                }}
                title={r}
                titleStyle={{ color: paperTheme.colors.text }}
              />
            ))}
          </Menu>

          <Divider style={[styles.divider, { backgroundColor: paperTheme.colors.border }]} />

          {/* Quality Distribution */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: paperTheme.colors.primary }]}>
            Quality Distribution
          </Text>

          <View style={styles.percentageRow}>
            <View style={styles.percentageContainer}>
              <Text style={[styles.percentageLabel, { color: paperTheme.colors.success }]}>Best Leaf  %</Text>
              <TextInput
                value={bestLeaf}
                onChangeText={setBestLeaf}
                mode="outlined"
                keyboardType="numeric"
                placeholder="0"
                right={<TextInput.Affix text="%" />}
                style={styles.percentageInput}
                dense={true}
                theme={{ colors: { primary: paperTheme.colors.success, text: paperTheme.colors.text } }}
              />
            </View>

            <View style={styles.percentageContainer}>
              <Text style={[styles.percentageLabel, { color: paperTheme.colors.warning }]}>Below Best  %</Text>
              <TextInput
                value={bellowBest}
                onChangeText={setBellowBest}
                mode="outlined"
                keyboardType="numeric"
                placeholder="0"
                right={<TextInput.Affix text="%" />}
                style={styles.percentageInput}
                dense={true}
                theme={{ colors: { primary: paperTheme.colors.warning, text: paperTheme.colors.text } }}
              />
            </View>

            <View style={styles.percentageContainer}>
              <Text style={[styles.percentageLabel, { color: paperTheme.colors.error }]}>Poor  %</Text>
              <TextInput
                value={poor}
                onChangeText={setPoor}
                mode="outlined"
                keyboardType="numeric"
                placeholder="0"
                right={<TextInput.Affix text="%" />}
                style={styles.percentageInput}
                dense={true}
                theme={{ colors: { primary: paperTheme.colors.error, text: paperTheme.colors.text } }}
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
              labelStyle={styles.buttonLabel}
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
              labelStyle={styles.buttonLabel}
            >
              Clear
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    padding: responsiveSpacing.md,
    gap: responsiveSpacing.sm,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing.sm,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    elevation: 2,
  },
  dateLabel: {
    fontSize: responsiveFontSize(11),
  },
  dateValue: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
  },
  card: {
    margin: responsiveSpacing.md,
    borderRadius: moderateScale(12),
    elevation: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing.lg,
  },
  title: {
    fontWeight: 'bold',
    marginLeft: responsiveSpacing.sm,
  },
  input: {
    marginBottom: responsiveSpacing.md,
    height: moderateScale(48),
  },
  divider: {
    marginVertical: responsiveSpacing.md,
  },
  sectionTitle: {
    marginBottom: responsiveSpacing.md,
    fontWeight: 'bold',
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
    fontSize: responsiveFontSize(12),
    marginBottom: responsiveSpacing.xs,
  },
  percentageInput: {
    height: moderateScale(44),
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
  buttonLabel: {
    fontSize: responsiveFontSize(14),
    paddingVertical: responsiveSpacing.xs,
  },
  dateDialog: {
    maxHeight: '80%',
  },
  dialogContent: {
    paddingHorizontal: responsiveSpacing.sm,
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '12%', // Reduced from 18% to 12%
    marginBottom: responsiveSpacing.xs,
    marginHorizontal: '0.5%',
    minWidth: 35, // Add minimum width
    borderRadius: moderateScale(4),
  },
  dayButtonLabel: {
    fontSize: responsiveFontSize(11),
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
});