'use client';

import { useEffect, useState } from 'react';
import { SERVICE_CATEGORIES } from '@wessali/contracts';
import { getDirection, getMessages, type Locale } from '@wessali/i18n';

type AdminSession = { accessToken: string; expiresAt?: string; user: { displayName: string } };

const ADMIN_SESSION_KEY = 'wessali.admin.session';
type Overview = {
  active_bookings: number;
  pending_bookings: number;
  completed_bookings: number;
  pending_providers: number;
  approved_providers: number;
};
type Provider = {
  id: string;
  business_name: string;
  status: string;
  display_name: string;
  phone_e164: string;
  verification_notes?: string | null;
  services: Array<{ serviceType: string; approved: boolean }>;
};
type Booking = {
  id: string;
  public_reference: string;
  service_type: string;
  status: string;
  pickup_address: string;
  destination_address?: string | null;
  customer_name: string;
  provider_name?: string | null;
  created_at: string;
};

const copy = {
  ar: {
    title: 'لوحة العمليات',
    intro: 'مركز إدارة وصلي',
    signIn: 'دخول الإدارة التجريبي',
    username: 'اسم المستخدم',
    password: 'كلمة مرور الإدارة',
    api: 'عنوان API',
    connect: 'دخول',
    logout: 'خروج',
    overview: 'نظرة عامة',
    bookings: 'الطلبات',
    providers: 'مقدمو الخدمات',
    active: 'الطلبات النشطة',
    pending: 'طلبات بانتظار المراجعة',
    completed: 'الخدمات المكتملة',
    approved: 'مقدمو الخدمات المعتمدون',
    providerReview: 'مراجعة مقدمي الخدمات',
    approve: 'اعتماد',
    reject: 'رفض',
    suspend: 'إيقاف',
    customer: 'الزبون',
    service: 'الخدمة',
    pickup: 'الانطلاق',
    destination: 'الوجهة',
    status: 'الحالة',
    provider: 'مقدم الخدمة',
    reference: 'المرجع',
    noBookings: 'لا توجد طلبات',
    noProviders: 'لا توجد طلبات مقدمي خدمات',
    loading: 'جارٍ التحميل',
    demo: 'وضع تجريبي محلي فقط. لا تستخدم المصادقة التجريبية في الإنتاج.',
    error: 'تعذر تنفيذ العملية',
    refresh: 'تحديث البيانات',
    appName: 'عمليات وصلي',
  },
  fr: {
    title: 'Tableau des opérations',
    intro: 'Centre de gestion Wessali',
    signIn: 'Connexion admin de démonstration',
    username: 'Nom d’utilisateur',
    password: 'Mot de passe admin',
    api: 'URL API',
    connect: 'Connexion',
    logout: 'Déconnexion',
    overview: 'Vue d’ensemble',
    bookings: 'Demandes',
    providers: 'Prestataires',
    active: 'Demandes actives',
    pending: 'Demandes en attente',
    completed: 'Services terminés',
    approved: 'Prestataires approuvés',
    providerReview: 'Vérification des prestataires',
    approve: 'Approuver',
    reject: 'Refuser',
    suspend: 'Suspendre',
    customer: 'Client',
    service: 'Service',
    pickup: 'Départ',
    destination: 'Destination',
    status: 'Statut',
    provider: 'Prestataire',
    reference: 'Référence',
    noBookings: 'Aucune demande',
    noProviders: 'Aucune candidature prestataire',
    loading: 'Chargement',
    demo: 'Mode de démonstration local uniquement. Ne pas utiliser en production.',
    error: 'Action impossible',
    refresh: 'Actualiser les données',
    appName: 'Opérations Wessali',
  },
  en: {
    title: 'Operations dashboard',
    intro: 'Wessali administration centre',
    signIn: 'Demo administrator sign-in',
    username: 'Admin username',
    password: 'Admin password',
    api: 'API URL',
    connect: 'Sign in',
    logout: 'Sign out',
    overview: 'Overview',
    bookings: 'Bookings',
    providers: 'Providers',
    active: 'Active bookings',
    pending: 'Pending provider reviews',
    completed: 'Completed services',
    approved: 'Approved providers',
    providerReview: 'Provider review queue',
    approve: 'Approve',
    reject: 'Reject',
    suspend: 'Suspend',
    customer: 'Customer',
    service: 'Service',
    pickup: 'Pickup',
    destination: 'Destination',
    status: 'Status',
    provider: 'Provider',
    reference: 'Reference',
    noBookings: 'No bookings',
    noProviders: 'No provider applications',
    loading: 'Loading',
    demo: 'Local development mode only. Do not use demo authentication in production.',
    error: 'The action could not be completed',
    refresh: 'Refresh data',
    appName: 'Wessali Operations',
  },
} as const;

function describeRequestError(error: unknown, base: string, fallback: string): string {
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    const healthUrl = `${base.trim().replace(/\/+$/, '')}/health`;
    return `Cannot reach the Wessali API at ${healthUrl}. Make sure the API is running. If you opened the dashboard using your PC's IP address, set the API URL to that same PC IP instead of localhost.`;
  }
  return error instanceof Error ? error.message : fallback;
}

async function apiRequest<T>(
  base: string,
  path: string,
  token?: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${base.trim().replace(/\/+$/, '')}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const raw = await response.text();
  let data: unknown = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }
  if (!response.ok) {
    throw new Error((data as { message?: string } | null)?.message ?? `HTTP ${response.status}`);
  }
  return data as T;
}

export default function DashboardPage() {
  const [locale, setLocale] = useState<Locale>('ar');
  const [apiBase, setApiBase] = useState(
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/v1',
  );
  const [adminUsername, setAdminUsername] = useState('fastx');
  const [adminKey, setAdminKey] = useState('fastx');
  const [session, setSession] = useState<AdminSession | null>(null);
  const [tab, setTab] = useState<'overview' | 'bookings' | 'providers'>('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const isRtl = getDirection(locale) === 'rtl';
  const labels = copy[locale];
  const messages = getMessages(locale);

  async function loadDashboard(current = session) {
    if (!current) return;
    setLoading(true);
    setError('');
    try {
      const [counts, bookingRows, providerRows] = await Promise.all([
        apiRequest<Overview>(apiBase, '/admin/overview', current.accessToken),
        apiRequest<Booking[]>(apiBase, '/admin/bookings', current.accessToken),
        apiRequest<Provider[]>(apiBase, '/admin/providers', current.accessToken),
      ]);
      setOverview(counts);
      setBookings(bookingRows);
      setProviders(providerRows);
    } catch (requestError) {
      setError(describeRequestError(requestError, apiBase, labels.error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SESSION_KEY);
      if (saved) {
        const restored = JSON.parse(saved) as AdminSession;
        if (restored.accessToken && (!restored.expiresAt || Date.parse(restored.expiresAt) > Date.now())) {
          setSession(restored);
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    if (session) void loadDashboard(session);
    // Reload only when the authenticated session changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiRequest<{ status: string }>(apiBase, '/health');
      const result = await apiRequest<AdminSession>(apiBase, '/auth/dev-session', undefined, {
        method: 'POST',
        body: JSON.stringify({
          phoneE164: '+213555000001',
          displayName: adminUsername.trim(),
          role: 'admin',
          adminUsername: adminUsername.trim(),
          adminKey,
        }),
      });
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(result));
      setSession(result);
      setNotice('Connected to the Wessali API');
    } catch (requestError) {
      setError(describeRequestError(requestError, apiBase, labels.error));
    } finally {
      setLoading(false);
    }
  }

  async function reviewProvider(providerId: string, decision: 'approve' | 'reject' | 'suspend') {
    if (!session) return;
    setLoading(true);
    setError('');
    try {
      await apiRequest(apiBase, `/admin/providers/${providerId}/review`, session.accessToken, {
        method: 'POST',
        body: JSON.stringify({ decision }),
      });
      setNotice(
        decision === 'approve'
          ? labels.approve
          : decision === 'reject'
            ? labels.reject
            : labels.suspend,
      );
      await loadDashboard(session);
    } catch (requestError) {
      setError(describeRequestError(requestError, apiBase, labels.error));
    } finally {
      setLoading(false);
    }
  }

  function serviceLabel(kind: string) {
    const service = SERVICE_CATEGORIES.find((item) => item.id === kind);
    return service?.labels[locale] ?? kind;
  }

  function statusLabel(status: string) {
    const statuses: Record<string, Record<string, string>> = {
      submitted: { ar: 'تم الإرسال', fr: 'Envoyée', en: 'Submitted' },
      matching: { ar: 'جارٍ البحث', fr: 'Recherche', en: 'Matching' },
      offer_received: { ar: 'عرض وارد', fr: 'Offre reçue', en: 'Offer received' },
      accepted: { ar: 'مقبول', fr: 'Acceptée', en: 'Accepted' },
      provider_en_route: { ar: 'في الطريق', fr: 'En route', en: 'En route' },
      arrived: { ar: 'وصل', fr: 'Arrivé', en: 'Arrived' },
      in_progress: { ar: 'قيد التنفيذ', fr: 'En cours', en: 'In progress' },
      completed: { ar: 'مكتمل', fr: 'Terminée', en: 'Completed' },
      cancelled: { ar: 'ملغي', fr: 'Annulée', en: 'Cancelled' },
      pending: { ar: 'قيد المراجعة', fr: 'En attente', en: 'Pending' },
      approved: { ar: 'معتمد', fr: 'Approuvé', en: 'Approved' },
      rejected: { ar: 'مرفوض', fr: 'Refusé', en: 'Rejected' },
      suspended: { ar: 'موقوف', fr: 'Suspendu', en: 'Suspended' },
    };
    return statuses[status]?.[locale] ?? status.replaceAll('_', ' ');
  }

  if (!session) {
    return (
      <main className="admin-login" dir={isRtl ? 'rtl' : 'ltr'}>
        <form className="login-card" onSubmit={signIn}>
          <div className="brand-mark">W</div>
          <p className="overline">WESSALI / ADMIN</p>
          <h1>{labels.signIn}</h1>
          <label>
            {labels.api}
            <input value={apiBase} onChange={(event) => setApiBase(event.target.value)} />
          </label>
          <label>
            {labels.username}
            <input
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={adminUsername}
              onChange={(event) => setAdminUsername(event.target.value)}
              required
              minLength={3}
              maxLength={32}
              pattern="[A-Za-z0-9._-]+"
            />
          </label>
          <label>
            {labels.password}
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              required
            />
          </label>
          <div className="login-languages">
            {(['ar', 'fr', 'en'] as const).map((language) => (
              <button
                type="button"
                key={language}
                className={locale === language ? 'language active' : 'language'}
                onClick={() => setLocale(language)}
              >
                {language.toUpperCase()}
              </button>
            ))}
          </div>
          {error ? <p className="error-message">{error}</p> : null}
          <button className="primary-button" disabled={loading}>
            {loading ? labels.loading : labels.connect}
          </button>
          <p className="demo-warning">{labels.demo}</p>
        </form>
      </main>
    );
  }

  const statCards = [
    { label: labels.active, value: overview?.active_bookings ?? 0 },
    { label: labels.pending, value: overview?.pending_providers ?? 0 },
    { label: labels.completed, value: overview?.completed_bookings ?? 0 },
    { label: labels.approved, value: overview?.approved_providers ?? 0 },
  ];

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
        <p className="side-label">{labels.intro}</p>
        <nav className="navigation">
          <button
            className={tab === 'overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => setTab('overview')}
          >
            {labels.overview}
          </button>
          <button
            className={tab === 'bookings' ? 'nav-item active' : 'nav-item'}
            onClick={() => setTab('bookings')}
          >
            {labels.bookings}
          </button>
          <button
            className={tab === 'providers' ? 'nav-item active' : 'nav-item'}
            onClick={() => setTab('providers')}
          >
            {labels.providers}
          </button>
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" />
          {session.user.displayName}
        </div>
      </aside>
      <section className="main-panel">
        <header className="topbar">
          <div>
            <p className="overline">WESSALI / ADMIN</p>
            <h1>{labels.title}</h1>
          </div>
          <div className="top-actions">
            <div className="language-picker">
              {(['ar', 'fr', 'en'] as const).map((language) => (
                <button
                  key={language}
                  className={locale === language ? 'language active' : 'language'}
                  onClick={() => setLocale(language)}
                >
                  {language.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="text-button" onClick={() => void loadDashboard()}>
              {labels.refresh}
            </button>
            <button
              className="text-button"
              onClick={() => {
                localStorage.removeItem(ADMIN_SESSION_KEY);
                setSession(null);
              }}
            >
              {labels.logout}
            </button>
          </div>
        </header>

        <div className="notice">
          <span className="notice-icon">!</span>
          <div>
            <strong>Local demo mode</strong>
            <p>{labels.demo}</p>
          </div>
        </div>
        {error ? <p className="error-message">{error}</p> : null}
        {notice ? <p className="success-message">{notice}</p> : null}

        {tab === 'overview' ? (
          <>
            <section className="stats-grid">
              {statCards.map((stat) => (
                <article className="stat-card" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <small>Live database count</small>
                </article>
              ))}
            </section>
            <section className="section-block">
              <div className="section-heading">
                <div>
                  <p className="overline">{labels.bookings}</p>
                  <h2>{labels.bookings}</h2>
                </div>
                <button className="text-button" onClick={() => setTab('bookings')}>
                  {labels.refresh}
                </button>
              </div>
              {bookings.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{labels.reference}</th>
                        <th>{labels.service}</th>
                        <th>{labels.customer}</th>
                        <th>{labels.status}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 8).map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.public_reference}</td>
                          <td>{serviceLabel(booking.service_type)}</td>
                          <td>{booking.customer_name}</td>
                          <td>
                            <span className="status-badge">{statusLabel(booking.status)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">{labels.noBookings}</div>
              )}
            </section>
          </>
        ) : null}

        {tab === 'bookings' ? (
          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="overline">{labels.intro}</p>
                <h2>{labels.bookings}</h2>
              </div>
              <span className="section-count">{bookings.length.toString().padStart(2, '0')}</span>
            </div>
            {bookings.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{labels.reference}</th>
                      <th>{labels.service}</th>
                      <th>{labels.customer}</th>
                      <th>{labels.pickup}</th>
                      <th>{labels.destination}</th>
                      <th>{labels.provider}</th>
                      <th>{labels.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.public_reference}</td>
                        <td>{serviceLabel(booking.service_type)}</td>
                        <td>{booking.customer_name}</td>
                        <td>{booking.pickup_address}</td>
                        <td>{booking.destination_address || '—'}</td>
                        <td>{booking.provider_name || '—'}</td>
                        <td>
                          <span className="status-badge">{statusLabel(booking.status)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">{labels.noBookings}</div>
            )}
          </section>
        ) : null}

        {tab === 'providers' ? (
          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="overline">{labels.intro}</p>
                <h2>{labels.providerReview}</h2>
              </div>
              <span className="section-count">{providers.length.toString().padStart(2, '0')}</span>
            </div>
            {providers.length ? (
              <div className="provider-grid">
                {providers.map((provider) => (
                  <article className="provider-card" key={provider.id}>
                    <div className="provider-heading">
                      <div>
                        <h3>{provider.business_name}</h3>
                        <p>
                          {provider.display_name} · {provider.phone_e164}
                        </p>
                      </div>
                      <span className="status-badge">{statusLabel(provider.status)}</span>
                    </div>
                    <div className="provider-services">
                      {provider.services.map((service) => (
                        <span key={service.serviceType}>{serviceLabel(service.serviceType)}</span>
                      ))}
                    </div>
                    {provider.verification_notes ? (
                      <p className="provider-note">{provider.verification_notes}</p>
                    ) : null}
                    {provider.status !== 'approved' ? (
                      <div className="provider-actions">
                        <button
                          className="primary-button small"
                          onClick={() => void reviewProvider(provider.id, 'approve')}
                          disabled={loading}
                        >
                          {labels.approve}
                        </button>
                        <button
                          className="secondary-button small"
                          onClick={() => void reviewProvider(provider.id, 'reject')}
                          disabled={loading}
                        >
                          {labels.reject}
                        </button>
                      </div>
                    ) : (
                      <button
                        className="secondary-button small"
                        onClick={() => void reviewProvider(provider.id, 'suspend')}
                        disabled={loading}
                      >
                        {labels.suspend}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">{labels.noProviders}</div>
            )}
          </section>
        ) : null}
        {loading ? <p className="loading-note">{labels.loading}</p> : null}
      </section>
    </main>
  );
}
