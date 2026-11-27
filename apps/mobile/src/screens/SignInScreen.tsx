import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme';
import type { WessaliApp } from '../useWessali';
import type { Role } from '../types';
import { AppText, BrandMark, GlassCard, Page, useLocaleValue } from '../ui/base';
import { Field, PrimaryButton, Segmented } from '../ui/controls';
import { LanguageSwitch } from '../ui/LanguageSwitch';
import { animateLayout, MotionPressable } from '../ui/motion';

export function SignInScreen({ app }: { app: WessaliApp }) {
  const { locale, ui, isRtl } = app;
  const { isRtl: rtl } = useLocaleValue();
  const [showConnection, setShowConnection] = useState(false);

  return (
    <Page variant="auth" bottomSpace={18} topSpace={12} contentStyle={styles.pageContent}>
      <View style={[styles.languageRow, rtl && styles.rowReverse]}>
        <LanguageSwitch value={locale} onChange={app.setLocale} compact />
      </View>
      <View style={styles.brandBlock}>
        <BrandMark size={66} />
        <AppText variant="h2" align="center">Wessali</AppText>
        <AppText variant="caption" tone="muted" align="center" style={{ maxWidth: 260 }}>{ui.tagline}</AppText>
      </View>

      <GlassCard padding={21} radius={24}>
        <View style={{ gap: 5 }}>
          <AppText variant="h2">{ui.signInTitle}</AppText>
          <AppText variant="caption" tone="muted">{ui.signInBody}</AppText>
        </View>
        <View style={{ height: 17 }} />
        <AppText variant="label" tone="soft">{ui.roleLabel}</AppText>
        <View style={{ height: 8 }} />
        <Segmented value={app.role} onChange={(value) => app.setRole(value as Role)} accent={palette.jadeBright}
          options={[{ value: 'customer', label: ui.roleCustomer }, { value: 'provider', label: ui.roleProvider }]} />
        <View style={{ height: 15 }} />
        <View style={{ gap: 13 }}>
          <Field label={ui.nameLabel} value={app.name} onChangeText={app.setName} placeholder={ui.namePlaceholder} icon="person-outline" autoComplete="name" />
          <Field label={ui.phoneLabel} value={app.phone} onChangeText={app.setPhone} placeholder={ui.phonePlaceholder} icon="call-outline" keyboardType="phone-pad" autoComplete="tel" />
        </View>
        <MotionPressable
          accessibilityRole="button"
          accessibilityLabel={ui.connection}
          accessibilityState={{ expanded: showConnection }}
          onPress={() => {
            animateLayout();
            setShowConnection((value) => !value);
          }}
          style={styles.connectionPress}
          contentStyle={[styles.connectionRow, rtl && styles.rowReverse]}
        >
          <View style={[styles.connectionLabel, rtl && styles.rowReverse]}>
            <Ionicons name="server-outline" size={15} color={palette.muted} />
            <AppText variant="caption" tone="muted">{ui.connection}</AppText>
          </View>
          <Ionicons name={showConnection ? 'chevron-up' : isRtl ? 'chevron-back' : 'chevron-forward'} size={16} color={palette.faint} />
        </MotionPressable>
        {showConnection ? (
          <View style={{ gap: 8, paddingTop: 4 }}>
            <Field label={ui.apiLabel} value={app.apiInput} onChangeText={app.setApiInput} placeholder={ui.apiPlaceholder} icon="link-outline" keyboardType="url" autoCapitalize="none" />
            <AppText variant="caption" tone="muted" style={{ lineHeight: 17 }}>{ui.connectionHint}</AppText>
          </View>
        ) : null}
        <View style={{ height: 17 }} />
        <PrimaryButton label={ui.enter} icon="log-in-outline" onPress={() => void app.signIn()} loading={app.busy} />
        <AppText variant="caption" tone="muted" align="center" style={{ marginTop: 11, lineHeight: 17 }}>{ui.demoNotice}</AppText>
      </GlassCard>
      <AppText variant="caption" tone="faint" align="center">{ui.version} · {ui.madeFor}</AppText>
    </Page>
  );
}

const styles = StyleSheet.create({
  pageContent: { gap: 15 },
  rowReverse: { flexDirection: 'row-reverse' },
  languageRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  brandBlock: { alignItems: 'center', gap: 7, paddingTop: 2, paddingBottom: 4 },
  connectionPress: { marginTop: 14, paddingVertical: 5 },
  connectionRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  connectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
});
