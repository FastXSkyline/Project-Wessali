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

/** How much of the sphere clears the bottom edge of the screen. */
const VISIBLE = 96;

/**
 * The navigation is a single frosted sphere sunk halfway below the screen
 * edge. Only its upper dome shows; a canvas gradient dissolves that dome into
 * the page so there is no visible top border.
 */
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
  // Wider than the viewport on every device, so the visible part reads as a
  // horizon of glass rather than a floating ball.
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
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(4, 18, 13, 0)', 'rgba(3, 12, 8, 0.62)', 'rgba(2, 8, 5, 0.95)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

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
          intensity={80}
          tint="dark"
          blurMethod="dimezisBlurViewSdk31Plus"
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(22, 60, 44, 0.9)', 'rgba(7, 26, 18, 0.96)', 'rgba(2, 9, 6, 0.99)']}
          locations={[0, 0.4, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <RadialGlow
          size={diameter * 0.7}
          color={palette.jade}
          opacity={0.1}
          style={{ position: 'absolute', top: -diameter * 0.42, left: diameter * 0.12 }}
        />
        <RadialGlow
          size={diameter * 0.5}
          color={palette.aqua}
          opacity={0.05}
          style={{ position: 'absolute', top: -diameter * 0.36, right: diameter * 0.1 }}
        />
        <View style={[styles.domeRim, { borderRadius: diameter / 2 }]} />
      </View>

      {/* The canvas breathes over the top of the glass so the arc has no seam. */}
      <LinearGradient
        pointerEvents="none"
        colors={[palette.canvas, 'rgba(4, 18, 13, 0.72)', 'rgba(4, 18, 13, 0)']}
        locations={[0, 0.4, 1]}
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
                  size={118}
                  color={palette.jade}
                  opacity={0.22}
                  style={{ position: 'absolute', top: -28, left: -31 }}
                />
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0.15, y: 0 }}
                  end={{ x: 0.9, y: 1 }}
                  style={styles.createOrb}
                >
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0.55)',
                      'rgba(255,255,255,0.08)',
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
                      colors={['rgba(61, 239, 169, 0.26)', 'rgba(61, 239, 169, 0.08)']}
                      start={{ x: 0.2, y: 0 }}
                      end={{ x: 0.8, y: 1 }}
                      style={styles.activePill}
                    />
                    <RadialGlow
                      size={62}
                      color={palette.jade}
                      opacity={0.24}
                      style={{ position: 'absolute', top: -14, left: -12 }}
                    />
                  </>
                ) : null}
                <Ionicons
                  name={selected ? item.activeIcon : item.icon}
                  size={19}
                  color={selected ? palette.jadeBright : 'rgba(214, 240, 228, 0.6)'}
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
                  color: selected ? palette.ink : 'rgba(190, 220, 206, 0.52)',
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
    borderColor: 'rgba(170, 252, 216, 0.20)',
    backgroundColor: 'rgba(5, 18, 13, 0.72)',
  },
  domeRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.055)',
  },
  topFade: {
    position: 'absolute',
    top: -16,
    left: 0,
    right: 0,
    height: 44,
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
    borderColor: 'rgba(123, 255, 208, 0.22)',
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
    borderColor: 'rgba(255, 255, 255, 0.38)',
    shadowColor: palette.jade,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  orbRim: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
});
