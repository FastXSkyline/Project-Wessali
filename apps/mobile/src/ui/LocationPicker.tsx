import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '../theme';
import { AppText } from './base';

export type PickedLocation = { address: string; latitude: number; longitude: number };
type Props = {
  visible: boolean;
  locale: string;
  onClose: () => void;
  onConfirm: (location: PickedLocation) => void;
};
const DEFAULT_CENTER = { latitude: 36.7538, longitude: 3.0588 };
function addressFrom(parts: Location.LocationGeocodedAddress[]) {
  const item = parts[0];
  if (!item) return '';
  return [item.name, item.street, item.district, item.city, item.region, item.country]
    .filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index)
    .join(', ');
}
export function LocationPicker({ visible, locale, onClose, onConfirm }: Props) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const rtl = locale === 'ar';
  const copy = {
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
    permission:
      locale === 'ar'
        ? 'يلزم السماح بالوصول إلى الموقع لاستخدام موقعك الحالي.'
        : locale === 'fr'
          ? 'Autorisez la localisation pour utiliser votre position actuelle.'
          : 'Allow location access to use your current position.',
    unavailable:
      locale === 'ar'
        ? 'تعذر تحديد العنوان. سيتم حفظ الإحداثيات ويمكن تعديل العنوان يدوياً.'
        : locale === 'fr'
          ? 'Adresse introuvable. Les coordonnées seront conservées.'
          : 'Address unavailable. Coordinates will still be saved; you can edit the address manually.',
  };
  useEffect(() => {
    if (visible) {
      setAddress('');
      void locate();
    }
  }, [visible]);
  async function resolveAddress(point: { latitude: number; longitude: number }) {
    setResolving(true);
    try {
      setAddress(addressFrom(await Location.reverseGeocodeAsync(point)));
    } catch {
      setAddress('');
    } finally {
      setResolving(false);
    }
  }
  async function locate() {
    setLoading(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(copy.title, copy.permission);
        return;
      }
      const result = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const point = { latitude: result.coords.latitude, longitude: result.coords.longitude };
      setCenter(point);
      setMapKey((current) => current + 1);
      await resolveAddress(point);
    } catch {
      Alert.alert(copy.title, copy.permission);
    } finally {
      setLoading(false);
    }
  }
  function updateCenter(point: { latitude?: number; longitude?: number }) {
    if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') return;
    setCenter({ latitude: point.latitude, longitude: point.longitude });
    setAddress('');
  }
  async function confirm() {
    setLoading(true);
    const point = center;
    let resolved = address;
    if (!resolved) {
      try {
        resolved = addressFrom(await Location.reverseGeocodeAsync(point));
      } catch {
        resolved = '';
      }
    }
    setLoading(false);
    onConfirm({
      address: resolved || `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`,
      latitude: point.latitude,
      longitude: point.longitude,
    });
  }
  const cameraPosition = { coordinates: center, zoom: 16 };
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
              markers={[
                {
                  coordinates: center,
                  title: 'Selected location',
                  tintColor: palette.jadeDeep,
                  systemImage: 'mappin.and.ellipse',
                },
              ]}
              properties={{ isMyLocationEnabled: true, selectionEnabled: true }}
              uiSettings={{ myLocationButtonEnabled: true, compassEnabled: true }}
              onCameraMove={(event) => updateCenter(event.coordinates)}
              onMapClick={(event) => updateCenter(event.coordinates)}
            />
          ) : Platform.OS === 'android' ? (
            <GoogleMaps.View
              key={`google-${mapKey}`}
              style={StyleSheet.absoluteFill}
              cameraPosition={cameraPosition}
              markers={[{ coordinates: center, title: 'Selected location', draggable: true }]}
              properties={{ isMyLocationEnabled: true }}
              uiSettings={{ myLocationButtonEnabled: true, compassEnabled: true }}
              onCameraMove={(event) => updateCenter(event.coordinates)}
              onMapClick={(event) => updateCenter(event.coordinates)}
            />
          ) : (
            <View style={styles.mapFallback}>
              <AppText variant="body" tone="muted">
                Maps are available on iOS and Android.
              </AppText>
            </View>
          )}
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
          <Pressable onPress={() => void locate()} style={styles.locateButton}>
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
