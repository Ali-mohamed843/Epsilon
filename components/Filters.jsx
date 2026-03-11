import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';

const BRAND = '#6e226e';


const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS_HEADER = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const isSameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
const isInRange = (date, from, to) => date >= from && date <= to;

const toMidnight = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDisplay = (date) => {
  if (!date) return '';
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
};

const MiniCalendar = ({
  year, month, onYearChange, onMonthChange,
  fromDate, toDate, onDayPress, selectingFrom,
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1),
  );

  const prevMonth = () => {
    if (month === 0) { onYearChange(year - 1); onMonthChange(11); }
    else onMonthChange(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { onYearChange(year + 1); onMonthChange(0); }
    else onMonthChange(month + 1);
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <View style={{ width: 280, backgroundColor: '#fff', borderRadius: 12, padding: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <TouchableOpacity onPress={prevMonth} style={{ padding: 6 }}>
          <Text style={{ color: '#475569', fontSize: 16 }}>‹</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: 110 }}>
            <View style={{ flexDirection: 'row' }}>
              {MONTHS.map((m, i) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => onMonthChange(i)}
                  style={{
                    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 4,
                    backgroundColor: i === month ? BRAND : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '500', color: i === month ? '#fff' : '#64748b' }}>
                    {m.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: 80 }}>
            <View style={{ flexDirection: 'row' }}>
              {years.map((y) => (
                <TouchableOpacity
                  key={y}
                  onPress={() => onYearChange(y)}
                  style={{
                    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 4,
                    backgroundColor: y === year ? BRAND : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '500', color: y === year ? '#fff' : '#64748b' }}>
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        <TouchableOpacity onPress={nextMonth} style={{ padding: 6 }}>
          <Text style={{ color: '#475569', fontSize: 16 }}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        {DAYS_HEADER.map((d) => (
          <View key={d} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '500' }}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, idx) => {
          if (!day) return <View key={`empty-${idx}`} style={{ width: '14.28%' }} />;
          const date = toMidnight(new Date(year, month, day));
          const isFrom = isSameDay(date, fromDate);
          const isTo = isSameDay(date, toDate);
          const inRange = fromDate && toDate && isInRange(date, fromDate, toDate);
          const isEdge = isFrom || isTo;

          return (
            <TouchableOpacity
              key={day}
              style={{ width: '14.28%', paddingVertical: 3, alignItems: 'center' }}
              onPress={() => onDayPress(date)}
            >
              <View
                style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: isEdge ? BRAND : inRange ? 'rgba(110,34,110,0.12)' : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: isEdge ? '#fff' : inRange ? BRAND : '#334155',
                    fontWeight: isEdge ? '700' : '400',
                  }}
                >
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const QUICK_RANGES = [
  {
    label: 'Today',
    getValue: () => { const d = toMidnight(new Date()); return { from: d, to: d }; },
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const d = toMidnight(new Date());
      d.setDate(d.getDate() - 1);
      return { from: d, to: new Date(d) };
    },
  },
  {
    label: 'This Week',
    getValue: () => {
      const to = toMidnight(new Date());
      const from = toMidnight(new Date());
      from.setDate(from.getDate() - from.getDay());
      return { from, to };
    },
  },
  {
    label: 'Last Week',
    getValue: () => {
      const now = toMidnight(new Date());
      const dayOfWeek = now.getDay();
      const to = toMidnight(new Date());
      to.setDate(now.getDate() - dayOfWeek - 1);
      const from = toMidnight(new Date(to));
      from.setDate(to.getDate() - 6);
      return { from, to };
    },
  },
  {
    label: 'This Month',
    getValue: () => {
      const to = toMidnight(new Date());
      const from = toMidnight(new Date());
      from.setDate(1);
      return { from, to };
    },
  },
  {
    label: 'Last Month',
    getValue: () => {
      const now = new Date();
      const from = toMidnight(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const to = toMidnight(new Date(now.getFullYear(), now.getMonth(), 0));
      return { from, to };
    },
  },
  {
    label: 'Last 7 days',
    getValue: () => {
      const to = toMidnight(new Date());
      const from = toMidnight(new Date());
      from.setDate(from.getDate() - 6);
      return { from, to };
    },
  },
  {
    label: 'Last 30 days',
    getValue: () => {
      const to = toMidnight(new Date());
      const from = toMidnight(new Date());
      from.setDate(from.getDate() - 29);
      return { from, to };
    },
  },
];


const Filters = ({
  granularity = 'day',
  onGranularityChange,
  fromDate,
  toDate,
  onDateRangeChange,
  onClear,
  isDefault = true,
  onFilterPress,
}) => {
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [granularityMenuVisible, setGranularityMenuVisible] = useState(false);

  const today = toMidnight(new Date());
  const [calYear, setCalYear] = useState((fromDate || today).getFullYear());
  const [calMonth, setCalMonth] = useState((fromDate || today).getMonth());
  const [selectingFrom, setSelectingFrom] = useState(true);
  const [tempFrom, setTempFrom] = useState(fromDate || null);
  const [tempTo, setTempTo] = useState(toDate || null);

  const openDatePicker = () => {
    setTempFrom(fromDate || null);
    setTempTo(toDate || null);
    setSelectingFrom(true);
    setCalYear((fromDate || today).getFullYear());
    setCalMonth((fromDate || today).getMonth());
    setDatePickerVisible(true);
  };

  const handleDayPress = (date) => {
    if (selectingFrom) {
      setTempFrom(date);
      setTempTo(null);
      setSelectingFrom(false);
    } else {
      if (date < tempFrom) {
        setTempTo(tempFrom);
        setTempFrom(date);
      } else {
        setTempTo(date);
      }
      setSelectingFrom(true);
    }
  };

  const applyDates = () => {
    if (tempFrom && tempTo) {
      onDateRangeChange({ from: tempFrom, to: tempTo });
      setDatePickerVisible(false);
    }
  };

  const applyQuickRange = (range) => {
    const result = range.getValue();
    setTempFrom(result.from);
    setTempTo(result.to);
    setCalYear(result.from.getFullYear());
    setCalMonth(result.from.getMonth());
    onDateRangeChange(result);
    setDatePickerVisible(false);
  };

  const handleClearInModal = () => {
    setTempFrom(null);
    setTempTo(null);
    setSelectingFrom(true);
    setDatePickerVisible(false);
    if (onClear) onClear();
  };

  const dateLabel = fromDate && toDate
    ? `${formatDisplay(fromDate)}  →  ${formatDisplay(toDate)}`
    : 'Select date range';

  const granularityLabel = granularity === 'day' ? 'Per Day' : 'Per Month';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>

      <TouchableOpacity
        onPress={openDatePicker}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
          borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', gap: 6,
        }}
      >
        <Text style={{ fontSize: 14 }}>📅</Text>
        <Text style={{ fontSize: 13, fontWeight: '500', color: '#334155' }}>{dateLabel}</Text>
      </TouchableOpacity>

      <View>
        <TouchableOpacity
          onPress={() => setGranularityMenuVisible((v) => !v)}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
            borderRadius: 12, borderWidth: 1, backgroundColor: '#fff', gap: 4,
            borderColor: granularityMenuVisible ? BRAND : '#e2e8f0',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '500', color: granularityMenuVisible ? BRAND : '#334155' }}>
            {granularityLabel}
          </Text>
          <Text style={{ fontSize: 11, color: '#94a3b8' }}>▾</Text>
        </TouchableOpacity>

        {granularityMenuVisible && (
          <View
            style={{
              position: 'absolute', top: 42, left: 0, zIndex: 999,
              backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0',
              minWidth: 110, overflow: 'hidden',
              shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 5,
            }}
          >
            {['day', 'month'].map((val) => (
              <TouchableOpacity
                key={val}
                onPress={() => { onGranularityChange(val); setGranularityMenuVisible(false); }}
                style={{
                  paddingHorizontal: 16, paddingVertical: 12,
                  backgroundColor: granularity === val ? 'rgba(110,34,110,0.08)' : '#fff',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '500', color: granularity === val ? BRAND : '#475569' }}>
                  {val === 'day' ? 'Per Day' : 'Per Month'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {!isDefault && onClear && (
        <TouchableOpacity
          onPress={onClear}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8,
            borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.08)', gap: 4,
          }}
        >
          <Text style={{ fontSize: 12 }}>✕</Text>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#EF4444' }}>Clear</Text>
        </TouchableOpacity>
      )}

      {onFilterPress && (
        <TouchableOpacity
          onPress={onFilterPress}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
            borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', gap: 4,
          }}
        >
          <Text style={{ fontSize: 14 }}>⚙️</Text>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#334155' }}>Filter</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={datePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', paddingTop: 80, paddingHorizontal: 16 }}
          activeOpacity={1}
          onPress={() => setDatePickerVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={{
              backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
              shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
            }}>
              <View style={{ flexDirection: 'row', padding: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <TouchableOpacity
                  onPress={() => setSelectingFrom(true)}
                  style={{
                    flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
                    alignItems: 'center', borderColor: selectingFrom ? BRAND : '#e2e8f0',
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>From</Text>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: '#334155' }}>
                    {tempFrom ? formatDisplay(tempFrom) : '—'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectingFrom(false)}
                  style={{
                    flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
                    alignItems: 'center', borderColor: !selectingFrom ? BRAND : '#e2e8f0',
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>To</Text>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: '#334155' }}>
                    {tempTo ? formatDisplay(tempTo) : '—'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: 150, borderRightWidth: 1, borderRightColor: '#f1f5f9', paddingVertical: 8 }}>
                  {QUICK_RANGES.map((range) => (
                    <TouchableOpacity
                      key={range.label}
                      onPress={() => applyQuickRange(range)}
                      style={{ paddingHorizontal: 16, paddingVertical: 10 }}
                    >
                      <Text style={{ fontSize: 13, color: '#475569' }}>{range.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ flex: 1, padding: 12 }}>
                  <MiniCalendar
                    year={calYear}
                    month={calMonth}
                    onYearChange={setCalYear}
                    onMonthChange={setCalMonth}
                    fromDate={tempFrom}
                    toDate={tempTo}
                    onDayPress={handleDayPress}
                    selectingFrom={selectingFrom}
                  />

                  <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
                    {selectingFrom ? 'Select start date' : 'Select end date'}
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    <TouchableOpacity
                      onPress={handleClearInModal}
                      activeOpacity={0.7}
                      style={{
                        flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
                        borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#EF4444' }}>
                        Clear
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={applyDates}
                      activeOpacity={0.8}
                      disabled={!tempFrom || !tempTo}
                      style={{
                        flex: 2, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
                        backgroundColor: tempFrom && tempTo ? BRAND : '#e2e8f0',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: tempFrom && tempTo ? '#fff' : '#94a3b8' }}>
                        Apply
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Filters;