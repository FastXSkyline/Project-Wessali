import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Locale } from '@wessali/i18n';
import { fontFamily, palette } from '../theme';
import { AppText, useLocaleValue } from './base';

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
  if (!compact) {
    const options: Array<{ value: Locale; label: string }> = [
      { value: 'ar', label: labels?.ar ?? 'العربية' },
      { value: 'fr', label: labels?.fr ?? 'Français' },
      { value: 'en', label: labels?.en ?? 'English' },
    ];
    return (
      <View style={[styles.full, isRtl && styles.rowReverse]}>
        {options.map((option) => {
          const active = value === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(option.value)}
              style={styles.segment}
            >
              {active ? (
                <LinearGradient
                  colors={['#45E8AF', '#1CB586']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
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
            </Pressable>
          );
        })}
      </View>
    );
  }
  return (
    <View style={[styles.compact, isRtl && styles.rowReverse]}>
      {(['ar', 'fr', 'en'] as const).map((locale) => {
        const active = value === locale;
        return (
          <Pressable
            key={locale}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={locale}
            onPress={() => onChange(locale)}
            style={[styles.pill, active && styles.pillActive]}
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
              {shortLabels[locale]}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  full: {
    flexDirection: 'row',
    padding: 4,
    gap: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.lineSoft,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  compact: {
    flexDirection: 'row',
    padding: 3,
    gap: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.lineSoft,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowReverse: { flexDirection: 'row-reverse' },
  pill: {
    minWidth: 32,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pillActive: { backgroundColor: palette.jade },
});
