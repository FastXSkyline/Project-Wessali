import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
  const accent = tone === 'danger' ? palette.danger : palette.jadeBright;

  useEffect(() => {
    enter.setValue(0);
    Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: true,
      speed: 19,
      bounciness: 3,
    }).start();
  }, [enter, message]);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { height: insets.top + 112 }]}
    >
      <View pointerEvents="none" style={[styles.fadeLayer, { height: insets.top + 116 }]}>
        <BlurView
          intensity={38}
          tint="light"
          blurMethod="dimezisBlurViewSdk31Plus"
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[
            'rgba(211,232,255,0.94)',
            'rgba(225,240,255,0.78)',
            'rgba(236,246,255,0.38)',
            'rgba(243,248,253,0)',
          ]}
          locations={[0, 0.42, 0.72, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(36,124,199,0.10)', 'rgba(36,124,199,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentWash}
        />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            marginTop: insets.top + 8,
            opacity: enter,
            transform: [
              { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) },
            ],
          },
        ]}
      >
        <View style={[styles.icon, { backgroundColor: `${accent}16` }]}>
          <Ionicons
            name={tone === 'danger' ? 'alert-circle' : 'checkmark-circle'}
            size={18}
            color={accent}
          />
        </View>
        <AppText variant="caption" tone="ink" numberOfLines={2} style={styles.message}>
          {message}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onClose}
          hitSlop={10}
          style={({ pressed }) => [styles.close, pressed && { opacity: 0.55 }]}
        >
          <Ionicons name="close" size={17} color={palette.inkSoft} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  fadeLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  accentWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: palette.ink,
  },
  close: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
