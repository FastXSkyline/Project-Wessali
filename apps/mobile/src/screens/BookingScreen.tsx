import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SERVICE_CATEGORIES, type ServiceKind } from '@wessali/contracts';
import { palette, serviceTheme } from '../theme';
import type { WessaliApp } from '../useWessali';
import { AppText, GlassCard, Page, useLocaleValue } from '../ui/base';
import { ChoiceChips, Field, IconButton, InfoNote, PrimaryButton, ToggleRow } from '../ui/controls';
import { IconTile } from '../ui/IconTile';
import { LocationPicker, type PickedLocation } from '../ui/LocationPicker';

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
  const [locationTarget, setLocationTarget] = useState<'pickup' | 'destination' | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
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
  }
  function openLocationPicker(target: 'pickup' | 'destination') {
    setLocationTarget(target);
    setPickerVisible(true);
  }

  async function submit() {
    const sent = await app.submitBooking();
    if (sent) onSent();
  }

  return (
    <Page bottomSpace={26} topSpace={6}>
      <View style={[styles.header, rtlStyle && styles.rowReverse]}>
        <IconButton
          icon={isRtl ? 'arrow-forward' : 'arrow-back'}
          label={ui.back}
          onPress={onBack}
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
      <AppText variant="body" tone="muted" style={{ marginTop: -8 }}>
        {ui.newRequestBody}
      </AppText>

      <View style={{ gap: 9 }}>
        <AppText variant="label" tone="soft">
          {ui.serviceStep}
        </AppText>
        <View style={[styles.serviceTabs, rtlStyle && styles.rowReverse]}>
          {SERVICE_CATEGORIES.map((service) => {
            const active = service.id === selectedService;
            const itemTone = serviceTheme[service.id];
            return (
              <Pressable
                key={service.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={service.labels[locale]}
                onPress={() => app.selectService(service.id as ServiceKind)}
                style={[
                  styles.serviceTab,
                  active && {
                    borderColor: `${itemTone.accent}80`,
                    backgroundColor: `${itemTone.accent}12`,
                  },
                ]}
              >
                <IconTile tone={service.id} size="sm" glow={active} />
                <AppText
                  variant="caption"
                  tone={active ? 'ink' : 'muted'}
                  align="center"
                  numberOfLines={2}
                  style={{ fontSize: 9.5, lineHeight: 12.5 }}
                >
                  {service.labels[locale]}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <GlassCard padding={18} radius={26}>
        <SectionTitle icon="location-outline" title={ui.locationSection} color={tone.accent} />
        <View style={{ height: 14 }} />
        <View style={{ gap: 14 }}>
          <Field
            label={ui.pickupLabel}
            value={app.pickupAddress}
            onChangeText={(value) => {
              app.setPickupAddress(value);
              app.setPickupCoordinates(null);
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
          {selectedService === 'freight' ? (
            <>
              <Field
                label={ui.destinationLabel}
                value={app.destinationAddress}
                onChangeText={(value) => {
                  app.setDestinationAddress(value);
                  app.setDestinationCoordinates(null);
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
            </>
          ) : null}
        </View>
      </GlassCard>

      <GlassCard padding={18} radius={26}>
        <SectionTitle icon="options-outline" title={ui.detailsSection} color={tone.accent} />
        <View style={{ height: 14 }} />

        {selectedService === 'freight' ? (
          <View style={{ gap: 16 }}>
            <Field
              label={ui.cargoLabel}
              value={app.cargoDescription}
              onChangeText={app.setCargoDescription}
              placeholder={ui.cargoPlaceholder}
              icon="cube-outline"
              multiline
            />
            <Field
              label={ui.weightLabel}
              value={app.weightKg}
              onChangeText={app.setWeightKg}
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
              label={ui.loadingLabel}
              value={app.loadingRequirements}
              onChangeText={app.setLoadingRequirements}
              placeholder={ui.loadingPlaceholder}
              icon="layers-outline"
              multiline
            />
          </View>
        ) : null}

        {selectedService === 'roadside' ? (
          <View style={{ gap: 16 }}>
            <View style={{ gap: 9 }}>
              <AppText variant="label" tone="soft">
                {ui.vehicleLabel}
              </AppText>
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
            </View>
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
            <ToggleRow
              label={ui.towingLabel}
              value={app.needsTowing}
              onChange={app.setNeedsTowing}
            />
            {app.needsTowing ? (
              <Field
                label={ui.towingDestinationLabel}
                value={app.towingDestination}
                onChangeText={app.setTowingDestination}
                placeholder={ui.towingPlaceholder}
                icon="navigate-outline"
              />
            ) : null}
            <InfoNote icon="shield-outline" tone="amber">
              {ui.safetyNote}
            </InfoNote>
          </View>
        ) : null}

        {selectedService === 'water' ? (
          <View style={{ gap: 16 }}>
            <Field
              label={ui.quantityLabel}
              value={app.quantityLitres}
              onChangeText={app.setQuantityLitres}
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
        ) : null}
      </GlassCard>

      <GlassCard padding={18} radius={26}>
        <SectionTitle
          icon="chatbubble-ellipses-outline"
          title={ui.notesSection}
          color={tone.accent}
        />
        <View style={{ height: 14 }} />
        <Field
          label={ui.notesLabel}
          value={app.customerNotes}
          onChangeText={app.setCustomerNotes}
          placeholder={ui.notesPlaceholder}
          multiline
        />
      </GlassCard>

      <LocationPicker
        visible={pickerVisible}
        locale={locale}
        onClose={() => {
          setPickerVisible(false);
          setLocationTarget(null);
        }}
        onConfirm={applyPickedLocation}
      />

      <PrimaryButton
        label={ui.sendRequest}
        icon={isRtl ? 'arrow-back' : 'arrow-forward'}
        onPress={() => void submit()}
        loading={app.busy}
        style={{ marginTop: 2 }}
      />
    </Page>
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
      <View
        style={[styles.sectionIcon, { backgroundColor: `${color}14`, borderColor: `${color}2E` }]}
      >
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <AppText variant="h3" style={{ fontSize: 16 }}>
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowReverse: { flexDirection: 'row-reverse' },
  serviceTabs: { flexDirection: 'row', gap: 8 },
  serviceTab: {
    flex: 1,
    minHeight: 96,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.lineSoft,
    backgroundColor: 'rgba(47, 62, 52, 0.035)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 9 },
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
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
