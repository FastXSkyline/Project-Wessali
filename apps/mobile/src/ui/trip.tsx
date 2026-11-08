import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Locale } from '@wessali/i18n';
import { serviceTheme, palette } from '../theme';
import { AppText, useLocaleValue } from './base';
import type { Booking } from '../types';
import { formatShortDate, statusProgress } from '../utils';

export function TripRoute({ booking, locale }: { booking: Booking; locale: Locale }) {
  const { isRtl } = useLocaleValue();
  const tone = serviceTheme[booking.service_type];
  const hasDestination = Boolean(booking.destination_address);
  return (
    <View style={[styles.routeRow, isRtl && styles.rowReverse]}>
      <View style={styles.rail}>
        <View style={[styles.originDot, { borderColor: tone.accent }]}>
          <View style={[styles.originCore, { backgroundColor: tone.accent }]} />
        </View>
        {hasDestination ? <View style={styles.railLine} /> : null}
        {hasDestination ? (
          <View style={[styles.destinationDot, { borderColor: tone.accent }]} />
        ) : null}
      </View>
      <View style={{ flex: 1, gap: hasDestination ? 13 : 2 }}>
        <View style={{ gap: 2 }}>
          <AppText variant="caption" tone="faint">
            {formatShortDate(booking.requested_at ?? booking.created_at, locale)}
          </AppText>
          <AppText variant="bodyStrong" numberOfLines={2}>
            {booking.pickup_address}
          </AppText>
        </View>
        {hasDestination ? (
          <AppText variant="body" tone="muted" numberOfLines={2}>
            {booking.destination_address}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

export function RouteProgress({ status }: { status: string }) {
  const progress = statusProgress(status);
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      {[0.08, 0.36, 0.66, 1].map((stop) => (
        <View
          key={stop}
          style={[
            styles.progressStop,
            { left: `${stop * 100}%`, opacity: progress >= stop - 0.01 ? 1 : 0.35 },
          ]}
        />
      ))}
    </View>
  );
}

export function DetailLine({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailLine}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={13} color={palette.jade} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <AppText variant="caption" tone="faint">
          {label}
        </AppText>
        <AppText variant="bodyStrong" numberOfLines={2} style={{ fontSize: 13 }}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  routeRow: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  rowReverse: { flexDirection: 'row-reverse' },
  rail: { width: 14, alignItems: 'center', paddingTop: 3 },
  originDot: {
    width: 13,
    height: 13,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  originCore: { width: 5, height: 5, borderRadius: 999 },
  railLine: {
    flex: 1,
    width: 1,
    minHeight: 14,
    backgroundColor: 'rgba(155, 244, 209, 0.22)',
    marginVertical: 4,
  },
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
    backgroundColor: 'rgba(155, 244, 209, 0.18)',
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: palette.jade,
  },
  progressStop: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: palette.mint,
    marginLeft: -2,
  },
  detailLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  detailIcon: {
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: 'rgba(55, 225, 165, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
