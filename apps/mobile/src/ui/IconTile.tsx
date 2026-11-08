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
    gradient: ['#7CFFD4', '#2BD79E', '#067552'],
    accent: palette.jade,
    icon: 'truck-fast',
  },
  roadside: {
    gradient: ['#FFE0B0', '#F6A54F', '#8A4711'],
    accent: palette.amber,
    icon: 'car-wrench',
  },
  water: {
    gradient: ['#B6F3FF', '#3EC4E4', '#0A5A70'],
    accent: palette.aqua,
    icon: 'water',
  },
  jade: {
    gradient: ['#8BFFD8', '#2ED3A0', '#066B4E'],
    accent: palette.jade,
    icon: 'cube',
  },
  aqua: {
    gradient: ['#BFF6FF', '#4AC7E6', '#0B566A'],
    accent: palette.aqua,
    icon: 'waves',
  },
  amber: {
    gradient: ['#FFE4B6', '#F5A855', '#7C420F'],
    accent: palette.amber,
    icon: 'lightning-bolt',
  },
  sand: {
    gradient: ['#FFF4DA', '#E2BE84', '#6E4E1D'],
    accent: palette.sand,
    icon: 'shield-check',
  },
  danger: {
    gradient: ['#FFD1D1', '#E97474', '#6E2020'],
    accent: palette.danger,
    icon: 'alert',
  },
  neutral: {
    gradient: ['rgba(196, 231, 217, 0.55)', 'rgba(62, 103, 86, 0.8)', 'rgba(8, 26, 19, 0.96)'],
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
          backgroundColor: 'rgba(0, 9, 6, 0.5)',
          shadowColor: '#000000',
          shadowOpacity: 0.5,
          shadowRadius: dimension * 0.18,
          shadowOffset: { width: 0, height: dimension * 0.09 },
          elevation: 6,
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
