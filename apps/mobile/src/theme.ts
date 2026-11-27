import { brandColors, radii, spacing } from '@wessali/design-tokens';
import type { Locale } from '@wessali/i18n';
import type { ServiceKind } from '@wessali/contracts';

export { brandColors, radii, spacing };

/** Navy and blue logistics identity based on the customer's reference. */
export const palette = {
  canvas: '#F4F7FB',
  canvasDeep: '#EAF0F8',
  canvasLift: '#FFFFFF',
  ink: '#132B49',
  inkSoft: '#52677F',
  muted: '#74869B',
  faint: '#9AAABD',
  jade: '#0E3C68',
  jadeBright: '#176FC2',
  jadeDeep: '#082B50',
  mint: '#E5F1FF',
  sand: '#54799F',
  amber: '#D99A37',
  aqua: '#3688D9',
  danger: '#E34F59',
  success: '#2475BE',
  white08: 'rgba(18, 54, 92, 0.035)',
  white12: 'rgba(18, 54, 92, 0.055)',
  white18: 'rgba(18, 54, 92, 0.085)',
  line: 'rgba(26, 66, 110, 0.13)',
  lineSoft: 'rgba(26, 66, 110, 0.075)',
  glass: 'rgba(255, 255, 255, 0.96)',
  glassDeep: 'rgba(248, 251, 255, 0.98)',
  glassLight: 'rgba(255, 255, 255, 0.98)',
  onAccent: '#FFFFFF',
  scrim: 'rgba(7, 27, 51, 0.58)',
  dangerSoft: 'rgba(227, 79, 89, 0.09)',
} as const;

export const glassTokens = {
  topEdge: 'rgba(255, 255, 255, 0.98)',
  rim: 'rgba(28, 72, 120, 0.11)',
  rimInner: 'rgba(255, 255, 255, 0.88)',
  fillTop: 'rgba(255, 255, 255, 0.98)',
  fillBottom: 'rgba(247, 250, 255, 0.96)',
  shadow: 'rgba(24, 55, 92, 0.08)',
} as const;

export const serviceTheme: Record<
  ServiceKind,
  { accent: string; accentSoft: string; icon: string; gradient: [string, string, string] }
> = {
  freight: {
    accent: '#0E3C68',
    accentSoft: 'rgba(14, 60, 104, 0.10)',
    icon: 'truck-fast-outline',
    gradient: ['#DCEBFA', '#83B3E5', '#0E3C68'],
  },
  roadside: {
    accent: '#E34F59',
    accentSoft: 'rgba(227, 79, 89, 0.11)',
    icon: 'car-wrench',
    gradient: ['#FCE7E9', '#F09AA0', '#D83D49'],
  },
  water: {
    accent: '#3688D9',
    accentSoft: 'rgba(54, 136, 217, 0.11)',
    icon: 'water-outline',
    gradient: ['#DDF0FF', '#8CC2F1', '#3688D9'],
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
  display: { fontSize: 38, lineHeight: 46, weight: 'black', letterSpacing: -1.3 },
  h1: { fontSize: 28, lineHeight: 35, weight: 'bold', letterSpacing: -0.65 },
  h2: { fontSize: 22, lineHeight: 29, weight: 'bold', letterSpacing: -0.35 },
  h3: { fontSize: 17, lineHeight: 24, weight: 'semibold', letterSpacing: -0.1 },
  body: { fontSize: 14, lineHeight: 21, weight: 'regular', letterSpacing: 0 },
  bodyStrong: { fontSize: 14, lineHeight: 21, weight: 'semibold', letterSpacing: 0 },
  label: { fontSize: 12, lineHeight: 16, weight: 'semibold', letterSpacing: 0.1 },
  caption: { fontSize: 10.5, lineHeight: 15, weight: 'medium', letterSpacing: 0 },
  button: { fontSize: 14, lineHeight: 19, weight: 'semibold', letterSpacing: 0 },
  number: { fontSize: 30, lineHeight: 37, weight: 'bold', letterSpacing: -0.8 },
};

export const layout = {
  screenPadding: 18,
  maxWidth: 560,
  dockSpace: 108,
  cardRadius: radii.xl,
};

export const glow = {
  jade: { color: palette.jadeBright, opacity: 0.08 },
  aqua: { color: palette.aqua, opacity: 0.07 },
  amber: { color: palette.amber, opacity: 0.07 },
  sand: { color: palette.sand, opacity: 0.07 },
  danger: { color: palette.danger, opacity: 0.08 },
};

export const gradients = {
  primary: ['#14558F', '#0C3C69', '#082B50'] as const,
  glass: ['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.86)', 'rgba(242,247,253,0.72)'] as const,
  deepGlass: ['rgba(248,251,255,0.99)', 'rgba(239,246,254,0.96)'] as const,
  canvas: [palette.canvas, palette.canvasDeep] as const,
};
