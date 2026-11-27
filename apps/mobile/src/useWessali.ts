import { useEffect, useMemo, useRef, useState } from 'react';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { SERVICE_CATEGORIES, type ServiceKind } from '@wessali/contracts';
import { DEFAULT_LOCALE, getDirection, type Locale } from '@wessali/i18n';
import { apiRequest, cleanBaseUrl } from './api';
import { copy } from './copy';
import type { Booking, ProviderProfile, Role, Session } from './types';
import { isActive } from './utils';

const DEFAULT_API = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://wessali-platform.anesteb8.workers.dev/v1';

const STORAGE_KEYS = {
  apiBaseUrl: 'wessali.api-base-url.v1',
  session: 'wessali.session.v1',
  rememberedCustomer: 'wessali.remembered-customer.v1',
} as const;

type RememberedCustomer = { displayName: string; phoneE164: string };

function normalizeApiBase(value: string) {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  const parsed = new URL(withProtocol);
  if (!parsed.hostname || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')) {
    throw new Error('Enter a valid HTTP or HTTPS API address.');
  }
  parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/v1';
  return cleanBaseUrl(parsed.toString());
}

function readStoredJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, '');
}

export function useWessali() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API);
  const [apiInput, setApiInput] = useState(DEFAULT_API);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [role, setRole] = useState<Role>('customer');
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [selectedService, setSelectedService] = useState<ServiceKind>('freight');
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [pickupCoordinates, setPickupCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [loadingRequirements, setLoadingRequirements] = useState('');
  const [weightKg, setWeightKg] = useState('1000');
  const [truckType, setTruckType] = useState('box_truck');
  const [vehicleType, setVehicleType] = useState('car');
  const [issueCategory, setIssueCategory] = useState('mechanical');
  const [needsTowing, setNeedsTowing] = useState(false);
  const [towingDestination, setTowingDestination] = useState('');
  const [quantityLitres, setQuantityLitres] = useState('3000');
  const [intendedUse, setIntendedUse] = useState('residential');
  const [waterCategory, setWaterCategory] = useState('non_potable');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [providerRequests, setProviderRequests] = useState<Booking[]>([]);
  const [providerJobs, setProviderJobs] = useState<Booking[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [providerServices, setProviderServices] = useState<ServiceKind[]>(['freight']);
  const [trackingBookingId, setTrackingBookingId] = useState<string | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const ui = copy[locale];
  const isRtl = getDirection(locale) === 'rtl';
  const isProvider = session?.user.role === 'provider';
  const providerApproved = providerProfile?.status === 'approved';

  useEffect(() => {
    let cancelled = false;

    async function restoreSecureState() {
      let discardStoredSession = false;
      try {
        const [savedApiBase, savedSessionJson, rememberedCustomerJson] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEYS.apiBaseUrl),
          SecureStore.getItemAsync(STORAGE_KEYS.session),
          SecureStore.getItemAsync(STORAGE_KEYS.rememberedCustomer),
        ]);
        if (cancelled) return;

        if (savedApiBase) {
          try {
            const normalized = normalizeApiBase(savedApiBase);
            const hostname = new URL(normalized).hostname.toLowerCase();
            const localHost =
              hostname === 'localhost' ||
              hostname === '127.0.0.1' ||
              hostname.startsWith('192.168.') ||
              hostname.startsWith('10.') ||
              /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
            if (localHost) {
              // Previous releases used the developer PC as the API server.
              // Move those installs to Wessali Cloud and discard the old server's token.
              discardStoredSession = true;
              setApiBaseUrl(DEFAULT_API);
              setApiInput(DEFAULT_API);
              await SecureStore.setItemAsync(STORAGE_KEYS.apiBaseUrl, DEFAULT_API);
              await SecureStore.deleteItemAsync(STORAGE_KEYS.session);
            } else {
              setApiBaseUrl(normalized);
              setApiInput(normalized);
            }
          } catch {
            // Ignore invalid values left by an older app version.
          }
        }

        const rememberedCustomer = readStoredJson<RememberedCustomer>(rememberedCustomerJson);
        if (
          rememberedCustomer &&
          typeof rememberedCustomer.displayName === 'string' &&
          typeof rememberedCustomer.phoneE164 === 'string'
        ) {
          setName(rememberedCustomer.displayName);
          setPhone(rememberedCustomer.phoneE164);
          setRole('customer');
        }

        const storedSession = readStoredJson<Session>(savedSessionJson);
        if (
          !discardStoredSession &&
          storedSession &&
          typeof storedSession.accessToken === 'string' &&
          storedSession.user &&
          typeof storedSession.user.id === 'string' &&
          (storedSession.user.role === 'customer' || storedSession.user.role === 'provider')
        ) {
          const expiresAt = storedSession.expiresAt ? Date.parse(storedSession.expiresAt) : NaN;
          if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
            await SecureStore.deleteItemAsync(STORAGE_KEYS.session);
          } else {
            setSession(storedSession);
            setName(storedSession.user.displayName);
            setPhone(storedSession.user.phoneE164);
            setRole(storedSession.user.role);
          }
        }
      } catch {
        // Keep sign-in available if secure storage cannot be read.
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void restoreSecureState();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4200);
    return () => clearTimeout(timer);
  }, [notice]);

  async function refreshData(currentSession = session, base = apiBaseUrl) {
    if (!currentSession) return;
    setBusy(true);
    setError('');
    try {
      if (currentSession.user.role === 'customer') {
        const list = await apiRequest<Booking[]>(
          base,
          '/bookings/mine',
          currentSession.accessToken,
        );
        setBookings(list);
      } else {
        const profile = await apiRequest<ProviderProfile>(
          base,
          '/providers/me',
          currentSession.accessToken,
        );
        setProviderProfile(profile);
        if (profile.status === 'approved') {
          const [requests, jobs] = await Promise.all([
            apiRequest<Booking[]>(base, '/providers/requests', currentSession.accessToken),
            apiRequest<Booking[]>(base, '/providers/jobs', currentSession.accessToken),
          ]);
          setProviderRequests(requests);
          setProviderJobs(jobs);
        } else {
          setProviderRequests([]);
          setProviderJobs([]);
        }
      }
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : ui.errorGeneric;
      setError(message);
      if (/HTTP 401|unauthorized/i.test(message)) {
        setSession(null);
        setBookings([]);
        setProviderProfile(null);
        setProviderRequests([]);
        setProviderJobs([]);
        void SecureStore.deleteItemAsync(STORAGE_KEYS.session).catch(() => undefined);
      }
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (session) void refreshData(session);
    // Refresh when the signed-in identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  async function signIn() {
    const normalizedPhone = normalizePhone(phone);
    const validPhone = /^\+[1-9]\d{7,14}$/.test(normalizedPhone);
    const validName = name.trim().length >= 2;
    if (!validPhone || (authMode === 'register' && !validName)) {
      setError(authMode === 'register' ? ui.registerRequired : ui.loginRequired);
      return;
    }
    if (password.length < 12 || password.length > 128) {
      setError(ui.passwordPlaceholder);
      return;
    }
    let base: string;
    try {
      base = normalizeApiBase(apiInput);
    } catch {
      setError(ui.connectionHint);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const registering = authMode === 'register';
      const result = await apiRequest<Session>(
        base,
        registering ? '/auth/register' : '/auth/login',
        undefined,
        {
          method: 'POST',
          body: JSON.stringify({
            phoneE164: normalizedPhone,
            password,
            role,
            ...(registering ? { displayName: name.trim(), locale } : {}),
          }),
        },
      );
      setApiBaseUrl(base);
      setApiInput(base);
      await Promise.all(
        [
          SecureStore.setItemAsync(STORAGE_KEYS.apiBaseUrl, base),
          SecureStore.setItemAsync(STORAGE_KEYS.session, JSON.stringify(result)),
          result.user.role === 'customer'
            ? SecureStore.setItemAsync(
                STORAGE_KEYS.rememberedCustomer,
                JSON.stringify({
                  displayName: result.user.displayName,
                  phoneE164: normalizedPhone,
                }),
              )
            : Promise.resolve(),
        ].map((write) => write.catch(() => undefined)),
      );
      setSession(result);
      setName(result.user.displayName);
      setPhone(result.user.phoneE164);
      setRole(result.user.role);
      setPassword('');
      setNotice(registering ? ui.authRegister : ui.saved);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    const activeTrackingId = trackingBookingId;
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setTrackingBookingId(null);
    if (session && activeTrackingId && session.user.role === 'provider') {
      try {
        await apiRequest(
          apiBaseUrl,
          `/providers/bookings/${activeTrackingId}/tracking/stop`,
          session.accessToken,
          { method: 'POST' },
        );
      } catch {
        // The local GPS watch is stopped even if the API is offline.
      }
    }
    if (session) {
      try {
        await apiRequest(apiBaseUrl, '/auth/logout', session.accessToken, { method: 'POST' });
      } catch {
        // A local sign-out should succeed even when the API is offline.
      }
    }
    await SecureStore.deleteItemAsync(STORAGE_KEYS.session).catch(() => undefined);
    setSession(null);
    setBookings([]);
    setProviderProfile(null);
    setProviderRequests([]);
    setProviderJobs([]);
    setError('');
    setNotice('');
  }

  function selectService(kind: ServiceKind) {
    setSelectedService(kind);
    if (kind !== 'freight') {
      setDestinationAddress('');
      setDestinationCoordinates(null);
    }
    if (kind !== 'roadside') {
      setVehicleType('car');
      setIssueCategory('mechanical');
      setNeedsTowing(false);
      setTowingDestination('');
    }
    if (kind !== 'water') {
      setQuantityLitres('3000');
      setIntendedUse('residential');
      setWaterCategory('non_potable');
    }
    setError('');
  }

  function beginBooking(kind: ServiceKind) {
    setSelectedService(kind);
    setPickupAddress('');
    setDestinationAddress('');
    setPickupCoordinates(null);
    setDestinationCoordinates(null);
    setCustomerNotes('');
    setCargoDescription('');
    setLoadingRequirements('');
    setWeightKg('1000');
    setTruckType('box_truck');
    setVehicleType('car');
    setIssueCategory('mechanical');
    setNeedsTowing(false);
    setTowingDestination('');
    setQuantityLitres('3000');
    setIntendedUse('residential');
    setWaterCategory('non_potable');
    setError('');
    setNotice('');
  }

  async function submitBooking() {
    if (!session) return false;
    const weight = Number(weightKg);
    const litres = Number(quantityLitres);
    const invalid =
      pickupAddress.trim().length < 3 ||
      (selectedService === 'freight' &&
        (destinationAddress.trim().length < 3 ||
          cargoDescription.trim().length < 3 ||
          !Number.isFinite(weight) ||
          weight <= 0)) ||
      (selectedService === 'water' && (!Number.isFinite(litres) || litres <= 0));
    if (invalid) {
      setError(ui.invalidRequest);
      return false;
    }

    const common = {
      serviceType: selectedService,
      pickupAddress: pickupAddress.trim(),
      ...(pickupCoordinates
        ? {
            pickupLatitude: pickupCoordinates.latitude,
            pickupLongitude: pickupCoordinates.longitude,
          }
        : {}),
      customerNotes: customerNotes.trim() || undefined,
      requestedAt: new Date().toISOString(),
    };
    let payload: Record<string, unknown>;
    if (selectedService === 'freight') {
      payload = {
        ...common,
        destinationAddress: destinationAddress.trim(),
        ...(destinationCoordinates
          ? {
              destinationLatitude: destinationCoordinates.latitude,
              destinationLongitude: destinationCoordinates.longitude,
            }
          : {}),
        cargoDescription: cargoDescription.trim(),
        weightKg: weight,
        truckType,
        loadingRequirements: loadingRequirements.trim() || undefined,
      };
    } else if (selectedService === 'roadside') {
      payload = {
        ...common,
        vehicleType,
        issueCategory,
        needsTowing,
        towingDestination: needsTowing ? towingDestination.trim() || undefined : undefined,
      };
    } else {
      payload = {
        ...common,
        quantityLitres: litres,
        intendedUse,
        waterCategory,
      };
    }

    setBusy(true);
    setError('');
    try {
      await apiRequest(apiBaseUrl, '/bookings', session.accessToken, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setNotice(ui.requestSent);
      await refreshData(session);
      return true;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.errorGeneric);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function cancelBooking(id: string) {
    if (!session) return;
    setBusy(true);
    setError('');
    try {
      await apiRequest(apiBaseUrl, `/bookings/${id}/cancel`, session.accessToken, {
        method: 'POST',
      });
      setNotice(ui.status.cancelled);
      await refreshData(session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function applyProvider() {
    if (!session || businessName.trim().length < 2 || providerServices.length === 0) {
      setError(ui.businessRequired);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await apiRequest(apiBaseUrl, '/providers/apply', session.accessToken, {
        method: 'POST',
        body: JSON.stringify({
          businessName: businessName.trim(),
          serviceTypes: providerServices,
        }),
      });
      setNotice(ui.pendingTitle);
      await refreshData(session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function acceptRequest(id: string) {
    if (!session) return;
    setBusy(true);
    setError('');
    try {
      await apiRequest(apiBaseUrl, `/providers/bookings/${id}/accept`, session.accessToken, {
        method: 'POST',
      });
      setNotice(ui.saved);
      await refreshData(session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function advanceJob(id: string) {
    if (!session) return;
    setBusy(true);
    setError('');
    try {
      const result = await apiRequest<{ status: string }>(
        apiBaseUrl,
        `/providers/bookings/${id}/advance`,
        session.accessToken,
        { method: 'POST' },
      );
      if (result.status === 'completed' && trackingBookingId === id) {
        locationSubscription.current?.remove();
        locationSubscription.current = null;
        setTrackingBookingId(null);
      }
      await refreshData(session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function startLocationSharing(bookingId: string) {
    if (!session || session.user.role !== 'provider') return;
    if (trackingBookingId === bookingId) return;
    setBusy(true);
    setError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError(ui.locationPermissionDenied);
        return;
      }
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
      if (trackingBookingId) {
        await apiRequest(
          apiBaseUrl,
          `/providers/bookings/${trackingBookingId}/tracking/stop`,
          session.accessToken,
          { method: 'POST' },
        ).catch(() => undefined);
      }
      await apiRequest(
        apiBaseUrl,
        `/providers/bookings/${bookingId}/tracking/start`,
        session.accessToken,
        { method: 'POST' },
      );
      setTrackingBookingId(bookingId);
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 15000,
          distanceInterval: 25,
        },
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          void apiRequest(
            apiBaseUrl,
            `/providers/bookings/${bookingId}/location`,
            session.accessToken,
            {
              method: 'POST',
              body: JSON.stringify({ latitude, longitude, accuracy }),
            },
          ).catch((requestError) => {
            setError(requestError instanceof Error ? requestError.message : ui.errorGeneric);
          });
        },
      );
      setNotice(ui.locationShareStarted);
    } catch (requestError) {
      locationSubscription.current?.remove();
      locationSubscription.current = null;
      await apiRequest(
        apiBaseUrl,
        `/providers/bookings/${bookingId}/tracking/stop`,
        session.accessToken,
        { method: 'POST' },
      ).catch(() => undefined);
      setTrackingBookingId(null);
      setError(requestError instanceof Error ? requestError.message : ui.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function stopLocationSharing() {
    const bookingId = trackingBookingId;
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setTrackingBookingId(null);
    if (session && bookingId) {
      try {
        await apiRequest(
          apiBaseUrl,
          `/providers/bookings/${bookingId}/tracking/stop`,
          session.accessToken,
          { method: 'POST' },
        );
      } catch {
        // The local GPS subscription is stopped even if the API is unavailable.
      }
    }
    setNotice(ui.locationShareStopped);
  }

  function toggleProviderService(kind: ServiceKind) {
    setProviderServices((current) =>
      current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind],
    );
  }

  async function saveConnection() {
    let base: string;
    try {
      base = normalizeApiBase(apiInput);
    } catch {
      setError(ui.connectionHint);
      return;
    }

    setBusy(true);
    setError('');
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.apiBaseUrl, base);
      if (session && base !== apiBaseUrl) {
        // A token is valid only on the API that issued it.
        void apiRequest(apiBaseUrl, '/auth/logout', session.accessToken, { method: 'POST' }).catch(
          () => undefined,
        );
        await SecureStore.deleteItemAsync(STORAGE_KEYS.session).catch(() => undefined);
        setSession(null);
        setBookings([]);
        setProviderProfile(null);
        setProviderRequests([]);
        setProviderJobs([]);
      }
      setApiBaseUrl(base);
      setApiInput(base);
      setNotice(ui.connectionSaved);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  const selectedServiceCopy = useMemo(
    () => SERVICE_CATEGORIES.find((service) => service.id === selectedService),
    [selectedService],
  );

  const activeBookings = useMemo(
    () => bookings.filter((item) => isActive(item.status)),
    [bookings],
  );
  const activeBooking = activeBookings[0] ?? null;

  return {
    ready,
    locale,
    setLocale,
    isRtl,
    ui,
    apiBaseUrl,
    apiInput,
    setApiInput,
    saveConnection,
    name,
    setName,
    phone,
    setPhone,
    password,
    setPassword,
    authMode,
    setAuthMode,
    role,
    setRole,
    session,
    isProvider,
    providerApproved,
    busy,
    error,
    notice,
    setError,
    setNotice,
    bookings,
    activeBookings,
    activeBooking,
    providerProfile,
    providerRequests,
    providerJobs,
    trackingBookingId,
    startLocationSharing,
    stopLocationSharing,
    businessName,
    setBusinessName,
    providerServices,
    toggleProviderService,
    selectedService,
    selectService,
    beginBooking,
    selectedServiceCopy,
    pickupAddress,
    setPickupAddress,
    pickupCoordinates,
    setPickupCoordinates,
    destinationAddress,
    setDestinationAddress,
    destinationCoordinates,
    setDestinationCoordinates,
    customerNotes,
    setCustomerNotes,
    cargoDescription,
    setCargoDescription,
    loadingRequirements,
    setLoadingRequirements,
    weightKg,
    setWeightKg,
    truckType,
    setTruckType,
    vehicleType,
    setVehicleType,
    issueCategory,
    setIssueCategory,
    needsTowing,
    setNeedsTowing,
    towingDestination,
    setTowingDestination,
    quantityLitres,
    setQuantityLitres,
    intendedUse,
    setIntendedUse,
    waterCategory,
    setWaterCategory,
    refreshData,
    signIn,
    signOut,
    submitBooking,
    cancelBooking,
    applyProvider,
    acceptRequest,
    advanceJob,
  };
}

export type WessaliApp = ReturnType<typeof useWessali>;
