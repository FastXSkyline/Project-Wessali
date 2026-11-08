import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '../theme';
import { AppText, useLocaleValue } from './base';

export function FeedbackToast({
  message,
  tone,
  onClose,
}: {
  message: string;
  tone: 'success' | 'danger';
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { isRtl } = useLocaleValue();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    enter.setValue(0);
    Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  }, [enter, message]);

  const accent = tone === 'danger' ? palette.danger : palette.jade;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          top: insets.top + 8,
          opacity: enter,
          transform: [
            {
              translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.toast, { borderColor: `${accent}3D` }]}>
        <BlurView
          intensity={60}
          tint="dark"
          blurMethod="dimezisBlurViewSdk31Plus"
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(7, 25, 18, 0.78)' }]} />
        <View style={[styles.iconWrap, { backgroundColor: `${accent}1F` }]}>
          <Ionicons
            name={tone === 'danger' ? 'alert-circle' : 'checkmark-circle'}
            size={17}
            color={accent}
          />
        </View>
        <AppText variant="caption" tone="ink" numberOfLines={3} style={{ flex: 1, lineHeight: 17 }}>
          {message}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onClose}
          hitSlop={10}
          style={[styles.close, isRtl && { transform: [{ scaleX: -1 }] }]}
        >
          <Ionicons name="close" size={15} color={palette.muted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 50,
  },
  toast: {
    width: '100%',
    maxWidth: 520,
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
