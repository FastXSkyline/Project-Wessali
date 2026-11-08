import React from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { SERVICE_CATEGORIES, type ServiceKind } from '@wessali/contracts';
import { palette, serviceTheme } from '../theme';
import type { WessaliApp } from '../useWessali';
import {
  AppText,
  Aurora,
  Avatar,
  BrandMark,
  Divider,
  GlassCard,
  Page,
  RouteDoodle,
  SectionHeading,
  useLocaleValue,
} from '../ui/base';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton, StatusPill } from '../ui/controls';
import { IconTile } from '../ui/IconTile';
import { ActivityArea, ServiceMix } from '../ui/charts';
import { RouteProgress, TripRoute } from '../ui/trip';
import { firstName, formatShortDate, lastSevenDays, weeklyRequestCounts } from '../utils';

const servicePhotos: Record<ServiceKind, string> = {
  freight:
    'https://images.pexels.com/photos/5410923/pexels-photo-5410923.jpeg?auto=compress&cs=tinysrgb&w=1400',
  roadside:
    'https://images.pexels.com/photos/6140995/pexels-photo-6140995.jpeg?auto=compress&cs=tinysrgb&w=1400',
  water:
    'https://images.pexels.com/photos/37899833/pexels-photo-37899833/free-photo-of-yellow-water-tanker-truck-by-seaside-in-foca.jpeg?auto=compress&cs=tinysrgb&w=1400',
};

type Props = {
  app: WessaliApp;
  onStartRequest: () => void;
  onOpenService: (kind: ServiceKind) => void;
  onOpenRequests: () => void;
  onOpenPartner: () => void;
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

export function HomeScreen({
  app,
  onStartRequest,
  onOpenService,
  onOpenRequests,
  onOpenPartner,
}: Props) {
  const { isRtl, locale, ui, session, activeBooking, bookings, activeBookings } = app;
  const { isRtl: rtlStyle } = useLocaleValue();
  const week = weeklyRequestCounts(bookings, locale);
  const dayLabels = lastSevenDays(locale).map((day) => day.label);
  const weekTotal = week.reduce((sum, value) => sum + value, 0);
  const completed = bookings.filter((booking) => booking.status === 'completed').length;
  const serviceCounts = SERVICE_CATEGORIES.map((service) => ({
    label: service.labels[locale],
    value: bookings.filter((booking) => booking.service_type === service.id).length,
    tone: serviceTheme[service.id].accent,
  }));
  const maxServiceCount = Math.max(1, ...serviceCounts.map((row) => row.value));

  return (
    <Page
      refreshControl={
        <RefreshControl
          refreshing={app.busy}
          onRefresh={() => void app.refreshData()}
          tintColor={palette.jade}
          colors={[palette.jade]}
          progressBackgroundColor={palette.canvasLift}
        />
      }
    >
      <View style={[styles.header, isRtl && styles.rowReverse]}>
        <View style={[styles.brandRow, isRtl && styles.rowReverse]}>
          <BrandMark size={38} />
          <View style={{ gap: 1, maxWidth: 210 }}>
            <AppText variant="h3" style={{ fontSize: 16 }}>
              Wessali
            </AppText>
            <AppText variant="caption" tone="faint" numberOfLines={1} style={{ fontSize: 9.5 }}>
              {ui.tagline}
            </AppText>
          </View>
        </View>
        <Avatar name={session?.user.displayName ?? 'Wessali'} provider={app.isProvider} />
      </View>

      <View style={styles.greeting}>
        <AppText variant="caption" tone="muted">
          {greetingFor(app)},
        </AppText>
        <AppText variant="h2" numberOfLines={1}>
          {firstName(session?.user.displayName ?? '')}
        </AppText>
      </View>

      {activeBooking ? (
        <ActiveRunCard app={app} onOpenRequests={onOpenRequests} />
      ) : (
        <GlassCard padding={20} tone="deep" radius={30} style={{ overflow: 'hidden' }}>
          <RouteDoodle height={190} opacity={0.72} />
          <Aurora width={380} height={300} opacity={0.3} secondary={palette.aqua} />
          <View style={{ gap: 14 }}>
            <View style={[styles.heroTop, rtlStyle && styles.rowReverse]}>
              <View style={[styles.kicker, rtlStyle && styles.rowReverse]}>
                <View style={styles.kickerDot} />
                <AppText variant="caption" tone="jade">
                  {ui.welcomeKicker}
                </AppText>
              </View>
              <IconTile tone="freight" size="lg" />
            </View>
            <AppText variant="h1" style={{ maxWidth: '88%' }}>
              {ui.homeTitle}
            </AppText>
            <AppText variant="body" tone="soft" style={{ maxWidth: '86%' }}>
              {ui.homeBody}
            </AppText>
            <PrimaryButton
              label={ui.homeCta}
              icon={isRtl ? 'arrow-back' : 'arrow-forward'}
              compact
              onPress={onStartRequest}
              style={{ alignSelf: isRtl ? 'flex-end' : 'flex-start', minWidth: 180 }}
            />
          </View>
        </GlassCard>
      )}

      <View style={[styles.statsRow, rtlStyle && styles.rowReverse]}>
        <StatTile
          label={ui.statActive}
          value={activeBookings.length}
          color={palette.jade}
          icon="navigate-outline"
          isRtl={isRtl}
        />
        <StatTile
          label={ui.statCompleted}
          value={completed}
          color={palette.aqua}
          icon="checkmark-circle-outline"
          isRtl={isRtl}
        />
        <StatTile
          label={ui.statTotal}
          value={bookings.length}
          color={palette.sand}
          icon="layers-outline"
          isRtl={isRtl}
        />
      </View>

      <SectionHeading title={ui.servicesTitle} caption={ui.servicesBody} />
      <View style={{ gap: 12 }}>
        {SERVICE_CATEGORIES.map((service, index) => {
          const tone = serviceTheme[service.id];
          const description =
            service.id === 'freight'
              ? ui.serviceFreightShort
              : service.id === 'roadside'
                ? ui.serviceRoadsideShort
                : ui.serviceWaterShort;

          return (
            <Pressable
              key={service.id}
              accessibilityRole="button"
              accessibilityLabel={service.labels[locale]}
              onPress={() => onOpenService(service.id)}
              style={({ pressed }) => [pressed && { opacity: 0.82 }]}
            >
              <GlassCard padding={9} radius={23} intensity={22}>
                <View style={[styles.serviceRow, rtlStyle && styles.rowReverse]}>
                  <View style={styles.servicePhoto}>
                    <ExpoImage
                      source={{ uri: servicePhotos[service.id] }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                      transition={240}
                      cachePolicy="memory-disk"
                    />
                    <LinearGradient
                      colors={['rgba(18, 27, 21, 0.02)', 'rgba(18, 27, 21, 0.38)']}
                      locations={[0.2, 1]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.serviceImageCounter}>
                      <AppText variant="caption" tone="white" style={{ fontSize: 8.5, lineHeight: 11 }}>
                        {String(index + 1).padStart(2, '0')} / 03
                      </AppText>
                    </View>
                    <View style={styles.serviceImageIcon}>
                      <IconTile tone={service.id} size="sm" glow={false} />
                    </View>
                  </View>
                  <View style={styles.serviceInfo}>
                    <AppText variant="h3" numberOfLines={2} style={{ fontSize: 15.5, lineHeight: 21 }}>
                      {service.labels[locale]}
                    </AppText>
                    <AppText variant="caption" tone="muted" numberOfLines={2} style={{ lineHeight: 17 }}>
                      {description}
                    </AppText>
                    <View style={[styles.serviceFooter, rtlStyle && styles.rowReverse]}>
                      <AppText variant="label" style={{ color: tone.accent, fontSize: 10.5 }}>
                        {ui.homeCta}
                      </AppText>
                      <View
                        style={[
                          styles.serviceArrow,
                          { backgroundColor: `${tone.accent}14`, borderColor: `${tone.accent}38` },
                        ]}
                      >
                        <Ionicons
                          name={isRtl ? 'arrow-back' : 'arrow-forward'}
                          size={14}
                          color={tone.accent}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </Pressable>
          );
        })}
      </View>

      <GlassCard padding={18} radius={26}>
        <View style={[styles.cardTop, rtlStyle && styles.rowReverse]}>
          <View style={{ flex: 1, gap: 3 }}>
            <AppText variant="h3">{ui.weekTitle}</AppText>
            <AppText variant="caption" tone="muted">
              {ui.weekCaption}
            </AppText>
          </View>
          <View style={styles.weekTotal}>
            <AppText variant="h2" tone="jade" align="center" style={{ fontSize: 22 }}>
              {weekTotal}
            </AppText>
            <AppText variant="caption" tone="muted" align="center" style={{ fontSize: 9 }}>
              {ui.navRequests}
            </AppText>
          </View>
        </View>
        <View style={{ height: 14 }} />
        <ActivityArea data={week} labels={dayLabels} />
        {weekTotal === 0 ? (
          <AppText variant="caption" tone="faint" align="center" style={{ marginTop: 6 }}>
            {ui.weekEmpty}
          </AppText>
        ) : null}
        <Divider style={{ marginVertical: 16 }} />
        <View style={{ gap: 12 }}>
          <AppText variant="label" tone="soft">
            {ui.serviceMix}
          </AppText>
          <ServiceMix rows={serviceCounts.map((row) => ({ ...row, max: maxServiceCount }))} />
        </View>
      </GlassCard>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={app.isProvider ? ui.providerBannerCta : ui.partnerBannerCta}
        onPress={onOpenPartner}
        style={({ pressed }) => [pressed && { opacity: 0.8 }]}
      >
        <GlassCard padding={16} radius={24} tone="deep">
          <Aurora
            width={300}
            height={200}
            opacity={0.16}
            color={palette.sand}
            secondary={palette.amber}
          />
          <View style={[styles.partnerRow, rtlStyle && styles.rowReverse]}>
            <IconTile
              tone="sand"
              icon={app.isProvider ? 'account-hard-hat' : 'handshake-outline'}
              size="md"
            />
            <View style={{ flex: 1, gap: 3 }}>
              <AppText variant="bodyStrong">
                {app.isProvider ? ui.providerBannerTitle : ui.partnerBannerTitle}
              </AppText>
              <AppText variant="caption" tone="muted" style={{ lineHeight: 17 }}>
                {app.isProvider ? ui.providerBannerBody : ui.partnerBannerBody}
              </AppText>
            </View>
            <Ionicons
              name={isRtl ? 'chevron-back' : 'chevron-forward'}
              size={17}
              color={palette.sand}
            />
          </View>
        </GlassCard>
      </Pressable>

      {bookings.length > 0 ? (
        <>
          <SectionHeading title={ui.recentTitle} action={ui.seeAll} onAction={onOpenRequests} />
          <View style={{ gap: 9 }}>
            {bookings.slice(0, 2).map((booking) => {
              const service = SERVICE_CATEGORIES.find((item) => item.id === booking.service_type);
              return (
                <Pressable
                  key={booking.id}
                  accessibilityRole="button"
                  accessibilityLabel={booking.public_reference}
                  onPress={onOpenRequests}
                >
                  <GlassCard padding={13} radius={20}>
                    <View style={[styles.recentRow, rtlStyle && styles.rowReverse]}>
                      <IconTile tone={booking.service_type} size="sm" />
                      <View style={{ flex: 1, gap: 2 }}>
                        <AppText variant="bodyStrong" numberOfLines={1} style={{ fontSize: 13.5 }}>
                          {service?.labels[locale]}
                        </AppText>
                        <AppText variant="caption" tone="muted" numberOfLines={1}>
                          {booking.pickup_address}
                        </AppText>
                      </View>
                      <View style={{ alignItems: isRtl ? 'flex-start' : 'flex-end', gap: 4 }}>
                        <StatusPill
                          status={booking.status}
                          label={statusText(app, booking.status)}
                        />
                        <AppText variant="caption" tone="faint" style={{ fontSize: 9.5 }}>
                          {formatShortDate(booking.requested_at ?? booking.created_at, locale)}
                        </AppText>
                      </View>
                    </View>
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
    </Page>
  );
}

function StatTile({
  label,
  value,
  color,
  icon,
  isRtl,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  isRtl: boolean;
}) {
  return (
    <GlassCard padding={13} radius={20} style={{ flex: 1 }}>
      <View style={{ gap: 6, alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
        <View style={[styles.statTop, { justifyContent: 'space-between' }]}>
          <LinearGradient
            colors={[`${color}3D`, `${color}0F`]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: `${color}2E`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={icon} size={14} color={color} />
          </LinearGradient>
        </View>
        <AppText
          variant="number"
          style={{ color, fontSize: 27, lineHeight: 31, letterSpacing: -1 }}
        >
          {value}
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={1} style={{ fontSize: 10 }}>
          {label}
        </AppText>
      </View>
    </GlassCard>
  );
}

function ActiveRunCard({ app, onOpenRequests }: { app: WessaliApp; onOpenRequests: () => void }) {
  const { ui, locale, activeBooking, isRtl } = app;
  const { isRtl: rtlStyle } = useLocaleValue();
  if (!activeBooking) return null;
  return (
    <GlassCard padding={18} tone="deep" radius={28} style={{ overflow: 'hidden' }}>
      <RouteDoodle
        height={150}
        opacity={0.5}
        color={serviceTheme[activeBooking.service_type].accent}
      />
      <View style={{ gap: 14 }}>
        <View style={[styles.cardTop, rtlStyle && styles.rowReverse]}>
          <View style={[styles.activeTitle, rtlStyle && styles.rowReverse]}>
            <IconTile tone={activeBooking.service_type} size="sm" />
            <View style={{ gap: 2 }}>
              <AppText variant="caption" tone="jade">
                {ui.activeRunTitle}
              </AppText>
              <AppText variant="h3" numberOfLines={1} style={{ fontSize: 15, maxWidth: 170 }}>
                {activeBooking.public_reference}
              </AppText>
            </View>
          </View>
          <StatusPill status={activeBooking.status} label={statusText(app, activeBooking.status)} />
        </View>
        <TripRoute booking={activeBooking} locale={locale} />
        <View style={{ gap: 9 }}>
          <RouteProgress status={activeBooking.status} />
          <View style={[styles.activeFooter, rtlStyle && styles.rowReverse]}>
            <AppText variant="caption" tone="muted" style={{ flex: 1 }} numberOfLines={1}>
              {activeBooking.provider_name ?? ui.findingProvider}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={ui.track}
              onPress={onOpenRequests}
              style={[styles.trackCta, rtlStyle && styles.rowReverse]}
            >
              <AppText variant="label" tone="jade">
                {ui.track}
              </AppText>
              <Ionicons
                name={isRtl ? 'arrow-back' : 'arrow-forward'}
                size={13}
                color={palette.jade}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </GlassCard>
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
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  greeting: { gap: 1, paddingTop: 2, paddingHorizontal: 2 },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(55, 225, 165, 0.18)',
    backgroundColor: 'rgba(55, 225, 165, 0.07)',
  },
  kickerDot: { width: 5, height: 5, borderRadius: 999, backgroundColor: palette.jade },
  statsRow: { flexDirection: 'row', gap: 9 },
  statTop: { flexDirection: 'row', alignItems: 'center' },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  servicePhoto: {
    width: 116,
    height: 108,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: palette.canvasDeep,
  },
  serviceImageCounter: {
    position: 'absolute',
    top: 7,
    left: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(18, 27, 21, 0.46)',
  },
  serviceImageIcon: { position: 'absolute', right: 6, bottom: 6 },
  serviceInfo: { flex: 1, minWidth: 0, justifyContent: 'center', gap: 5 },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  serviceArrow: {
    width: 32,
    height: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  weekTotal: { alignItems: 'center', gap: 0, minWidth: 54 },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  activeTitle: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  activeFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trackCta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
