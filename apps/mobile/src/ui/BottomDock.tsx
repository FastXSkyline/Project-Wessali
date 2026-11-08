import React from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gradients, palette } from '../theme';
import { AppText, RadialGlow, useLocaleValue } from './base';

export type Tab = 'home' | 'requests' | 'create' | 'partner' | 'profile';

type Item = {
  tab: Tab;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  activeIcon: React.ComponentProps<typeof Ionicons>['name'];
};

const VISIBLE = 96;

/** A frosted-glass dock with its upper edge dissolved into the page. */
export function BottomDock({
  active,
  onSelect,
  labels,
}: {
  active: Tab;
  onSelect: (tab: Tab) => void;
  labels: { home: string; requests: string; new: string; partner: string; profile: string };
}) {
  const { isRtl } = useLocaleValue();
  const { width } = useWindowDimensions();
  const diameter = Math.max(560, width * 1.72);
  const items: Item[] = [
    { tab: 'home', label: labels.home, icon: 'home-outline', activeIcon: 'home' },
    { tab: 'requests', label: labels.requests, icon: 'cube-outline', activeIcon: 'cube' },
    { tab: 'create', label: labels.new, icon: 'add', activeIcon: 'add' },
    { tab: 'partner', label: labels.partner, icon: 'briefcase-outline', activeIcon: 'briefcase' },
    { tab: 'profile', label: labels.profile, icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View
        pointerEvents="none"
        style={[
          styles.dome,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            bottom: -(diameter - VISIBLE),
          },
        ]}
      >
        <BlurView
          intensity={92}
          tint="light"
          blurMethod="dimezisBlurViewSdk31Plus"
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.10)', 'rgba(250,251,248,0.42)', 'rgba(246,247,243,0.80)']}
          locations={[0, 0.44, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <RadialGlow
          size={diameter * 0.66}
          color={palette.jade}
          opacity={0.045}
          style={{ position: 'absolute', top: -diameter * 0.43, left: diameter * 0.12 }}
        />
        <View style={[styles.domeRim, { borderRadius: diameter / 2 }]} />
      </View>

      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(243,243,239,0.99)',
          'rgba(243,243,239,0.94)',
          'rgba(243,243,239,0.56)',
          'rgba(243,243,239,0)',
        ]}
        locations={[0, 0.38, 0.72, 1]}
        style={styles.topFade}
      />

      <View style={[styles.row, isRtl && styles.rowReverse]}>
        {items.map((item) => {
          if (item.tab === 'create') {
            return (
              <Pressable
                key={item.tab}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => onSelect(item.tab)}
                style={styles.createSlot}
              >
                <RadialGlow
                  size={110}
                  color={palette.jade}
                  opacity={0.07}
                  style={{ position: 'absolute', top: -25, left: -28 }}
                />
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0.15, y: 0 }}
                  end={{ x: 0.9, y: 1 }}
                  style={styles.createOrb}
                >
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0.48)',
                      'rgba(255,255,255,0.10)',
                      'rgba(255,255,255,0)',
                    ]}
                    locations={[0, 0.46, 1]}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.7, y: 0.8 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.orbRim} />
                  <Ionicons name="add" size={27} color={palette.onAccent} />
                </LinearGradient>
              </Pressable>
            );
          }

          const selected = item.tab === active;
          return (
            <Pressable
              key={item.tab}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected }}
              onPress={() => onSelect(item.tab)}
              style={styles.item}
            >
              <View style={styles.iconSlot}>
                {selected ? (
                  <>
                    <LinearGradient
                      colors={['rgba(88,116,94,0.16)', 'rgba(88,116,94,0.07)']}
                      start={{ x: 0.2, y: 0 }}
                      end={{ x: 0.8, y: 1 }}
                      style={styles.activePill}
                    />
                    <RadialGlow
                      size={58}
                      color={palette.jade}
                      opacity={0.06}
                      style={{ position: 'absolute', top: -12, left: -10 }}
                    />
                  </>
                ) : null}
                <Ionicons
                  name={selected ? item.activeIcon : item.icon}
                  size={19}
                  color={selected ? palette.jadeDeep : palette.muted}
                />
              </View>
              <AppText
                variant="caption"
                align="center"
                numberOfLines={1}
                style={{
                  fontSize: 9.5,
                  lineHeight: 12,
                  letterSpacing: isRtl ? 0 : 0.1,
                  color: selected ? palette.ink : palette.faint,
                }}
              >
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: VISIBLE + 24,
    alignItems: 'center',
  },
  dome: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(83, 103, 87, 0.09)',
    backgroundColor: 'rgba(248, 249, 246, 0.20)',
  },
  domeRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.52)',
  },
  topFade: {
    position: 'absolute',
    top: -31,
    left: 0,
    right: 0,
    height: 82,
  },
  row: {
    position: 'absolute',
    top: 26,
    width: '100%',
    maxWidth: 430,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowReverse: { flexDirection: 'row-reverse' },
  item: { flex: 1, alignItems: 'center', gap: 5 },
  iconSlot: {
    width: 42,
    height: 34,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(88, 116, 94, 0.18)',
  },
  createSlot: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  createOrb: {
    marginTop: -10,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    shadowColor: palette.jade,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
  },
  orbRim: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
  },
});
