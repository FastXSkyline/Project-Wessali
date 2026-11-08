import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { accentForTone, gradients, palette, statusTone } from '../theme';
import { AppText, RadialGlow, useLocaleValue } from './base';

function tap() {
  Haptics.selectionAsync().catch(() => undefined);
}

export function usePressScale() {
  const scale = useRef(new Animated.Value(1)).current;
  return {
    scale,
    pressIn: () =>
      Animated.spring(scale, {
        toValue: 0.965,
        useNativeDriver: true,
        speed: 35,
        bounciness: 0,
      }).start(),
    pressOut: () =>
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 28,
        bounciness: 7,
      }).start(),
  };
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  style,
  compact = false,
}: PrimaryButtonProps) {
  const { scale, pressIn, pressOut } = usePressScale();
  const inactive = disabled || loading;
  const { isRtl } = useLocaleValue();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={() => {
        if (inactive) return;
        tap();
        onPress();
      }}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <RadialGlow
          size={230}
          color={palette.jade}
          opacity={0.22}
          style={{ position: 'absolute', top: -55, left: '12%' }}
        />
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.primaryButton, compact && styles.primaryButtonCompact]}
        >
          <View pointerEvents="none" style={styles.primarySheen} />
          {loading ? (
            <ActivityIndicator color={palette.onAccent} />
          ) : (
            <View style={[styles.buttonRow, isRtl && styles.rowReverse]}>
              {icon ? <Ionicons name={icon} size={17} color={palette.onAccent} /> : null}
              <AppText
                variant="button"
                align="center"
                style={{ color: palette.onAccent, fontSize: compact ? 13.5 : 14.5 }}
              >
                {label}
              </AppText>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  icon,
  style,
  danger = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  style?: StyleProp<ViewStyle>;
  danger?: boolean;
  disabled?: boolean;
}) {
  const { isRtl } = useLocaleValue();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={[
        styles.secondaryButton,
        danger && { borderColor: 'rgba(255,123,123,0.32)', backgroundColor: palette.dangerSoft },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <View style={[styles.buttonRow, isRtl && styles.rowReverse]}>
        {icon ? (
          <Ionicons name={icon} size={16} color={danger ? palette.danger : palette.ink} />
        ) : null}
        <AppText variant="button" tone={danger ? 'danger' : 'ink'} align="center">
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  size = 42,
  tint = palette.ink,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  label: string;
  size?: number;
  tint?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.iconButton,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && { opacity: 0.7 },
      ]}
    >
      <BlurView
        intensity={30}
        tint="dark"
        blurMethod="dimezisBlurViewSdk31Plus"
        style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
      />
      <View style={[StyleSheet.absoluteFill, styles.iconButtonFill, { borderRadius: size / 2 }]} />
      <Ionicons name={icon} size={size * 0.43} color={tint} />
    </Pressable>
  );
}

type FieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: React.ComponentProps<typeof TextInput>['autoComplete'];
  secureTextEntry?: boolean;
};

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete,
  secureTextEntry,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const { locale, isRtl } = useLocaleValue();
  const font = locale === 'ar' ? 'IBMPlexSansArabic_400Regular' : 'Sora_400Regular';

  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <AppText variant="label" tone={focused ? 'jade' : 'soft'}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.fieldShell,
          isRtl && styles.rowReverse,
          focused && styles.fieldShellFocused,
          multiline && styles.fieldShellMultiline,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={17}
            color={focused ? palette.jade : palette.faint}
            style={{ marginTop: multiline ? 3 : 0 }}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.faint}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          secureTextEntry={secureTextEntry}
          selectionColor={palette.jade}
          cursorColor={palette.jade}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          style={[
            styles.input,
            {
              fontFamily: font,
              textAlign: isRtl ? 'right' : 'left',
              writingDirection: isRtl ? 'rtl' : 'ltr',
            },
            multiline && styles.inputMultiline,
          ]}
        />
      </View>
    </View>
  );
}

type Choice = { label: string; value: string };

export function ChoiceChips({
  options,
  value,
  onChange,
  accent = palette.jade,
}: {
  options: Choice[];
  value: string;
  onChange: (value: string) => void;
  accent?: string;
}) {
  const { isRtl } = useLocaleValue();
  return (
    <View style={[styles.chipWrap, isRtl && styles.rowReverse]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              tap();
              onChange(option.value);
            }}
            style={[
              styles.chip,
              active && {
                backgroundColor: `${accent}1F`,
                borderColor: `${accent}80`,
              },
            ]}
          >
            {active ? <View style={[styles.chipDot, { backgroundColor: accent }]} /> : null}
            <AppText variant="label" tone={active ? 'ink' : 'muted'}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Segmented({
  options,
  value,
  onChange,
  accent = palette.jade,
}: {
  options: Choice[];
  value: string;
  onChange: (value: string) => void;
  accent?: string;
}) {
  const { isRtl } = useLocaleValue();
  return (
    <View style={[styles.segmented, isRtl && styles.rowReverse]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              tap();
              onChange(option.value);
            }}
            style={styles.segment}
          >
            {active ? (
              <LinearGradient
                colors={[`${accent}F2`, `${accent}B8`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <AppText
              variant="label"
              align="center"
              style={{ color: active ? palette.onAccent : palette.muted }}
              numberOfLines={1}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const slide = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(slide, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [slide, value]);
  const { isRtl } = useLocaleValue();
  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onChange(!value);
      }}
      style={[styles.toggleRow, isRtl && styles.rowReverse]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong">{label}</AppText>
        {description ? (
          <AppText variant="caption" tone="muted">
            {description}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.track, value && styles.trackOn]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
      </View>
    </Pressable>
  );
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  const tone = statusTone[status] ?? 'muted';
  const color = accentForTone[tone];
  const { isRtl } = useLocaleValue();
  return (
    <View
      style={[
        styles.statusPill,
        isRtl && styles.rowReverse,
        { backgroundColor: `${color}14`, borderColor: `${color}3D` },
      ]}
    >
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <AppText variant="caption" style={{ color }}>
        {label}
      </AppText>
    </View>
  );
}

export function InfoNote({
  icon = 'information-circle-outline',
  children,
  tone = 'muted',
}: {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  children: string;
  tone?: 'muted' | 'amber' | 'aqua';
}) {
  const color = tone === 'amber' ? palette.amber : tone === 'aqua' ? palette.aqua : palette.muted;
  const { isRtl } = useLocaleValue();
  return (
    <View
      style={[
        styles.note,
        isRtl && styles.rowReverse,
        { borderColor: `${color}2E`, backgroundColor: `${color}0D` },
      ]}
    >
      <Ionicons name={icon} size={16} color={color} style={{ marginTop: 1 }} />
      <AppText variant="caption" tone="muted" style={{ flex: 1, lineHeight: 18 }}>
        {children}
      </AppText>
    </View>
  );
}

export const controlStyles = StyleSheet.create({});

const styles = StyleSheet.create({
  primaryButton: {
    minHeight: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingVertical: 16,
    shadowColor: palette.jade,
    shadowOpacity: 0.34,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 9,
  },
  primaryButtonCompact: { minHeight: 46, paddingVertical: 12, paddingHorizontal: 18 },
  primarySheen: {
    position: 'absolute',
    top: 1,
    left: 12,
    right: 12,
    height: '48%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  buttonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  rowReverse: { flexDirection: 'row-reverse' },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.line,
  },
  iconButtonFill: {
    backgroundColor: 'rgba(12, 34, 25, 0.42)',
  },
  fieldShell: {
    minHeight: 54,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: 'rgba(7, 24, 17, 0.58)',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldShellFocused: {
    borderColor: 'rgba(55, 225, 165, 0.6)',
    backgroundColor: 'rgba(11, 40, 29, 0.72)',
  },
  fieldShellMultiline: { alignItems: 'flex-start', paddingTop: 14, minHeight: 92 },
  input: {
    flex: 1,
    fontSize: 14.5,
    lineHeight: 21,
    color: palette.ink,
    paddingVertical: 14,
  },
  inputMultiline: { paddingTop: 0, minHeight: 64, textAlignVertical: 'top' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.lineSoft,
    backgroundColor: 'rgba(255,255,255,0.035)',
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  chipDot: { width: 5, height: 5, borderRadius: 999 },
  segmented: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.lineSoft,
    backgroundColor: 'rgba(255,255,255,0.035)',
    gap: 3,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  track: {
    width: 46,
    height: 28,
    borderRadius: 999,
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: palette.lineSoft,
  },
  trackOn: { backgroundColor: palette.jade, borderColor: 'rgba(55,225,165,0.5)' },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: '#F4FFF9',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: { width: 5, height: 5, borderRadius: 999 },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
});
