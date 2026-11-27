import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Ionicons } from '@expo/vector-icons';
import type { Booking, WessaliApp } from '../types';
import { palette } from '../theme';
import { AppText, GlassCard, Page, useLocaleValue } from '../ui/base';
import { IconButton, StatusPill } from '../ui/controls';
import { RouteProgress, TripRoute } from '../ui/trip';

const DEFAULT_CENTER = { latitude: 36.7538, longitude: 3.0588 };

function statusText(app: WessaliApp, status: string) {
  return (app.ui.status as Record<string, string>)[status] ?? status.replaceAll('_', ' ');
}

export function TrackingScreen({ app, booking, onBack }: { app: WessaliApp; booking: Booking; onBack: () => void }) {
  const { ui, locale, isRtl } = app;
  const { isRtl: rtl } = useLocaleValue();
  const pickup = useMemo(() => (
    typeof booking.pickup_latitude === 'number' && typeof booking.pickup_longitude === 'number'
      ? { latitude: booking.pickup_latitude, longitude: booking.pickup_longitude }
      : null
  ), [booking.pickup_latitude, booking.pickup_longitude]);
  const destination = useMemo(() => (
    typeof booking.destination_latitude === 'number' && typeof booking.destination_longitude === 'number'
      ? { latitude: booking.destination_latitude, longitude: booking.destination_longitude }
      : null
  ), [booking.destination_latitude, booking.destination_longitude]);
  const center = pickup && destination
    ? { latitude: (pickup.latitude + destination.latitude) / 2, longitude: (pickup.longitude + destination.longitude) / 2 }
    : pickup ?? destination ?? DEFAULT_CENTER;
  const cameraPosition = useMemo(() => ({
    coordinates: center,
    zoom: pickup && destination ? 10.5 : 14,
  }), [center.latitude, center.longitude, pickup, destination]);
  const markers = [
    ...(pickup ? [{
      coordinates: pickup,
      title: ui.pickupLabel,
      systemImage: 'location.fill',
      tintColor: '#176FC2',
    }] : []),
    ...(destination ? [{
      coordinates: destination,
      title: ui.destinationLabel,
      systemImage: 'flag.fill',
      tintColor: '#E34F59',
    }] : []),
  ];
  const hasMapPins = markers.length > 0;

  return (
    <Page topSpace={8} bottomSpace={20}>
      <View style={[styles.header, rtl && styles.rowReverse]}>
        <IconButton icon={isRtl ? 'arrow-forward' : 'arrow-back'} label={ui.back} onPress={onBack} />
        <View style={{ flex: 1, gap: 1 }}>
          <AppText variant="caption" style={{ color: palette.jadeBright }}>{ui.activeRunTitle}</AppText>
          <AppText variant="h2">{ui.track}</AppText>
        </View>
        <StatusPill status={booking.status} label={statusText(app, booking.status)} />
      </View>

      <View style={styles.mapCard}>
        {Platform.OS === 'ios' ? (
          <AppleMaps.View
            style={StyleSheet.absoluteFill}
            cameraPosition={cameraPosition}
            markers={markers}
            properties={{ selectionEnabled: true }}
            uiSettings={{ compassEnabled: true, myLocationButtonEnabled: false }}
          />
        ) : Platform.OS === 'android' ? (
          <GoogleMaps.View
            style={StyleSheet.absoluteFill}
            cameraPosition={cameraPosition}
            markers={markers}
            properties={{}}
            uiSettings={{ compassEnabled: true, myLocationButtonEnabled: false }}
          />
        ) : (
          <View style={styles.mapFallback}>
            <Ionicons name="map-outline" size={30} color={palette.jadeBright} />
            <AppText variant="label" tone="muted" align="center">{ui.locationSection}</AppText>
          </View>
        )}
        <View pointerEvents="none" style={styles.mapLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#176FC2' }]} />
            <AppText variant="caption" style={{ color: palette.ink }}>{ui.pickupLabel}</AppText>
          </View>
          {destination ? (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E34F59' }]} />
              <AppText variant="caption" style={{ color: palette.ink }}>{ui.destinationLabel}</AppText>
            </View>
          ) : null}
        </View>
        {!hasMapPins ? (
          <View style={styles.mapNotice}>
            <AppText variant="caption" tone="muted" align="center">{ui.pickupLabel}</AppText>
          </View>
        ) : null}
      </View>

      <GlassCard padding={17} radius={22}>
        <View style={[styles.providerHeader, rtl && styles.rowReverse]}>
          <View style={styles.providerIcon}>
            <Ionicons name="car-outline" size={19} color={palette.jadeBright} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="caption" tone="muted">{ui.assignedProvider}</AppText>
            <AppText variant="bodyStrong" numberOfLines={1}>{booking.provider_name || ui.findingProvider}</AppText>
          </View>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <AppText variant="caption" style={{ color: palette.jade }}>{statusText(app, booking.status)}</AppText>
          </View>
        </View>
        <View style={{ height: 14 }} />
        <TripRoute booking={booking} locale={locale} />
        <View style={{ height: 15 }} />
        <RouteProgress status={booking.status} />
        <View style={[styles.referenceRow, rtl && styles.rowReverse]}>
          <AppText variant="caption" tone="muted">{ui.refLabel}</AppText>
          <AppText variant="caption" style={{ color: palette.ink }}>{booking.public_reference}</AppText>
        </View>
      </GlassCard>
      <AppText variant="caption" tone="muted" align="center">
        {locale === 'ar'
          ? 'تعرض الخريطة مواقع الانطلاق والوجهة المحفوظة في الطلب.'
          : locale === 'fr'
            ? 'La carte affiche les points de départ et de destination enregistrés pour cette demande.'
            : 'The map shows the saved pickup and destination points for this request.'}
      </AppText>
    </Page>
  );
}

const styles = StyleSheet.create({
  rowReverse: { flexDirection: 'row-reverse' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mapCard: { height: 330, borderRadius: 22, overflow: 'hidden', backgroundColor: '#E8F0F9' },
  mapFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  mapLegend: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 8, backgroundColor: 'rgba(255,255,255,0.96)', paddingHorizontal: 11, paddingVertical: 9, borderRadius: 13 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 7 },
  mapNotice: { position: 'absolute', bottom: 12, left: 12, right: 12, padding: 9, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.94)' },
  providerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  providerIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#EAF2FC', alignItems: 'center', justifyContent: 'center' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 99, backgroundColor: '#EAF4FF' },
  liveDot: { width: 6, height: 6, borderRadius: 6, backgroundColor: '#176FC2' },
  referenceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
});
