import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Locale } from '@wessali/i18n';
import { fontFamily, palette } from '../theme';
import { AppText, useLocaleValue } from './base';
import { MotionPressable } from './motion';

const shortLabels: Record<Locale, string> = { ar: 'AR', fr: 'FR', en: 'EN' };

export function LanguageSwitch({
  value,
  onChange,
  compact = false,
  labels,
}: {
  value: Locale;
  onChange: (locale: Locale) => void;
  compact?: boolean;
  labels?: { ar: string; fr: string; en: string };
}) {
  const { isRtl } = useLocaleValue();
  const [containerWidth, setContainerWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const options: Array<{ value: Locale; label: string }> = [
    { value: 'ar', label: labels?.ar ?? 'العربية' },
    { value: 'fr', label: labels?.fr ?? 'Français' },
    { value: 'en', label: labels?.en ?? 'English' },
  ];
  const activeIndex = options.findIndex((option) => option.value === value);
  const physicalIndex = isRtl ? options.length - 1 - activeIndex : activeIndex;
  const segmentWidth = Math.max(0, (containerWidth - 8 - (options.length - 1) * 3) / options.length);

  useEffect(() => {
    if (compact || !segmentWidth) return;
    Animated.spring(indicatorX, {
      toValue: physicalIndex * (segmentWidth + 3),
      damping: 24,
      stiffness: 220,
      mass: 0.82,
      useNativeDriver: true,
    }).start();
  }, [compact, indicatorX, physicalIndex, segmentWidth]);

  if (!compact) {
    return (
      <View
        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
        style={[styles.full, isRtl && styles.rowReverse]}
      >
        {segmentWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              { width: segmentWidth, transform: [{ translateX: indicatorX }] },
            ]}
          >
            <LinearGradient
              colors={['#247CC7', '#176FC2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        ) : null}
        {options.map((option) => {
          const active = value === option.value;
          return (
            <MotionPressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(option.value)}
              style={styles.segment}
              contentStyle={styles.segmentContent}
            >
              <AppText
                variant="label"
                align="center"
                numberOfLines={1}
                style={{
                  color: active ? palette.onAccent : palette.muted,
                  fontFamily: fontFamily('semibold', option.value),
                  fontSize: 11.5,
                }}
              >
                {option.label}
              </AppText>
            </MotionPressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.compact, isRtl && styles.rowReverse]}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <MotionPressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.pill, active && styles.pillActive]}
            contentStyle={styles.pillContent}
          >
            <AppText
              variant="caption"
              align="center"
              style={{
                color: active ? palette.onAccent : palette.muted,
                fontSize: 10,
                letterSpacing: 0.6,
              }}
            >
              {shortLabels[option.value]}
            </AppText>
          </MotionPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  full: {
    position: 'relative',
    flexDirection: 'row',
    padding: 4,
    gap: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.lineSoft,
    backgroundColor: 'rgba(255,255,255,0.035)',
    overflow: 'hidden',
  },
  rowReverse: { flexDirection: 'row-reverse' },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 8,
  },
  segmentContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  compact: {
    flexDirection: 'row',
    padding: 3,
    gap: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.lineSoft,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pill: {
    minWidth: 32,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pillContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: palette.jade },
});
