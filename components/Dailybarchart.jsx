import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';

const BRAND = '#6e226e';

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1_000_000)     return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000)         return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(Math.round(num));
};

const getDateFromItem = (item) => {
  const raw = item?.date || item?.created_time || item?.day;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

const formatFullDate = (item) => {
  const d = getDateFromItem(item);
  if (!d) return '';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const DailyBarChart = ({
  data,
  valueKey = 'total_interactions',
  chartHeight = 160,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);

  if (!data || data.length === 0) return null;

  const values = data.map((d) => d[valueKey] ?? 0);
  const maxVal = Math.max(...values, 1);
  const count  = data.length;

  const SVG_W = 100;
  const SVG_H = 30;
  const PADDING_TOP = 2;
  const barW = Math.max(0.8, Math.min(2.8, (SVG_W * 0.8) / count));
  const totalBarsWidth = count * barW;
  const gap = (SVG_W - totalBarsWidth) / (count + 1);

  const handlePress = (index) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  const getBarCenterPercent = (index) => {
    const barCenter = gap + index * (barW + gap) + barW / 2;
    return (barCenter / SVG_W) * 100;
  };

  const getTooltipStyle = (index) => {
    if (containerWidth === 0) return { left: '50%', transform: [{ translateX: -40 }] };

    const pct = getBarCenterPercent(index);
    const tooltipW = 80;
    const leftPx = (pct / 100) * containerWidth;

    const minLeft = tooltipW / 2 + 4;
    const maxLeft = containerWidth - tooltipW / 2 - 4;
    const clampedLeft = Math.min(Math.max(leftPx, minLeft), maxLeft);

    return {
      position: 'absolute',
      left: clampedLeft,
      transform: [{ translateX: -(tooltipW / 2) }],
      width: tooltipW,
    };
  };

  const getArrowOffset = (index) => {
    if (containerWidth === 0) return 0;
    const pct = getBarCenterPercent(index);
    const tooltipW = 80;
    const leftPx = (pct / 100) * containerWidth;
    const minLeft = tooltipW / 2 + 4;
    const maxLeft = containerWidth - tooltipW / 2 - 4;
    const clampedLeft = Math.min(Math.max(leftPx, minLeft), maxLeft);
    return leftPx - clampedLeft;
  };

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>

      <View style={{ height: 52, justifyContent: 'flex-end', position: 'relative' }}>
        {activeIndex !== null && (
          <View
            pointerEvents="none"
            style={{
              ...getTooltipStyle(activeIndex),
              bottom: 0,
            }}
          >
            <View
              style={{
                backgroundColor: '#1e1e1e',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 5,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
                {formatNumber(values[activeIndex])}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, marginTop: 1 }}>
                {formatFullDate(data[activeIndex])}
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  marginLeft: getArrowOffset(activeIndex),
                  width: 0,
                  height: 0,
                  borderLeftWidth: 5,
                  borderRightWidth: 5,
                  borderTopWidth: 5,
                  borderLeftColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderTopColor: '#1e1e1e',
                }}
              />
            </View>
          </View>
        )}
      </View>

      <View style={{ height: chartHeight, position: 'relative' }}>
        <Svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="none"
        >
          {[0.25, 0.5, 0.75].map((frac) => (
            <Line
              key={frac}
              x1={0}
              y1={SVG_H - (SVG_H - PADDING_TOP) * frac}
              x2={SVG_W}
              y2={SVG_H - (SVG_H - PADDING_TOP) * frac}
              stroke="#f1f5f9"
              strokeWidth={0.15}
            />
          ))}

          {values.map((val, i) => {
            const h = Math.max(0.3, (val / maxVal) * (SVG_H - PADDING_TOP));
            const x = gap + i * (barW + gap);
            const y = SVG_H - h;
            const isActive = i === activeIndex;

            return (
              <Rect
                key={i}
                x={x}
                y={y}
                width={barW}
                height={h}
                fill={BRAND}
                rx={0.35}
                opacity={isActive ? 1 : activeIndex !== null ? 0.35 : 0.72}
              />
            );
          })}

          {activeIndex !== null && (
            <Line
              x1={gap + activeIndex * (barW + gap) + barW / 2}
              y1={0}
              x2={gap + activeIndex * (barW + gap) + barW / 2}
              y2={SVG_H}
              stroke={BRAND}
              strokeWidth={0.12}
              strokeDasharray="0.5,0.5"
              opacity={0.4}
            />
          )}
        </Svg>

        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            flexDirection: 'row',
          }}
        >
          {values.map((_, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={1}
              onPress={() => handlePress(i)}
              style={{ flex: 1, height: '100%' }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default DailyBarChart;