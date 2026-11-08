import React from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gradients, palette } from '../theme';
import { AppText, RadialGlow, useLocaleValue } from './base';

export type Tab = 'home' | 'requests' | 'create' | 'partner' | 'profile';

type Item = {
  tab: Tab;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  activeIcon: React.ComponentProps<typeof Ionicons>['name'];
};

const DOCK_CONTENT_HEIGHT = 92;

/** A safe-area-aware frosted dock that fades into the scrolling page. */
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
  const insets = useSafeAreaInsets();
  const compact = width < 360;
  const dockHeight = DOCK_CONTENT_HEIGHT + insets.bottom;
  const domeWidth = Math.max(width * 1.55, 560);
  const items: Item[] = [
    { tab: 'home', label: labels.home, icon: 'home-outline', activeIcon: 'home' },
    { tab: 'requests', label: labels.requests, icon: 'cube-outline', activeIcon: 'cube' },
    { tab: 'create', label: labels.new, icon: 'add', activeIcon: 'add' },
    { tab: 'partner', label: labels.partner, icon: 'briefcase-outline', activeIcon: 'briefcase' },
    { tab: 'profile', label: labels.profile, icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { height: dockHeight }]}>
      {/* One continuous glass surface reaches the bottom edge; no second blur strip below the controls. */}
      <View pointerEvents="none" style={styles.domeClip}>
        <View style={[styles.dome, { width: domeWidth, left: (width - domeWidth) / 2 }]}>
          <BlurView
            intensity={100}
            tint="light"
            blurMethod="dimezisBlurViewSdk31Plus"
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.18)', 'rgba(246,248,243,0.72)', 'rgba(242,245,239,0.92)']}
            locations={[0, 0.5, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <RadialGlow
            size={domeWidth * 0.7}
            color={palette.jade}
            opacity={0.055}
            style={{ position: 'absolute', top: -domeWidth * 0.28, left: domeWidth * 0.15 }}
          />
          <View style={styles.domeRim} />
        </View>
      </View>

      {/* Transparent at the upper edge, increasingly opaque toward the home indicator. */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(243,245,240,0.00)',
          'rgba(243,245,240,0.28)',
          'rgba(243,245,240,0.82)',
          'rgba(243,245,240,1.00)',
        ]}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.row,
          isRtl && styles.rowReverse,
          {
            bottom: Math.max(8, insets.bottom - 18),
            paddingHorizontal: compact ? 7 : 12,
          },
        ]}
      >
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
                  size={118}
                  color={palette.jade}
                  opacity={0.1}
                  style={{ position: 'absolute', top: -31, left: -31 }}
                />
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0.15, y: 0 }}
                  end={{ x: 0.9, y: 1 }}
                  style={[styles.createOrb, compact && styles.createOrbCompact]}
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
              <View style={[styles.iconSlot, compact && styles.iconSlotCompact]}>
                {selected ? (
                  <>
                    <LinearGradient
                      colors={['rgba(88,116,94,0.19)', 'rgba(88,116,94,0.09)']}
                      start={{ x: 0.2, y: 0 }}
                      end={{ x: 0.8, y: 1 }}
                      style={styles.activePill}
                    />
                    <RadialGlow
                      size={66}
                      color={palette.jade}
                      opacity={0.085}
                      style={{ position: 'absolute', top: -15, left: -12 }}
                    />
                  </>
                ) : null}
                <Ionicons
                  name={selected ? item.activeIcon : item.icon}
                  size={compact ? 18 : 20}
                  color={selected ? palette.jadeDeep : palette.muted}
                />
              </View>
              <AppText
                variant="caption"
                align="center"
                numberOfLines={1}
                style={{
                  width: '100%',
                  fontSize: compact ? 8.5 : 9.5,
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
    alignItems: 'center',
    overflow: 'hidden',
  },
  domeClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  dome: {
    position: 'absolute',
    height: 190,
    bottom: -31,
    borderRadius: 110,
    overflow: 'hidden',
    backgroundColor: 'rgba(246,248,243,0.82)',
  },
  domeRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
  },
  row: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
    maxWidth: 560,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowReverse: { flexDirection: 'row-reverse' },
  item: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', gap: 4 },
  iconSlot: {
    width: 48,
    height: 38,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlotCompact: { width: 42, height: 35 },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(88,116,94,0.20)',
  },
  createSlot: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center' },
  createOrb: {
    marginTop: -7,
    width: 58,
    height: 58,
    borderRadius: 29,
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
  createOrbCompact: { width: 52, height: 52, borderRadius: 26 },
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
