import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SERVICE_CATEGORIES, type ServiceKind } from '@wessali/contracts';
import { palette, serviceTheme } from '../theme';
import type { WessaliApp } from '../useWessali';
import {
  AppText,
  Divider,
  GlassCard,
  Page,
  RadialGlow,
  RouteDoodle,
  useLocaleValue,
} from '../ui/base';
import { Field, IconButton, InfoNote, PrimaryButton } from '../ui/controls';
import { IconTile } from '../ui/IconTile';
import { formatShortDate } from '../utils';

export function PartnerScreen({
  app,
  onContinueAsProvider,
  onOpenQueue,
}: {
  app: WessaliApp;
  onContinueAsProvider: () => void;
  onOpenQueue: () => void;
}) {
  const { ui, isProvider, providerProfile, isRtl } = app;
  const { isRtl: rtlStyle } = useLocaleValue();

  if (!isProvider) {
    return (
      <Page bottomSpace={132}>
        <View style={[styles.header, rtlStyle && styles.rowReverse]}>
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="h1">{ui.partnerTitle}</AppText>
            <AppText variant="body" tone="muted">
              {ui.partnerHeaderBody}
            </AppText>
          </View>
        </View>
        <PartnerIntro app={app} onOpenQueue={onOpenQueue} />
        <GlassCard padding={18} radius={24}>
          <View style={{ gap: 10 }}>
            <View style={[styles.sessionTitle, rtlStyle && styles.rowReverse]}>
              <View style={styles.sessionIcon}>
                <Ionicons name="key-outline" size={15} color={palette.sand} />
              </View>
              <AppText variant="bodyStrong" style={{ flex: 1 }}>
                {ui.providerSessionTitle}
              </AppText>
            </View>
            <AppText variant="caption" tone="muted" style={{ lineHeight: 18 }}>
              {ui.providerSessionBody}
            </AppText>
            <PrimaryButton
              label={ui.providerSessionCta}
              icon={isRtl ? 'arrow-back' : 'arrow-forward'}
              onPress={onContinueAsProvider}
            />
          </View>
        </GlassCard>
      </Page>
    );
  }

  if (!providerProfile) {
    return (
      <Page bottomSpace={132}>
        <GlassCard padding={28} radius={26}>
          <View style={{ alignItems: 'center', gap: 12 }}>
            <ActivityIndicator color={palette.jade} />
            <AppText variant="body" tone="muted" align="center">
              {ui.working}
            </AppText>
          </View>
        </GlassCard>
      </Page>
    );
  }

  const status = providerProfile.status;
  const approved = status === 'approved';
  const rejected = status === 'rejected';

  return (
    <Page bottomSpace={132}>
      <View style={[styles.header, rtlStyle && styles.rowReverse]}>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="h1">{ui.partnerTitle}</AppText>
          <AppText variant="body" tone="muted">
            {approved ? ui.approvedBody : rejected ? ui.rejectedBody : ui.pendingBody}
          </AppText>
        </View>
        <IconButton
          icon="refresh-outline"
          label={ui.refresh}
          onPress={() => void app.refreshData()}
        />
      </View>

      {approved ? (
        <ApprovedBusiness app={app} onOpenQueue={onOpenQueue} />
      ) : status === 'not_applied' ? (
        <>
          <PartnerIntro app={app} onOpenQueue={onOpenQueue} />
          <ApplicationForm app={app} />
        </>
      ) : (
        <>
          <StatusTimeline app={app} rejected={rejected} />
          <ServiceApprovalList app={app} />
          {rejected ? <ApplicationForm app={app} /> : null}
        </>
      )}
    </Page>
  );
}

function PartnerIntro({ app, onOpenQueue }: { app: WessaliApp; onOpenQueue: () => void }) {
  const { ui } = app;
  const { isRtl } = useLocaleValue();
  const benefits = [
    {
      icon: 'shield-checkmark-outline' as const,
      title: ui.benefitVerifiedTitle,
      body: ui.benefitVerifiedBody,
      tone: palette.jade,
    },
    {
      icon: 'git-commit-outline' as const,
      title: ui.benefitMilestonesTitle,
      body: ui.benefitMilestonesBody,
      tone: palette.aqua,
    },
    {
      icon: 'map-outline' as const,
      title: ui.benefitNetworkTitle,
      body: ui.benefitNetworkBody,
      tone: palette.sand,
    },
  ];
  return (
    <>
      <GlassCard padding={20} tone="deep" radius={30} style={{ overflow: 'hidden' }}>
        <RouteDoodle height={180} opacity={0.6} color={palette.sand} />
        <RadialGlow
          size={260}
          color={palette.sand}
          opacity={0.16}
          style={{ position: 'absolute', top: -140, right: -90 }}
        />
        <View style={{ gap: 13 }}>
          <View style={[styles.introTop, isRtl && styles.rowReverse]}>
            <View style={[styles.kicker, isRtl && styles.rowReverse]}>
              <View style={[styles.kickerDot, { backgroundColor: palette.sand }]} />
              <AppText variant="caption" style={{ color: palette.sand }}>
                {ui.brand} · {ui.partnerTitle}
              </AppText>
            </View>
            <IconTile tone="sand" icon="account-hard-hat" size="lg" />
          </View>
          <AppText variant="h1" style={{ maxWidth: '90%' }}>
            {ui.partnerIntroTitle}
          </AppText>
          <AppText variant="body" tone="soft" style={{ maxWidth: '92%' }}>
            {ui.partnerIntroBody}
          </AppText>
        </View>
      </GlassCard>

      <GlassCard padding={16} radius={24}>
        <View style={{ gap: 13 }}>
          {benefits.map((benefit, index) => (
            <React.Fragment key={benefit.title}>
              <View style={[styles.benefitRow, isRtl && styles.rowReverse]}>
                <View
                  style={[
                    styles.benefitIcon,
                    { backgroundColor: `${benefit.tone}12`, borderColor: `${benefit.tone}2A` },
                  ]}
                >
                  <Ionicons name={benefit.icon} size={16} color={benefit.tone} />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <AppText variant="bodyStrong">{benefit.title}</AppText>
                  <AppText variant="caption" tone="muted">
                    {benefit.body}
                  </AppText>
                </View>
              </View>
              {index < benefits.length - 1 ? <Divider /> : null}
            </React.Fragment>
          ))}
        </View>
      </GlassCard>
      {app.providerApproved ? (
        <PrimaryButton
          label={ui.availableRequests}
          icon={isRtl ? 'arrow-back' : 'arrow-forward'}
          onPress={onOpenQueue}
        />
      ) : null}
    </>
  );
}

function ApplicationForm({ app }: { app: WessaliApp }) {
  const { ui, locale, isRtl } = app;
  const { isRtl: rtlStyle } = useLocaleValue();
  return (
    <GlassCard padding={18} radius={26}>
      <View style={{ gap: 4 }}>
        <AppText variant="h3">{ui.applyTitle}</AppText>
        <AppText variant="caption" tone="muted">
          {ui.notAppliedBody}
        </AppText>
      </View>
      <View style={{ height: 16 }} />
      <Field
        label={ui.businessLabel}
        value={app.businessName}
        onChangeText={app.setBusinessName}
        placeholder={ui.businessPlaceholder}
        icon="business-outline"
      />
      <View style={{ height: 16 }} />
      <AppText variant="label" tone="soft">
        {ui.servicesLabel}
      </AppText>
      <View style={{ height: 9 }} />
      <View style={{ gap: 8 }}>
        {SERVICE_CATEGORIES.map((service) => {
          const selected = app.providerServices.includes(service.id);
          const tone = serviceTheme[service.id];
          return (
            <Pressable
              key={service.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={service.labels[locale]}
              onPress={() => app.toggleProviderService(service.id as ServiceKind)}
              style={[
                styles.serviceOption,
                rtlStyle && styles.rowReverse,
                selected && {
                  borderColor: `${tone.accent}66`,
                  backgroundColor: `${tone.accent}0F`,
                },
              ]}
            >
              <IconTile tone={service.id} size="sm" glow={selected} />
              <View style={{ flex: 1, gap: 1 }}>
                <AppText variant="bodyStrong" numberOfLines={1} style={{ fontSize: 13 }}>
                  {service.labels[locale]}
                </AppText>
                <AppText variant="caption" tone="muted" numberOfLines={1} style={{ fontSize: 10 }}>
                  {service.id === 'freight'
                    ? ui.serviceFreightShort
                    : service.id === 'roadside'
                      ? ui.serviceRoadsideShort
                      : ui.serviceWaterShort}
                </AppText>
              </View>
              <View
                style={[
                  styles.check,
                  selected && { backgroundColor: tone.accent, borderColor: tone.accent },
                ]}
              >
                {selected ? <Ionicons name="checkmark" size={13} color={palette.onAccent} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={{ height: 18 }} />
      <PrimaryButton
        label={ui.applyCta}
        icon={isRtl ? 'arrow-back' : 'arrow-forward'}
        loading={app.busy}
        onPress={() => void app.applyProvider()}
      />
    </GlassCard>
  );
}

function StatusTimeline({ app, rejected }: { app: WessaliApp; rejected: boolean }) {
  const { ui } = app;
  const { isRtl } = useLocaleValue();
  const steps = [
    { title: ui.stepReceived, state: 'done' },
    { title: ui.stepReview, state: rejected ? 'attention' : 'active' },
    { title: ui.stepDecision, state: rejected ? 'attention' : 'pending' },
  ];
  return (
    <GlassCard padding={18} radius={26} tone="deep">
      <View style={[styles.statusTop, isRtl && styles.rowReverse]}>
        <View style={{ flex: 1, gap: 3 }}>
          <AppText variant="caption" tone={rejected ? 'amber' : 'jade'}>
            {ui.businessStatus}
          </AppText>
          <AppText variant="h3" numberOfLines={1}>
            {app.providerProfile?.business_name ?? ui.partnerTitle}
          </AppText>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              borderColor: rejected ? 'rgba(255,180,94,0.35)' : 'rgba(88,116,94,0.30)',
              backgroundColor: rejected ? 'rgba(255,180,94,0.10)' : 'rgba(88,116,94,0.09)',
            },
          ]}
        >
          <View
            style={[
              styles.statusBadgeDot,
              { backgroundColor: rejected ? palette.amber : palette.jade },
            ]}
          />
          <AppText variant="caption" tone={rejected ? 'amber' : 'jade'}>
            {rejected ? ui.needsAttention : ui.awaitingApproval}
          </AppText>
        </View>
      </View>
      <View style={{ height: 18 }} />
      <View style={{ gap: 0 }}>
        {steps.map((step, index) => {
          const done = step.state === 'done';
          const attention = step.state === 'attention';
          const active = step.state === 'active';
          const color = attention ? palette.amber : done ? palette.jade : palette.muted;
          return (
            <View key={step.title} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      borderColor: `${color}66`,
                      backgroundColor: done ? color : 'rgba(255,255,255,0.05)',
                    },
                  ]}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={9} color={palette.onAccent} />
                  ) : active ? (
                    <View style={[styles.timelineInnerDot, { backgroundColor: color }]} />
                  ) : null}
                </View>
                {index < steps.length - 1 ? <View style={styles.timelineLine} /> : null}
              </View>
              <View style={{ flex: 1, paddingBottom: index < steps.length - 1 ? 18 : 0 }}>
                <AppText
                  variant="bodyStrong"
                  style={{ fontSize: 13, color: done || attention ? palette.ink : palette.muted }}
                >
                  {step.title}
                </AppText>
                {active ? (
                  <AppText variant="caption" tone="muted" style={{ fontSize: 10 }}>
                    {app.providerProfile?.created_at
                      ? formatShortDate(app.providerProfile.created_at, app.locale)
                      : ui.working}
                  </AppText>
                ) : null}
              </View>
              {index === 1 ? (
                <View style={styles.stepTag}>
                  <AppText
                    variant="caption"
                    tone={rejected ? 'amber' : 'jade'}
                    style={{ fontSize: 9 }}
                  >
                    {rejected ? ui.needsAttention : ui.awaitingApproval}
                  </AppText>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
      {app.providerProfile?.verification_notes ? (
        <View style={{ marginTop: 14 }}>
          <InfoNote icon="chatbubble-ellipses-outline" tone="amber">
            {app.providerProfile.verification_notes}
          </InfoNote>
        </View>
      ) : null}
    </GlassCard>
  );
}

function ServiceApprovalList({ app }: { app: WessaliApp }) {
  const { ui, locale } = app;
  const { isRtl } = useLocaleValue();
  const services = app.providerProfile?.services ?? [];
  if (!services.length) return null;
  return (
    <GlassCard padding={16} radius={24}>
      <AppText variant="label" tone="soft" style={{ marginBottom: 12 }}>
        {ui.serviceApprovals}
      </AppText>
      <View style={{ gap: 9 }}>
        {services.map((service) => {
          const category = SERVICE_CATEGORIES.find((item) => item.id === service.serviceType);
          return (
            <View
              key={service.serviceType}
              style={[styles.serviceStatusRow, isRtl && styles.rowReverse]}
            >
              <IconTile tone={service.serviceType} size="sm" />
              <AppText variant="bodyStrong" style={{ flex: 1, fontSize: 13 }} numberOfLines={1}>
                {category?.labels[locale] ?? service.serviceType}
              </AppText>
              <View style={[styles.approvalPill, isRtl && styles.rowReverse]}>
                <Ionicons
                  name={service.approved ? 'checkmark-circle' : 'time-outline'}
                  size={13}
                  color={service.approved ? palette.jade : palette.muted}
                />
                <AppText
                  variant="caption"
                  tone={service.approved ? 'jade' : 'muted'}
                  style={{ fontSize: 9.5 }}
                >
                  {service.approved ? ui.approved : ui.awaitingApproval}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}

function ApprovedBusiness({ app, onOpenQueue }: { app: WessaliApp; onOpenQueue: () => void }) {
  const { ui, locale, isRtl, providerProfile } = app;
  const { isRtl: rtlStyle } = useLocaleValue();
  const approvedServices = (providerProfile?.services ?? []).filter((item) => item.approved);
  const stats = [
    { label: ui.availableRequests, value: app.providerRequests.length, color: palette.jade },
    { label: ui.activeJobs, value: app.providerJobs.length, color: palette.aqua },
    { label: ui.serviceApprovals, value: approvedServices.length, color: palette.sand },
  ];
  return (
    <>
      <GlassCard padding={20} tone="deep" radius={30} style={{ overflow: 'hidden' }}>
        <RouteDoodle height={170} opacity={0.5} color={palette.jade} />
        <RadialGlow
          size={260}
          color={palette.jade}
          opacity={0.2}
          style={{ position: 'absolute', top: -130, right: -90 }}
        />
        <View style={{ gap: 13 }}>
          <View style={[styles.introTop, rtlStyle && styles.rowReverse]}>
            <View style={[styles.kicker, rtlStyle && styles.rowReverse]}>
              <View style={styles.kickerDot} />
              <AppText variant="caption" tone="jade">
                {ui.approvedTitle}
              </AppText>
            </View>
            <IconTile tone="jade" icon="shield-check-outline" size="lg" />
          </View>
          <AppText variant="h1">{providerProfile?.business_name ?? ui.partnerTitle}</AppText>
          <View style={[styles.approvedMeta, rtlStyle && styles.rowReverse]}>
            <View style={styles.approvedPill}>
              <Ionicons name="checkmark-circle" size={14} color={palette.jade} />
              <AppText variant="caption" tone="jade" style={{ fontSize: 10 }}>
                {ui.approved}
              </AppText>
            </View>
            {providerProfile?.approved_at || providerProfile?.created_at ? (
              <AppText variant="caption" tone="muted" style={{ fontSize: 10 }}>
                {ui.businessSince}{' '}
                {formatShortDate(providerProfile.approved_at ?? providerProfile.created_at, locale)}
              </AppText>
            ) : null}
          </View>
        </View>
      </GlassCard>

      <View style={[styles.statRow, rtlStyle && styles.rowReverse]}>
        {stats.map((stat) => (
          <GlassCard key={stat.label} padding={13} radius={20} style={{ flex: 1 }}>
            <View style={{ gap: 5, alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
              <AppText variant="number" style={{ color: stat.color, fontSize: 26, lineHeight: 30 }}>
                {stat.value}
              </AppText>
              <AppText variant="caption" tone="muted" numberOfLines={1} style={{ fontSize: 9.5 }}>
                {stat.label}
              </AppText>
            </View>
          </GlassCard>
        ))}
      </View>

      <ServiceApprovalList app={app} />

      <InfoNote icon="information-circle-outline">{ui.approvedBody}</InfoNote>
      <PrimaryButton
        label={ui.availableRequests}
        icon={isRtl ? 'arrow-back' : 'arrow-forward'}
        onPress={onOpenQueue}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowReverse: { flexDirection: 'row-reverse' },
  introTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(88, 116, 94, 0.17)',
    backgroundColor: 'rgba(88, 116, 94, 0.07)',
  },
  kickerDot: { width: 5, height: 5, borderRadius: 999, backgroundColor: palette.jade },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sessionIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(169, 130, 85, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(169, 130, 85, 0.18)',
  },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: palette.lineSoft,
    borderRadius: 18,
    padding: 10,
    backgroundColor: 'rgba(47, 62, 52, 0.035)',
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusBadgeDot: { width: 5, height: 5, borderRadius: 999 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  timelineRail: { width: 18, alignItems: 'center' },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  timelineInnerDot: { width: 6, height: 6, borderRadius: 999 },
  timelineLine: {
    width: 1,
    flex: 1,
    minHeight: 18,
    backgroundColor: 'rgba(88, 116, 94, 0.12)',
    marginVertical: 3,
  },
  stepTag: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: 'rgba(47, 62, 52, 0.045)',
  },
  serviceStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  approvalPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  approvedMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  approvedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(88, 116, 94, 0.22)',
    backgroundColor: 'rgba(55, 225, 165, 0.10)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statRow: { flexDirection: 'row', gap: 9 },
});
