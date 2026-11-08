import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, serviceTheme } from '../theme';
import type { WessaliApp } from '../useWessali';
import { AppText, Avatar, Divider, GlassCard, Page, RadialGlow, useLocaleValue } from '../ui/base';
import { Field, PrimaryButton, SecondaryButton } from '../ui/controls';
import { IconTile } from '../ui/IconTile';
import { LanguageSwitch } from '../ui/LanguageSwitch';

export function ProfileScreen({ app }: { app: WessaliApp }) {
  const { ui, isRtl, session, isProvider } = app;
  const { isRtl: rtlStyle } = useLocaleValue();
  const roleLabel = isProvider ? ui.roleProvider : ui.roleCustomer;

  return (
    <Page bottomSpace={132}>
      <View style={[styles.header, rtlStyle && styles.rowReverse]}>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="h1">{ui.profileTitle}</AppText>
          <AppText variant="body" tone="muted">
            {ui.profileBody}
          </AppText>
        </View>
        <IconTile tone="jade" icon="account-outline" size="md" />
      </View>

      <GlassCard padding={20} tone="deep" radius={30} style={{ overflow: 'hidden' }}>
        <RadialGlow
          size={240}
          color={isProvider ? palette.sand : palette.jade}
          opacity={0.2}
          style={{ position: 'absolute', top: -120, right: -80 }}
        />
        <View style={[styles.identity, rtlStyle && styles.rowReverse]}>
          <Avatar name={session?.user.displayName ?? 'Wessali'} provider={isProvider} size={60} />
          <View style={{ flex: 1, gap: 3 }}>
            <AppText variant="h2" numberOfLines={1}>
              {session?.user.displayName ?? ui.brand}
            </AppText>
            <AppText variant="caption" tone="muted">
              {session?.user.phoneE164}
            </AppText>
            <View
              style={[
                styles.rolePill,
                rtlStyle && styles.rowReverse,
                {
                  borderColor: isProvider ? 'rgba(240,216,169,0.3)' : 'rgba(55,225,165,0.3)',
                  backgroundColor: isProvider ? 'rgba(240,216,169,0.10)' : 'rgba(55,225,165,0.10)',
                },
              ]}
            >
              <Ionicons
                name={isProvider ? 'briefcase-outline' : 'person-outline'}
                size={12}
                color={isProvider ? palette.sand : palette.jade}
              />
              <AppText
                variant="caption"
                style={{ color: isProvider ? palette.sand : palette.jade, fontSize: 9.5 }}
              >
                {roleLabel}
              </AppText>
            </View>
          </View>
        </View>
        <Divider style={{ marginVertical: 16 }} />
        <View style={[styles.metaRow, rtlStyle && styles.rowReverse]}>
          <View style={[styles.metaItem, rtlStyle && styles.rowReverse]}>
            <Ionicons name="shield-checkmark-outline" size={14} color={palette.jade} />
            <AppText variant="caption" tone="muted" style={{ fontSize: 10 }}>
              {ui.demoSession}
            </AppText>
          </View>
          <View style={[styles.metaItem, rtlStyle && styles.rowReverse]}>
            <Ionicons name="location-outline" size={14} color={palette.aqua} />
            <AppText variant="caption" tone="muted" style={{ fontSize: 10 }}>
              {ui.madeFor}
            </AppText>
          </View>
        </View>
      </GlassCard>

      <GlassCard padding={18} radius={26}>
        <View style={[styles.sectionLabel, rtlStyle && styles.rowReverse]}>
          <Ionicons name="language-outline" size={15} color={palette.jade} />
          <AppText variant="h3" style={{ fontSize: 16 }}>
            {ui.languageSection}
          </AppText>
        </View>
        <View style={{ height: 12 }} />
        <LanguageSwitch
          value={app.locale}
          onChange={app.setLocale}
          labels={{ ar: ui.arabicName, fr: ui.frenchName, en: ui.englishName }}
        />
        <AppText variant="caption" tone="muted" style={{ marginTop: 10, lineHeight: 17 }}>
          {ui.languageHint}
        </AppText>
      </GlassCard>

      <GlassCard padding={18} radius={26}>
        <View style={[styles.sectionLabel, rtlStyle && styles.rowReverse]}>
          <Ionicons name="server-outline" size={15} color={palette.aqua} />
          <AppText variant="h3" style={{ fontSize: 16 }}>
            {ui.connectionSection}
          </AppText>
        </View>
        <View style={{ height: 13 }} />
        <Field
          label={ui.apiLabel}
          value={app.apiInput}
          onChangeText={app.setApiInput}
          placeholder={ui.apiPlaceholder}
          icon="link-outline"
          keyboardType="url"
          autoCapitalize="none"
        />
        <AppText variant="caption" tone="muted" style={{ marginTop: 9, lineHeight: 17 }}>
          {ui.connectionHint}
        </AppText>
        <View style={{ height: 13 }} />
        <PrimaryButton
          label={ui.saveConnection}
          icon="save-outline"
          compact
          onPress={app.saveConnection}
        />
      </GlassCard>

      <View style={{ gap: 10 }}>
        <SecondaryButton
          label={ui.signOut}
          icon="log-out-outline"
          danger
          onPress={() => void app.signOut()}
        />
        <AppText variant="caption" tone="faint" align="center">
          {ui.version} · {ui.madeFor}
        </AppText>
        <View style={[styles.serviceDots, rtlStyle && styles.rowReverse]}>
          {(['freight', 'roadside', 'water'] as const).map((service) => (
            <View
              key={service}
              style={[styles.serviceDot, { backgroundColor: serviceTheme[service].accent }]}
            />
          ))}
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowReverse: { flexDirection: 'row-reverse' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  serviceDots: { flexDirection: 'row', justifyContent: 'center', gap: 5, paddingTop: 2 },
  serviceDot: { width: 4, height: 4, borderRadius: 999, opacity: 0.8 },
});
