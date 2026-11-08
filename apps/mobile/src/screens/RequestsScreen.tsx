import React, { useState } from 'react';
import { Alert, Linking, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SERVICE_CATEGORIES, type ServiceKind } from '@wessali/contracts';
import { palette, serviceTheme } from '../theme';
import type { WessaliApp } from '../useWessali';
import type { Booking } from '../types';
import { AppText, EmptyArt, GlassCard, Page, useLocaleValue } from '../ui/base';
import { IconButton, PrimaryButton, SecondaryButton, Segmented, StatusPill } from '../ui/controls';
import { IconTile } from '../ui/IconTile';
import { RouteProgress, TripRoute } from '../ui/trip';
import { formatShortDate, isActive, isClosed } from '../utils';

type Props = {
  app: WessaliApp;
  onStartRequest: () => void;
  onOpenPartner: () => void;
};

function statusText(app: WessaliApp, status: string) {
  return (app.ui.status as Record<string, string>)[status] ?? status.replaceAll('_', ' ');
}

export function RequestsScreen({ app, onStartRequest, onOpenPartner }: Props) {
  const { ui, isRtl } = app;
  const [filter, setFilter] = useState<'active' | 'closed' | 'all'>('active');
  const [queueTab, setQueueTab] = useState<'available' | 'jobs'>('available');

  if (app.isProvider) {
    return (
      <ProviderQueue
        app={app}
        onOpenPartner={onOpenPartner}
        queueTab={queueTab}
        setQueueTab={setQueueTab}
      />
    );
  }

  const items =
    filter === 'active'
      ? app.bookings.filter((booking) => isActive(booking.status))
      : filter === 'closed'
        ? app.bookings.filter((booking) => isClosed(booking.status))
        : app.bookings;

  const emptyTitle =
    filter === 'active'
      ? ui.emptyActiveTitle
      : filter === 'closed'
        ? ui.emptyClosedTitle
        : ui.emptyAllTitle;
  const emptyBody =
    filter === 'active'
      ? ui.emptyActiveBody
      : filter === 'closed'
        ? ui.emptyClosedBody
        : ui.emptyAllBody;

  function requestCancel(booking: Booking) {
    Alert.alert(ui.cancelTitle, ui.cancelBody, [
      { text: ui.keepRequest, style: 'cancel' },
      {
        text: ui.confirmCancel,
        style: 'destructive',
        onPress: () => void app.cancelBooking(booking.id),
      },
    ]);
  }

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
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="h1">{ui.requestsTitle}</AppText>
          <AppText variant="body" tone="muted">
            {ui.requestsBody}
          </AppText>
        </View>
        <IconButton
          icon="refresh-outline"
          label={ui.refresh}
          onPress={() => void app.refreshData()}
        />
      </View>

      <Segmented
        value={filter}
        onChange={(value) => setFilter(value as typeof filter)}
        options={[
          { value: 'active', label: ui.filterActive },
          { value: 'closed', label: ui.filterClosed },
          { value: 'all', label: ui.filterAll },
        ]}
      />

      {items.length === 0 ? (
        <GlassCard padding={24} radius={26}>
          <View style={{ gap: 12, alignItems: 'center' }}>
            <EmptyArt icon="navigate-outline" />
            <AppText variant="h3" align="center">
              {emptyTitle}
            </AppText>
            <AppText variant="body" tone="muted" align="center" style={{ maxWidth: 270 }}>
              {emptyBody}
            </AppText>
            <PrimaryButton
              label={ui.startRequest}
              icon={isRtl ? 'arrow-back' : 'arrow-forward'}
              compact
              onPress={onStartRequest}
              style={{ marginTop: 4, minWidth: 180 }}
            />
          </View>
        </GlassCard>
      ) : (
        <View style={{ gap: 12 }}>
          {items.map((booking) => (
            <CustomerBookingCard
              key={booking.id}
              app={app}
              booking={booking}
              onCancel={() => requestCancel(booking)}
            />
          ))}
        </View>
      )}
    </Page>
  );
}

function CustomerBookingCard({
  app,
  booking,
  onCancel,
}: {
  app: WessaliApp;
  booking: Booking;
  onCancel: () => void;
}) {
  const { ui, locale, isRtl } = app;
  const { isRtl: rtlStyle } = useLocaleValue();
  const service = SERVICE_CATEGORIES.find((item) => item.id === booking.service_type);
  const tone = serviceTheme[booking.service_type];
  const canCancel = ['submitted', 'matching', 'offer_received'].includes(booking.status);
  const meta = bookingMeta(app, booking);

  return (
    <GlassCard padding={16} radius={24}>
      <View style={[styles.cardHeader, rtlStyle && styles.rowReverse]}>
        <IconTile tone={booking.service_type} size="sm" />
        <View style={{ flex: 1, gap: 3 }}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {service?.labels[locale]}
          </AppText>
          <AppText variant="caption" tone="faint">
            {ui.refLabel} {booking.public_reference} ·{' '}
            {formatShortDate(booking.requested_at ?? booking.created_at, locale)}
          </AppText>
        </View>
        <StatusPill status={booking.status} label={statusText(app, booking.status)} />
      </View>

      <View style={styles.routeWrap}>
        <TripRoute booking={booking} locale={locale} />
      </View>

      {isActive(booking.status) ? (
        <View style={{ gap: 7, marginTop: 14 }}>
          <RouteProgress status={booking.status} />
        </View>
      ) : null}

      {meta.length ? (
        <View style={[styles.metaRow, rtlStyle && styles.rowReverse]}>
          {meta.map((item) => (
            <View
              key={item.label}
              style={[
                styles.metaChip,
                { borderColor: `${tone.accent}24`, backgroundColor: `${tone.accent}0D` },
              ]}
            >
              <Ionicons name={item.icon} size={12} color={tone.accent} />
              <AppText variant="caption" tone="soft" style={{ fontSize: 10 }}>
                {item.label}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      {booking.provider_name ? (
        <View style={[styles.providerRow, rtlStyle && styles.rowReverse]}>
          <Ionicons name="shield-checkmark-outline" size={13} color={palette.jade} />
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {ui.assignedProvider}: {booking.provider_name}
          </AppText>
        </View>
      ) : isActive(booking.status) ? (
        <View style={[styles.providerRow, rtlStyle && styles.rowReverse]}>
          <Ionicons name="radio-outline" size={13} color={palette.aqua} />
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {ui.findingProvider}
          </AppText>
        </View>
      ) : null}

      {canCancel ? (
        <View style={{ marginTop: 14 }}>
          <SecondaryButton
            label={ui.cancelRequest}
            icon="close-outline"
            danger
            onPress={onCancel}
            disabled={app.busy}
          />
        </View>
      ) : null}
    </GlassCard>
  );
}

function bookingMeta(app: WessaliApp, booking: Booking) {
  const { ui } = app;
  const items: Array<{ label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [];
  if (booking.service_type === 'freight' && booking.freight) {
    const freight = booking.freight;
    if (freight.weight_kg) {
      items.push({
        label: `${Number(freight.weight_kg)} kg`,
        icon: 'barbell-outline',
      });
    }
    if (freight.truck_type) {
      const truckLabels: Record<string, string> = {
        pickup: ui.truckPickup,
        van: ui.truckVan,
        flatbed: ui.truckFlatbed,
        box_truck: ui.truckBox,
        semi_trailer: ui.truckSemi,
        other: ui.otherUse,
      };
      items.push({
        label: truckLabels[freight.truck_type] ?? freight.truck_type,
        icon: 'cube-outline',
      });
    }
  }
  if (booking.service_type === 'roadside' && booking.roadside) {
    const roadside = booking.roadside;
    const vehicleLabels: Record<string, string> = {
      car: ui.vehicleCar,
      motorcycle: ui.vehicleMotorcycle,
      van: ui.vehicleVan,
      truck: ui.vehicleTruck,
      other: ui.otherUse,
    };
    const issueLabels: Record<string, string> = {
      mechanical: ui.issueMechanical,
      tyre: ui.issueTyre,
      battery: ui.issueBattery,
      fuel: ui.issueFuel,
      towing: ui.issueTowing,
      other: ui.otherUse,
    };
    if (roadside.vehicle_type) {
      items.push({
        label: vehicleLabels[roadside.vehicle_type] ?? roadside.vehicle_type,
        icon: 'car-outline',
      });
    }
    if (roadside.issue_category) {
      items.push({
        label: issueLabels[roadside.issue_category] ?? roadside.issue_category,
        icon: 'construct-outline',
      });
    }
  }
  if (booking.service_type === 'water' && booking.water) {
    const water = booking.water;
    if (water.quantity_litres) {
      items.push({ label: `${Number(water.quantity_litres)} L`, icon: 'water-outline' });
    }
    if (water.water_category) {
      const waterLabels: Record<string, string> = {
        potable: ui.potable,
        non_potable: ui.nonPotable,
        irrigation: ui.irrigation,
      };
      items.push({
        label: waterLabels[water.water_category] ?? water.water_category,
        icon: 'flask-outline',
      });
    }
  }
  return items;
}

function ProviderQueue({
  app,
  onOpenPartner,
  queueTab,
  setQueueTab,
}: {
  app: WessaliApp;
  onOpenPartner: () => void;
  queueTab: 'available' | 'jobs';
  setQueueTab: (tab: 'available' | 'jobs') => void;
}) {
  const { ui, isRtl, providerApproved, providerRequests, providerJobs } = app;
  const { isRtl: rtlStyle } = useLocaleValue();

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
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="h1">{ui.requestsTitle}</AppText>
          <AppText variant="body" tone="muted">
            {ui.providerQueueBody}
          </AppText>
        </View>
        <IconButton
          icon="refresh-outline"
          label={ui.refresh}
          onPress={() => void app.refreshData()}
        />
      </View>

      {!providerApproved ? (
        <GlassCard padding={22} radius={26}>
          <View style={{ gap: 12, alignItems: 'center' }}>
            <EmptyArt
              icon={
                app.providerProfile?.status === 'pending' ? 'time-outline' : 'briefcase-outline'
              }
              color={palette.sand}
            />
            <AppText variant="h3" align="center">
              {app.providerProfile?.status === 'pending' ? ui.pendingTitle : ui.partnerTitle}
            </AppText>
            <AppText variant="body" tone="muted" align="center" style={{ maxWidth: 280 }}>
              {app.providerProfile?.status === 'pending' ? ui.pendingBody : ui.notAppliedBody}
            </AppText>
            <PrimaryButton
              label={ui.providerBannerCta}
              icon={isRtl ? 'arrow-back' : 'arrow-forward'}
              compact
              onPress={onOpenPartner}
              style={{ marginTop: 4, minWidth: 180 }}
            />
          </View>
        </GlassCard>
      ) : (
        <>
          <Segmented
            value={queueTab}
            onChange={(value) => setQueueTab(value as typeof queueTab)}
            options={[
              {
                value: 'available',
                label: `${ui.availableRequests} · ${providerRequests.length}`,
              },
              { value: 'jobs', label: `${ui.activeJobs} · ${providerJobs.length}` },
            ]}
          />
          {queueTab === 'available' ? (
            providerRequests.length ? (
              <View style={{ gap: 12 }}>
                {providerRequests.map((booking) => (
                  <AvailableCard key={booking.id} app={app} booking={booking} />
                ))}
              </View>
            ) : (
              <QueueEmpty
                icon="file-tray-outline"
                title={ui.noAvailableTitle}
                body={ui.noAvailableBody}
              />
            )
          ) : providerJobs.length ? (
            <View style={{ gap: 12 }}>
              {providerJobs.map((booking) => (
                <JobCard key={booking.id} app={app} booking={booking} />
              ))}
            </View>
          ) : (
            <QueueEmpty icon="checkmark-done-outline" title={ui.noJobsTitle} body={ui.noJobsBody} />
          )}
          <AppText variant="caption" tone="faint" align="center" style={{ paddingTop: 4 }}>
            {ui.providerBannerBody}
          </AppText>
        </>
      )}
    </Page>
  );
}

function AvailableCard({ app, booking }: { app: WessaliApp; booking: Booking }) {
  const { ui, locale } = app;
  const { isRtl } = useLocaleValue();
  const service = SERVICE_CATEGORIES.find((item) => item.id === booking.service_type);
  const tone = serviceTheme[booking.service_type];
  return (
    <GlassCard padding={16} radius={24}>
      <View style={[styles.cardHeader, isRtl && styles.rowReverse]}>
        <IconTile tone={booking.service_type} size="sm" />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {service?.labels[locale]}
          </AppText>
          <AppText variant="caption" tone="faint">
            {ui.refLabel} {booking.public_reference}
          </AppText>
        </View>
        <View
          style={[
            styles.openTag,
            { borderColor: `${tone.accent}3D`, backgroundColor: `${tone.accent}14` },
          ]}
        >
          <AppText variant="caption" style={{ color: tone.accent, fontSize: 9.5 }}>
            {ui.openJobCount}
          </AppText>
        </View>
      </View>
      <View style={styles.routeWrap}>
        <TripRoute booking={booking} locale={locale} />
      </View>
      <CoordinateNavigation booking={booking} locale={locale} />
      {booking.customer_notes ? (
        <AppText variant="caption" tone="muted" numberOfLines={2} style={{ marginTop: 10 }}>
          {booking.customer_notes}
        </AppText>
      ) : null}
      <View style={{ marginTop: 14 }}>
        <PrimaryButton
          label={ui.acceptCta}
          icon="checkmark"
          compact
          loading={app.busy}
          onPress={() => void app.acceptRequest(booking.id)}
        />
      </View>
    </GlassCard>
  );
}

function JobCard({ app, booking }: { app: WessaliApp; booking: Booking }) {
  const { ui, locale } = app;
  const { isRtl } = useLocaleValue();
  const service = SERVICE_CATEGORIES.find((item) => item.id === booking.service_type);
  return (
    <GlassCard padding={16} radius={24} tone="deep">
      <View style={[styles.cardHeader, isRtl && styles.rowReverse]}>
        <IconTile tone={booking.service_type} size="sm" />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {service?.labels[locale]}
          </AppText>
          <AppText variant="caption" tone="faint">
            {ui.refLabel} {booking.public_reference}
          </AppText>
        </View>
        <StatusPill status={booking.status} label={statusText(app, booking.status)} />
      </View>
      <View style={styles.routeWrap}>
        <TripRoute booking={booking} locale={locale} />
      </View>
      <CoordinateNavigation booking={booking} locale={locale} />
      <View style={{ gap: 10, marginTop: 14 }}>
        <RouteProgress status={booking.status} />
        <PrimaryButton
          label={ui.advanceCta}
          icon={isRtl ? 'arrow-back' : 'arrow-forward'}
          compact
          loading={app.busy}
          onPress={() => void app.advanceJob(booking.id)}
        />
      </View>
    </GlassCard>
  );
}

function CoordinateNavigation({ booking, locale }: { booking: Booking; locale: string }) {
  const pickupReady =
    typeof booking.pickup_latitude === 'number' && typeof booking.pickup_longitude === 'number';
  const destinationReady =
    typeof booking.destination_latitude === 'number' &&
    typeof booking.destination_longitude === 'number';
  if (!pickupReady && !destinationReady) return null;
  const open = (latitude: number, longitude: number) =>
    Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`);
  const pickup =
    locale === 'ar'
      ? 'فتح موقع الاستلام'
      : locale === 'fr'
        ? 'Ouvrir le retrait'
        : 'Open pickup pin';
  const destination =
    locale === 'ar'
      ? 'فتح موقع التسليم'
      : locale === 'fr'
        ? 'Ouvrir la destination'
        : 'Open destination pin';
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 11 }}>
      {pickupReady ? (
        <Pressable
          onPress={() => void open(booking.pickup_latitude!, booking.pickup_longitude!)}
          style={styles.mapLink}
        >
          <Ionicons name="navigate-outline" size={14} color={palette.jadeDeep} />
          <AppText variant="caption" style={{ color: palette.jadeDeep }}>
            {pickup}
          </AppText>
        </Pressable>
      ) : null}
      {destinationReady ? (
        <Pressable
          onPress={() => void open(booking.destination_latitude!, booking.destination_longitude!)}
          style={styles.mapLink}
        >
          <Ionicons name="flag-outline" size={14} color={palette.jadeDeep} />
          <AppText variant="caption" style={{ color: palette.jadeDeep }}>
            {destination}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

function QueueEmpty({
  icon,
  title,
  body,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
}) {
  return (
    <GlassCard padding={24} radius={26}>
      <View style={{ gap: 12, alignItems: 'center' }}>
        <EmptyArt icon={icon} color={palette.aqua} />
        <AppText variant="h3" align="center">
          {title}
        </AppText>
        <AppText variant="body" tone="muted" align="center" style={{ maxWidth: 270 }}>
          {body}
        </AppText>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowReverse: { flexDirection: 'row-reverse' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  routeWrap: { marginTop: 14 },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(88,116,94,0.22)',
    backgroundColor: 'rgba(88,116,94,0.07)',
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 11,
  },
  openTag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
});
