export const messages = {
  ar: {
    brand: 'وصلي',
    tagline: 'خدمات النقل والمساعدة في مكان واحد',
    welcome: 'كيف يمكننا مساعدتك اليوم؟',
    chooseService: 'اختر الخدمة التي تحتاجها',
    customerMode: 'طلب خدمة',
    providerMode: 'تقديم الخدمات',
    comingSoon: 'قريباً',
    bookingPreview: 'سيتم ربط نموذج الحجز في المرحلة التالية.',
    language: 'اللغة',
    home: 'الرئيسية',
    requests: 'الطلبات',
    history: 'السجل',
    profile: 'حسابي',
  },
  fr: {
    brand: 'Wessali',
    tagline: 'Transport et assistance, au même endroit',
    welcome: 'Comment pouvons-nous vous aider aujourd’hui ?',
    chooseService: 'Choisissez le service dont vous avez besoin',
    customerMode: 'Demander un service',
    providerMode: 'Proposer mes services',
    comingSoon: 'Bientôt disponible',
    bookingPreview: 'Le formulaire de réservation sera ajouté à la prochaine étape.',
    language: 'Langue',
    home: 'Accueil',
    requests: 'Demandes',
    history: 'Historique',
    profile: 'Profil',
  },
  en: {
    brand: 'Wessali',
    tagline: 'Transport and assistance in one place',
    welcome: 'How can we help you today?',
    chooseService: 'Choose the service you need',
    customerMode: 'Request a service',
    providerMode: 'Offer services',
    comingSoon: 'Coming soon',
    bookingPreview: 'The booking form will be connected in the next implementation stage.',
    language: 'Language',
    home: 'Home',
    requests: 'Requests',
    history: 'History',
    profile: 'Profile',
  },
} as const;

export type Locale = keyof typeof messages;
export const DEFAULT_LOCALE: Locale = 'ar';

export function isLocale(value: string): value is Locale {
  return value in messages;
}

export function getMessages(locale: Locale) {
  return messages[locale];
}

export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
