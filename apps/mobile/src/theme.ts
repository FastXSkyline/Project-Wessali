import { brandColors, radii, spacing } from '@wessali/design-tokens';
import type { Locale } from '@wessali/i18n';
import type { ServiceKind } from '@wessali/contracts';

export { brandColors, radii, spacing };

export const palette = {
  canvas: '#04120D',
  canvasDeep: '#010705',
  canvasLift: '#082018',
  ink: '#F2FFF9',
  inkSoft: '#CBE5D8',
  muted: '#8FB3A4',
  faint: '#5F8375',
  jade: '#3DEFA9',
  jadeBright: '#7BFFD0',
  jadeDeep: '#0B7F5A',
  mint: '#D6FFEE',
  sand: '#F0D8A9',
  amber: '#FFB45E',
  aqua: '#6CDCF4',
  danger: '#FF7B7B',
  success: '#37E1A5',
  white08: 'rgba(255, 255, 255, 0.08)',
  white12: 'rgba(255, 255, 255, 0.12)',
  white18: 'rgba(255, 255, 255, 0.18)',
  line: 'rgba(160, 250, 214, 0.15)',
  lineSoft: 'rgba(160, 250, 214, 0.075)',
  glass: 'rgba(12, 40, 29, 0.62)',
  glassDeep: 'rgba(4, 16, 11, 0.72)',
  glassLight: 'rgba(38, 84, 64, 0.34)',
  onAccent: '#022117',
  scrim: 'rgba(2, 10, 7, 0.74)',
  dangerSoft: 'rgba(255, 123, 123, 0.12)',
} as const;

/** Edge colours used by the glass system: a cool top light and a warm floor. */
export const glassTokens = {
  topEdge: 'rgba(198, 255, 232, 0.52)',
  rim: 'rgba(170, 252, 216, 0.16)',
  rimInner: 'rgba(255, 255, 255, 0.05)',
  fillTop: 'rgba(21, 62, 46, 0.62)',
  fillBottom: 'rgba(4, 17, 12, 0.72)',
  shadow: 'rgba(0, 6, 4, 0.55)',
} as const;

export const serviceTheme: Record<
  ServiceKind,
  { accent: string; accentSoft: string; icon: string; gradient: [string, string, string] }
> = {
  freight: {
    accent: palette.jade,
    accentSoft: 'rgba(55, 225, 165, 0.18)',
    icon: 'truck-fast-outline',
    gradient: ['#2FE6B0', '#14A97A', '#086148'],
  },
  roadside: {
    accent: palette.amber,
    accentSoft: 'rgba(255, 180, 94, 0.18)',
    icon: 'car-wrench',
    gradient: ['#FFD08A', '#F09A43', '#8A4A15'],
  },
  water: {
    accent: palette.aqua,
    accentSoft: 'rgba(108, 220, 244, 0.18)',
    icon: 'water-outline',
    gradient: ['#8AE9FA', '#31B8DC', '#0D6076'],
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
  display: { fontSize: 42, lineHeight: 48, weight: 'black', letterSpacing: -1.7 },
  h1: { fontSize: 31, lineHeight: 37, weight: 'bold', letterSpacing: -1 },
  h2: { fontSize: 23, lineHeight: 29, weight: 'bold', letterSpacing: -0.5 },
  h3: { fontSize: 18, lineHeight: 24, weight: 'semibold', letterSpacing: -0.2 },
  body: { fontSize: 14.5, lineHeight: 22, weight: 'regular', letterSpacing: 0 },
  bodyStrong: { fontSize: 14.5, lineHeight: 22, weight: 'semibold', letterSpacing: 0 },
  label: { fontSize: 12, lineHeight: 16, weight: 'semibold', letterSpacing: 0.3 },
  caption: { fontSize: 11, lineHeight: 15, weight: 'medium', letterSpacing: 0.15 },
  button: { fontSize: 14.5, lineHeight: 19, weight: 'semibold', letterSpacing: 0 },
  number: { fontSize: 34, lineHeight: 38, weight: 'bold', letterSpacing: -1.3 },
};

export const layout = {
  screenPadding: 22,
  maxWidth: 560,
  dockSpace: 132,
  cardRadius: radii.xl,
};

export const glow = {
  jade: { color: palette.jade, opacity: 0.42 },
  aqua: { color: palette.aqua, opacity: 0.22 },
  amber: { color: palette.amber, opacity: 0.14 },
  sand: { color: palette.sand, opacity: 0.2 },
  danger: { color: palette.danger, opacity: 0.22 },
};

export const gradients = {
  primary: ['#74F8C9', '#2BD79E', '#12A778'] as const,
  glass: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.025)', 'rgba(3,14,9,0.18)'] as const,
  deepGlass: ['rgba(23, 61, 45, 0.72)', 'rgba(7, 24, 17, 0.55)'] as const,
  canvas: [palette.canvas, palette.canvasDeep] as const,
};
