import { useEffect, useMemo, useState } from 'react';
import { SERVICE_CATEGORIES, type ServiceKind } from '@wessali/contracts';
import { DEFAULT_LOCALE, getDirection, type Locale } from '@wessali/i18n';
import { apiRequest, cleanBaseUrl } from './api';
import { copy } from './copy';
import type { Booking, ProviderProfile, Role, Session } from './types';
import { isActive } from './utils';

const DEFAULT_API = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/v1';

function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, '');
}

export function useWessali() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API);
  const [apiInput, setApiInput] = useState(DEFAULT_API);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [selectedService, setSelectedService] = useState<ServiceKind>('freight');
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
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

  const ui = copy[locale];
  const isRtl = getDirection(locale) === 'rtl';
  const isProvider = session?.user.role === 'provider';
  const providerApproved = providerProfile?.status === 'approved';

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
      setError(requestError instanceof Error ? requestError.message : ui.errorGeneric);
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
    if (name.trim().length < 2 || !/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setError(ui.signInRequired);
      return;
    }
    const base = cleanBaseUrl(apiInput);
    setBusy(true);
    setError('');
    try {
      const result = await apiRequest<Session>(base, '/auth/dev-session', undefined, {
        method: 'POST',
        body: JSON.stringify({
          displayName: name.trim(),
          phoneE164: normalizedPhone,
          role,
        }),
      });
      setApiBaseUrl(base);
      setApiInput(base);
      setSession(result);
      setNotice(ui.saved);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (session) {
      try {
        await apiRequest(apiBaseUrl, '/auth/logout', session.accessToken, { method: 'POST' });
      } catch {
        // A local sign-out should succeed even when the API is offline.
      }
    }
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
    if (kind !== 'freight') setDestinationAddress('');
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
      customerNotes: customerNotes.trim() || undefined,
      requestedAt: new Date().toISOString(),
    };
    let payload: Record<string, unknown>;
    if (selectedService === 'freight') {
      payload = {
        ...common,
        destinationAddress: destinationAddress.trim(),
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
      await apiRequest(apiBaseUrl, `/providers/bookings/${id}/advance`, session.accessToken, {
        method: 'POST',
      });
      await refreshData(session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  function toggleProviderService(kind: ServiceKind) {
    setProviderServices((current) =>
      current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind],
    );
  }

  function saveConnection() {
    setApiBaseUrl(cleanBaseUrl(apiInput));
    setApiInput(cleanBaseUrl(apiInput));
    setNotice(ui.connectionSaved);
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
    destinationAddress,
    setDestinationAddress,
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
