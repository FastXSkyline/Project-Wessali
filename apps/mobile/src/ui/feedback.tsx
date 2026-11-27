import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '../theme';
import { AppText, useLocaleValue } from './base';

const AlphaMaskedView = MaskedView as unknown as React.ComponentType<{
  children?: React.ReactNode;
  maskElement: React.ReactElement;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
  style?: StyleProp<ViewStyle>;
}>;

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
      speed: 22,
      bounciness: 2,
    }).start();
  }, [enter, message]);

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { height: insets.top + 65 }]}>
      <AlphaMaskedView
        pointerEvents="none"
        style={[styles.blurFade, { height: insets.top + 104 }]}
        maskElement={
          <LinearGradient
            colors={['#000000', '#000000', 'rgba(0,0,0,0)']}
            locations={[0, 0.74, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        }
      >
        <BlurView
          intensity={29}
          tint="light"
          blurMethod="dimezisBlurViewSdk31Plus"
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(218,235,253,0.24)', 'rgba(228,241,255,0.06)']}
          locations={[0, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </AlphaMaskedView>

      <Animated.View
        style={[
          styles.content,
          {
            marginTop: insets.top + 5,
            opacity: enter,
            transform: [
              { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-7, 0] }) },
            ],
          },
        ]}
      >
        <View style={[styles.icon, { backgroundColor: `${accent}14` }]}>
          <Ionicons name={tone === 'danger' ? 'alert-circle' : 'checkmark-circle'} size={17} color={accent} />
        </View>
        <AppText variant="caption" tone="ink" numberOfLines={2} style={styles.message}>
          {message}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onClose}
          hitSlop={9}
          style={({ pressed }) => [styles.close, pressed && { opacity: 0.52 }]}
        >
          <Ionicons name="close" size={16} color={palette.inkSoft} />
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
  blurFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    minHeight: 43,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 18,
    paddingVertical: 5,
  },
  icon: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    minWidth: 0,
    fontSize: 12.5,
    lineHeight: 17,
    color: palette.ink,
  },
  close: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
