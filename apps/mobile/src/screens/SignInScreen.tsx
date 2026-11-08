import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { palette, serviceTheme } from '../theme';
import type { Copy } from '../copy';
import type { WessaliApp } from '../useWessali';
import type { Role } from '../types';
import {
  AppText,
  Aurora,
  BrandMark,
  GlassCard,
  Page,
  RouteDoodle,
  useLocaleValue,
} from '../ui/base';
import { Field, PrimaryButton, Segmented } from '../ui/controls';
import { IconTile } from '../ui/IconTile';
import { LanguageSwitch } from '../ui/LanguageSwitch';

export function SignInScreen({ app }: { app: WessaliApp }) {
  const { locale, ui, isRtl } = app;
  const { isRtl: rtlStyle } = useLocaleValue();
  const [showConnection, setShowConnection] = useState(false);

  return (
    <Page variant="auth" bottomSpace={18} topSpace={6}>
      <View style={[styles.header, isRtl && styles.rowReverse]}>
        <View style={[styles.brandRow, isRtl && styles.rowReverse]}>
          <BrandMark size={40} />
          <View style={{ gap: 1 }}>
            <AppText variant="h3" style={{ letterSpacing: 0.2 }}>
              Wessali
            </AppText>
            <AppText variant="caption" tone="muted" style={{ fontSize: 10, letterSpacing: 0.6 }}>
              وصلي
            </AppText>
          </View>
        </View>
        <LanguageSwitch value={locale} onChange={app.setLocale} compact />
      </View>

      <View style={styles.hero}>
        <View style={[styles.kicker, isRtl && styles.rowReverse]}>
          <View style={styles.kickerDot} />
          <AppText variant="caption" tone="jade">
            {ui.welcomeKicker}
          </AppText>
        </View>
        <AppText variant="display" style={styles.headline}>
          {ui.welcomeTitle}
        </AppText>
        <AppText variant="body" tone="soft" style={styles.heroBody}>
          {ui.welcomeBody}
        </AppText>
      </View>

      <ServiceConstellation isRtl={isRtl} ui={ui} />

      <View style={[styles.trustRow, isRtl && styles.rowReverse]}>
        <TrustItem icon="shield-checkmark-outline" label={ui.trustVerified} />
        <TrustItem icon="git-commit-outline" label={ui.trustMilestones} />
        <TrustItem icon="location-outline" label={ui.trustLocal} />
      </View>

      <GlassCard padding={20} intensity={34} radius={30}>
        <View style={{ gap: 5 }}>
          <AppText variant="h2">{ui.signInTitle}</AppText>
          <AppText variant="caption" tone="muted">
            {ui.signInBody}
          </AppText>
        </View>

        <View style={{ height: 18 }} />
        <View style={{ gap: 9 }}>
          <AppText variant="label" tone="soft">
            {ui.roleLabel}
          </AppText>
          <Segmented
            value={app.role}
            onChange={(value) => app.setRole(value as Role)}
            options={[
              { value: 'customer', label: ui.roleCustomer },
              { value: 'provider', label: ui.roleProvider },
            ]}
          />
        </View>

        <View style={{ height: 16 }} />
        <View style={{ gap: 14 }}>
          <Field
            label={ui.nameLabel}
            value={app.name}
            onChangeText={app.setName}
            placeholder={ui.namePlaceholder}
            icon="person-outline"
            autoComplete="name"
          />
          <Field
            label={ui.phoneLabel}
            value={app.phone}
            onChangeText={app.setPhone}
            placeholder={ui.phonePlaceholder}
            icon="call-outline"
            keyboardType="phone-pad"
            autoComplete="tel"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ui.connection}
          accessibilityState={{ expanded: showConnection }}
          onPress={() => setShowConnection((current) => !current)}
          style={[styles.connectionRow, rtlStyle && styles.rowReverse]}
        >
          <View style={[styles.connectionLabel, rtlStyle && styles.rowReverse]}>
            <Ionicons name="link-outline" size={15} color={palette.muted} />
            <AppText variant="caption" tone="muted">
              {ui.connection}
            </AppText>
          </View>
          <Ionicons
            name={showConnection ? 'chevron-up' : isRtl ? 'chevron-back' : 'chevron-forward'}
            size={16}
            color={palette.faint}
          />
        </Pressable>

        {showConnection ? (
          <View style={{ gap: 8, paddingTop: 4 }}>
            <Field
              label={ui.apiLabel}
              value={app.apiInput}
              onChangeText={app.setApiInput}
              placeholder={ui.apiPlaceholder}
              icon="server-outline"
              keyboardType="url"
              autoCapitalize="none"
            />
            <AppText variant="caption" tone="faint" style={{ lineHeight: 16 }}>
              {ui.connectionHint}
            </AppText>
          </View>
        ) : null}

        <View style={{ height: 18 }} />
        <PrimaryButton
          label={ui.enter}
          icon="arrow-forward"
          onPress={() => void app.signIn()}
          loading={app.busy}
        />
        <AppText variant="caption" tone="faint" align="center" style={styles.demoNotice}>
          {ui.demoNotice}
        </AppText>
      </GlassCard>

      <View style={{ alignItems: 'center', gap: 3, paddingTop: 2 }}>
        <AppText variant="caption" tone="faint" align="center">
          {ui.version} · {ui.madeFor}
        </AppText>
      </View>
    </Page>
  );
}

function TrustItem({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}) {
  return (
    <View style={styles.trustItem}>
      <Ionicons name={icon} size={13} color={palette.jade} />
      <AppText variant="caption" tone="muted" style={{ fontSize: 10.5 }}>
        {label}
      </AppText>
    </View>
  );
}

function ServiceConstellation({ isRtl, ui }: { isRtl: boolean; ui: Copy }) {
  // Mirror the composition so the largest tile always leads on the reading side.
  const anchor = (side: 'left' | 'right', value: number) => {
    const resolved = isRtl ? (side === 'left' ? 'right' : 'left') : side;
    return resolved === 'left' ? { left: value } : { right: value };
  };

  return (
    <View style={styles.constellation}>
      <LinearGradient
        colors={['rgba(17, 54, 40, 0.82)', 'rgba(4, 16, 11, 0.92)']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Aurora width={360} height={230} opacity={0.26} secondary={palette.aqua} />
      <RouteDoodle height={210} opacity={0.9} />
      <View
        style={[
          styles.orbit,
          { borderColor: 'rgba(155, 244, 209, 0.10)' },
          isRtl ? { right: -40 } : { left: -40 },
        ]}
      />
      <View
        style={[
          styles.orbitLarge,
          { borderColor: 'rgba(155, 244, 209, 0.055)' },
          isRtl ? { right: -85 } : { left: -85 },
        ]}
      />

      <View style={[styles.node, { top: 8 }, anchor('right', 14)]}>
        <IconTile tone="freight" size="xl" />
        <View style={[styles.nodeLabel, isRtl ? { left: 104 } : { right: 104 }]}>
          <ServiceLabel
            label={ui.legendFreight}
            color={serviceTheme.freight.accent}
            isRtl={isRtl}
          />
        </View>
      </View>

      <View style={[styles.node, { top: 62 }, anchor('left', 16)]}>
        <IconTile tone="roadside" size="lg" />
        <View style={[styles.nodeLabel, isRtl ? { right: 84 } : { left: 84 }]}>
          <ServiceLabel
            label={ui.legendRoadside}
            color={serviceTheme.roadside.accent}
            isRtl={isRtl}
          />
        </View>
      </View>

      <View style={[styles.node, { top: 126 }, anchor('right', 30)]}>
        <IconTile tone="water" size="lg" />
        <View style={[styles.nodeLabel, isRtl ? { left: 84 } : { right: 84 }]}>
          <ServiceLabel label={ui.legendWater} color={serviceTheme.water.accent} isRtl={isRtl} />
        </View>
      </View>
    </View>
  );
}

function ServiceLabel({ label, color, isRtl }: { label: string; color: string; isRtl: boolean }) {
  return (
    <View style={[styles.serviceLabel, isRtl && styles.rowReverse]}>
      <View style={[styles.serviceDot, { backgroundColor: color, shadowColor: color }]} />
      <AppText variant="caption" tone="soft" numberOfLines={1} style={{ fontSize: 10.5 }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hero: { gap: 12, paddingTop: 10 },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(55, 225, 165, 0.18)',
    backgroundColor: 'rgba(55, 225, 165, 0.07)',
  },
  kickerDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: palette.jade,
    shadowColor: palette.jade,
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  headline: { marginTop: 2 },
  heroBody: { maxWidth: 330, lineHeight: 23 },
  constellation: {
    height: 212,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(174, 245, 217, 0.13)',
    backgroundColor: palette.glassDeep,
  },
  node: { position: 'absolute', flexDirection: 'row', alignItems: 'center' },
  nodeLabel: { position: 'absolute', top: 26 },
  serviceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(174, 245, 217, 0.14)',
    backgroundColor: 'rgba(5, 20, 14, 0.55)',
  },
  serviceDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  orbit: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 999,
    borderWidth: 1,
    top: -50,
  },
  orbitLarge: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 999,
    borderWidth: 1,
    top: -95,
  },

  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 2,
  },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingVertical: 4,
  },
  connectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  demoNotice: { marginTop: 10, lineHeight: 16 },
});
