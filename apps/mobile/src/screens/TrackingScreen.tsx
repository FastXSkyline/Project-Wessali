import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { WessaliApp } from '../useWessali';
import type { Booking } from '../types';
import { palette } from '../theme';
import { AppText, GlassCard, Page, RadialGlow, useLocaleValue } from '../ui/base';
import { IconButton, StatusPill } from '../ui/controls';
import { RouteProgress, TripRoute } from '../ui/trip';

const DEFAULT_CENTER = { latitude: 36.7538, longitude: 3.0588 };

const NAVY_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0A2138' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9BB4CD' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0A2138' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#274866' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#102D49' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#123653' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#244967' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0B2945' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#A8C0D8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3474A8' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#0B2945' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#04182B' }] },
];

function statusText(app: WessaliApp, status: string) {
  return (app.ui.status as Record<string, string>)[status] ?? status.replaceAll('_', ' ');
}

export function TrackingScreen({
  app,
  booking,
  onBack,
}: {
  app: WessaliApp;
  booking: Booking;
  onBack: () => void;
}) {
  const { ui, locale, isRtl } = app;
  const { isRtl: rtl } = useLocaleValue();

  const pickup = useMemo(
    () =>
      typeof booking.pickup_latitude === 'number' && typeof booking.pickup_longitude === 'number'
        ? { latitude: booking.pickup_latitude, longitude: booking.pickup_longitude }
        : null,
    [booking.pickup_latitude, booking.pickup_longitude],
  );
  const destination = useMemo(
    () =>
      typeof booking.destination_latitude === 'number' &&
      typeof booking.destination_longitude === 'number'
        ? { latitude: booking.destination_latitude, longitude: booking.destination_longitude }
        : null,
    [booking.destination_latitude, booking.destination_longitude],
  );

  const center =
    pickup && destination
      ? {
          latitude: (pickup.latitude + destination.latitude) / 2,
          longitude: (pickup.longitude + destination.longitude) / 2,
        }
      : pickup ?? destination ?? DEFAULT_CENTER;
  const cameraPosition = useMemo(
    () => ({
      coordinates: center,
      zoom: pickup && destination ? 10.5 : 14,
    }),
    [center.latitude, center.longitude, pickup, destination],
  );

  const appleMarkers = [
    ...(pickup
      ? [
          {
            id: 'pickup',
            coordinates: pickup,
            title: ui.pickupLabel,
            systemImage: 'location.fill',
            tintColor: '#54A9FF',
          },
        ]
      : []),
    ...(destination
      ? [
          {
            id: 'destination',
            coordinates: destination,
            title: ui.destinationLabel,
            systemImage: 'flag.fill',
            tintColor: '#FF8494',
          },
        ]
      : []),
  ];

  const googleMarkers = [
    ...(pickup
      ? [{ id: 'pickup', coordinates: pickup, title: ui.pickupLabel, snippet: booking.public_reference }]
      : []),
    ...(destination
      ? [
          {
            id: 'destination',
            coordinates: destination,
            title: ui.destinationLabel,
            snippet: booking.public_reference,
          },
        ]
      : []),
  ];

  const appleHalos = [
    ...(pickup
      ? [
          {
            id: 'pickup-halo',
            center: pickup,
            radius: 310,
            color: 'rgba(52, 151, 255, 0.12)',
            lineColor: 'rgba(74, 173, 255, 0.48)',
            lineWidth: 2,
          },
        ]
      : []),
    ...(destination
      ? [
          {
            id: 'destination-halo',
            center: destination,
            radius: 310,
            color: 'rgba(255, 116, 139, 0.10)',
            lineColor: 'rgba(255, 132, 148, 0.44)',
            lineWidth: 2,
          },
        ]
      : []),
  ];

  const googleHalos = [
    ...(pickup
      ? [
          {
            id: 'pickup-halo',
            center: pickup,
            radius: 310,
            color: 'rgba(52, 151, 255, 0.12)',
            lineColor: 'rgba(74, 173, 255, 0.48)',
            lineWidth: 2,
          },
        ]
      : []),
    ...(destination
      ? [
          {
            id: 'destination-halo',
            center: destination,
            radius: 310,
            color: 'rgba(255, 116, 139, 0.10)',
            lineColor: 'rgba(255, 132, 148, 0.44)',
            lineWidth: 2,
          },
        ]
      : []),
  ];

  const hasMapPins = appleMarkers.length > 0;

  return (
    <Page topSpace={8} bottomSpace={20}>
      <View style={[styles.header, rtl && styles.rowReverse]}>
        <IconButton icon={isRtl ? 'arrow-forward' : 'arrow-back'} label={ui.back} onPress={onBack} />
        <View style={{ flex: 1, gap: 1 }}>
          <AppText variant="caption" style={{ color: palette.jadeBright }}>
            {ui.activeRunTitle}
          </AppText>
          <AppText variant="h2">{ui.track}</AppText>
        </View>
        <StatusPill status={booking.status} label={statusText(app, booking.status)} />
      </View>

      <View style={styles.mapStage}>
        <RadialGlow
          size={340}
          color="#258FE4"
          opacity={0.18}
          style={{ position: 'absolute', top: -88, left: -90 }}
        />
        <View style={styles.mapCard}>
          {Platform.OS === 'ios' ? (
            <AppleMaps.View
              style={StyleSheet.absoluteFill}
              cameraPosition={cameraPosition}
              markers={appleMarkers}
              circles={appleHalos}
              colorScheme="DARK"
              properties={{
                elevation: 'FLAT',
                emphasis: 'MUTED',
                mapType: 'STANDARD',
                selectionEnabled: true,
                isTrafficEnabled: false,
              }}
              uiSettings={{ compassEnabled: true, myLocationButtonEnabled: false }}
            />
          ) : Platform.OS === 'android' ? (
            <GoogleMaps.View
              style={StyleSheet.absoluteFill}
              cameraPosition={cameraPosition}
              markers={googleMarkers}
              circles={googleHalos}
              colorScheme="DARK"
              properties={{
                mapStyleOptions: { json: JSON.stringify(NAVY_MAP_STYLE) },
                isTrafficEnabled: false,
                isBuildingEnabled: true,
                selectionEnabled: true,
              }}
              uiSettings={{
                compassEnabled: true,
                myLocationButtonEnabled: false,
                zoomControlsEnabled: false,
                mapToolbarEnabled: false,
              }}
            />
          ) : (
            <View style={styles.mapFallback}>
              <Ionicons name="map-outline" size={30} color="#72B9F6" />
              <AppText variant="label" style={{ color: '#DCEBFA' }} align="center">
                {ui.locationSection}
              </AppText>
            </View>
          )}

          <LinearGradient
            pointerEvents="none"
            colors={['rgba(4,22,40,0.32)', 'rgba(4,22,40,0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.mapTopFade}
          />

          {hasMapPins ? (
            <View style={[styles.mapLegend, rtl && styles.rowReverse]}>
              <BlurView intensity={34} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={[StyleSheet.absoluteFill, styles.legendTint]} />
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#54A9FF' }]} />
                <AppText variant="caption" style={styles.legendText}>
                  {ui.pickupLabel}
                </AppText>
              </View>
              {destination ? (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FF8494' }]} />
                  <AppText variant="caption" style={styles.legendText}>
                    {ui.destinationLabel}
                  </AppText>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.mapNotice}>
              <LinearGradient
                colors={['rgba(5,24,43,0.02)', 'rgba(5,24,43,0.78)']}
                style={StyleSheet.absoluteFill}
              />
              <AppText variant="caption" style={styles.legendText} align="center">
                {locale === 'ar'
                  ? 'لم تُحفظ إحداثيات الطلب بعد. اختر الموقع من الخريطة عند إنشاء الطلب.'
                  : locale === 'fr'
                    ? 'Aucune coordonnée n’a été enregistrée. Choisissez les emplacements sur la carte lors de la demande.'
                    : 'No map coordinates were saved. Choose locations on the map when creating the request.'}
              </AppText>
            </View>
          )}
        </View>
      </View>

      <GlassCard padding={17} radius={22}>
        <View style={[styles.providerHeader, rtl && styles.rowReverse]}>
          <View style={styles.providerIcon}>
            <Ionicons name="car-outline" size={19} color={palette.jadeBright} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="caption" tone="muted">
              {ui.assignedProvider}
            </AppText>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {booking.provider_name || ui.findingProvider}
            </AppText>
          </View>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <AppText variant="caption" style={{ color: palette.jadeBright }}>
              {statusText(app, booking.status)}
            </AppText>
          </View>
        </View>
        <View style={{ height: 14 }} />
        <TripRoute booking={booking} locale={locale} />
        <View style={{ height: 15 }} />
        <RouteProgress status={booking.status} />
        <View style={[styles.referenceRow, rtl && styles.rowReverse]}>
          <AppText variant="caption" tone="muted">
            {ui.refLabel}
          </AppText>
          <AppText variant="caption" style={{ color: palette.ink }}>
            {booking.public_reference}
          </AppText>
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
  mapStage: {
    position: 'relative',
    padding: 1,
    marginVertical: 2,
  },
  mapCard: {
    height: 340,
    borderRadius: 27,
    overflow: 'hidden',
    backgroundColor: '#071C30',
    borderWidth: 1,
    borderColor: 'rgba(76, 161, 237, 0.40)',
    shadowColor: '#248BD7',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },
  mapTopFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 74 },
  mapFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  mapLegend: {
    position: 'absolute',
    top: 13,
    left: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(151, 204, 250, 0.26)',
  },
  legendTint: { backgroundColor: 'rgba(5, 25, 45, 0.72)' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    shadowColor: '#58B4FF',
    shadowOpacity: 0.7,
    shadowRadius: 5,
  },
  legendText: { color: '#F2F8FF', fontSize: 10.5 },
  mapNotice: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 17,
    overflow: 'hidden',
  },
  providerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  providerIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#EAF2FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: '#EAF4FF',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#2586CE',
    shadowColor: '#2586CE',
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
