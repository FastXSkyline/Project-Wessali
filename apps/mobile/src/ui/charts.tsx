import React, { useId, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import { palette } from '../theme';
import { AppText } from './base';

type Point = { x: number; y: number };

function smoothPath(points: Point[]) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return path;
}

export function ActivityArea({
  data,
  labels,
  accent = palette.jade,
  height = 126,
}: {
  data: number[];
  labels: string[];
  accent?: string;
  height?: number;
}) {
  const [width, setWidth] = useState(0);
  const rawId = useId();
  const seed = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const areaId = `area${seed}`;
  const lineId = `line${seed}`;
  const max = Math.max(1, ...data);
  const values = data.length ? data : [0];
  const top = 14;
  const bottom = height - 14;
  const usable = bottom - top;
  const points: Point[] = values.map((value, index) => ({
    x: values.length === 1 ? 0 : (index / (values.length - 1)) * width,
    y: bottom - (value / max) * usable,
  }));
  const line = smoothPath(points);
  const area =
    points.length > 0
      ? `${line} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
      : '';
  const last = points[points.length - 1];

  return (
    <View style={{ gap: 9 }}>
      <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Svg width={width} height={height}>
            <Defs>
              <SvgGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={accent} stopOpacity={0.38} />
                <Stop offset="0.45" stopColor={accent} stopOpacity={0.14} />
                <Stop offset="1" stopColor={accent} stopOpacity={0} />
              </SvgGradient>
              <SvgGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={palette.aqua} stopOpacity={0.9} />
                <Stop offset="0.55" stopColor={accent} stopOpacity={1} />
                <Stop offset="1" stopColor={palette.jadeBright} stopOpacity={1} />
              </SvgGradient>
            </Defs>
            {[0.34, 0.68].map((fraction) => (
              <Path
                key={fraction}
                d={`M 0 ${top + usable * fraction} L ${width} ${top + usable * fraction}`}
                stroke="rgba(175, 240, 213, 0.06)"
                strokeWidth={1}
                strokeDasharray="2 8"
              />
            ))}
            <Path d={area} fill={`url(#${areaId})`} />
            <Path d={line} stroke={accent} strokeOpacity={0.14} strokeWidth={12} fill="none" />
            <Path d={line} stroke={accent} strokeOpacity={0.28} strokeWidth={5} fill="none" />
            <Path
              d={line}
              stroke={`url(#${lineId})`}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {last ? (
              <>
                <Path
                  d={`M ${last.x} ${last.y + 6} L ${last.x} ${height - 8}`}
                  stroke={accent}
                  strokeOpacity={0.2}
                  strokeWidth={1}
                  strokeDasharray="2 5"
                />
                <Circle cx={last.x} cy={last.y} r={13} fill={accent} opacity={0.1} />
                <Circle cx={last.x} cy={last.y} r={8} fill={accent} opacity={0.16} />
                <Circle cx={last.x} cy={last.y} r={4.4} fill={palette.canvas} />
                <Circle cx={last.x} cy={last.y} r={3} fill={palette.jadeBright} />
              </>
            ) : null}
          </Svg>
        ) : null}
      </View>
      <View style={styles.axis}>
        {labels.map((label, index) => (
          <AppText
            key={`${label}-${index}`}
            variant="caption"
            tone={index === labels.length - 1 ? 'jade' : 'faint'}
            align="center"
            style={{ flex: 1, fontSize: 9.5, letterSpacing: 0.2 }}
          >
            {label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

export function ServiceMix({
  rows,
}: {
  rows: Array<{ label: string; value: number; tone: string; max: number }>;
}) {
  return (
    <View style={{ gap: 13 }}>
      {rows.map((row) => {
        const ratio = row.max > 0 ? Math.max(row.value > 0 ? 0.05 : 0, row.value / row.max) : 0;
        return (
          <View key={row.label} style={{ gap: 7 }}>
            <View style={styles.mixLabelRow}>
              <View style={styles.mixLabelLeft}>
                <View
                  style={[styles.mixDot, { backgroundColor: row.tone, shadowColor: row.tone }]}
                />
                <AppText variant="caption" tone="soft">
                  {row.label}
                </AppText>
              </View>
              <AppText variant="caption" tone="muted">
                {row.value}
              </AppText>
            </View>
            <View style={styles.mixTrack}>
              <View
                style={{
                  width: `${Math.max(ratio * 100, 2)}%`,
                  height: '100%',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: row.tone,
                    opacity: row.value > 0 ? 0.9 : 0.18,
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: 'rgba(255,255,255,0.35)',
                  }}
                />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  axis: { flexDirection: 'row', marginTop: 2 },
  mixLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mixLabelLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  mixDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    shadowOpacity: 0.7,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  mixTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.055)',
    overflow: 'hidden',
  },
});
