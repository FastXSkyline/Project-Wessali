import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gradients, palette } from '../theme';
import { AppText, useLocaleValue } from './base';
import { MotionPressable } from './motion';

export type Tab = 'home' | 'requests' | 'create' | 'partner' | 'profile';

type Item = {
  tab: Tab;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  activeIcon: React.ComponentProps<typeof Ionicons>['name'];
};

function DockTab({
  item,
  selected,
  compact,
  onSelect,
}: {
  item: Item;
  selected: boolean;
  compact: boolean;
  onSelect: () => void;
}) {
  const progress = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: selected ? 1 : 0,
      damping: 22,
      stiffness: 230,
      mass: 0.72,
      useNativeDriver: true,
    }).start();
  }, [progress, selected]);

  const iconY = progress.interpolate({ inputRange: [0, 1], outputRange: [2, 0] });
  const iconScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const iconOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] });

  return (
    <MotionPressable
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected }}
      onPress={onSelect}
      style={styles.item}
      contentStyle={styles.dockItemContent}
    >
      <Animated.View
        style={[
          styles.iconSlot,
          selected && styles.iconSlotActive,
          {
            opacity: iconOpacity,
            transform: [{ translateY: iconY }, { scale: iconScale }],
          },
        ]}
      >
        <Ionicons
          name={selected ? item.activeIcon : item.icon}
          size={compact ? 19 : 21}
          color={selected ? palette.jadeBright : palette.muted}
        />
      </Animated.View>
      <AppText
        variant="caption"
        align="center"
        numberOfLines={1}
        style={{
          color: selected ? palette.jadeDeep : palette.muted,
          fontSize: compact ? 8 : 9,
          opacity: selected ? 1 : 0.82,
        }}
      >
        {item.label}
      </AppText>
    </MotionPressable>
  );
}

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
  const items: Item[] = [
    { tab: 'home', label: labels.home, icon: 'home-outline', activeIcon: 'home' },
    { tab: 'requests', label: labels.requests, icon: 'receipt-outline', activeIcon: 'receipt' },
    { tab: 'create', label: labels.new, icon: 'add', activeIcon: 'add' },
    { tab: 'partner', label: labels.partner, icon: 'briefcase-outline', activeIcon: 'briefcase' },
    { tab: 'profile', label: labels.profile, icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 7) }]}>
      <View style={[styles.row, isRtl && styles.rowReverse]}>
        {items.map((item) => {
          if (item.tab === 'create') {
            return (
              <MotionPressable
                key={item.tab}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => onSelect(item.tab)}
                style={styles.createSlot}
                contentStyle={styles.createContent}
              >
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.createOrb, compact && styles.createOrbCompact]}
                >
                  <Ionicons name="add" size={25} color="#FFFFFF" />
                </LinearGradient>
                <AppText variant="caption" align="center" style={styles.createLabel}>
                  {item.label}
                </AppText>
              </MotionPressable>
            );
          }

          return (
            <DockTab
              key={item.tab}
              item={item}
              selected={item.tab === active}
              compact={compact}
              onSelect={() => onSelect(item.tab)}
            />
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
    minHeight: 76,
    backgroundColor: 'rgba(255,255,255,0.99)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(28,72,120,0.10)',
    shadowColor: '#193A5E',
    shadowOpacity: 0.055,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 10,
    paddingTop: 7,
    paddingHorizontal: 7,
  },
  row: {
    minHeight: 59,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  rowReverse: { flexDirection: 'row-reverse' },
  item: { flex: 1, minWidth: 0 },
  dockItemContent: { alignItems: 'center', justifyContent: 'center', gap: 3 },
  iconSlot: { width: 40, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconSlotActive: { backgroundColor: '#E9F2FC' },
  createSlot: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center' },
  createContent: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  createOrb: {
    width: 47,
    height: 47,
    borderRadius: 24,
    marginTop: -17,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.jade,
    shadowOpacity: 0.18,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  createOrbCompact: { width: 43, height: 43, borderRadius: 22 },
  createLabel: { color: palette.muted, fontSize: 8.5 },
});
