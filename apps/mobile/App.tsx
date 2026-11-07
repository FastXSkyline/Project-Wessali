import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SERVICE_CATEGORIES } from '@wessali/contracts';
import { brandColors, radii, spacing } from '@wessali/design-tokens';
import { DEFAULT_LOCALE, getDirection, getMessages, type Locale } from '@wessali/i18n';

export default function App() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [mode, setMode] = useState<'customer' | 'provider'>('customer');
  const copy = getMessages(locale);
  const isRtl = getDirection(locale) === 'rtl';

  const showComingSoon = (serviceName: string) => {
    Alert.alert(copy.comingSoon, serviceName + '\n' + copy.bookingPreview);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.topBar, isRtl && styles.rowReverse]}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>W</Text>
          </View>
          <View style={styles.brandText}>
            <Text style={styles.brandName}>{copy.brand}</Text>
            <Text style={styles.tagline}>{copy.tagline}</Text>
          </View>
          <View style={styles.languageSwitch}>
            {(['ar', 'fr', 'en'] as const).map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: locale === item }}
                onPress={() => setLocale(item)}
                style={[styles.languageButton, locale === item && styles.languageButtonActive]}
              >
                <Text style={[styles.languageText, locale === item && styles.languageTextActive]}>
                  {item.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={[styles.eyebrow, isRtl && styles.textRtl]}>WESSALI SERVICES</Text>
          <Text style={[styles.title, isRtl && styles.textRtl]}>{copy.welcome}</Text>
          <Text style={[styles.subtitle, isRtl && styles.textRtl]}>{copy.chooseService}</Text>
        </View>

        <View style={[styles.modeSwitch, isRtl && styles.rowReverse]}>
          <Pressable
            onPress={() => setMode('customer')}
            style={[styles.modeButton, mode === 'customer' && styles.modeButtonActive]}
          >
            <Text style={[styles.modeText, mode === 'customer' && styles.modeTextActive]}>
              {copy.customerMode}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('provider')}
            style={[styles.modeButton, mode === 'provider' && styles.modeButtonActive]}
          >
            <Text style={[styles.modeText, mode === 'provider' && styles.modeTextActive]}>
              {copy.providerMode}
            </Text>
          </Pressable>
        </View>

        <View style={styles.services}>
          {SERVICE_CATEGORIES.map((service) => (
            <Pressable
              key={service.id}
              accessibilityRole="button"
              onPress={() => showComingSoon(service.labels[locale])}
              style={({ pressed }) => [styles.serviceCard, pressed && styles.serviceCardPressed]}
            >
              <View style={[styles.serviceHeader, isRtl && styles.rowReverse]}>
                <View style={styles.serviceCode}>
                  <Text style={styles.serviceCodeText}>{service.code}</Text>
                </View>
                <Text style={[styles.serviceArrow, isRtl && styles.textRtl]}>
                  {isRtl ? '←' : '→'}
                </Text>
              </View>
              <Text style={[styles.serviceTitle, isRtl && styles.textRtl]}>
                {service.labels[locale]}
              </Text>
              <Text style={[styles.serviceDescription, isRtl && styles.textRtl]}>
                {service.descriptions[locale]}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>WESSALI · ALGERIA</Text>
          <Text style={styles.footerText}>Version 0.1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: brandColors.canvas },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowReverse: { flexDirection: 'row-reverse' },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brandColors.primary,
  },
  brandMarkText: { color: '#FFFFFF', fontWeight: '800', fontSize: 22 },
  brandText: { flex: 1, gap: 2 },
  brandName: { color: brandColors.ink, fontSize: 19, fontWeight: '800' },
  tagline: { color: brandColors.muted, fontSize: 11 },
  languageSwitch: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radii.pill,
    backgroundColor: '#E8EAEE',
    gap: 2,
  },
  languageButton: { paddingHorizontal: 8, paddingVertical: 7, borderRadius: radii.pill },
  languageButtonActive: { backgroundColor: '#FFFFFF' },
  languageText: { color: brandColors.muted, fontSize: 10, fontWeight: '700' },
  languageTextActive: { color: brandColors.primary },
  hero: { paddingTop: spacing.xl, gap: spacing.sm },
  eyebrow: { color: brandColors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: brandColors.ink, fontSize: 29, fontWeight: '800', lineHeight: 37 },
  subtitle: { color: brandColors.muted, fontSize: 14 },
  textRtl: { textAlign: 'right', writingDirection: 'rtl' },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#E8EAEE',
    borderRadius: radii.md,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  modeButtonActive: { backgroundColor: '#FFFFFF' },
  modeText: { color: brandColors.muted, fontWeight: '700', fontSize: 12 },
  modeTextActive: { color: brandColors.primary },
  services: { gap: spacing.md },
  serviceCard: {
    backgroundColor: brandColors.surface,
    borderWidth: 1,
    borderColor: brandColors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  serviceCardPressed: { opacity: 0.82, borderColor: brandColors.primary },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceCode: {
    backgroundColor: '#F8EDEC',
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  serviceCodeText: { color: brandColors.primary, fontSize: 12, fontWeight: '800' },
  serviceArrow: { color: brandColors.muted, fontSize: 21 },
  serviceTitle: { color: brandColors.ink, fontSize: 18, fontWeight: '800' },
  serviceDescription: { color: brandColors.muted, fontSize: 13, lineHeight: 20 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  footerText: {
    color: brandColors.muted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
