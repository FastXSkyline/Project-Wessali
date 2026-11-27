import { brandColors, radii, spacing } from '@wessali/design-tokens';
import type { Locale } from '@wessali/i18n';
import type { ServiceKind } from '@wessali/contracts';

export { brandColors, radii, spacing };

/** Wessali's calm navy + sky-blue logistics identity. */
export const palette = {
  canvas: '#F3F7FC',
  canvasDeep: '#EAF1F9',
  canvasLift: '#FFFFFF',
  ink: '#102A46',
  inkSoft: '#4E657D',
  muted: '#71859B',
  faint: '#A1B2C4',
  jade: '#123F69',
  jadeBright: '#247CC7',
  jadeDeep: '#082A4B',
  mint: '#E8F3FF',
  sand: '#607B97',
  amber: '#D69A45',
  aqua: '#2F9ACD',
  danger: '#D95768',
  success: '#247CC0',
  white08: 'rgba(16, 53, 91, 0.035)',
  white12: 'rgba(16, 53, 91, 0.055)',
  white18: 'rgba(16, 53, 91, 0.085)',
  line: 'rgba(26, 66, 110, 0.13)',
  lineSoft: 'rgba(26, 66, 110, 0.075)',
  glass: 'rgba(255, 255, 255, 0.96)',
  glassDeep: 'rgba(248, 251, 255, 0.98)',
  glassLight: 'rgba(255, 255, 255, 0.98)',
  onAccent: '#FFFFFF',
  scrim: 'rgba(7, 27, 51, 0.58)',
  dangerSoft: 'rgba(217, 87, 104, 0.09)',
} as const;

export const glassTokens = {
  topEdge: 'rgba(255, 255, 255, 0.92)',
  rim: 'rgba(28, 72, 120, 0.10)',
  rimInner: 'rgba(255, 255, 255, 0.72)',
  fillTop: 'rgba(255, 255, 255, 0.97)',
  fillBottom: 'rgba(247, 250, 255, 0.94)',
  shadow: 'rgba(24, 55, 92, 0.065)',
} as const;

export const serviceTheme: Record<
  ServiceKind,
  { accent: string; accentSoft: string; icon: string; gradient: [string, string, string] }
> = {
  freight: {
    accent: '#185C99',
    accentSoft: 'rgba(24, 92, 153, 0.10)',
    icon: 'truck-fast-outline',
    gradient: ['#E7F2FE', '#A9CFF1', '#286FAE'],
  },
  roadside: {
    accent: '#D95768',
    accentSoft: 'rgba(217, 87, 104, 0.10)',
    icon: 'car-wrench',
    gradient: ['#FFF0F2', '#F4B8C1', '#D95768'],
  },
  water: {
    accent: '#258FBE',
    accentSoft: 'rgba(37, 143, 190, 0.10)',
    icon: 'water-outline',
    gradient: ['#E9F8FC', '#A8DDEB', '#258FBE'],
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
  jade: palette.jadeBright,
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
  display: { fontSize: 36, lineHeight: 44, weight: 'black', letterSpacing: -1.1 },
  h1: { fontSize: 27, lineHeight: 34, weight: 'bold', letterSpacing: -0.55 },
  h2: { fontSize: 21, lineHeight: 28, weight: 'bold', letterSpacing: -0.3 },
  h3: { fontSize: 16.5, lineHeight: 23, weight: 'semibold', letterSpacing: -0.08 },
  body: { fontSize: 14, lineHeight: 21, weight: 'regular', letterSpacing: 0 },
  bodyStrong: { fontSize: 14, lineHeight: 21, weight: 'semibold', letterSpacing: 0 },
  label: { fontSize: 11.5, lineHeight: 16, weight: 'semibold', letterSpacing: 0.12 },
  caption: { fontSize: 11, lineHeight: 15.5, weight: 'medium', letterSpacing: 0 },
  button: { fontSize: 14, lineHeight: 19, weight: 'semibold', letterSpacing: 0 },
  number: { fontSize: 29, lineHeight: 36, weight: 'bold', letterSpacing: -0.7 },
};

export const layout = {
  screenPadding: 18,
  maxWidth: 560,
  dockSpace: 108,
  cardRadius: radii.xl,
};

export const glow = {
  jade: { color: palette.jadeBright, opacity: 0.075 },
  aqua: { color: palette.aqua, opacity: 0.07 },
  amber: { color: palette.amber, opacity: 0.065 },
  sand: { color: palette.sand, opacity: 0.06 },
  danger: { color: palette.danger, opacity: 0.07 },
};

export const gradients = {
  primary: ['#1A69A8', '#124B7D', '#0A3157'] as const,
  glass: ['rgba(255,255,255,0.97)', 'rgba(255,255,255,0.88)', 'rgba(242,247,253,0.76)'] as const,
  deepGlass: ['rgba(248,251,255,0.98)', 'rgba(239,246,254,0.94)'] as const,
  canvas: [palette.canvas, palette.canvasDeep] as const,
};
