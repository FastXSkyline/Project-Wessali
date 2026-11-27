import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SERVICE_CATEGORIES, type ServiceKind } from '@wessali/contracts';
import { palette, serviceTheme } from '../theme';
import type { WessaliApp } from '../useWessali';
import { AppText, GlassCard, Page, useLocaleValue } from '../ui/base';
import { ChoiceChips, Field, IconButton, InfoNote, PrimaryButton, Segmented, ToggleRow } from '../ui/controls';
import { IconTile } from '../ui/IconTile';
import { LocationPicker, type PickedLocation } from '../ui/LocationPicker';

export function BookingScreen({ app, onBack, onSent }: { app: WessaliApp; onBack: () => void; onSent: () => void }) {
  const { ui, locale, selectedService, isRtl } = app;
  const { isRtl: rtl } = useLocaleValue();
  const tone = serviceTheme[selectedService];
  const [pickerTarget, setPickerTarget] = useState<'pickup' | 'destination' | null>(null);
  const [formError, setFormError] = useState('');

  function applyPickedLocation(location: PickedLocation) {
    if (pickerTarget === 'pickup') {
      app.setPickupAddress(location.address);
      app.setPickupCoordinates({ latitude: location.latitude, longitude: location.longitude });
    } else if (pickerTarget === 'destination') {
      app.setDestinationAddress(location.address);
      app.setDestinationCoordinates({ latitude: location.latitude, longitude: location.longitude });
    }
    setPickerTarget(null);
    setFormError('');
  }

  function validate() {
    const invalidPickup = app.pickupAddress.trim().length < 3;
    const invalidFreight = selectedService === 'freight' && (
      app.destinationAddress.trim().length < 3 ||
      app.cargoDescription.trim().length < 3 ||
      !Number.isFinite(Number(app.weightKg)) ||
      Number(app.weightKg) <= 0
    );
    const invalidRoadside = selectedService === 'roadside' && app.needsTowing && app.towingDestination.trim().length < 3;
    const invalidWater = selectedService === 'water' && (!Number.isFinite(Number(app.quantityLitres)) || Number(app.quantityLitres) <= 0);
    if (invalidPickup || invalidFreight || invalidRoadside || invalidWater) {
      setFormError(ui.invalidRequest);
      return false;
    }
    setFormError('');
    return true;
  }

  async function submit() {
    if (!validate()) return;
    if (await app.submitBooking()) onSent();
  }

  const chooseOnMap = locale === 'ar' ? 'اختيار من الخريطة' : locale === 'fr' ? 'Choisir sur la carte' : 'Choose on map';
  const setService = (value: string) => { app.selectService(value as ServiceKind); setFormError(''); };
  return (
    <>
      <Page topSpace={8} bottomSpace={26}>
        <View style={[styles.header, rtl && styles.rowReverse]}>
          <IconButton icon={isRtl ? 'arrow-forward' : 'arrow-back'} label={ui.back} onPress={onBack} />
          <View style={{ flex: 1, gap: 1 }}>
            <AppText variant="caption" style={{ color: palette.jadeBright }}>{ui.newRequestTitle}</AppText>
            <AppText variant="h2">{ui.newRequestBody}</AppText>
          </View>
          <IconTile tone={selectedService} size="md" />
        </View>

        <GlassCard padding={16} radius={21}>
          <SectionTitle title={ui.servicesTitle} icon="grid-outline" />
          <View style={{ height: 12 }} />
          <Segmented value={selectedService} onChange={setService} accent={palette.jadeBright}
            options={SERVICE_CATEGORIES.map((service) => ({ value: service.id, label: service.labels[locale] }))} />
        </GlassCard>

        <GlassCard padding={16} radius={21}>
          <SectionTitle title={ui.locationSection} icon="map-outline" />
          <View style={{ height: 13 }} />
          <Field label={ui.pickupLabel} value={app.pickupAddress} onChangeText={(value) => { app.setPickupAddress(value); app.setPickupCoordinates(null); setFormError(''); }} placeholder={ui.pickupPlaceholder} icon="location-outline" />
          <MapAction label={chooseOnMap} selected={Boolean(app.pickupCoordinates)} onPress={() => setPickerTarget('pickup')} />
          {selectedService === 'freight' ? (
            <>
              <View style={{ height: 14 }} />
              <Field label={ui.destinationLabel} value={app.destinationAddress} onChangeText={(value) => { app.setDestinationAddress(value); app.setDestinationCoordinates(null); setFormError(''); }} placeholder={ui.destinationPlaceholder} icon="flag-outline" />
              <MapAction label={chooseOnMap} selected={Boolean(app.destinationCoordinates)} onPress={() => setPickerTarget('destination')} />
            </>
          ) : null}
        </GlassCard>

        <GlassCard padding={16} radius={21}>
          <SectionTitle title={ui.detailsSection} icon="clipboard-outline" />
          <View style={{ height: 14 }} />
          {selectedService === 'freight' ? (
            <View style={{ gap: 13 }}>
              <Field label={ui.cargoLabel} value={app.cargoDescription} onChangeText={app.setCargoDescription} placeholder={ui.cargoPlaceholder} icon="cube-outline" multiline />
              <Field label={ui.weightLabel} value={app.weightKg} onChangeText={app.setWeightKg} placeholder="1000" icon="scale-outline" keyboardType="numeric" />
              <View style={{ gap: 8 }}>
                <AppText variant="label" tone="soft">{ui.truckLabel}</AppText>
                <ChoiceChips accent={tone.accent} value={app.truckType} onChange={app.setTruckType} options={[
                  { value: 'pickup', label: ui.truckPickup }, { value: 'van', label: ui.truckVan }, { value: 'flatbed', label: ui.truckFlatbed }, { value: 'box_truck', label: ui.truckBox }, { value: 'semi_trailer', label: ui.truckSemi },
                ]} />
              </View>
              <Field label={ui.loadingLabel} value={app.loadingRequirements} onChangeText={app.setLoadingRequirements} placeholder={ui.loadingPlaceholder} icon="layers-outline" multiline />
            </View>
          ) : null}

          {selectedService === 'roadside' ? (
            <View style={{ gap: 14 }}>
              <View style={{ gap: 8 }}>
                <AppText variant="label" tone="soft">{ui.vehicleLabel}</AppText>
                <ChoiceChips accent={tone.accent} value={app.vehicleType} onChange={app.setVehicleType} options={[
                  { value: 'car', label: ui.vehicleCar }, { value: 'motorcycle', label: ui.vehicleMotorcycle }, { value: 'van', label: ui.vehicleVan }, { value: 'truck', label: ui.vehicleTruck },
                ]} />
              </View>
              <View style={{ gap: 8 }}>
                <AppText variant="label" tone="soft">{ui.issueLabel}</AppText>
                <ChoiceChips accent={tone.accent} value={app.issueCategory} onChange={app.setIssueCategory} options={[
                  { value: 'mechanical', label: ui.issueMechanical }, { value: 'tyre', label: ui.issueTyre }, { value: 'battery', label: ui.issueBattery }, { value: 'fuel', label: ui.issueFuel }, { value: 'towing', label: ui.issueTowing },
                ]} />
              </View>
              <View style={styles.divider} />
              <ToggleRow label={ui.towingLabel} value={app.needsTowing} onChange={(value) => { app.setNeedsTowing(value); setFormError(''); }} />
              {app.needsTowing ? <Field label={ui.towingDestinationLabel} value={app.towingDestination} onChangeText={app.setTowingDestination} placeholder={ui.towingPlaceholder} icon="navigate-outline" /> : null}
              <InfoNote icon="shield-checkmark-outline" tone="amber">{ui.safetyNote}</InfoNote>
            </View>
          ) : null}

          {selectedService === 'water' ? (
            <View style={{ gap: 14 }}>
              <Field label={ui.quantityLabel} value={app.quantityLitres} onChangeText={app.setQuantityLitres} placeholder="3000" icon="water-outline" keyboardType="numeric" />
              <View style={{ gap: 8 }}>
                <AppText variant="label" tone="soft">{ui.useLabel}</AppText>
                <ChoiceChips accent={tone.accent} value={app.intendedUse} onChange={app.setIntendedUse} options={[
                  { value: 'residential', label: ui.residential }, { value: 'agricultural', label: ui.agricultural }, { value: 'other', label: ui.otherUse },
                ]} />
              </View>
              <View style={{ gap: 8 }}>
                <AppText variant="label" tone="soft">{ui.waterCategoryLabel}</AppText>
                <ChoiceChips accent={tone.accent} value={app.waterCategory} onChange={app.setWaterCategory} options={[
                  { value: 'potable', label: ui.potable }, { value: 'non_potable', label: ui.nonPotable }, { value: 'irrigation', label: ui.irrigation },
                ]} />
              </View>
              <InfoNote icon="information-circle-outline" tone="aqua">{ui.waterNote}</InfoNote>
            </View>
          ) : null}
          <View style={{ height: 14 }} />
          <Field label={ui.notesLabel} value={app.customerNotes} onChangeText={app.setCustomerNotes} placeholder={ui.notesPlaceholder} multiline />
        </GlassCard>

        {formError ? <AppText variant="caption" tone="danger">{formError}</AppText> : null}
        <PrimaryButton label={ui.sendRequest} icon="checkmark-circle-outline" loading={app.busy} onPress={() => void submit()} />
      </Page>
      <LocationPicker visible={pickerTarget !== null} locale={locale} onClose={() => setPickerTarget(null)} onConfirm={applyPickedLocation} />
    </>
  );
}

function SectionTitle({ title, icon }: { title: string; icon: React.ComponentProps<typeof Ionicons>['name'] }) {
  const { isRtl } = useLocaleValue();
  return (
    <View style={[styles.sectionTitle, isRtl && styles.rowReverse]}>
      <View style={styles.sectionIcon}><Ionicons name={icon} size={15} color={palette.jade} /></View>
      <AppText variant="h3" style={{ flex: 1 }}>{title}</AppText>
    </View>
  );
}

function MapAction({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { isRtl } = useLocaleValue();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.mapAction, isRtl && styles.rowReverse]}>
      <Ionicons name="map-outline" size={15} color={palette.jadeBright} />
      <AppText variant="label" style={{ color: palette.jadeBright }}>{label}</AppText>
      <View style={{ flex: 1 }} />
      {selected ? <Ionicons name="checkmark-circle" size={16} color={palette.success} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowReverse: { flexDirection: 'row-reverse' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: '#EAF2FC', alignItems: 'center', justifyContent: 'center' },
  mapAction: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 9, minHeight: 38, paddingHorizontal: 11, borderRadius: 12, backgroundColor: '#EFF5FC' },
  divider: { height: 1, backgroundColor: palette.lineSoft },
});
