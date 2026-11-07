'use client';

import { useState } from 'react';
import { SERVICE_CATEGORIES } from '@wessali/contracts';
import { getDirection, getMessages, type Locale } from '@wessali/i18n';

const languages: Locale[] = ['ar', 'fr', 'en'];

export default function DashboardPage() {
  const [locale, setLocale] = useState<Locale>('ar');
  const copy = getMessages(locale);
  const isRtl = getDirection(locale) === 'rtl';

  const labels = {
    menu: locale === 'ar' ? 'القائمة الرئيسية' : locale === 'fr' ? 'MENU PRINCIPAL' : 'MAIN MENU',
    providers: locale === 'ar' ? 'مقدمو الخدمات' : locale === 'fr' ? 'Prestataires' : 'Providers',
    services: locale === 'ar' ? 'الخدمات' : locale === 'fr' ? 'Services' : 'Services',
    settings: locale === 'ar' ? 'الإعدادات' : locale === 'fr' ? 'Paramètres' : 'Settings',
    pageTitle: locale === 'ar' ? 'لوحة العمليات' : locale === 'fr' ? 'Tableau des opérations' : 'Operations dashboard',
    starter: locale === 'ar' ? 'بيئة أولية' : locale === 'fr' ? 'Environnement initial' : 'Starter environment',
    starterText:
      locale === 'ar'
        ? 'الواجهة متصلة بهيكل المشروع فقط. ستظهر البيانات الحقيقية بعد ربط واجهة API وقاعدة البيانات.'
        : locale === 'fr'
          ? 'Cette interface présente la structure du projet. Les données réelles apparaîtront après la connexion à l’API et à la base de données.'
          : 'This interface is the project scaffold. Live records will appear after the API and database are connected.',
    stats: [
      locale === 'ar' ? 'الطلبات النشطة' : locale === 'fr' ? 'Demandes actives' : 'Active requests',
      locale === 'ar' ? 'مقدمو الخدمات' : locale === 'fr' ? 'Prestataires' : 'Providers',
      locale === 'ar' ? 'الخدمات المكتملة' : locale === 'fr' ? 'Services terminés' : 'Completed services',
      locale === 'ar' ? 'المناطق النشطة' : locale === 'fr' ? 'Zones actives' : 'Active zones',
    ],
    awaiting: locale === 'ar' ? 'بانتظار ربط البيانات' : locale === 'fr' ? 'En attente des données' : 'Awaiting data connection',
    sectors: locale === 'ar' ? 'قطاعات المنصة' : locale === 'fr' ? 'SECTEURS' : 'SERVICE LINES',
    threeServices: locale === 'ar' ? 'الخدمات الثلاث' : locale === 'fr' ? 'Les trois services' : 'Three service lines',
    preparing: locale === 'ar' ? 'قيد الإعداد' : locale === 'fr' ? 'En préparation' : 'In setup',
    monitoring: locale === 'ar' ? 'مراقبة المنصة' : locale === 'fr' ? 'SUPERVISION' : 'MONITORING',
    recent: locale === 'ar' ? 'الطلبات الأخيرة' : locale === 'fr' ? 'Demandes récentes' : 'Recent requests',
    empty: locale === 'ar' ? 'لا توجد طلبات بعد' : locale === 'fr' ? 'Aucune demande pour le moment' : 'No requests yet',
    emptyText:
      locale === 'ar'
        ? 'ستظهر الطلبات هنا بمجرد تشغيل نظام الحجز.'
        : locale === 'fr'
          ? 'Les demandes apparaîtront ici lorsque le système de réservation sera activé.'
          : 'Requests will appear here once the booking system is enabled.',
  };

  return (
    <main className="dashboard" dir={isRtl ? 'rtl' : 'ltr'}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">W</span>
          <span>
            <strong>Wessali</strong>
            <small>OPERATIONS</small>
          </span>
        </div>
        <div className="side-label">{labels.menu}</div>
        <nav className="navigation">
          <a className="nav-item active" href="#overview">{copy.home}</a>
          <a className="nav-item" href="#requests">{copy.requests}</a>
          <a className="nav-item" href="#providers">{labels.providers}</a>
          <a className="nav-item" href="#services">{labels.services}</a>
          <a className="nav-item" href="#settings">{labels.settings}</a>
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" />
          <span>{locale === 'ar' ? 'المنصة جاهزة للتطوير' : locale === 'fr' ? 'Base technique prête' : 'Foundation ready'}</span>
        </div>
      </aside>

      <section className="main-panel" id="overview">
        <header className="topbar">
          <div>
            <p className="overline">WESSALI / ADMIN</p>
            <h1>{labels.pageTitle}</h1>
          </div>
          <div className="language-picker" aria-label={copy.language}>
            {languages.map((language) => (
              <button
                key={language}
                className={locale === language ? 'language active' : 'language'}
                onClick={() => setLocale(language)}
                type="button"
              >
                {language.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <div className="notice">
          <span className="notice-icon">i</span>
          <div>
            <strong>{labels.starter}</strong>
            <p>{labels.starterText}</p>
          </div>
        </div>

        <section className="stats-grid" aria-label="Platform overview">
          {labels.stats.map((label) => (
            <article className="stat-card" key={label}>
              <span>{label}</span>
              <strong>—</strong>
              <small>{labels.awaiting}</small>
            </article>
          ))}
        </section>

        <section className="section-block" id="services">
          <div className="section-heading">
            <div>
              <p className="overline">{labels.sectors}</p>
              <h2>{labels.threeServices}</h2>
            </div>
            <span className="section-count">03</span>
          </div>
          <div className="service-grid">
            {SERVICE_CATEGORIES.map((service) => (
              <article className="service-card" key={service.id}>
                <div className="service-card-top">
                  <span className="service-number">{service.code}</span>
                  <span className="service-state">{labels.preparing}</span>
                </div>
                <h3>{service.labels[locale]}</h3>
                <p>{service.descriptions[locale]}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block" id="requests">
          <div className="section-heading">
            <div>
              <p className="overline">{labels.monitoring}</p>
              <h2>{labels.recent}</h2>
            </div>
          </div>
          <div className="empty-state">
            <span className="empty-mark">W</span>
            <strong>{labels.empty}</strong>
            <p>{labels.emptyText}</p>
          </div>
        </section>
      </section>
    </main>
  );
}
