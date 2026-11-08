import { brandColors, radii, spacing } from '@wessali/design-tokens';
import type { Locale } from '@wessali/i18n';
import type { ServiceKind } from '@wessali/contracts';

export { brandColors, radii, spacing };

/** Warm, neutral surfaces with a restrained sage identity. */
export const palette = {
  canvas: '#F3F3EF',
  canvasDeep: '#E8EAE4',
  canvasLift: '#FFFFFF',
  ink: '#202A24',
  inkSoft: '#536159',
  muted: '#748078',
  faint: '#98A198',
  jade: '#58745E',
  jadeBright: '#66866C',
  jadeDeep: '#3F5E47',
  mint: '#E3ECE2',
  sand: '#A98255',
  amber: '#B7834D',
  aqua: '#668795',
  danger: '#B85F58',
  success: '#63836A',
  white08: 'rgba(36, 50, 40, 0.055)',
  white12: 'rgba(36, 50, 40, 0.08)',
  white18: 'rgba(36, 50, 40, 0.12)',
  line: 'rgba(55, 73, 60, 0.15)',
  lineSoft: 'rgba(55, 73, 60, 0.085)',
  glass: 'rgba(255, 255, 255, 0.82)',
  glassDeep: 'rgba(249, 250, 247, 0.94)',
  glassLight: 'rgba(255, 255, 255, 0.94)',
  onAccent: '#FFFFFF',
  scrim: 'rgba(24, 34, 28, 0.54)',
  dangerSoft: 'rgba(184, 95, 88, 0.10)',
} as const;

export const glassTokens = {
  topEdge: 'rgba(255, 255, 255, 0.94)',
  rim: 'rgba(72, 91, 76, 0.14)',
  rimInner: 'rgba(255, 255, 255, 0.76)',
  fillTop: 'rgba(255, 255, 255, 0.92)',
  fillBottom: 'rgba(246, 247, 243, 0.88)',
  shadow: 'rgba(38, 48, 40, 0.13)',
} as const;

export const serviceTheme: Record<
  ServiceKind,
  { accent: string; accentSoft: string; icon: string; gradient: [string, string, string] }
> = {
  freight: {
    accent: palette.jade,
    accentSoft: 'rgba(88, 116, 94, 0.13)',
    icon: 'truck-fast-outline',
    gradient: ['#D2E0D1', '#91AA92', '#58745E'],
  },
  roadside: {
    accent: palette.amber,
    accentSoft: 'rgba(183, 131, 77, 0.14)',
    icon: 'car-wrench',
    gradient: ['#F0E0CC', '#C8A37B', '#8D6944'],
  },
  water: {
    accent: palette.aqua,
    accentSoft: 'rgba(102, 135, 149, 0.14)',
    icon: 'water-outline',
    gradient: ['#DCE7E9', '#A3BCC3', '#668795'],
  },
};

export const statusTone: Record<string, 'jade' | 'aqua' | 'amber' | 'sand' | 'danger' | 'muted'> = {
  draft: 'muted',
  submitted: 'jade',
  matching: 'aqua',
  offer_received: 'sand',
  accepted: 'jade',
  provider_en_route: 'aqua',
  arrived: 'amber',
  in_progress: 'amber',
  completed: 'jade',
  cancelled: 'danger',
  expired: 'muted',
  disputed: 'danger',
};

export const accentForTone = {
  jade: palette.jade,
  aqua: palette.aqua,
  amber: palette.amber,
  sand: palette.sand,
  danger: palette.danger,
  muted: palette.muted,
};

export type TypeVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'button'
  | 'number';

export type FontWeightName = 'regular' | 'medium' | 'semibold' | 'bold' | 'black';

const latinFonts: Record<FontWeightName, string> = {
  regular: 'Sora_400Regular',
  medium: 'Sora_500Medium',
  semibold: 'Sora_600SemiBold',
  bold: 'Sora_700Bold',
  black: 'Sora_800ExtraBold',
};

const arabicFonts: Record<FontWeightName, string> = {
  regular: 'IBMPlexSansArabic_400Regular',
  medium: 'IBMPlexSansArabic_500Medium',
  semibold: 'IBMPlexSansArabic_600SemiBold',
  bold: 'IBMPlexSansArabic_700Bold',
  black: 'IBMPlexSansArabic_700Bold',
};

export function fontFamily(weight: FontWeightName, locale: Locale) {
  return locale === 'ar' ? arabicFonts[weight] : latinFonts[weight];
}

export const typeScale: Record<
  TypeVariant,
  { fontSize: number; lineHeight: number; weight: FontWeightName; letterSpacing: number }
> = {
  display: { fontSize: 40, lineHeight: 47, weight: 'black', letterSpacing: -1.5 },
  h1: { fontSize: 30, lineHeight: 37, weight: 'bold', letterSpacing: -0.9 },
  h2: { fontSize: 23, lineHeight: 29, weight: 'bold', letterSpacing: -0.45 },
  h3: { fontSize: 18, lineHeight: 24, weight: 'semibold', letterSpacing: -0.15 },
  body: { fontSize: 14.5, lineHeight: 22, weight: 'regular', letterSpacing: 0 },
  bodyStrong: { fontSize: 14.5, lineHeight: 22, weight: 'semibold', letterSpacing: 0 },
  label: { fontSize: 12, lineHeight: 16, weight: 'semibold', letterSpacing: 0.2 },
  caption: { fontSize: 11, lineHeight: 15, weight: 'medium', letterSpacing: 0.1 },
  button: { fontSize: 14.5, lineHeight: 19, weight: 'semibold', letterSpacing: 0 },
  number: { fontSize: 32, lineHeight: 38, weight: 'bold', letterSpacing: -1.1 },
};

export const layout = {
  screenPadding: 20,
  maxWidth: 560,
  dockSpace: 132,
  cardRadius: radii.xl,
};

export const glow = {
  jade: { color: palette.jade, opacity: 0.13 },
  aqua: { color: palette.aqua, opacity: 0.09 },
  amber: { color: palette.amber, opacity: 0.09 },
  sand: { color: palette.sand, opacity: 0.11 },
  danger: { color: palette.danger, opacity: 0.12 },
};

export const gradients = {
  primary: ['#829C83', '#66836A', '#4E6A53'] as const,
  glass: ['rgba(255,255,255,0.94)', 'rgba(255,255,255,0.70)', 'rgba(237,240,234,0.35)'] as const,
  deepGlass: ['rgba(248,250,246,0.96)', 'rgba(235,239,232,0.90)'] as const,
  canvas: [palette.canvas, palette.canvasDeep] as const,
};
