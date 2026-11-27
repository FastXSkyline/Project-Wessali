import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ServiceKind } from '@wessali/contracts';
import { palette } from '../theme';
import { RadialGlow } from './base';

type TileTone = ServiceKind | 'jade' | 'aqua' | 'amber' | 'sand' | 'danger' | 'neutral';
type SizeName = 'sm' | 'md' | 'lg' | 'xl';
const sizes: Record<SizeName, number> = { sm: 38, md: 52, lg: 68, xl: 88 };

type GlyphName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
type Recipe = { gradient: [string, string, string]; accent: string; icon: GlyphName };

const recipes: Record<TileTone, Recipe> = {
  freight: {
    gradient: ['#F0F6FE', '#E2EEFC', '#D5E7F9'],
    accent: '#185C99',
    icon: 'truck-fast',
  },
  roadside: {
    gradient: ['#FFF3F4', '#FCE7EA', '#F8DADF'],
    accent: '#D95768',
    icon: 'car-wrench',
  },
  water: {
    gradient: ['#EFF9FC', '#DDF2F8', '#CDEBF4'],
    accent: '#258FBE',
    icon: 'water',
  },
  jade: {
    gradient: ['#F0F6FE', '#E2EEFC', '#D5E7F9'],
    accent: palette.jadeBright,
    icon: 'cube-outline',
  },
  aqua: {
    gradient: ['#EFF9FC', '#DDF2F8', '#CDEBF4'],
    accent: palette.aqua,
    icon: 'waves',
  },
  amber: {
    gradient: ['#FFF8EC', '#F8EEDB', '#F2E2C4'],
    accent: palette.amber,
    icon: 'lightning-bolt',
  },
  sand: {
    gradient: ['#F0F5FA', '#E3EDF6', '#D4E2EF'],
    accent: palette.sand,
    icon: 'shield-check',
  },
  danger: {
    gradient: ['#FFF3F4', '#FCE7EA', '#F8DADF'],
    accent: palette.danger,
    icon: 'alert',
  },
  neutral: {
    gradient: ['#F4F7FA', '#EAF0F5', '#DEE8F0'],
    accent: palette.inkSoft,
    icon: 'dots-horizontal',
  },
};

type Props = {
  tone?: TileTone;
  icon?: GlyphName;
  size?: SizeName;
  glow?: boolean;
};

export function IconTile({ tone = 'jade', icon, size = 'md', glow = true }: Props) {
  const recipe = recipes[tone];
  const dimension = sizes[size];
  const radius = Math.round(dimension * 0.29);
  const glyphSize = Math.round(dimension * 0.44);

  return (
    <View style={{ width: dimension, height: dimension }}>
      {glow ? (
        <RadialGlow
          size={dimension * 1.8}
          color={recipe.accent}
          opacity={0.11}
          style={{ position: 'absolute', top: -dimension * 0.4, left: -dimension * 0.4 }}
        />
      ) : null}
      <LinearGradient
        colors={recipe.gradient}
        locations={[0, 0.55, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[
          styles.tile,
          { width: dimension, height: dimension, borderRadius: radius, borderColor: `${recipe.accent}20` },
        ]}
      >
        <MaterialCommunityIcons name={icon ?? recipe.icon} size={glyphSize} color={recipe.accent} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
});
