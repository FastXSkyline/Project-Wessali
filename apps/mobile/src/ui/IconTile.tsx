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

type Recipe = {
  gradient: [string, string, string];
  accent: string;
  icon: GlyphName;
};

/**
 * Hand-made, MIT/Apache-licensed glyph sets only (Material Community Icons and
 * Ionicons). The depth is rendered in code: plinth, body gradient, specular
 * sweep, inner shade and a cast shadow. No generated artwork is used.
 */
const recipes: Record<TileTone, Recipe> = {
  freight: {
    gradient: ['#D2E0D1', '#91AA92', '#58745E'],
    accent: palette.jade,
    icon: 'truck-fast',
  },
  roadside: {
    gradient: ['#F0E0CC', '#C8A37B', '#8D6944'],
    accent: palette.amber,
    icon: 'car-wrench',
  },
  water: {
    gradient: ['#DCE7E9', '#A3BCC3', '#668795'],
    accent: palette.aqua,
    icon: 'water',
  },
  jade: {
    gradient: ['#D2E0D1', '#91AA92', '#58745E'],
    accent: palette.jade,
    icon: 'cube',
  },
  aqua: {
    gradient: ['#DCE7E9', '#A3BCC3', '#668795'],
    accent: palette.aqua,
    icon: 'waves',
  },
  amber: {
    gradient: ['#F0E0CC', '#C8A37B', '#8D6944'],
    accent: palette.amber,
    icon: 'lightning-bolt',
  },
  sand: {
    gradient: ['#EEE5D7', '#CDB895', '#947A51'],
    accent: palette.sand,
    icon: 'shield-check',
  },
  danger: {
    gradient: ['#FFD1D1', '#E97474', '#6E2020'],
    accent: palette.danger,
    icon: 'alert',
  },
  neutral: {
    gradient: ['#E8EBE4', '#B8C2B5', '#788579'],
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
  const radius = Math.round(dimension * 0.3);
  const glyphSize = Math.round(dimension * 0.46);

  return (
    <View style={{ width: dimension, height: dimension }}>
      {glow ? (
        <RadialGlow
          size={dimension * 2.4}
          color={recipe.accent}
          opacity={0.2}
          style={{
            position: 'absolute',
            top: -dimension * 0.7,
            left: -dimension * 0.7,
          }}
        />
      ) : null}

      {/* Plinth: the dark physical base the plate sits on. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: dimension * 0.045,
          right: dimension * 0.045,
          bottom: -dimension * 0.045,
          height: dimension * 0.82,
          borderRadius: radius,
          backgroundColor: 'rgba(34, 44, 36, 0.18)',
          shadowColor: '#000000',
          shadowOpacity: 0.22,
          shadowRadius: dimension * 0.18,
          shadowOffset: { width: 0, height: dimension * 0.09 },
          elevation: 4,
        }}
      />

      <LinearGradient
        colors={recipe.gradient}
        locations={[0, 0.52, 1]}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.88, y: 1 }}
        style={[styles.tile, { width: dimension, height: dimension, borderRadius: radius }]}
      >
        {/* Wide specular sweep across the upper hemisphere. */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
          locations={[0, 0.44, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.62, y: 0.78 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Curved glass edge. */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius, borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)' },
          ]}
        />
        <MaterialCommunityIcons
          name={icon ?? recipe.icon}
          size={glyphSize}
          color="#FFFFFF"
          style={{
            textShadowColor: 'rgba(1, 22, 15, 0.5)',
            textShadowOffset: { width: 0, height: 1.6 },
            textShadowRadius: 3.2,
          }}
        />
        {/* Contact shade at the base. */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.26)']}
          start={{ x: 0.5, y: 0.52 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.bottomShade, { borderRadius: radius }]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.highlightDot,
            { width: dimension * 0.09, height: dimension * 0.09, borderRadius: 999 },
          ]}
        />
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
    borderColor: 'rgba(2, 20, 14, 0.24)',
  },
  bottomShade: {
    position: 'absolute',
    left: 1,
    right: 1,
    bottom: 1,
    height: '44%',
  },
  highlightDot: {
    position: 'absolute',
    top: '12%',
    left: '15%',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
