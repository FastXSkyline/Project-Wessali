import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import * as Location from 'expo-location';
import {
  Location as PreciseLocation,
  LocationAccuracy,
  LocationProfile,
} from 'expo-location/next';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '../theme';
import { AppText } from './base';

export type PickedLocation = { address: string; latitude: number; longitude: number };
type Coordinates = { latitude: number; longitude: number };
type Props = {
  visible: boolean;
  locale: string;
  onClose: () => void;
  onConfirm: (location: PickedLocation) => void;
};

const DEFAULT_CENTER: Coordinates = { latitude: 36.7538, longitude: 3.0588 };

function addressFrom(parts: Location.LocationGeocodedAddress[]) {
  const item = parts[0];
  if (!item) return '';
  return [item.name, item.street, item.district, item.city, item.region, item.country]
    .filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index)
    .join(', ');
}

export function LocationPicker({ visible, locale, onClose, onConfirm }: Props) {
  const [center, setCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [mapStart, setMapStart] = useState<Coordinates>(DEFAULT_CENTER);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const centerRef = useRef<Coordinates>(DEFAULT_CENTER);
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geocodeSequence = useRef(0);
  const rtl = locale === 'ar';

  const copy = useMemo(
    () => ({
      title:
        locale === 'ar'
          ? 'حدد موقعك'
          : locale === 'fr'
            ? 'Choisir un emplacement'
            : 'Choose a location',
      body:
        locale === 'ar'
          ? 'حرّك الخريطة لوضع الدبوس في المكان الصحيح.'
          : locale === 'fr'
            ? 'Déplacez la carte pour placer le repère.'
            : 'Move the map to place the pin exactly where needed.',
      current: locale === 'ar' ? 'موقعي الحالي' : locale === 'fr' ? 'Ma position' : 'Use my location',
      confirm:
        locale === 'ar'
          ? 'تأكيد الموقع'
          : locale === 'fr'
            ? 'Confirmer la position'
            : 'Confirm location',
      address:
        locale === 'ar'
          ? 'العنوان المقترح'
          : locale === 'fr'
            ? 'Adresse estimée'
            : 'Suggested address',
      coords: locale === 'ar' ? 'الإحداثيات' : locale === 'fr' ? 'Coordonnées' : 'Coordinates',
      permissionTitle:
        locale === 'ar'
          ? 'يلزم السماح بالموقع الدقيق'
          : locale === 'fr'
            ? 'Autorisez la position précise'
            : 'Precise location is required',
      permission:
        locale === 'ar'
          ? 'اسمح لـ Wessali بالوصول إلى موقعك الدقيق حتى يظهر مكانك الصحيح على الخريطة.'
          : locale === 'fr'
            ? 'Autorisez Wessali à accéder à votre position précise pour afficher votre emplacement réel sur la carte.'
            : 'Allow Wessali to use your precise location so the map can show where you actually are.',
      settings:
        locale === 'ar' ? 'فتح الإعدادات' : locale === 'fr' ? 'Ouvrir les réglages' : 'Open Settings',
      cancel: locale === 'ar' ? 'إلغاء' : locale === 'fr' ? 'Annuler' : 'Cancel',
      unavailable:
        locale === 'ar'
          ? 'تعذر تحديد العنوان. ستظل الإحداثيات محفوظة ويمكنك تعديل العنوان يدوياً.'
          : locale === 'fr'
            ? 'Adresse indisponible. Les coordonnées seront tout de même conservées.'
            : 'Address unavailable. Coordinates will still be saved; you can edit the address manually.',
      servicesOff:
        locale === 'ar'
          ? 'فعّل خدمات الموقع في إعدادات الجهاز ثم حاول مرة أخرى.'
          : locale === 'fr'
            ? 'Activez les services de localisation dans les réglages de votre appareil, puis réessayez.'
            : 'Turn on Location Services in your device settings, then try again.',
      locationFailed:
        locale === 'ar'
          ? 'تعذر الحصول على موقعك. تحقق من تشغيل خدمات الموقع وحاول مجدداً.'
          : locale === 'fr'
            ? 'Impossible d’obtenir votre position. Vérifiez les services de localisation et réessayez.'
            : 'Could not get your location. Check that Location Services are on and try again.',
      accuracy:
        locale === 'ar'
          ? 'دقة الموقع'
          : locale === 'fr'
            ? 'Précision'
            : 'Location accuracy',
      meters: locale === 'ar' ? 'م' : locale === 'fr' ? 'm' : 'm',
    }),
    [locale],
  );

  const cameraPosition = useMemo(() => ({ coordinates: mapStart, zoom: 16 }), [mapStart]);

  useEffect(() => {
    if (visible) {
      setAddress('');
      setCenter(DEFAULT_CENTER);
      centerRef.current = DEFAULT_CENTER;
      setUserLocation(null);
      setLocationAccuracy(null);
      void locate();
    }
  }, [visible]);

  useEffect(
    () => () => {
      if (moveTimer.current) clearTimeout(moveTimer.current);
      geocodeSequence.current += 1;
    },
    [],
  );

  async function resolveAddress(point: Coordinates) {
    const sequence = ++geocodeSequence.current;
    setResolving(true);
    try {
      const nextAddress = addressFrom(await Location.reverseGeocodeAsync(point));
      if (sequence === geocodeSequence.current) setAddress(nextAddress);
    } catch {
      if (sequence === geocodeSequence.current) setAddress('');
    } finally {
      if (sequence === geocodeSequence.current) setResolving(false);
    }
  }

  async function locate() {
    setLoading(true);
    try {
      if (!PreciseLocation.hasLocationServicesEnabled()) {
        if (Platform.OS === 'android') {
          const enabled = await PreciseLocation.enableLocationServices();
          if (!enabled) {
            Alert.alert(copy.title, copy.servicesOff);
            return;
          }
        } else {
          Alert.alert(copy.title, copy.servicesOff, [
            { text: copy.cancel, style: 'cancel' },
            { text: copy.settings, onPress: () => void Linking.openSettings() },
          ]);
          return;
        }
      }

      const permission = await PreciseLocation.requestForegroundPermissions();
      if (!permission.granted) {
        if (!permission.canAskAgain) {
          Alert.alert(copy.permissionTitle, copy.permission, [
            { text: copy.cancel, style: 'cancel' },
            { text: copy.settings, onPress: () => void Linking.openSettings() },
          ]);
        } else {
          Alert.alert(copy.permissionTitle, copy.permission);
        }
        return;
      }

      if (permission.accuracy === LocationAccuracy.REDUCED) {
        Alert.alert(copy.permissionTitle, copy.permission, [
          { text: copy.cancel, style: 'cancel' },
          { text: copy.settings, onPress: () => void Linking.openSettings() },
        ]);
        return;
      }

      const fix = await PreciseLocation.getPosition({
        maxCachedAge: 0,
        timeout: 25,
        profile: LocationProfile.OTHER_NAVIGATION,
      });
      if (!fix) {
        Alert.alert(copy.title, copy.locationFailed);
        return;
      }

      const point = {
        latitude: fix.coordinates.latitude,
        longitude: fix.coordinates.longitude,
      };
      centerRef.current = point;
      setCenter(point);
      setMapStart(point);
      setUserLocation(point);
      setLocationAccuracy(fix.horizontalAccuracy);
      setMapKey((current) => current + 1);
      await resolveAddress(point);
    } catch {
      Alert.alert(copy.title, copy.locationFailed);
    } finally {
      setLoading(false);
    }
  }

  function handleCameraMove(point?: { latitude?: number; longitude?: number }) {
    if (typeof point?.latitude !== 'number' || typeof point.longitude !== 'number') return;
    const next = { latitude: point.latitude, longitude: point.longitude };
    centerRef.current = next;

    // Only commit React state after the camera has settled. The camera itself
    // is never controlled by this value, so each drag frame cannot snap it back.
    if (moveTimer.current) clearTimeout(moveTimer.current);
    moveTimer.current = setTimeout(() => {
      setCenter(next);
      void resolveAddress(next);
      moveTimer.current = null;
    }, 260);
  }

  function handleMapTap(point?: { latitude?: number; longitude?: number }) {
    if (typeof point?.latitude !== 'number' || typeof point.longitude !== 'number') return;
    if (moveTimer.current) {
      clearTimeout(moveTimer.current);
      moveTimer.current = null;
    }
    const next = { latitude: point.latitude, longitude: point.longitude };
    centerRef.current = next;
    setCenter(next);
    void resolveAddress(next);
  }

  async function confirm() {
    setLoading(true);
    if (moveTimer.current) {
      clearTimeout(moveTimer.current);
      moveTimer.current = null;
    }
    const point = centerRef.current;
    let resolved = '';
    try {
      resolved = addressFrom(await Location.reverseGeocodeAsync(point));
    } catch {
      resolved = '';
    }
    setLoading(false);
    onConfirm({
      address: resolved || `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`,
      latitude: point.latitude,
      longitude: point.longitude,
    });
  }

  const userMarker = userLocation
    ? [
        {
          coordinates: userLocation,
          title: copy.current,
          systemImage: 'location.fill',
          tintColor: '#1677F2',
        },
      ]
    : [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <View style={[styles.header, rtl && styles.rowReverse]}>
          <Pressable onPress={onClose} style={styles.close}>
            <Ionicons name="close" size={21} color={palette.ink} />
          </Pressable>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="h2">{copy.title}</AppText>
            <AppText variant="caption" tone="muted">
              {copy.body}
            </AppText>
          </View>
        </View>

        <View style={styles.mapWrap}>
          {Platform.OS === 'ios' ? (
            <AppleMaps.View
              key={`apple-${mapKey}`}
              style={StyleSheet.absoluteFill}
              cameraPosition={cameraPosition}
              markers={userMarker}
              properties={{ isMyLocationEnabled: Boolean(userLocation), selectionEnabled: true }}
              uiSettings={{ myLocationButtonEnabled: true, compassEnabled: true }}
              onCameraMove={(event) => handleCameraMove(event.coordinates)}
              onMapClick={(event) => handleMapTap(event.coordinates)}
            />
          ) : Platform.OS === 'android' ? (
            <GoogleMaps.View
              key={`google-${mapKey}`}
              style={StyleSheet.absoluteFill}
              cameraPosition={cameraPosition}
              userLocation={
                userLocation
                  ? { coordinates: userLocation, followUserLocation: false }
                  : undefined
              }
              properties={{ isMyLocationEnabled: Boolean(userLocation) }}
              uiSettings={{ myLocationButtonEnabled: true, compassEnabled: true }}
              onCameraMove={(event) => handleCameraMove(event.coordinates)}
              onMapClick={(event) => handleMapTap(event.coordinates)}
            />
          ) : (
            <View style={styles.mapFallback}>
              <AppText variant="body" tone="muted">
                Maps are available on iOS and Android.
              </AppText>
            </View>
          )}

          {/* This pin marks the map centre. The device's blue location dot remains separate. */}
          <View pointerEvents="none" style={styles.pin}>
            <Ionicons name="location" size={35} color={palette.jadeDeep} />
          </View>
          <LinearGradient
            colors={['rgba(243,243,239,0.9)', 'rgba(243,243,239,0)']}
            style={styles.mapTopFade}
            pointerEvents="none"
          />
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={palette.jadeDeep} />
            </View>
          ) : null}
        </View>

        <View style={styles.bottom}>
          <Pressable onPress={() => void locate()} disabled={loading} style={styles.locateButton}>
            <Ionicons name="locate" size={18} color={palette.jadeDeep} />
            <AppText variant="label" style={{ color: palette.jadeDeep }}>
              {copy.current}
            </AppText>
          </Pressable>
          <View style={styles.addressCard}>
            <View style={[styles.addressTop, rtl && styles.rowReverse]}>
              <Ionicons name="location-outline" size={18} color={palette.jadeDeep} />
              <AppText variant="label" style={{ flex: 1 }}>
                {copy.address}
              </AppText>
              {resolving ? <ActivityIndicator size="small" color={palette.jadeDeep} /> : null}
            </View>
            <AppText variant="body" numberOfLines={2}>
              {address || copy.unavailable}
            </AppText>
            {locationAccuracy !== null && userLocation ? (
              <AppText variant="caption" tone="muted">
                {copy.accuracy}: ±{Math.round(locationAccuracy)} {copy.meters}
              </AppText>
            ) : null}
            <AppText variant="caption" tone="muted">
              {copy.coords}: {center.latitude.toFixed(6)}, {center.longitude.toFixed(6)}
            </AppText>
          </View>
          <Pressable
            disabled={loading}
            onPress={() => void confirm()}
            style={[styles.confirm, loading && { opacity: 0.55 }]}
          >
            <AppText variant="bodyStrong" style={{ color: '#FFFFFF' }}>
              {copy.confirm}
            </AppText>
            <Ionicons name={rtl ? 'arrow-back' : 'arrow-forward'} size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.canvas, paddingTop: 58 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  close: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.canvasLift,
    borderWidth: 1,
    borderColor: palette.lineSoft,
  },
  mapWrap: { flex: 1, overflow: 'hidden', backgroundColor: '#E7E9E4' },
  mapFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -17,
    marginTop: -35,
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5,
  },
  mapTopFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 34 },
  loading: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  bottom: {
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 28,
    gap: 11,
    backgroundColor: palette.canvas,
  },
  locateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    alignSelf: 'flex-start',
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(88,116,94,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(88,116,94,0.2)',
  },
  addressCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.lineSoft,
    backgroundColor: palette.canvasLift,
    gap: 7,
  },
  addressTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirm: {
    minHeight: 52,
    borderRadius: 17,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: palette.jadeDeep,
  },
});
