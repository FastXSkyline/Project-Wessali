import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  UIManager,
  useWindowDimensions,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type MotionDirection = 'forward' | 'back' | 'up' | 'down' | 'fade';

type ScreenTransitionProps = {
  transitionKey: string;
  direction?: MotionDirection;
  children: React.ReactNode;
};

function offsets(direction: MotionDirection, width: number, height: number) {
  switch (direction) {
    case 'forward':
      return { fromX: width * 0.14, fromY: 0, exitX: -width * 0.055, exitY: 0 };
    case 'back':
      return { fromX: -width * 0.14, fromY: 0, exitX: width * 0.055, exitY: 0 };
    case 'up':
      return { fromX: 0, fromY: height * 0.075, exitX: 0, exitY: -height * 0.035 };
    case 'down':
      return { fromX: 0, fromY: -height * 0.075, exitX: 0, exitY: height * 0.035 };
    default:
      return { fromX: 0, fromY: 0, exitX: 0, exitY: 0 };
  }
}

export function directionBetween(
  fromIndex: number,
  toIndex: number,
  isRtl = false,
): MotionDirection {
  if (fromIndex === toIndex) return 'fade';
  const movesRight = (toIndex > fromIndex) !== isRtl;
  return movesRight ? 'forward' : 'back';
}

export function animateLayout() {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

const androidUIManager = UIManager as typeof UIManager & {
  setLayoutAnimationEnabledExperimental?: (enabled: boolean) => void;
};

if (Platform.OS === 'android') {
  androidUIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export function ScreenTransition({
  transitionKey,
  direction = 'forward',
  children,
}: ScreenTransitionProps) {
  const { width, height } = useWindowDimensions();
  const activeRef = useRef({ key: transitionKey, child: children });
  const [outgoing, setOutgoing] = useState<{
    key: string;
    child: React.ReactNode;
  } | null>(null);
  const incomingOpacity = useRef(new Animated.Value(1)).current;
  const incomingX = useRef(new Animated.Value(0)).current;
  const incomingY = useRef(new Animated.Value(0)).current;
  const outgoingOpacity = useRef(new Animated.Value(0)).current;
  const outgoingX = useRef(new Animated.Value(0)).current;
  const outgoingY = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  if (activeRef.current.key === transitionKey) {
    activeRef.current = { key: transitionKey, child: children };
  }

  useLayoutEffect(() => {
    const previous = activeRef.current;
    if (previous.key === transitionKey) return;

    animationRef.current?.stop();
    activeRef.current = { key: transitionKey, child: children };
    setOutgoing(previous);

    const motion = offsets(direction, width, height);
    incomingOpacity.setValue(0);
    incomingX.setValue(motion.fromX);
    incomingY.setValue(motion.fromY);
    outgoingOpacity.setValue(1);
    outgoingX.setValue(0);
    outgoingY.setValue(0);

    const animation = Animated.parallel([
      Animated.spring(incomingX, {
        toValue: 0,
        damping: 27,
        stiffness: 185,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(incomingY, {
        toValue: 0,
        damping: 27,
        stiffness: 185,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.timing(incomingOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(outgoingOpacity, {
        toValue: 0,
        duration: 235,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(outgoingX, {
        toValue: motion.exitX,
        duration: 265,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(outgoingY, {
        toValue: motion.exitY,
        duration: 265,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animationRef.current = animation;
    animation.start(({ finished }) => {
      if (finished) setOutgoing(null);
    });

    return () => animation.stop();
  }, [
    children,
    direction,
    height,
    incomingOpacity,
    incomingX,
    incomingY,
    outgoingOpacity,
    outgoingX,
    outgoingY,
    transitionKey,
    width,
  ]);

  return (
    <Animated.View style={styles.stage}>
      {outgoing ? (
        <Animated.View
          key={outgoing.key}
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: outgoingOpacity,
              transform: [{ translateX: outgoingX }, { translateY: outgoingY }],
            },
          ]}
        >
          {outgoing.child}
        </Animated.View>
      ) : null}
      <Animated.View
        key={transitionKey}
        style={{
          flex: 1,
          opacity: incomingOpacity,
          transform: [{ translateX: incomingX }, { translateY: incomingY }],
        }}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

export function ContentTransition({
  transitionKey,
  direction = 'forward',
  children,
  style,
}: ScreenTransitionProps & { style?: StyleProp<ViewStyle> }) {
  const { width, height } = useWindowDimensions();
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const currentKey = useRef(transitionKey);

  useLayoutEffect(() => {
    if (currentKey.current === transitionKey) return;
    currentKey.current = transitionKey;
    const motion = offsets(direction, width, height);
    opacity.setValue(0);
    translateX.setValue(motion.fromX * 0.22 || (direction === 'fade' ? 0 : direction === 'up' || direction === 'down' ? 0 : 14));
    translateY.setValue(motion.fromY * 0.22);
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        damping: 24,
        stiffness: 210,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        stiffness: 210,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 265,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [direction, height, opacity, transitionKey, translateX, translateY, width]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

type MotionPressableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function MotionPressable({
  children,
  style,
  contentStyle,
  onPressIn,
  onPressOut,
  ...rest
}: MotionPressableProps) {
  const progress = useRef(new Animated.Value(0)).current;

  function pressIn(event: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) {
    Animated.spring(progress, {
      toValue: 1,
      damping: 24,
      stiffness: 340,
      mass: 0.65,
      useNativeDriver: true,
    }).start();
    onPressIn?.(event);
  }

  function pressOut(event: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) {
    Animated.spring(progress, {
      toValue: 0,
      damping: 22,
      stiffness: 280,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
    onPressOut?.(event);
  }

  const animatedStyle = {
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] }),
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1.5] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.992] }) },
    ],
  };

  return (
    <Pressable {...rest} style={style} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View style={[styles.pressableContent, contentStyle, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function StaggeredItem({
  index,
  children,
  style,
}: {
  index: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(11)).current;

  useLayoutEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(Math.min(index * 42, 210)),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 23,
          stiffness: 190,
          mass: 0.85,
          useNativeDriver: true,
        }),
      ]),
    ]);
    animation.start();
    return () => animation.stop();
  }, [index, opacity, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, overflow: 'hidden' },
  pressableContent: { flexGrow: 1, minWidth: 0 },
});
