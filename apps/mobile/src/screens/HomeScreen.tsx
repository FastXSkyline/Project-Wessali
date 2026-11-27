import React from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SERVICE_CATEGORIES, type ServiceKind } from '@wessali/contracts';
import { palette, serviceTheme } from '../theme';
import type { WessaliApp } from '../useWessali';
import { AppText, Avatar, BrandMark, Divider, GlassCard, Page, SectionHeading, useLocaleValue } from '../ui/base';
import { PrimaryButton, StatusPill } from '../ui/controls';
import { IconTile } from '../ui/IconTile';
import { RouteProgress, TripRoute } from '../ui/trip';
import { MotionPressable, StaggeredItem } from '../ui/motion';
import { firstName, formatShortDate } from '../utils';

const photos: Record<ServiceKind, string> = {
  freight: 'https://images.pexels.com/photos/15595843/pexels-photo-15595843.jpeg?auto=compress&cs=tinysrgb&w=1400',
  roadside: 'https://images.pexels.com/photos/35580957/pexels-photo-35580957.jpeg?auto=compress&cs=tinysrgb&w=1400',
  water: 'https://images.pexels.com/photos/25311203/pexels-photo-25311203.jpeg?auto=compress&cs=tinysrgb&w=1400',
};

type Props = {
  app: WessaliApp;
  onStartRequest: () => void;
  onOpenService: (kind: ServiceKind) => void;
  onOpenRequests: () => void;
  onOpenPartner: () => void;
  onOpenProfile: () => void;
  onOpenTracking: () => void;
};

function greetingFor(app: WessaliApp) {
  const hour = new Date().getHours();
  if (hour < 12) return app.ui.goodMorning;
  if (hour < 18) return app.ui.goodAfternoon;
  return app.ui.goodEvening;
}

function statusText(app: WessaliApp, status: string) {
  return (app.ui.status as Record<string, string>)[status] ?? status.replaceAll('_', ' ');
}

export function HomeScreen({ app, onStartRequest, onOpenService, onOpenRequests, onOpenPartner, onOpenProfile, onOpenTracking }: Props) {
  const { isRtl, locale, ui, session, bookings, activeBookings, activeBooking } = app;
  const { isRtl: rtl } = useLocaleValue();
  const completed = bookings.filter((booking) => booking.status === 'completed').length;
  const service = (kind: ServiceKind) => SERVICE_CATEGORIES.find((item) => item.id === kind)?.labels[locale] ?? '';
  return (
    <Page topSpace={8} bottomSpace={108}
      refreshControl={<RefreshControl refreshing={app.busy} onRefresh={() => void app.refreshData()} tintColor={palette.jadeBright} colors={[palette.jadeBright]} progressBackgroundColor={palette.canvasLift} />}>
      <View style={[styles.header, rtl && styles.rowReverse]}>
        <View style={[styles.brandRow, rtl && styles.rowReverse]}>
          <BrandMark size={38} />
          <View style={{ gap: 1 }}>
            <AppText variant="h3" style={{ fontSize: 16 }}>{ui.brand || 'Wessali'}</AppText>
            <AppText variant="caption" tone="muted" numberOfLines={1}>{ui.tagline}</AppText>
          </View>
        </View>
        <MotionPressable accessibilityRole="button" accessibilityLabel={ui.profileTitle} onPress={onOpenProfile}>
          <Avatar name={session?.user.displayName ?? 'Wessali'} provider={app.isProvider} size={40} />
        </MotionPressable>
      </View>

      <View style={[styles.greeting, rtl && styles.rowReverse]}>
        <View style={{ flex: 1, gap: 1 }}>
          <AppText variant="caption" tone="muted">{greetingFor(app)}</AppText>
          <AppText variant="h2" numberOfLines={1}>{firstName(session?.user.displayName ?? '')}</AppText>
        </View>
        <View style={styles.locationBadge}>
          <Ionicons name="location" size={13} color={palette.jadeBright} />
          <AppText variant="caption" style={{ color: palette.jade }}>{locale === 'ar' ? 'الجزائر' : locale === 'fr' ? 'Algérie' : 'Algeria'}</AppText>
        </View>
      </View>

      {activeBooking ? (
        <GlassCard padding={16} radius={22}>
          <View style={[styles.rowBetween, rtl && styles.rowReverse]}>
            <View style={[styles.row, rtl && styles.rowReverse]}>
              <IconTile tone={activeBooking.service_type} size="sm" />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="caption" tone="muted">{ui.activeRunTitle}</AppText>
                <AppText variant="bodyStrong">{activeBooking.public_reference}</AppText>
              </View>
            </View>
            <StatusPill status={activeBooking.status} label={statusText(app, activeBooking.status)} />
          </View>
          <View style={{ height: 12 }} />
          <TripRoute booking={activeBooking} locale={locale} />
          <View style={{ height: 12 }} />
          <RouteProgress status={activeBooking.status} />
          <MotionPressable onPress={onOpenTracking} style={styles.trackRow} contentStyle={[styles.trackRowContent, rtl && styles.rowReverse]}>
            <AppText variant="label" style={{ color: palette.jadeBright }}>{ui.track}</AppText>
            <Ionicons name={isRtl ? 'arrow-back' : 'arrow-forward'} size={15} color={palette.jadeBright} />
          </MotionPressable>
        </GlassCard>
      ) : (
        <View style={styles.hero}>
          <ExpoImage source={{ uri: photos.freight }} style={StyleSheet.absoluteFill} contentFit="cover" transition={350} cachePolicy="memory-disk" />
          <LinearGradient colors={['rgba(5,28,55,0.18)', 'rgba(5,29,57,0.94)']} locations={[0,1]} style={StyleSheet.absoluteFill} />
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <View style={styles.onlineDot} />
              <AppText variant="caption" tone="white">{ui.welcomeKicker}</AppText>
            </View>
            <AppText variant="h2" tone="white" style={{ maxWidth: '92%' }}>{ui.homeTitle}</AppText>
            <AppText variant="caption" tone="white" style={styles.heroBody}>{ui.homeBody}</AppText>
            <PrimaryButton label={ui.homeCta} icon={isRtl ? 'arrow-back' : 'arrow-forward'} compact onPress={onStartRequest} style={{ alignSelf: isRtl ? 'flex-end' : 'flex-start', minWidth: 164 }} />
          </View>
        </View>
      )}

      <View style={[styles.statRow, rtl && styles.rowReverse]}>
        <Metric value={activeBookings.length} label={ui.statActive} icon="navigate-outline" />
        <Metric value={completed} label={ui.statCompleted} icon="checkmark-circle-outline" />
        <Metric value={bookings.length} label={ui.statTotal} icon="layers-outline" />
      </View>

      <SectionHeading title={ui.servicesTitle} caption={ui.servicesBody} />
      <View style={[styles.serviceGrid, rtl && styles.rowReverse]}>
        <ServiceCard kind="roadside" title={service('roadside')} description={ui.serviceRoadsideShort} actionLabel={ui.navNew} onPress={() => onOpenService('roadside')} />
        <ServiceCard kind="freight" title={service('freight')} description={ui.serviceFreightShort} actionLabel={ui.navNew} onPress={() => onOpenService('freight')} />
      </View>
      <MotionPressable accessibilityRole="button" onPress={() => onOpenService('water')} style={styles.waterAction} contentStyle={[styles.waterActionContent, rtl && styles.rowReverse]}>
        <IconTile tone="water" size="sm" />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="bodyStrong">{service('water')}</AppText>
          <AppText variant="caption" tone="muted">{ui.serviceWaterShort}</AppText>
        </View>
        <Ionicons name={isRtl ? 'chevron-back' : 'chevron-forward'} size={17} color={palette.aqua} />
      </MotionPressable>

      <SectionHeading title={ui.recentTitle} action={ui.seeAll} onAction={onOpenRequests} />
      {bookings.length > 0 ? (
        <View style={{ gap: 9 }}>
          {bookings.slice(0, 3).map((booking, index) => (
            <StaggeredItem key={booking.id} index={index}><MotionPressable accessibilityRole="button" onPress={onOpenRequests}>
              <GlassCard padding={12} radius={18}>
                <View style={[styles.recentRow, rtl && styles.rowReverse]}>
                  <IconTile tone={booking.service_type} size="sm" />
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText variant="bodyStrong" numberOfLines={1}>{service(booking.service_type)}</AppText>
                    <AppText variant="caption" tone="muted" numberOfLines={1}>{booking.pickup_address}</AppText>
                  </View>
                  <View style={{ alignItems: isRtl ? 'flex-start' : 'flex-end', gap: 4 }}>
                    <StatusPill status={booking.status} label={statusText(app, booking.status)} />
                    <AppText variant="caption" tone="faint">{formatShortDate(booking.requested_at ?? booking.created_at, locale)}</AppText>
                  </View>
                </View>
              </GlassCard>
            </MotionPressable></StaggeredItem>
          ))}
        </View>
      ) : (
        <GlassCard padding={15} radius={18}>
          <View style={[styles.emptyRow, rtl && styles.rowReverse]}>
            <Ionicons name="receipt-outline" size={20} color={palette.jadeBright} />
            <AppText variant="caption" tone="muted" style={{ flex: 1 }}>{ui.noData}</AppText>
            <MotionPressable onPress={onStartRequest}><AppText variant="label" style={{ color: palette.jadeBright }}>{ui.homeCta}</AppText></MotionPressable>
          </View>
        </GlassCard>
      )}

      <View style={[styles.shortcuts, rtl && styles.rowReverse]}>
        <Shortcut icon="receipt-outline" label={ui.navRequests} onPress={onOpenRequests} />
        <Shortcut icon="briefcase-outline" label={ui.navPartner} onPress={onOpenPartner} />
        <Shortcut icon="person-outline" label={ui.navProfile} onPress={onOpenProfile} />
      </View>
      <Divider />
      <AppText variant="caption" tone="faint" align="center">{ui.madeFor} · {ui.version}</AppText>
    </Page>
  );
}

function Metric({ value, label, icon }: { value: number; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <GlassCard padding={11} radius={17} style={{ flex: 1 }}>
      <View style={{ gap: 5 }}>
        <Ionicons name={icon} size={16} color={palette.jadeBright} />
        <AppText variant="number" style={{ color: palette.ink, fontSize: 22, lineHeight: 27 }}>{value}</AppText>
        <AppText variant="caption" tone="muted" numberOfLines={1}>{label}</AppText>
      </View>
    </GlassCard>
  );
}

function ServiceCard({ kind, title, description, actionLabel, onPress }: { kind: ServiceKind; title: string; description: string; actionLabel: string; onPress: () => void }) {
  const tone = serviceTheme[kind];
  const { isRtl } = useLocaleValue();
  return (
    <MotionPressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={styles.serviceCard} contentStyle={styles.serviceCardContentWrap}>
      <ExpoImage source={{ uri: photos[kind] }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} cachePolicy="memory-disk" />
      <LinearGradient colors={['rgba(7,28,52,0.10)', 'rgba(7,28,52,0.88)']} locations={[0,1]} style={StyleSheet.absoluteFill} />
      <View style={[styles.serviceCardContent, isRtl && styles.rowReverse]}>
        <View style={[styles.serviceBadge, { backgroundColor: kind === 'roadside' ? '#E34F59' : '#176FC2' }]}>
          <Ionicons name={kind === 'roadside' ? 'flash' : 'cube'} size={14} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <AppText variant="bodyStrong" tone="white" numberOfLines={1}>{title}</AppText>
          <AppText variant="caption" tone="white" numberOfLines={2} style={{ opacity: 0.86 }}>{description}</AppText>
        </View>
        <Ionicons name={isRtl ? 'arrow-back' : 'arrow-forward'} size={16} color="#FFFFFF" />
      </View>
      <AppText variant="caption" tone="white" style={styles.serviceActionLabel}>{actionLabel}</AppText>
    </MotionPressable>
  );
}

function Shortcut({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <MotionPressable accessibilityRole="button" onPress={onPress} style={styles.shortcut} contentStyle={styles.shortcutContent}>
      <View style={styles.shortcutIcon}><Ionicons name={icon} size={18} color={palette.jade} /></View>
      <AppText variant="caption" align="center" numberOfLines={1}>{label}</AppText>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  rowReverse: { flexDirection: 'row-reverse' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
  greeting: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 99, backgroundColor: '#EAF3FC' },
  onlineDot: { width: 6, height: 6, borderRadius: 9, backgroundColor: '#7CC3FF' },
  hero: { height: 192, borderRadius: 22, overflow: 'hidden', backgroundColor: palette.jadeDeep, justifyContent: 'flex-end' },
  heroContent: { paddingHorizontal: 17, paddingVertical: 16, gap: 9 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 7, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.15)' },
  heroBody: { opacity: 0.86, lineHeight: 17, maxWidth: 300 },
  statRow: { flexDirection: 'row', gap: 8 },
  serviceGrid: { flexDirection: 'row', gap: 10 },
  serviceCard: { flex: 1, height: 138, borderRadius: 18, overflow: 'hidden', backgroundColor: palette.jadeDeep, justifyContent: 'flex-end' },
  serviceCardContent: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingBottom: 8 },
  serviceBadge: { width: 29, height: 29, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  serviceActionLabel: { marginHorizontal: 12, marginBottom: 10, opacity: 0.8 },
  waterAction: { backgroundColor: '#FFFFFF', borderRadius: 17, borderWidth: 1, borderColor: palette.lineSoft, padding: 11 },
  waterActionContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trackRowContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  serviceCardContentWrap: { flex: 1, justifyContent: 'flex-end' },
  shortcutContent: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  trackRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  shortcuts: { flexDirection: 'row', justifyContent: 'space-around', gap: 8, paddingVertical: 3 },
  shortcut: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 6 },
  shortcutIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#EAF2FC', alignItems: 'center', justifyContent: 'center' },
});
