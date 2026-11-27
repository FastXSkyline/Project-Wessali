import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme';
import type { WessaliApp } from '../useWessali';
import { AppText, Avatar, Divider, GlassCard, Page, useLocaleValue } from '../ui/base';
import { Field, PrimaryButton, SecondaryButton } from '../ui/controls';
import { LanguageSwitch } from '../ui/LanguageSwitch';

export function ProfileScreen({ app }: { app: WessaliApp }) {
  const { ui, isRtl, session, isProvider } = app;
  const { isRtl: rtl } = useLocaleValue();
  return (
    <Page topSpace={10} bottomSpace={108}>
      <View style={[styles.header, rtl && styles.rowReverse]}>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="h1">{ui.profileTitle}</AppText>
          <AppText variant="caption" tone="muted">{ui.profileBody}</AppText>
        </View>
        <View style={styles.settingsMark}><Ionicons name="settings-outline" size={19} color={palette.jade} /></View>
      </View>

      <GlassCard padding={17} radius={22}>
        <View style={[styles.identity, rtl && styles.rowReverse]}>
          <Avatar name={session?.user.displayName ?? 'Wessali'} provider={isProvider} size={58} />
          <View style={{ flex: 1, gap: 3 }}>
            <AppText variant="h3" numberOfLines={1}>{session?.user.displayName ?? ui.brand}</AppText>
            <AppText variant="caption" tone="muted">{session?.user.phoneE164}</AppText>
            <View style={[styles.rolePill, rtl && styles.rowReverse]}>
              <Ionicons name={isProvider ? 'briefcase-outline' : 'person-outline'} size={12} color={palette.jade} />
              <AppText variant="caption" style={{ color: palette.jade }}>{isProvider ? ui.roleProvider : ui.roleCustomer}</AppText>
            </View>
          </View>
          <Ionicons name={isRtl ? 'chevron-back' : 'chevron-forward'} size={17} color={palette.faint} />
        </View>
        <Divider style={{ marginVertical: 15 }} />
        <View style={[styles.infoLine, rtl && styles.rowReverse]}>
          <Ionicons name="shield-checkmark-outline" size={14} color={palette.aqua} />
          <AppText variant="caption" tone="muted">{ui.demoSession}</AppText>
          <View style={{ flex: 1 }} />
          <AppText variant="caption" style={{ color: palette.inkSoft }}>{ui.madeFor}</AppText>
        </View>
      </GlassCard>

      <GlassCard padding={17} radius={22}>
        <View style={[styles.sectionTitle, rtl && styles.rowReverse]}>
          <View style={styles.sectionIcon}><Ionicons name="language-outline" size={17} color={palette.jade} /></View>
          <View style={{ flex: 1, gap: 1 }}>
            <AppText variant="h3">{ui.languageSection}</AppText>
            <AppText variant="caption" tone="muted">{ui.languageHint}</AppText>
          </View>
        </View>
        <View style={{ height: 14 }} />
        <LanguageSwitch value={app.locale} onChange={app.setLocale} labels={{ ar: ui.arabicName, fr: ui.frenchName, en: ui.englishName }} />
      </GlassCard>

      <GlassCard padding={17} radius={22}>
        <View style={[styles.sectionTitle, rtl && styles.rowReverse]}>
          <View style={[styles.sectionIcon, { backgroundColor: '#EAF4FF' }]}><Ionicons name="cloud-outline" size={17} color={palette.aqua} /></View>
          <View style={{ flex: 1, gap: 1 }}>
            <AppText variant="h3">{ui.connectionSection}</AppText>
            <AppText variant="caption" tone="muted">{ui.apiServer}</AppText>
          </View>
        </View>
        <View style={{ height: 13 }} />
        <Field label={ui.apiLabel} value={app.apiInput} onChangeText={app.setApiInput} placeholder={ui.apiPlaceholder} icon="link-outline" keyboardType="url" autoCapitalize="none" />
        <View style={{ height: 12 }} />
        <PrimaryButton
          label={ui.saveConnection}
          icon="save-outline"
          compact
          loading={app.busy}
          onPress={() => void app.saveConnection()}
        />
      </GlassCard>

      <View style={{ gap: 9 }}>
        <SecondaryButton label={ui.signOut} icon="log-out-outline" danger onPress={() => void app.signOut()} />
        <AppText variant="caption" tone="faint" align="center">{ui.version} · {ui.madeFor}</AppText>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  rowReverse: { flexDirection: 'row-reverse' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsMark: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#EAF2FC', alignItems: 'center', justifyContent: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rolePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 30, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: '#EAF2FC' },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  sectionIcon: { width: 35, height: 35, borderRadius: 12, backgroundColor: '#EAF2FC', alignItems: 'center', justifyContent: 'center' },
});
