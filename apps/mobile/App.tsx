import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SERVICE_CATEGORIES, type ServiceKind } from '@wessali/contracts';
import { brandColors, radii, spacing } from '@wessali/design-tokens';
import { DEFAULT_LOCALE, getDirection, getMessages, type Locale } from '@wessali/i18n';

type Role = 'customer' | 'provider';
type Session = {
  accessToken: string;
  user: { id: string; displayName: string; phoneE164: string; role: Role };
};
type ProviderProfile = {
  status: string;
  business_name?: string;
  services?: Array<{ serviceType: ServiceKind; approved: boolean }>;
};
type Booking = {
  id: string;
  public_reference: string;
  service_type: ServiceKind;
  status: string;
  pickup_address: string;
  destination_address?: string | null;
  customer_notes?: string | null;
  provider_name?: string | null;
  freight?: Record<string, unknown> | null;
  roadside?: Record<string, unknown> | null;
  water?: Record<string, unknown> | null;
};

const words = {
  ar: {
    signIn: 'الدخول التجريبي',
    name: 'الاسم الكامل',
    phone: 'رقم الهاتف الدولي (+213...)',
    customer: 'زبون',
    provider: 'مقدم خدمة',
    api: 'عنوان API (عنوان IP للحاسوب)',
    connect: 'دخول',
    signOut: 'تسجيل الخروج',
    home: 'الخدمات',
    history: 'طلباتي',
    refresh: 'تحديث',
    choose: 'اختر الخدمة',
    create: 'إرسال الطلب',
    cancel: 'إلغاء',
    pickup: 'عنوان الاستلام / الموقع',
    destination: 'عنوان الوجهة',
    notes: 'ملاحظات إضافية',
    cargo: 'وصف البضاعة',
    weight: 'الوزن التقريبي بالكيلوغرام',
    truckType: 'نوع الشاحنة',
    vehicle: 'نوع المركبة',
    issue: 'نوع العطل',
    towing: 'أحتاج إلى سحب المركبة',
    towingDestination: 'وجهة السحب',
    quantity: 'الكمية باللتر',
    intendedUse: 'الاستخدام',
    waterCategory: 'نوع المياه المطلوب',
    waterDisclaimer:
      'تصنيف المياه هو تصريح من مقدم الخدمة وليس شهادة صلاحية للشرب. تحقق من المصدر قبل الاستلام.',
    residential: 'منزلي',
    agricultural: 'فلاحي',
    other: 'أخرى',
    potable: 'مصرح بأنها صالحة للشرب',
    nonPotable: 'غير صالحة للشرب',
    irrigation: 'للري',
    mechanical: 'ميكانيكي',
    tyre: 'عجلة',
    battery: 'بطارية',
    fuel: 'وقود',
    vehicleTowing: 'سحب',
    car: 'سيارة',
    motorcycle: 'دراجة نارية',
    van: 'شاحنة صغيرة',
    truckVehicle: 'شاحنة',
    pickupTruck: 'بيك أب',
    flatbed: 'سطحة',
    boxTruck: 'شاحنة مغلقة',
    semi: 'مقطورة',
    loadingRequirements: 'متطلبات التحميل',
    apply: 'إرسال طلب الانضمام',
    business: 'اسم النشاط',
    services: 'الخدمات التي تقدمها',
    pending: 'طلبك قيد مراجعة الإدارة',
    approved: 'تم اعتماد حسابك',
    notApplied: 'قدّم طلب مقدم خدمة للبدء',
    available: 'الطلبات المتاحة',
    jobs: 'مهامي الحالية',
    accept: 'قبول الطلب',
    advance: 'تحديث حالة المهمة',
    empty: 'لا توجد طلبات حالياً',
    status: 'الحالة',
    submitted: 'تم إرسال الطلب',
    matching: 'جارٍ البحث عن مقدم خدمة',
    offer_received: 'وصل عرض',
    accepted: 'تم قبول الطلب',
    provider_en_route: 'المقدم في الطريق',
    arrived: 'وصل مقدم الخدمة',
    in_progress: 'الخدمة قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    expired: 'منتهي',
    disputed: 'قيد النزاع',
    error: 'حدث خطأ',
    saved: 'تم بنجاح',
    safety: 'في حالة عطل على الطريق، انتقل إلى مكان آمن إن أمكن. وصلي لا يحل محل خدمات الطوارئ.',
    working: 'جارٍ التنفيذ...',
    loginRequired: 'أدخل الاسم ورقم الهاتف الصحيح للمتابعة.',
    details: 'تفاصيل الطلب',
    waterInfo: 'لا يتم تأكيد صلاحية المياه للشرب من خلال التطبيق.',
    freightShort: 'نقل بين الولايات والوجهات',
    roadsideShort: 'مساعدة ميكانيكية وسحب',
    waterShort: 'توصيل صهاريج للمنازل والفلاحة',
  },
  fr: {
    signIn: 'Connexion de démonstration',
    name: 'Nom complet',
    phone: 'Téléphone international (+213...)',
    customer: 'Client',
    provider: 'Prestataire',
    api: 'URL API (adresse IP du PC)',
    connect: 'Se connecter',
    signOut: 'Déconnexion',
    home: 'Services',
    history: 'Mes demandes',
    refresh: 'Actualiser',
    choose: 'Choisir un service',
    create: 'Envoyer la demande',
    cancel: 'Annuler',
    pickup: 'Adresse de prise en charge / lieu',
    destination: 'Adresse de destination',
    notes: 'Notes supplémentaires',
    cargo: 'Description du chargement',
    weight: 'Poids estimé en kg',
    truckType: 'Type de camion',
    vehicle: 'Type de véhicule',
    issue: 'Type de panne',
    towing: 'J’ai besoin d’un remorquage',
    towingDestination: 'Destination du remorquage',
    quantity: 'Quantité en litres',
    intendedUse: 'Utilisation',
    waterCategory: 'Catégorie d’eau',
    waterDisclaimer:
      'La catégorie est déclarée par le prestataire et ne constitue pas une certification de potabilité. Vérifiez la source avant livraison.',
    residential: 'Résidentiel',
    agricultural: 'Agricole',
    other: 'Autre',
    potable: 'Déclarée potable',
    nonPotable: 'Non potable',
    irrigation: 'Irrigation',
    mechanical: 'Mécanique',
    tyre: 'Pneu',
    battery: 'Batterie',
    fuel: 'Carburant',
    vehicleTowing: 'Remorquage',
    car: 'Voiture',
    motorcycle: 'Moto',
    van: 'Fourgon',
    truckVehicle: 'Camion',
    pickupTruck: 'Pickup',
    flatbed: 'Plateau',
    boxTruck: 'Fourgon fermé',
    semi: 'Semi-remorque',
    loadingRequirements: 'Exigences de chargement',
    apply: 'Envoyer la candidature',
    business: 'Nom de l’activité',
    services: 'Services proposés',
    pending: 'Votre candidature est en cours de vérification',
    approved: 'Votre compte est approuvé',
    notApplied: 'Déposez une candidature prestataire pour commencer',
    available: 'Demandes disponibles',
    jobs: 'Mes missions',
    accept: 'Accepter la demande',
    advance: 'Mettre à jour le statut',
    empty: 'Aucune demande pour le moment',
    status: 'Statut',
    submitted: 'Demande envoyée',
    matching: 'Recherche d’un prestataire',
    offer_received: 'Offre reçue',
    accepted: 'Demande acceptée',
    provider_en_route: 'Prestataire en route',
    arrived: 'Prestataire arrivé',
    in_progress: 'Service en cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
    expired: 'Expiré',
    disputed: 'En litige',
    error: 'Une erreur est survenue',
    saved: 'Enregistré',
    safety:
      'En cas de panne, rejoignez un endroit sûr si possible. Wessali ne remplace pas les services d’urgence.',
    working: 'En cours...',
    loginRequired: 'Saisissez un nom et un numéro de téléphone valides.',
    details: 'Détails de la demande',
    waterInfo: 'L’application ne certifie pas la potabilité de l’eau.',
    freightShort: 'Transport entre villes et destinations',
    roadsideShort: 'Assistance mécanique et remorquage',
    waterShort: 'Livraison par citerne pour maison et ferme',
  },
  en: {
    signIn: 'Demo sign in',
    name: 'Full name',
    phone: 'International phone (+213...)',
    customer: 'Customer',
    provider: 'Provider',
    api: 'API URL (PC IP address)',
    connect: 'Continue',
    signOut: 'Sign out',
    home: 'Services',
    history: 'My requests',
    refresh: 'Refresh',
    choose: 'Choose a service',
    create: 'Submit request',
    cancel: 'Cancel',
    pickup: 'Pickup address / location',
    destination: 'Destination address',
    notes: 'Additional notes',
    cargo: 'Cargo description',
    weight: 'Estimated weight in kg',
    truckType: 'Truck type',
    vehicle: 'Vehicle type',
    issue: 'Issue category',
    towing: 'I need towing',
    towingDestination: 'Towing destination',
    quantity: 'Quantity in litres',
    intendedUse: 'Intended use',
    waterCategory: 'Water category',
    waterDisclaimer:
      'This category is declared by the provider, not a drinking-water certification. Verify the source before delivery.',
    residential: 'Residential',
    agricultural: 'Agricultural',
    other: 'Other',
    potable: 'Provider-declared potable',
    nonPotable: 'Non-potable',
    irrigation: 'Irrigation',
    mechanical: 'Mechanical',
    tyre: 'Tyre',
    battery: 'Battery',
    fuel: 'Fuel',
    vehicleTowing: 'Towing',
    car: 'Car',
    motorcycle: 'Motorcycle',
    van: 'Van',
    truckVehicle: 'Truck',
    pickupTruck: 'Pickup',
    flatbed: 'Flatbed',
    boxTruck: 'Box truck',
    semi: 'Semi-trailer',
    loadingRequirements: 'Loading requirements',
    apply: 'Submit provider application',
    business: 'Business name',
    services: 'Services you provide',
    pending: 'Your application is awaiting admin review',
    approved: 'Your account is approved',
    notApplied: 'Apply as a provider to get started',
    available: 'Available requests',
    jobs: 'My active jobs',
    accept: 'Accept request',
    advance: 'Advance job status',
    empty: 'No requests right now',
    status: 'Status',
    submitted: 'Request submitted',
    matching: 'Finding a provider',
    offer_received: 'Offer received',
    accepted: 'Request accepted',
    provider_en_route: 'Provider en route',
    arrived: 'Provider arrived',
    in_progress: 'Service in progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    expired: 'Expired',
    disputed: 'Disputed',
    error: 'Something went wrong',
    saved: 'Saved',
    safety:
      'For roadside breakdowns, move to a safe place if possible. Wessali does not replace emergency services.',
    working: 'Working...',
    loginRequired: 'Enter a valid name and phone number to continue.',
    details: 'Request details',
    waterInfo: 'The app does not certify water as safe to drink.',
    freightShort: 'Freight between cities and destinations',
    roadsideShort: 'Mechanical help and towing',
    waterShort: 'Water tankers for homes and farms',
  },
} as const;

const serviceShort: Record<Locale, Record<ServiceKind, string>> = {
  ar: {
    freight: words.ar.freightShort,
    roadside: words.ar.roadsideShort,
    water: words.ar.waterShort,
  },
  fr: {
    freight: words.fr.freightShort,
    roadside: words.fr.roadsideShort,
    water: words.fr.waterShort,
  },
  en: {
    freight: words.en.freightShort,
    roadside: words.en.roadsideShort,
    water: words.en.waterShort,
  },
};

function cleanBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

async function apiRequest<T>(
  baseUrl: string,
  path: string,
  token?: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${cleanBaseUrl(baseUrl)}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const record = data as { message?: string } | null;
    throw new Error(record?.message ?? `HTTP ${response.status}`);
  }
  return data as T;
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [apiBaseUrl, setApiBaseUrl] = useState(
    process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/v1',
  );
  const [apiInput, setApiInput] = useState(apiBaseUrl);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [screen, setScreen] = useState<'home' | 'booking' | 'history'>('home');
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

  const copy = getMessages(locale);
  const ui = words[locale];
  const isRtl = getDirection(locale) === 'rtl';

  const directionStyle = isRtl ? styles.textRtl : styles.textLtr;
  const rowStyle = isRtl ? styles.rowReverse : undefined;

  const statusLabel = (status: string) => {
    const labels = ui as Record<string, string>;
    return labels[status] ?? status.replaceAll('_', ' ');
  };

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
      setError(requestError instanceof Error ? requestError.message : ui.error);
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
    if (name.trim().length < 2 || !/^\+[1-9]\d{7,14}$/.test(phone.trim())) {
      setError(ui.loginRequired);
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
          phoneE164: phone.trim(),
          role,
        }),
      });
      setApiBaseUrl(base);
      setSession(result);
      setNotice(ui.saved);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.error);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (session) {
      try {
        await apiRequest(apiBaseUrl, '/auth/logout', session.accessToken, { method: 'POST' });
      } catch {
        // Local session is cleared even if the API is unavailable.
      }
    }
    setSession(null);
    setBookings([]);
    setProviderProfile(null);
    setProviderRequests([]);
    setProviderJobs([]);
    setScreen('home');
  }

  function beginBooking(kind: ServiceKind) {
    setSelectedService(kind);
    setPickupAddress('');
    setDestinationAddress('');
    setCustomerNotes('');
    setCargoDescription('');
    setLoadingRequirements('');
    setLoadingRequirements('');
    setNeedsTowing(false);
    setError('');
    setNotice('');
    setScreen('booking');
  }

  async function submitBooking() {
    if (!session || pickupAddress.trim().length < 3) {
      setError(ui.loginRequired);
      return;
    }
    const common = {
      serviceType: selectedService,
      pickupAddress: pickupAddress.trim(),
      customerNotes: customerNotes.trim() || undefined,
      requestedAt: new Date().toISOString(),
    };
    let payload: Record<string, unknown>;
    if (selectedService === 'freight') {
      if (destinationAddress.trim().length < 3 || cargoDescription.trim().length < 3) {
        setError(ui.error);
        return;
      }
      payload = {
        ...common,
        destinationAddress: destinationAddress.trim(),
        cargoDescription: cargoDescription.trim(),
        weightKg: Number(weightKg),
        truckType,
        loadingRequirements: loadingRequirements.trim() || undefined,
      };
    } else if (selectedService === 'roadside') {
      payload = {
        ...common,
        vehicleType,
        issueCategory,
        needsTowing,
        towingDestination: needsTowing ? towingDestination.trim() : undefined,
      };
    } else {
      payload = {
        ...common,
        quantityLitres: Number(quantityLitres),
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
      setNotice(ui.submitted);
      setScreen('history');
      await refreshData(session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.error);
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
      setNotice(ui.cancelled);
      await refreshData(session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.error);
    } finally {
      setBusy(false);
    }
  }

  async function applyProvider() {
    if (!session || businessName.trim().length < 2 || providerServices.length === 0) {
      setError(ui.error);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await apiRequest(apiBaseUrl, '/providers/apply', session.accessToken, {
        method: 'POST',
        body: JSON.stringify({ businessName: businessName.trim(), serviceTypes: providerServices }),
      });
      setNotice(ui.pending);
      await refreshData(session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.error);
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
      setNotice(ui.accept);
      await refreshData(session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ui.error);
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
      setError(requestError instanceof Error ? requestError.message : ui.error);
    } finally {
      setBusy(false);
    }
  }

  function toggleProviderService(kind: ServiceKind) {
    setProviderServices((current) =>
      current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind],
    );
  }

  const selectedServiceCopy = useMemo(
    () => SERVICE_CATEGORIES.find((service) => service.id === selectedService),
    [selectedService],
  );

  const renderBookingCard = (booking: Booking, providerMode = false) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={[styles.bookingTop, rowStyle]}>
        <Text style={styles.reference}>{booking.public_reference}</Text>
        <Text style={styles.statusPill}>{statusLabel(booking.status)}</Text>
      </View>
      <Text style={[styles.bookingService, directionStyle]}>
        {SERVICE_CATEGORIES.find((item) => item.id === booking.service_type)?.labels[locale]}
      </Text>
      <Text style={[styles.bodyText, directionStyle]}>{booking.pickup_address}</Text>
      {booking.destination_address ? (
        <Text style={[styles.bodyText, directionStyle]}>→ {booking.destination_address}</Text>
      ) : null}
      {booking.provider_name ? (
        <Text style={[styles.mutedText, directionStyle]}>{booking.provider_name}</Text>
      ) : null}
      {providerMode ? (
        <Pressable
          style={styles.primaryButton}
          onPress={() => void acceptRequest(booking.id)}
          disabled={busy}
        >
          <Text style={styles.primaryButtonText}>{ui.accept}</Text>
        </Pressable>
      ) : ['submitted', 'matching', 'offer_received'].includes(booking.status) ? (
        <Pressable
          style={styles.secondaryButton}
          onPress={() => void cancelBooking(booking.id)}
          disabled={busy}
        >
          <Text style={styles.secondaryButtonText}>{ui.cancel}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  const renderField = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    placeholder?: string,
    keyboardType: 'default' | 'numeric' = 'default',
    multiline = false,
  ) => (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, directionStyle]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#9AA1AD"
        keyboardType={keyboardType}
        multiline={multiline}
        textAlign={isRtl ? 'right' : 'left'}
        style={[styles.input, multiline && styles.multilineInput, isRtl && styles.inputRtl]}
      />
    </View>
  );

  const renderChoice = (
    label: string,
    options: Array<{ label: string; value: string }>,
    value: string,
    onChange: (value: string) => void,
  ) => (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, directionStyle]}>{label}</Text>
      <View style={styles.choiceWrap}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.choice, value === option.value && styles.choiceActive]}
          >
            <Text style={[styles.choiceText, value === option.value && styles.choiceTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.loginContent} keyboardShouldPersistTaps="handled">
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>W</Text>
          </View>
          <Text style={styles.loginTitle}>Wessali</Text>
          <Text style={[styles.loginSubtitle, directionStyle]}>{ui.signIn}</Text>
          {renderField(ui.name, name, setName)}
          {renderField(ui.phone, phone, setPhone, '+213555123456', 'default')}
          {renderField(ui.api, apiInput, setApiInput, 'http://192.168.1.20:4000/v1')}
          <View style={styles.choiceWrap}>
            <Pressable
              onPress={() => setRole('customer')}
              style={[styles.choice, role === 'customer' && styles.choiceActive]}
            >
              <Text style={[styles.choiceText, role === 'customer' && styles.choiceTextActive]}>
                {ui.customer}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setRole('provider')}
              style={[styles.choice, role === 'provider' && styles.choiceActive]}
            >
              <Text style={[styles.choiceText, role === 'provider' && styles.choiceTextActive]}>
                {ui.provider}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.demoNotice}>Development demo access. Not phone verification.</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable style={styles.primaryButton} onPress={() => void signIn()} disabled={busy}>
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>{ui.connect}</Text>
            )}
          </Pressable>
          <View style={styles.languageSwitch}>
            {(['ar', 'fr', 'en'] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => setLocale(item)}
                style={[styles.languageButton, locale === item && styles.languageButtonActive]}
              >
                <Text style={[styles.languageText, locale === item && styles.languageTextActive]}>
                  {item.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.topBar, rowStyle]}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>W</Text>
          </View>
          <View style={styles.brandText}>
            <Text style={styles.brandName}>Wessali</Text>
            <Text style={styles.tagline}>{session.user.displayName}</Text>
          </View>
          <Pressable onPress={() => void signOut()} style={styles.logoutButton}>
            <Text style={styles.logoutText}>{ui.signOut}</Text>
          </Pressable>
        </View>
        <View style={[styles.languageSwitch, { alignSelf: isRtl ? 'flex-end' : 'flex-start' }]}>
          {(['ar', 'fr', 'en'] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setLocale(item)}
              style={[styles.languageButton, locale === item && styles.languageButtonActive]}
            >
              <Text style={[styles.languageText, locale === item && styles.languageTextActive]}>
                {item.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        {session.user.role === 'customer' ? (
          <>
            <View style={styles.hero}>
              <Text style={[styles.eyebrow, directionStyle]}>WESSALI · ALGERIA</Text>
              <Text style={[styles.title, directionStyle]}>{copy.welcome}</Text>
              <Text style={[styles.subtitle, directionStyle]}>{copy.chooseService}</Text>
            </View>
            <View style={[styles.navTabs, rowStyle]}>
              <Pressable
                onPress={() => setScreen('home')}
                style={[styles.navTab, screen === 'home' && styles.navTabActive]}
              >
                <Text style={[styles.navTabText, screen === 'home' && styles.navTabTextActive]}>
                  {ui.home}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setScreen('history');
                  void refreshData();
                }}
                style={[styles.navTab, screen === 'history' && styles.navTabActive]}
              >
                <Text style={[styles.navTabText, screen === 'history' && styles.navTabTextActive]}>
                  {ui.history}
                </Text>
              </Pressable>
            </View>

            {screen === 'home' ? (
              <View style={styles.services}>
                {SERVICE_CATEGORIES.map((service) => (
                  <Pressable
                    key={service.id}
                    onPress={() => beginBooking(service.id)}
                    style={styles.serviceCard}
                  >
                    <View style={[styles.serviceHeader, rowStyle]}>
                      <Text style={styles.serviceCode}>{service.code}</Text>
                      <Text style={styles.serviceArrow}>{isRtl ? '←' : '→'}</Text>
                    </View>
                    <Text style={[styles.serviceTitle, directionStyle]}>
                      {service.labels[locale]}
                    </Text>
                    <Text style={[styles.serviceDescription, directionStyle]}>
                      {serviceShort[locale][service.id]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : screen === 'booking' ? (
              <View style={styles.formCard}>
                <Text style={[styles.sectionTitle, directionStyle]}>
                  {selectedServiceCopy?.labels[locale]}
                </Text>
                {renderField(
                  ui.pickup,
                  pickupAddress,
                  setPickupAddress,
                  undefined,
                  'default',
                  true,
                )}
                {selectedService === 'freight' ? (
                  <>
                    {renderField(
                      ui.destination,
                      destinationAddress,
                      setDestinationAddress,
                      undefined,
                      'default',
                      true,
                    )}
                    {renderField(
                      ui.cargo,
                      cargoDescription,
                      setCargoDescription,
                      undefined,
                      'default',
                      true,
                    )}
                    {renderField(ui.weight, weightKg, setWeightKg, '1000', 'numeric')}
                    {renderChoice(
                      ui.truckType,
                      [
                        { label: ui.pickupTruck, value: 'pickup' },
                        { label: ui.van, value: 'van' },
                        { label: ui.flatbed, value: 'flatbed' },
                        { label: ui.boxTruck, value: 'box_truck' },
                        { label: ui.semi, value: 'semi_trailer' },
                      ],
                      truckType,
                      setTruckType,
                    )}
                    {renderField(
                      ui.loadingRequirements,
                      loadingRequirements,
                      setLoadingRequirements,
                      undefined,
                      'default',
                      true,
                    )}
                  </>
                ) : null}
                {selectedService === 'roadside' ? (
                  <>
                    {renderChoice(
                      ui.vehicle,
                      [
                        { label: ui.car, value: 'car' },
                        { label: ui.motorcycle, value: 'motorcycle' },
                        { label: ui.van, value: 'van' },
                        { label: ui.truckVehicle, value: 'truck' },
                      ],
                      vehicleType,
                      setVehicleType,
                    )}
                    {renderChoice(
                      ui.issue,
                      [
                        { label: ui.mechanical, value: 'mechanical' },
                        { label: ui.tyre, value: 'tyre' },
                        { label: ui.battery, value: 'battery' },
                        { label: ui.fuel, value: 'fuel' },
                        { label: ui.vehicleTowing, value: 'towing' },
                      ],
                      issueCategory,
                      setIssueCategory,
                    )}
                    <View style={[styles.switchRow, rowStyle]}>
                      <Text style={[styles.fieldLabel, directionStyle]}>{ui.towing}</Text>
                      <Switch
                        value={needsTowing}
                        onValueChange={setNeedsTowing}
                        trackColor={{ true: brandColors.primary }}
                      />
                    </View>
                    {needsTowing
                      ? renderField(ui.towingDestination, towingDestination, setTowingDestination)
                      : null}
                    <Text style={[styles.infoText, directionStyle]}>{ui.safety}</Text>
                  </>
                ) : null}
                {selectedService === 'water' ? (
                  <>
                    {renderField(ui.quantity, quantityLitres, setQuantityLitres, '3000', 'numeric')}
                    {renderChoice(
                      ui.intendedUse,
                      [
                        { label: ui.residential, value: 'residential' },
                        { label: ui.agricultural, value: 'agricultural' },
                        { label: ui.other, value: 'other' },
                      ],
                      intendedUse,
                      setIntendedUse,
                    )}
                    {renderChoice(
                      ui.waterCategory,
                      [
                        { label: ui.potable, value: 'potable' },
                        { label: ui.nonPotable, value: 'non_potable' },
                        { label: ui.irrigation, value: 'irrigation' },
                      ],
                      waterCategory,
                      setWaterCategory,
                    )}
                    <Text style={[styles.infoText, directionStyle]}>{ui.waterDisclaimer}</Text>
                  </>
                ) : null}
                {renderField(ui.notes, customerNotes, setCustomerNotes, undefined, 'default', true)}
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => void submitBooking()}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>{ui.create}</Text>
                  )}
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => setScreen('home')}>
                  <Text style={styles.secondaryButtonText}>{ui.cancel}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.section}>
                <View style={[styles.sectionHeader, rowStyle]}>
                  <Text style={[styles.sectionTitle, directionStyle]}>{ui.history}</Text>
                  <Pressable onPress={() => void refreshData()}>
                    <Text style={styles.linkText}>{ui.refresh}</Text>
                  </Pressable>
                </View>
                {bookings.length ? (
                  bookings.map((booking) => renderBookingCard(booking))
                ) : (
                  <Text style={[styles.emptyText, directionStyle]}>{ui.empty}</Text>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, rowStyle]}>
              <Text style={[styles.sectionTitle, directionStyle]}>{ui.provider}</Text>
              <Pressable onPress={() => void refreshData()}>
                <Text style={styles.linkText}>{ui.refresh}</Text>
              </Pressable>
            </View>
            {!providerProfile || providerProfile.status === 'not_applied' ? (
              <View style={styles.formCard}>
                <Text style={[styles.subtitle, directionStyle]}>{ui.notApplied}</Text>
                {renderField(ui.business, businessName, setBusinessName)}
                <Text style={[styles.fieldLabel, directionStyle]}>{ui.services}</Text>
                {SERVICE_CATEGORIES.map((service) => (
                  <View key={service.id} style={[styles.switchRow, rowStyle]}>
                    <Text style={[styles.bodyText, directionStyle]}>{service.labels[locale]}</Text>
                    <Switch
                      value={providerServices.includes(service.id)}
                      onValueChange={() => toggleProviderService(service.id)}
                      trackColor={{ true: brandColors.primary }}
                    />
                  </View>
                ))}
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => void applyProvider()}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>{ui.apply}</Text>
                  )}
                </Pressable>
              </View>
            ) : providerProfile.status !== 'approved' ? (
              <View style={styles.formCard}>
                <Text style={[styles.sectionTitle, directionStyle]}>{ui.pending}</Text>
                <Text style={[styles.mutedText, directionStyle]}>
                  {providerProfile.business_name}
                </Text>
                <Text style={[styles.infoText, directionStyle]}>{ui.pending}</Text>
              </View>
            ) : (
              <>
                <View style={styles.formCard}>
                  <Text style={[styles.sectionTitle, directionStyle]}>{ui.approved}</Text>
                </View>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, directionStyle]}>{ui.jobs}</Text>
                  {providerJobs.length ? (
                    providerJobs.map((job) => (
                      <View key={job.id} style={styles.bookingCard}>
                        <View style={[styles.bookingTop, rowStyle]}>
                          <Text style={styles.reference}>{job.public_reference}</Text>
                          <Text style={styles.statusPill}>{statusLabel(job.status)}</Text>
                        </View>
                        <Text style={[styles.bodyText, directionStyle]}>{job.pickup_address}</Text>
                        {job.destination_address ? (
                          <Text style={[styles.bodyText, directionStyle]}>
                            {job.destination_address}
                          </Text>
                        ) : null}
                        {job.status !== 'completed' ? (
                          <Pressable
                            style={styles.primaryButton}
                            onPress={() => void advanceJob(job.id)}
                            disabled={busy}
                          >
                            <Text style={styles.primaryButtonText}>{ui.advance}</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    ))
                  ) : (
                    <Text style={[styles.emptyText, directionStyle]}>{ui.empty}</Text>
                  )}
                </View>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, directionStyle]}>{ui.available}</Text>
                  {providerRequests.length ? (
                    providerRequests.map((booking) => renderBookingCard(booking, true))
                  ) : (
                    <Text style={[styles.emptyText, directionStyle]}>{ui.empty}</Text>
                  )}
                </View>
              </>
            )}
          </View>
        )}

        {notice ? <Text style={styles.successText}>{notice}</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {busy ? <ActivityIndicator color={brandColors.primary} /> : null}
        <Text style={styles.footerText}>WESSALI · ALGERIA · 0.2.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: brandColors.canvas },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  loginContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowReverse: { flexDirection: 'row-reverse' },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brandColors.primary,
  },
  brandMarkText: { color: '#FFFFFF', fontWeight: '800', fontSize: 23 },
  brandText: { flex: 1, gap: 2 },
  brandName: { color: brandColors.ink, fontSize: 19, fontWeight: '800' },
  tagline: { color: brandColors.muted, fontSize: 11 },
  loginTitle: { color: brandColors.ink, fontSize: 32, fontWeight: '800', textAlign: 'center' },
  loginSubtitle: {
    color: brandColors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  languageSwitch: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: 3,
    borderRadius: radii.pill,
    backgroundColor: '#E8EAEE',
    gap: 2,
  },
  languageButton: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: radii.pill },
  languageButtonActive: { backgroundColor: '#FFFFFF' },
  languageText: { color: brandColors.muted, fontSize: 10, fontWeight: '700' },
  languageTextActive: { color: brandColors.primary },
  hero: { paddingTop: spacing.md, gap: spacing.sm },
  eyebrow: { color: brandColors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: brandColors.ink, fontSize: 28, fontWeight: '800', lineHeight: 36 },
  subtitle: { color: brandColors.muted, fontSize: 14, lineHeight: 22 },
  textRtl: { textAlign: 'right', writingDirection: 'rtl' },
  textLtr: { textAlign: 'left', writingDirection: 'ltr' },
  navTabs: {
    flexDirection: 'row',
    backgroundColor: '#E8EAEE',
    padding: 4,
    borderRadius: radii.md,
    gap: 4,
  },
  navTab: { flex: 1, alignItems: 'center', padding: 11, borderRadius: radii.sm },
  navTabActive: { backgroundColor: '#FFFFFF' },
  navTabText: { color: brandColors.muted, fontWeight: '700', fontSize: 12 },
  navTabTextActive: { color: brandColors.primary },
  services: { gap: spacing.md },
  serviceCard: {
    backgroundColor: brandColors.surface,
    borderWidth: 1,
    borderColor: brandColors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceCode: {
    backgroundColor: '#F8EDEC',
    color: brandColors.primary,
    overflow: 'hidden',
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontWeight: '800',
  },
  serviceArrow: { color: brandColors.muted, fontSize: 21 },
  serviceTitle: { color: brandColors.ink, fontSize: 18, fontWeight: '800' },
  serviceDescription: { color: brandColors.muted, fontSize: 13, lineHeight: 20 },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: brandColors.ink, fontSize: 18, fontWeight: '800' },
  linkText: { color: brandColors.primary, fontWeight: '800', fontSize: 12 },
  formCard: {
    backgroundColor: brandColors.surface,
    borderWidth: 1,
    borderColor: brandColors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  field: { gap: 7 },
  fieldLabel: { color: brandColors.ink, fontSize: 12, fontWeight: '700' },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: brandColors.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: brandColors.ink,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  inputRtl: { textAlign: 'right' },
  multilineInput: { minHeight: 76, textAlignVertical: 'top' },
  choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  choice: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: brandColors.border,
    borderRadius: radii.pill,
    backgroundColor: '#FFFFFF',
  },
  choiceActive: { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
  choiceText: { color: brandColors.muted, fontSize: 11, fontWeight: '700' },
  choiceTextActive: { color: '#FFFFFF' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: brandColors.primary,
    marginTop: 6,
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  secondaryButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: brandColors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: { color: brandColors.muted, fontWeight: '700', fontSize: 12 },
  bookingCard: {
    backgroundColor: brandColors.surface,
    borderWidth: 1,
    borderColor: brandColors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  bookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  reference: { color: brandColors.primary, fontSize: 11, fontWeight: '800' },
  statusPill: {
    color: brandColors.primary,
    backgroundColor: '#F8EDEC',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.pill,
    fontSize: 10,
    fontWeight: '800',
  },
  bookingService: { color: brandColors.ink, fontSize: 15, fontWeight: '800' },
  bodyText: { color: brandColors.ink, fontSize: 12, lineHeight: 19 },
  mutedText: { color: brandColors.muted, fontSize: 11 },
  emptyText: { color: brandColors.muted, paddingVertical: 18, fontSize: 12 },
  infoText: {
    color: brandColors.muted,
    fontSize: 11,
    lineHeight: 18,
    backgroundColor: '#F7F8FA',
    borderRadius: radii.md,
    padding: 10,
  },
  errorText: { color: '#B42318', fontSize: 12, lineHeight: 18 },
  successText: { color: '#16724A', fontSize: 12, lineHeight: 18 },
  demoNotice: { color: brandColors.muted, textAlign: 'center', fontSize: 10 },
  logoutButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: '#F8EDEC',
  },
  logoutText: { color: brandColors.primary, fontWeight: '700', fontSize: 10 },
  footerText: {
    color: brandColors.muted,
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 0.8,
    paddingTop: spacing.md,
  },
});
