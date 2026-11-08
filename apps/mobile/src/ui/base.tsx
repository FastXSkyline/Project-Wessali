import React, { createContext, useContext, useId } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Locale } from '@wessali/i18n';
import {
  fontFamily,
  glassTokens,
  gradients,
  layout,
  palette,
  typeScale,
  type FontWeightName,
  type TypeVariant,
} from '../theme';

type LocaleValue = { locale: Locale; isRtl: boolean };

const LocaleContext = createContext<LocaleValue>({ locale: 'ar', isRtl: true });

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = React.useMemo<LocaleValue>(() => ({ locale, isRtl: locale === 'ar' }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleValue() {
  return useContext(LocaleContext);
}

export function useFontsForLocale() {
  const { locale } = useLocaleValue();
  return (weight: FontWeightName) => fontFamily(weight, locale);
}

export type TextTone =
  | 'ink'
  | 'soft'
  | 'muted'
  | 'faint'
  | 'jade'
  | 'aqua'
  | 'amber'
  | 'sand'
  | 'danger'
  | 'accentInk'
  | 'white';

const toneColors: Record<TextTone, string> = {
  ink: palette.ink,
  soft: palette.inkSoft,
  muted: palette.muted,
  faint: palette.faint,
  jade: palette.jade,
  aqua: palette.aqua,
  amber: palette.amber,
  sand: palette.sand,
  danger: palette.danger,
  accentInk: palette.onAccent,
  white: '#FFFFFF',
};

type AppTextProps = TextProps & {
  variant?: TypeVariant;
  tone?: TextTone;
  align?: 'left' | 'center' | 'right';
  weight?: FontWeightName;
};

export function AppText({
  variant = 'body',
  tone = 'ink',
  align,
  weight,
  style,
  ...rest
}: AppTextProps) {
  const { locale, isRtl } = useLocaleValue();
  const spec = typeScale[variant];
  const isArabic = locale === 'ar';
  const resolved: TextStyle = {
    fontFamily: fontFamily(weight ?? spec.weight, locale),
    fontSize: spec.fontSize,
    lineHeight: spec.lineHeight + (isArabic ? 3 : 0),
    letterSpacing: isArabic ? 0 : spec.letterSpacing,
    color: toneColors[tone],
    textAlign: align ?? (isRtl ? 'right' : 'left'),
    writingDirection: isRtl ? 'rtl' : 'ltr',
  };
  return <RNText {...rest} style={[resolved, style]} />;
}

type GlowProps = {
  size: number;
  color: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * A real light falloff, not a tinted disc. The alpha follows a long
 * near-quadratic tail with many stops, so the boundary is imperceptible on a
 * dark canvas and no hard rim can appear where a card clips it.
 */
export function RadialGlow({ size, color, opacity = 0.4, style }: GlowProps) {
  const rawId = useId();
  const id = `glow${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View pointerEvents="none" style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="12%" stopColor={color} stopOpacity={opacity * 0.66} />
            <Stop offset="26%" stopColor={color} stopOpacity={opacity * 0.38} />
            <Stop offset="42%" stopColor={color} stopOpacity={opacity * 0.18} />
            <Stop offset="58%" stopColor={color} stopOpacity={opacity * 0.072} />
            <Stop offset="74%" stopColor={color} stopOpacity={opacity * 0.022} />
            <Stop offset="88%" stopColor={color} stopOpacity={opacity * 0.005} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/**
 * Ambient light for a card or hero: two offset, oversized, very low alpha
 * clouds. Overlapping them removes the single-centre hot spot that reads as a
 * pasted circle.
 */
export function Aurora({
  color = palette.jade,
  secondary = palette.aqua,
  width = 420,
  height = 320,
  opacity = 0.3,
}: {
  color?: string;
  secondary?: string;
  width?: number;
  height?: number;
  opacity?: number;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <RadialGlow
        size={Math.max(width, height) * 1.15}
        color={color}
        opacity={opacity}
        style={{
          position: 'absolute',
          top: -height * 0.55,
          right: -width * 0.38,
        }}
      />
      <RadialGlow
        size={Math.max(width, height) * 0.95}
        color={secondary}
        opacity={opacity * 0.42}
        style={{
          position: 'absolute',
          bottom: -height * 0.6,
          left: -width * 0.42,
        }}
      />
    </View>
  );
}

export function AmbientField({ variant = 'app' }: { variant?: 'app' | 'auth' }) {
  const { width, height } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.canvas }]} />
      <LinearGradient
        colors={['rgba(226, 234, 224, 0.86)', 'rgba(243, 243, 239, 0)']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.8, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />
      <RadialGlow
        size={Math.max(380, width * 1.1)}
        color={palette.jade}
        opacity={variant === 'auth' ? 0.14 : 0.09}
        style={{ position: 'absolute', top: -width * 0.46, right: -width * 0.3 }}
      />
      <RadialGlow
        size={Math.max(320, width * 0.9)}
        color={palette.aqua}
        opacity={0.07}
        style={{ position: 'absolute', top: height * 0.25, left: -width * 0.42 }}
      />
      {variant === 'auth' ? (
        <RadialGlow
          size={280}
          color={palette.sand}
          opacity={0.08}
          style={{ position: 'absolute', top: height * 0.05, left: -40 }}
        />
      ) : null}
      <RadialGlow
        size={430}
        color={palette.amber}
        opacity={0.045}
        style={{ position: 'absolute', bottom: -230, right: -150 }}
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0)', 'rgba(75, 89, 77, 0.035)']}
        locations={[0, 0.34, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

type GlassCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  radius?: number;
  intensity?: number;
  tone?: 'default' | 'deep' | 'light';
};

export function GlassCard({
  children,
  style,
  padding = 18,
  radius = layout.cardRadius,
  intensity = 34,
  tone = 'default',
}: GlassCardProps) {
  return (
    <View
      style={[styles.cardShadow, { borderRadius: radius, shadowColor: glassTokens.shadow }, style]}
    >
      <View
        style={{
          borderRadius: radius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: glassTokens.rim,
          backgroundColor: palette.glass,
        }}
      >
        <BlurView
          intensity={intensity}
          tint="light"
          blurMethod="dimezisBlurViewSdk31Plus"
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={
            tone === 'deep'
              ? (['rgba(242, 246, 240, 0.96)', 'rgba(231, 237, 229, 0.90)'] as const)
              : tone === 'light'
                ? (['rgba(255,255,255,0.92)', 'rgba(255,255,255,0.72)'] as const)
                : ([glassTokens.fillTop, glassTokens.fillBottom] as const)
          }
          start={{ x: 0.06, y: 0 }}
          end={{ x: 0.94, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* A soft sheen from the top-left, like light grazing a glass pane. */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.075)', 'rgba(255,255,255,0)']}
          start={{ x: 0.12, y: 0 }}
          end={{ x: 0.55, y: 0.62 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Specular top edge: the single detail that sells a real material. */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0)', glassTokens.topEdge, 'rgba(255,255,255,0)']}
          locations={[0, 0.38, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topSpecular}
        />
        <View pointerEvents="none" style={[styles.innerHairline, { borderRadius: radius - 1 }]} />
        <View style={{ padding }}>{children}</View>
      </View>
    </View>
  );
}

export function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <RadialGlow
        size={size * 2.1}
        color={palette.jade}
        opacity={0.28}
        style={{ position: 'absolute', top: -size * 0.55, left: -size * 0.55 }}
      />
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.brandTile, { width: size, height: size, borderRadius: size * 0.32 }]}
      >
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Path
            d="M10.4 27.5 L16 13.5 L21 24.8 L27 11.8"
            stroke={palette.onAccent}
            strokeWidth={3.1}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.94}
          />
          <Circle cx={10.4} cy={27.5} r={2.05} fill={palette.onAccent} opacity={0.7} />
          <Circle cx={27} cy={11.8} r={2.3} fill={palette.onAccent} />
        </Svg>
        <View style={[styles.brandSheen, { borderRadius: size * 0.32 }]} />
      </LinearGradient>
      <View
        pointerEvents="none"
        style={[styles.brandRim, { width: size, height: size, borderRadius: size * 0.32 }]}
      />
    </View>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'W';
  return parts
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? '')
    .join('');
}

export function Avatar({
  name,
  size = 42,
  provider = false,
}: {
  name: string;
  size?: number;
  provider?: boolean;
}) {
  return (
    <View style={{ width: size, height: size }}>
      <RadialGlow
        size={size * 1.9}
        color={provider ? palette.sand : palette.jade}
        opacity={0.22}
        style={{ position: 'absolute', top: -size * 0.45, left: -size * 0.45 }}
      />
      <LinearGradient
        colors={provider ? ['#E7D9C5', '#B38B5B'] : ['#D7E3D7', '#77947C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.3)',
        }}
      >
        <AppText
          variant="label"
          weight="bold"
          align="center"
          style={{
            color: provider ? '#5B4225' : '#334F39',
            fontSize: size * 0.32,
            lineHeight: size * 0.4,
          }}
        >
          {initials(name)}
        </AppText>
      </LinearGradient>
    </View>
  );
}

type PageProps = {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  bottomSpace?: number;
  topSpace?: number;
  variant?: 'app' | 'auth';
  refreshControl?: React.ReactElement;
};

export function Page({
  children,
  contentStyle,
  scroll = true,
  bottomSpace = layout.dockSpace,
  topSpace = 10,
  variant = 'app',
  refreshControl,
}: PageProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = insets.top + topSpace;
  const paddingBottom = insets.bottom + bottomSpace + 18;

  return (
    <View style={styles.page}>
      <AmbientField variant={variant} />
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop, paddingBottom },
            contentStyle,
          ]}
          refreshControl={refreshControl}
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.pageInner}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.pageInner, { paddingTop, paddingBottom, flex: 1 }, contentStyle]}>
          {children}
        </View>
      )}
    </View>
  );
}

export function SectionHeading({
  title,
  caption,
  action,
  onAction,
}: {
  title: string;
  caption?: string;
  action?: string;
  onAction?: () => void;
}) {
  const { isRtl } = useLocaleValue();
  return (
    <View style={[styles.sectionHeading, isRtl && styles.rowReverse]}>
      <View style={{ flex: 1, gap: 3 }}>
        <AppText variant="h3">{title}</AppText>
        {caption ? (
          <AppText variant="caption" tone="muted">
            {caption}
          </AppText>
        ) : null}
      </View>
      {action && onAction ? (
        <AppText variant="label" tone="jade" onPress={onAction} suppressHighlighting>
          {action}
        </AppText>
      ) : null}
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

export function RouteDoodle({
  height = 150,
  opacity = 0.5,
  color = palette.jade,
}: {
  height?: number;
  opacity?: number;
  color?: string;
}) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      <Svg width="100%" height="100%" viewBox="0 0 360 160" preserveAspectRatio="xMidYMid slice">
        <Path
          d="M-20 112 C 42 70, 86 138, 152 104 S 258 48, 390 84"
          stroke="rgba(84, 107, 89, 0.12)"
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M-20 132 C 46 92, 96 154, 158 124 S 272 68, 390 108"
          stroke="rgba(84, 107, 89, 0.085)"
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M-20 92 C 48 52, 104 116, 168 84 S 272 30, 390 62"
          stroke="rgba(84, 107, 89, 0.07)"
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M18 128 C 84 118, 98 84, 164 82 S 248 96, 338 38"
          stroke={color}
          strokeOpacity={0.5}
          strokeWidth={1.4}
          strokeDasharray="4 7"
          fill="none"
        />
        <Circle cx={18} cy={128} r={3.6} fill={color} opacity={0.85} />
        <Circle cx={18} cy={128} r={9} stroke={color} strokeOpacity={0.25} fill="none" />
        <Circle cx={338} cy={38} r={4.4} fill={palette.mint} />
        <Circle cx={338} cy={38} r={11} stroke={palette.mint} strokeOpacity={0.22} fill="none" />
        <Circle cx={338} cy={38} r={20} stroke={palette.mint} strokeOpacity={0.08} fill="none" />
      </Svg>
    </View>
  );
}

export function EmptyArt({
  icon,
  color = palette.jade,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color?: string;
}) {
  return (
    <View style={styles.emptyArt}>
      <RadialGlow
        size={150}
        color={color}
        opacity={0.24}
        style={{ position: 'absolute', top: -30, left: -30 }}
      />
      <View style={[styles.emptyOrb, { borderColor: `${color}33` }]}>
        <View style={[styles.emptyInner, { backgroundColor: `${color}14` }]}>
          <Ionicons name={icon} size={27} color={color} />
        </View>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.canvas, overflow: 'hidden' },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingHorizontal: layout.screenPadding,
  },
  pageInner: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    gap: 18,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  divider: { height: 1, backgroundColor: palette.lineSoft },
  cardShadow: {
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  topSpecular: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 1,
  },
  innerHairline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: glassTokens.rimInner,
  },
  brandTile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(72, 91, 76, 0.13)',
    overflow: 'hidden',
  },
  brandSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  brandRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.76)',
  },
  emptyArt: {
    width: 90,
    height: 90,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyOrb: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
