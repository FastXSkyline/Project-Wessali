import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SERVICE_CATEGORIES, type ServiceKind } from '@wessali/contracts';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, serviceTheme } from '../theme';
import type { WessaliApp } from '../useWessali';
import { AppText, GlassCard, Page, useLocaleValue } from '../ui/base';
import { ChoiceChips, Field, IconButton, InfoNote, PrimaryButton, ToggleRow } from '../ui/controls';
import { IconTile } from '../ui/IconTile';
import { LocationPicker, type PickedLocation } from '../ui/LocationPicker';

type FlowStep = 'service' | 'pickup' | 'destination' | 'freight' | 'vehicle' | 'issue' | 'water' | 'notes';

function stepCopy(locale: string) {
  if (locale === 'ar') {
    return {
      serviceTitle: 'ما الخدمة التي تحتاجها؟',
      serviceBody: 'اختر الخدمة المناسبة وسنرشدك خلال الطلب خطوة بخطوة.',
      pickupTitle: 'أين نلتقي؟',
      pickupBody: 'حدد نقطة الانطلاق. يمكنك كتابة العنوان أو اختيار موقعك من الخريطة.',
      destinationTitle: 'إلى أين نذهب؟',
      destinationBody: 'حدد الوجهة التي تريد إيصال الشحنة إليها.',
      freightTitle: 'أخبرنا عن الحمولة',
      freightBody: 'أدخل المعلومات الأساسية حتى نختار وسيلة النقل المناسبة.',
      vehicleTitle: 'ما نوع المركبة؟',
      vehicleBody: 'اختر المركبة التي تحتاج إلى المساعدة.',
      issueTitle: 'ما المشكلة؟',
      issueBody: 'حدد نوع المساعدة وأخبرنا إن كنت تحتاج إلى سحب المركبة.',
      waterTitle: 'تفاصيل طلب المياه',
      waterBody: 'حدد الكمية والاستخدام ونوع المياه المطلوبة.',
      notesTitle: 'راجع طلبك',
      notesBody: 'أضف ملاحظة اختيارية، ثم أرسل الطلب.',
      step: 'الخطوة',
      of: 'من',
      next: 'متابعة',
      back: 'السابق',
      send: 'إرسال الطلب',
      optional: 'اختياري',
      chooseService: 'اختر الخدمة',
      serviceFreight: 'نقل البضائع والتوصيل',
      serviceRoadside: 'مساعدة المركبات على الطريق',
      serviceWater: 'توصيل المياه',
      pickupRequired: 'أدخل عنوان الانطلاق أو حدده على الخريطة للمتابعة.',
      destinationRequired: 'أدخل عنوان الوجهة أو حدده على الخريطة للمتابعة.',
      cargoRequired: 'اكتب وصفاً مختصراً للحمولة.',
      weightRequired: 'أدخل وزناً صحيحاً أكبر من صفر.',
      towRequired: 'حدد وجهة السحب للمتابعة.',
      quantityRequired: 'أدخل كمية مياه صحيحة أكبر من صفر.',
      serviceLabel: 'الخدمة',
      pickupLabel: 'نقطة الانطلاق',
      destinationLabel: 'الوجهة',
      detailsLabel: 'التفاصيل',
      cargo: 'الحمولة',
      weight: 'الوزن',
      truck: 'المركبة المطلوبة',
      vehicle: 'نوع المركبة',
      issue: 'المشكلة',
      towing: 'السحب',
      quantity: 'الكمية',
      use: 'الاستخدام',
      waterType: 'نوع المياه',
      yes: 'نعم',
      no: 'لا',
    };
  }
  if (locale === 'fr') {
    return {
      serviceTitle: 'De quel service avez-vous besoin ?',
      serviceBody: 'Choisissez un service. Nous vous guiderons étape par étape.',
      pickupTitle: 'Où devons-nous vous rejoindre ?',
      pickupBody: 'Indiquez le point de départ en saisissant une adresse ou en choisissant sur la carte.',
      destinationTitle: 'Quelle est la destination ?',
      destinationBody: 'Indiquez où la marchandise doit être livrée.',
      freightTitle: 'Parlez-nous du chargement',
      freightBody: 'Ajoutez les informations essentielles pour choisir le bon véhicule.',
      vehicleTitle: 'Quel véhicule est concerné ?',
      vehicleBody: 'Choisissez le véhicule qui a besoin d’assistance.',
      issueTitle: 'Quel est le problème ?',
      issueBody: 'Choisissez le type d’assistance et indiquez si un remorquage est nécessaire.',
      waterTitle: 'Détails de la livraison d’eau',
      waterBody: 'Indiquez la quantité, l’utilisation et le type d’eau.',
      notesTitle: 'Vérifiez votre demande',
      notesBody: 'Ajoutez une note facultative, puis envoyez votre demande.',
      step: 'Étape',
      of: 'sur',
      next: 'Continuer',
      back: 'Précédent',
      send: 'Envoyer la demande',
      optional: 'Facultatif',
      chooseService: 'Choisir un service',
      serviceFreight: 'Transport et livraison de marchandises',
      serviceRoadside: 'Assistance routière',
      serviceWater: 'Livraison d’eau',
      pickupRequired: 'Saisissez le départ ou choisissez-le sur la carte.',
      destinationRequired: 'Saisissez la destination ou choisissez-la sur la carte.',
      cargoRequired: 'Décrivez brièvement le chargement.',
      weightRequired: 'Saisissez un poids valide supérieur à zéro.',
      towRequired: 'Indiquez la destination du remorquage.',
      quantityRequired: 'Saisissez une quantité d’eau valide supérieure à zéro.',
      serviceLabel: 'Service',
      pickupLabel: 'Départ',
      destinationLabel: 'Destination',
      detailsLabel: 'Détails',
      cargo: 'Chargement',
      weight: 'Poids',
      truck: 'Véhicule demandé',
      vehicle: 'Type de véhicule',
      issue: 'Problème',
      towing: 'Remorquage',
      quantity: 'Quantité',
      use: 'Utilisation',
      waterType: 'Type d’eau',
      yes: 'Oui',
      no: 'Non',
    };
  }
  return {
    serviceTitle: 'What do you need today?',
    serviceBody: 'Choose a service and we’ll guide you through the request one step at a time.',
    pickupTitle: 'Where should we meet?',
    pickupBody: 'Set the starting point. Type an address or choose your exact position on the map.',
    destinationTitle: 'Where is it going?',
    destinationBody: 'Set the destination for the delivery.',
    freightTitle: 'Tell us about the cargo',
    freightBody: 'Add the essentials so the right vehicle can be matched to your request.',
    vehicleTitle: 'What vehicle needs help?',
    vehicleBody: 'Choose the vehicle that needs roadside assistance.',
    issueTitle: 'What happened?',
    issueBody: 'Choose the type of help you need and whether the vehicle must be towed.',
    waterTitle: 'Water delivery details',
    waterBody: 'Set the amount, intended use and water type.',
    notesTitle: 'Review your request',
    notesBody: 'Add an optional note, check the details and send your request.',
    step: 'Step',
    of: 'of',
    next: 'Continue',
    back: 'Back',
    send: 'Send request',
    optional: 'Optional',
    chooseService: 'Choose a service',
    serviceFreight: 'Cargo transport and delivery',
    serviceRoadside: 'Help for vehicles on the road',
    serviceWater: 'Water delivery',
    pickupRequired: 'Enter a starting address or choose one on the map.',
    destinationRequired: 'Enter a destination or choose one on the map.',
    cargoRequired: 'Add a short description of the cargo.',
    weightRequired: 'Enter a valid weight greater than zero.',
    towRequired: 'Enter the towing destination to continue.',
    quantityRequired: 'Enter a valid water quantity greater than zero.',
    serviceLabel: 'Service',
    pickupLabel: 'Pickup',
    destinationLabel: 'Destination',
    detailsLabel: 'Details',
    cargo: 'Cargo',
    weight: 'Weight',
    truck: 'Requested vehicle',
    vehicle: 'Vehicle',
    issue: 'Issue',
    towing: 'Towing',
    quantity: 'Quantity',
    use: 'Intended use',
    waterType: 'Water type',
    yes: 'Yes',
    no: 'No',
  };
}

export function BookingScreen({
  app,
  onBack,
  onSent,
}: {
  app: WessaliApp;
  onBack: () => void;
  onSent: () => void;
}) {
  const { ui, locale, selectedService, selectedServiceCopy, isRtl } = app;
  const { isRtl: rtlStyle } = useLocaleValue();
  const tone = serviceTheme[selectedService];
  const copy = useMemo(() => stepCopy(locale), [locale]);
  const flow = useMemo<FlowStep[]>(() => {
    if (selectedService === 'freight') {
      return ['service', 'pickup', 'destination', 'freight', 'notes'];
    }
    if (selectedService === 'roadside') {
      return ['service', 'pickup', 'vehicle', 'issue', 'notes'];
    }
    return ['service', 'pickup', 'water', 'notes'];
  }, [selectedService]);

  const [step, setStep] = useState<FlowStep>('service');
  const [stepError, setStepError] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [locationTarget, setLocationTarget] = useState<'pickup' | 'destination' | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const shift = useRef(new Animated.Value(0)).current;

  const currentIndex = Math.max(0, flow.indexOf(step));
  const lastStep = currentIndex === flow.length - 1;
  const progress = ((currentIndex + 1) / flow.length) * 100;

  function changeStep(nextStep: FlowStep) {
    if (transitioning || nextStep === step) return;
    const nextIndex = flow.indexOf(nextStep);
    const direction = nextIndex >= currentIndex ? 1 : -1;
    setTransitioning(true);
    Animated.timing(opacity, {
      toValue: 0,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        setTransitioning(false);
        return;
      }
      setStep(nextStep);
      setStepError('');
      shift.setValue(direction * 18);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 230,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(shift, {
          toValue: 0,
          duration: 230,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => setTransitioning(false));
    });
  }

  function validateStep() {
    if (step === 'pickup' && app.pickupAddress.trim().length < 3) {
      setStepError(copy.pickupRequired);
      return false;
    }
    if (step === 'destination' && app.destinationAddress.trim().length < 3) {
      setStepError(copy.destinationRequired);
      return false;
    }
    if (step === 'freight') {
      if (app.cargoDescription.trim().length < 3) {
        setStepError(copy.cargoRequired);
        return false;
      }
      const weight = Number(app.weightKg);
      if (!Number.isFinite(weight) || weight <= 0) {
        setStepError(copy.weightRequired);
        return false;
      }
    }
    if (step === 'issue' && app.needsTowing && app.towingDestination.trim().length < 3) {
      setStepError(copy.towRequired);
      return false;
    }
    if (step === 'water') {
      const quantity = Number(app.quantityLitres);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        setStepError(copy.quantityRequired);
        return false;
      }
    }
    setStepError('');
    return true;
  }

  function next() {
    if (transitioning || !validateStep()) return;
    const target = flow[currentIndex + 1];
    if (target) changeStep(target);
  }

  function previous() {
    if (transitioning) return;
    const target = flow[currentIndex - 1];
    if (target) changeStep(target);
    else onBack();
  }

  function applyPickedLocation(location: PickedLocation) {
    if (locationTarget === 'pickup') {
      app.setPickupAddress(location.address);
      app.setPickupCoordinates({ latitude: location.latitude, longitude: location.longitude });
    } else if (locationTarget === 'destination') {
      app.setDestinationAddress(location.address);
      app.setDestinationCoordinates({ latitude: location.latitude, longitude: location.longitude });
    }
    setPickerVisible(false);
    setLocationTarget(null);
    setStepError('');
  }

  function openLocationPicker(target: 'pickup' | 'destination') {
    setLocationTarget(target);
    setPickerVisible(true);
  }

  async function submit() {
    if (!validateStep()) return;
    const sent = await app.submitBooking();
    if (sent) onSent();
  }

  const stepMeta: Record<FlowStep, { title: string; body: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
    service: { title: copy.serviceTitle, body: copy.serviceBody, icon: 'grid-outline' },
    pickup: { title: copy.pickupTitle, body: copy.pickupBody, icon: 'navigate-outline' },
    destination: { title: copy.destinationTitle, body: copy.destinationBody, icon: 'flag-outline' },
    freight: { title: copy.freightTitle, body: copy.freightBody, icon: 'cube-outline' },
    vehicle: { title: copy.vehicleTitle, body: copy.vehicleBody, icon: 'car-outline' },
    issue: { title: copy.issueTitle, body: copy.issueBody, icon: 'construct-outline' },
    water: { title: copy.waterTitle, body: copy.waterBody, icon: 'water-outline' },
    notes: { title: copy.notesTitle, body: copy.notesBody, icon: 'checkmark-circle-outline' },
  };
  const meta = stepMeta[step];

  const reviewRows: { label: string; value: string }[] = [
    {
      label: copy.serviceLabel,
      value: selectedServiceCopy?.labels[locale] ?? ui.newRequestTitle,
    },
    { label: ui.pickupLabel, value: app.pickupAddress },
  ];
  if (selectedService === 'freight') {
    reviewRows.push(
      { label: ui.destinationLabel, value: app.destinationAddress },
      { label: copy.cargo, value: app.cargoDescription },
      { label: copy.weight, value: `${app.weightKg} kg` },
      {
        label: copy.truck,
        value:
          app.truckType === 'pickup'
            ? ui.truckPickup
            : app.truckType === 'van'
              ? ui.truckVan
              : app.truckType === 'flatbed'
                ? ui.truckFlatbed
                : app.truckType === 'semi_trailer'
                  ? ui.truckSemi
                  : ui.truckBox,
      },
    );
  } else if (selectedService === 'roadside') {
    reviewRows.push(
      {
        label: copy.vehicle,
        value:
          app.vehicleType === 'motorcycle'
            ? ui.vehicleMotorcycle
            : app.vehicleType === 'van'
              ? ui.vehicleVan
              : app.vehicleType === 'truck'
                ? ui.vehicleTruck
                : ui.vehicleCar,
      },
      {
        label: copy.issue,
        value:
          app.issueCategory === 'tyre'
            ? ui.issueTyre
            : app.issueCategory === 'battery'
              ? ui.issueBattery
              : app.issueCategory === 'fuel'
                ? ui.issueFuel
                : app.issueCategory === 'towing'
                  ? ui.issueTowing
                  : ui.issueMechanical,
      },
      { label: copy.towing, value: app.needsTowing ? copy.yes : copy.no },
    );
    if (app.needsTowing && app.towingDestination.trim()) {
      reviewRows.push({ label: ui.towingDestinationLabel, value: app.towingDestination });
    }
  } else {
    reviewRows.push(
      { label: copy.quantity, value: `${app.quantityLitres} L` },
      {
        label: copy.use,
        value:
          app.intendedUse === 'agricultural'
            ? ui.agricultural
            : app.intendedUse === 'other'
              ? ui.otherUse
              : ui.residential,
      },
      {
        label: copy.waterType,
        value:
          app.waterCategory === 'potable'
            ? ui.potable
            : app.waterCategory === 'irrigation'
              ? ui.irrigation
              : ui.nonPotable,
      },
    );
  }

  return (
    <Page bottomSpace={30} topSpace={6}>
      <View style={[styles.header, rtlStyle && styles.rowReverse]}>
        <IconButton
          icon={isRtl ? 'arrow-forward' : 'arrow-back'}
          label={currentIndex === 0 ? ui.back : copy.back}
          onPress={previous}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="caption" tone="jade">
            {ui.newRequestTitle}
          </AppText>
          <AppText variant="h2" numberOfLines={1}>
            {selectedServiceCopy?.labels[locale] ?? ui.newRequestTitle}
          </AppText>
        </View>
        <IconTile tone={selectedService} size="md" />
      </View>

      <View style={styles.progressBlock}>
        <View style={[styles.progressMeta, rtlStyle && styles.rowReverse]}>
          <AppText variant="caption" tone="muted">
            {copy.step} {currentIndex + 1} {copy.of} {flow.length}
          </AppText>
          <AppText variant="caption" tone="jade">
            {Math.round(progress)}%
          </AppText>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[tone.accent, palette.jadeDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      <Animated.View
        style={{
          opacity,
          transform: [{ translateX: shift }],
        }}
      >
        <View style={styles.stepHeading}>
          <View style={[styles.stepIcon, { backgroundColor: `${tone.accent}14`, borderColor: `${tone.accent}35` }]}>
            <Ionicons name={meta.icon} size={18} color={tone.accent} />
          </View>
          <AppText variant="h2">{meta.title}</AppText>
          <AppText variant="body" tone="muted" style={{ lineHeight: 21 }}>
            {meta.body}
          </AppText>
        </View>

        {step === 'service' ? (
          <View style={{ gap: 10 }}>
            <ServiceChoice
              selected={selectedService === 'freight'}
              kind="freight"
              label={SERVICE_CATEGORIES.find((item) => item.id === 'freight')?.labels[locale] ?? 'Freight'}
              description={copy.serviceFreight}
              onPress={() => {
                app.selectService('freight');
                setStepError('');
              }}
            />
            <ServiceChoice
              selected={selectedService === 'roadside'}
              kind="roadside"
              label={SERVICE_CATEGORIES.find((item) => item.id === 'roadside')?.labels[locale] ?? 'Roadside'}
              description={copy.serviceRoadside}
              onPress={() => {
                app.selectService('roadside');
                setStepError('');
              }}
            />
            <ServiceChoice
              selected={selectedService === 'water'}
              kind="water"
              label={SERVICE_CATEGORIES.find((item) => item.id === 'water')?.labels[locale] ?? 'Water'}
              description={copy.serviceWater}
              onPress={() => {
                app.selectService('water');
                setStepError('');
              }}
            />
          </View>
        ) : null}

        {step === 'pickup' ? (
          <GlassCard padding={17} radius={24}>
            <SectionTitle icon="location-outline" title={ui.pickupLabel} color={tone.accent} />
            <Field
              label={ui.pickupLabel}
              value={app.pickupAddress}
              onChangeText={(value) => {
                app.setPickupAddress(value);
                app.setPickupCoordinates(null);
                setStepError('');
              }}
              placeholder={ui.pickupPlaceholder}
              icon="pin-outline"
              multiline
            />
            <LocationActionButton
              locale={locale}
              selected={Boolean(app.pickupCoordinates)}
              onPress={() => openLocationPicker('pickup')}
            />
          </GlassCard>
        ) : null}

        {step === 'destination' ? (
          <GlassCard padding={17} radius={24}>
            <SectionTitle icon="flag-outline" title={ui.destinationLabel} color={tone.accent} />
            <Field
              label={ui.destinationLabel}
              value={app.destinationAddress}
              onChangeText={(value) => {
                app.setDestinationAddress(value);
                app.setDestinationCoordinates(null);
                setStepError('');
              }}
              placeholder={ui.destinationPlaceholder}
              icon="flag-outline"
              multiline
            />
            <LocationActionButton
              locale={locale}
              selected={Boolean(app.destinationCoordinates)}
              onPress={() => openLocationPicker('destination')}
            />
          </GlassCard>
        ) : null}

        {step === 'freight' ? (
          <GlassCard padding={17} radius={24}>
            <View style={{ gap: 15 }}>
              <Field
                label={ui.cargoLabel}
                value={app.cargoDescription}
                onChangeText={(value) => {
                  app.setCargoDescription(value);
                  setStepError('');
                }}
                placeholder={ui.cargoPlaceholder}
                icon="cube-outline"
                multiline
              />
              <Field
                label={ui.weightLabel}
                value={app.weightKg}
                onChangeText={(value) => {
                  app.setWeightKg(value);
                  setStepError('');
                }}
                placeholder="1000"
                icon="barbell-outline"
                keyboardType="numeric"
              />
              <View style={{ gap: 9 }}>
                <AppText variant="label" tone="soft">
                  {ui.truckLabel}
                </AppText>
                <ChoiceChips
                  accent={tone.accent}
                  value={app.truckType}
                  onChange={app.setTruckType}
                  options={[
                    { value: 'pickup', label: ui.truckPickup },
                    { value: 'van', label: ui.truckVan },
                    { value: 'flatbed', label: ui.truckFlatbed },
                    { value: 'box_truck', label: ui.truckBox },
                    { value: 'semi_trailer', label: ui.truckSemi },
                  ]}
                />
              </View>
              <Field
                label={`${ui.loadingLabel} · ${copy.optional}`}
                value={app.loadingRequirements}
                onChangeText={app.setLoadingRequirements}
                placeholder={ui.loadingPlaceholder}
                icon="layers-outline"
                multiline
              />
            </View>
          </GlassCard>
        ) : null}

        {step === 'vehicle' ? (
          <GlassCard padding={17} radius={24}>
            <AppText variant="label" tone="soft">
              {ui.vehicleLabel}
            </AppText>
            <View style={{ height: 10 }} />
            <ChoiceChips
              accent={tone.accent}
              value={app.vehicleType}
              onChange={app.setVehicleType}
              options={[
                { value: 'car', label: ui.vehicleCar },
                { value: 'motorcycle', label: ui.vehicleMotorcycle },
                { value: 'van', label: ui.vehicleVan },
                { value: 'truck', label: ui.vehicleTruck },
              ]}
            />
          </GlassCard>
        ) : null}

        {step === 'issue' ? (
          <GlassCard padding={17} radius={24}>
            <View style={{ gap: 15 }}>
              <View style={{ gap: 9 }}>
                <AppText variant="label" tone="soft">
                  {ui.issueLabel}
                </AppText>
                <ChoiceChips
                  accent={tone.accent}
                  value={app.issueCategory}
                  onChange={app.setIssueCategory}
                  options={[
                    { value: 'mechanical', label: ui.issueMechanical },
                    { value: 'tyre', label: ui.issueTyre },
                    { value: 'battery', label: ui.issueBattery },
                    { value: 'fuel', label: ui.issueFuel },
                    { value: 'towing', label: ui.issueTowing },
                  ]}
                />
              </View>
              <View style={styles.softDivider} />
              <ToggleRow
                label={ui.towingLabel}
                value={app.needsTowing}
                onChange={(value) => {
                  app.setNeedsTowing(value);
                  setStepError('');
                }}
              />
              {app.needsTowing ? (
                <Field
                  label={ui.towingDestinationLabel}
                  value={app.towingDestination}
                  onChangeText={(value) => {
                    app.setTowingDestination(value);
                    setStepError('');
                  }}
                  placeholder={ui.towingPlaceholder}
                  icon="navigate-outline"
                  multiline
                />
              ) : null}
              <InfoNote icon="shield-outline" tone="amber">
                {ui.safetyNote}
              </InfoNote>
            </View>
          </GlassCard>
        ) : null}

        {step === 'water' ? (
          <GlassCard padding={17} radius={24}>
            <View style={{ gap: 15 }}>
              <Field
                label={ui.quantityLabel}
                value={app.quantityLitres}
                onChangeText={(value) => {
                  app.setQuantityLitres(value);
                  setStepError('');
                }}
                placeholder="3000"
                icon="water-outline"
                keyboardType="numeric"
              />
              <View style={{ gap: 9 }}>
                <AppText variant="label" tone="soft">
                  {ui.useLabel}
                </AppText>
                <ChoiceChips
                  accent={tone.accent}
                  value={app.intendedUse}
                  onChange={app.setIntendedUse}
                  options={[
                    { value: 'residential', label: ui.residential },
                    { value: 'agricultural', label: ui.agricultural },
                    { value: 'other', label: ui.otherUse },
                  ]}
                />
              </View>
              <View style={{ gap: 9 }}>
                <AppText variant="label" tone="soft">
                  {ui.waterCategoryLabel}
                </AppText>
                <ChoiceChips
                  accent={tone.accent}
                  value={app.waterCategory}
                  onChange={app.setWaterCategory}
                  options={[
                    { value: 'potable', label: ui.potable },
                    { value: 'non_potable', label: ui.nonPotable },
                    { value: 'irrigation', label: ui.irrigation },
                  ]}
                />
              </View>
              <InfoNote icon="water-outline" tone="aqua">
                {ui.waterNote}
              </InfoNote>
            </View>
          </GlassCard>
        ) : null}

        {step === 'notes' ? (
          <View style={{ gap: 12 }}>
            <GlassCard padding={17} radius={24}>
              <View style={{ gap: 11 }}>
                <SectionTitle icon="clipboard-outline" title={copy.detailsLabel} color={tone.accent} />
                {reviewRows.map((row, index) => (
                  <ReviewRow key={row.label} label={row.label} value={row.value} last={index === reviewRows.length - 1} />
                ))}
              </View>
            </GlassCard>
            <GlassCard padding={17} radius={24}>
              <View style={{ gap: 10 }}>
                <View style={[styles.optionalTitle, rtlStyle && styles.rowReverse]}>
                  <AppText variant="label">{ui.notesSection}</AppText>
                  <AppText variant="caption" tone="muted">
                    {copy.optional}
                  </AppText>
                </View>
                <Field
                  label={ui.notesLabel}
                  value={app.customerNotes}
                  onChangeText={app.setCustomerNotes}
                  placeholder={ui.notesPlaceholder}
                  multiline
                />
              </View>
            </GlassCard>
          </View>
        ) : null}
      </Animated.View>

      {stepError ? (
        <AppText variant="caption" tone="danger" style={styles.errorText}>
          {stepError}
        </AppText>
      ) : null}

      <View style={[styles.footer, rtlStyle && styles.rowReverse]}>
        <Pressable
          accessibilityRole="button"
          onPress={previous}
          disabled={transitioning || app.busy}
          style={styles.backButton}
        >
          <Ionicons name={isRtl ? 'arrow-forward' : 'arrow-back'} size={17} color={palette.inkSoft} />
          <AppText variant="label" tone="muted">
            {copy.back}
          </AppText>
        </Pressable>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label={lastStep ? copy.send : copy.next}
            icon={lastStep ? 'checkmark' : isRtl ? 'arrow-back' : 'arrow-forward'}
            onPress={lastStep ? () => void submit() : next}
            loading={app.busy}
            style={{ width: '100%' }}
          />
        </View>
      </View>

      <LocationPicker
        visible={pickerVisible}
        locale={locale}
        onClose={() => {
          setPickerVisible(false);
          setLocationTarget(null);
        }}
        onConfirm={applyPickedLocation}
      />
    </Page>
  );
}

function ServiceChoice({
  selected,
  kind,
  label,
  description,
  onPress,
}: {
  selected: boolean;
  kind: ServiceKind;
  label: string;
  description: string;
  onPress: () => void;
}) {
  const accent = serviceTheme[kind].accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.serviceChoice,
        selected && { borderColor: `${accent}90`, backgroundColor: `${accent}12` },
      ]}
    >
      <IconTile tone={kind} size="md" glow={selected} />
      <View style={{ flex: 1, gap: 3 }}>
        <AppText variant="bodyStrong">{label}</AppText>
        <AppText variant="caption" tone="muted">
          {description}
        </AppText>
      </View>
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color={selected ? accent : palette.faint}
      />
    </Pressable>
  );
}

function LocationActionButton({
  locale,
  selected,
  onPress,
}: {
  locale: string;
  selected: boolean;
  onPress: () => void;
}) {
  const label = selected
    ? locale === 'ar'
      ? 'تم تحديد الموقع على الخريطة'
      : locale === 'fr'
        ? 'Position sélectionnée sur la carte'
        : 'Location selected on map'
    : locale === 'ar'
      ? 'تحديد الموقع على الخريطة'
      : locale === 'fr'
        ? 'Choisir sur la carte'
        : 'Choose location on map';
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.mapButton}>
      <Ionicons name="map-outline" size={17} color={palette.jadeDeep} />
      <AppText variant="label" style={{ color: palette.jadeDeep, flex: 1 }}>
        {label}
      </AppText>
      <Ionicons name="chevron-forward" size={15} color={palette.jadeDeep} />
    </Pressable>
  );
}

function SectionTitle({
  icon,
  title,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  color: string;
}) {
  const { isRtl } = useLocaleValue();
  return (
    <View style={[styles.sectionTitle, isRtl && styles.rowReverse]}>
      <View style={[styles.sectionIcon, { backgroundColor: `${color}14`, borderColor: `${color}2E` }]}>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <AppText variant="h3" style={{ fontSize: 16 }}>
        {title}
      </AppText>
    </View>
  );
}

function ReviewRow({ label, value, last }: { label: string; value: string; last: boolean }) {
  const { isRtl } = useLocaleValue();
  return (
    <View style={{ gap: 8 }}>
      <View style={[styles.reviewRow, isRtl && styles.rowReverse]}>
        <AppText variant="caption" tone="muted" style={{ width: 104 }}>
          {label}
        </AppText>
        <AppText variant="bodyStrong" style={{ flex: 1 }} numberOfLines={3}>
          {value}
        </AppText>
      </View>
      {!last ? <View style={styles.softDivider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowReverse: { flexDirection: 'row-reverse' },
  progressBlock: { gap: 8, marginTop: 1, marginBottom: 4 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTrack: { height: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: 'rgba(72,91,76,0.10)' },
  progressFill: { height: '100%', borderRadius: 999 },
  stepHeading: { gap: 8, marginBottom: 5 },
  stepIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  serviceChoice: {
    minHeight: 82,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: palette.lineSoft,
    backgroundColor: 'rgba(47,62,52,0.025)',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapButton: {
    minHeight: 46,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(88,116,94,0.22)',
    backgroundColor: 'rgba(88,116,94,0.07)',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  softDivider: { height: 1, backgroundColor: palette.lineSoft },
  optionalTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  errorText: { color: palette.danger, marginTop: -4, marginHorizontal: 3 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 2 },
  backButton: {
    minHeight: 52,
    paddingHorizontal: 13,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: palette.lineSoft,
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
});
