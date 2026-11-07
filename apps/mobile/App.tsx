import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  ImageBackground,
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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SERVICE_CATEGORIES, type ServiceKind } from '@wessali/contracts';
import { DEFAULT_LOCALE, getDirection, getMessages, type Locale } from '@wessali/i18n';

type Role = 'customer' | 'provider';
type Screen = 'home' | 'booking' | 'history' | 'about';
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
  created_at?: string;
  requested_at?: string | null;
  freight?: Record<string, unknown> | null;
  roadside?: Record<string, unknown> | null;
  water?: Record<string, unknown> | null;
};

const photo = {
  freight:
    'https://images.pexels.com/photos/5410923/pexels-photo-5410923.jpeg?auto=compress&cs=tinysrgb&w=1400',
  roadside:
    'https://images.pexels.com/photos/6140995/pexels-photo-6140995.jpeg?auto=compress&cs=tinysrgb&w=1400',
  water:
    'https://images.pexels.com/photos/37899833/pexels-photo-37899833/free-photo-of-yellow-water-tanker-truck-by-seaside-in-foca.jpeg?auto=compress&cs=tinysrgb&w=1400',
};

const words = {
  ar: {
    brand: 'وصلي',
    tagline: 'نقل، لوجستيك ومساعدة ميدانية',
    greeting: 'مرحباً،',
    welcome: 'كل خدمات الطريق في مكان واحد',
    welcomeSub: 'من الشحنة إلى الديباناج وصهريج المياه، وصلي يقرّبك من مقدم الخدمة المناسب.',
    choose: 'ماذا تحتاج اليوم؟',
    services: 'خدماتنا',
    freight: 'نقل البضائع',
    freightShort: 'شحنات، سلع ورحلات بين الولايات',
    roadside: 'الديباناج والمساعدة',
    roadsideShort: 'مساعدة ميكانيكية وسحب عند الحاجة',
    water: 'صهاريج المياه',
    waterShort: 'توصيل للمنازل والخزانات والاستغلال الفلاحي',
    start: 'اطلب الخدمة',
    learn: 'اكتشف وصلي',
    how: 'كيف تعمل وصلي؟',
    step1: 'اختر الخدمة',
    step1d: 'حدد نوع الطلب وأدخل التفاصيل الأساسية.',
    step2: 'أرسل موقعك',
    step2d: 'اكتب عنوان الاستلام والوجهة عند الحاجة.',
    step3: 'استقبل مقدم الخدمة',
    step3d: 'يعاين مقدم الخدمة المؤهل الطلب ويقبله.',
    step4: 'تابع التنفيذ',
    step4d: 'تابع تحديثات المهمة حتى اكتمالها.',
    story: 'منصة جزائرية لخدمات أكثر تنظيماً',
    storySub: 'نربط أصحاب السلع والسائقين والفلاحين والمواطنين بمنظومة رقمية واحدة.',
    corridor: 'الشرق الجزائري ↔ العاصمة',
    trustTitle: 'خدمات واضحة. طلبات منظمة.',
    trustSub: 'هدفنا تقليل الوقت الضائع وتحسين استغلال الموارد ورفع الثقة بين طالب الخدمة ومقدمها.',
    about: 'عن وصلي',
    history: 'طلباتي',
    home: 'الرئيسية',
    login: 'ابدأ مع وصلي',
    loginSub: 'سجل دخولك لإنشاء الطلبات ومتابعتها.',
    name: 'الاسم الكامل',
    phone: 'رقم الهاتف الدولي',
    api: 'عنوان خادم API',
    showServer: 'إعدادات الاتصال',
    hideServer: 'إخفاء إعدادات الاتصال',
    customer: 'أطلب خدمة',
    provider: 'أقدم خدمة',
    continue: 'متابعة',
    logout: 'تسجيل الخروج',
    refresh: 'تحديث',
    back: 'رجوع',
    pickup: 'عنوان الاستلام أو موقعك',
    destination: 'عنوان الوجهة',
    cargo: 'وصف البضاعة',
    weight: 'الوزن التقريبي بالكيلوغرام',
    truckType: 'نوع الشاحنة',
    loading: 'متطلبات التحميل',
    vehicle: 'نوع المركبة',
    issue: 'نوع العطل',
    towing: 'أحتاج إلى سحب المركبة',
    towingDestination: 'وجهة السحب',
    quantity: 'الكمية باللتر',
    intendedUse: 'الاستخدام',
    waterCategory: 'نوع المياه',
    notes: 'ملاحظات إضافية',
    create: 'إرسال الطلب',
    cancel: 'إلغاء',
    details: 'تفاصيل الخدمة',
    select: 'اختر',
    required: 'يرجى إكمال الحقول المطلوبة.',
    signInError: 'تحقق من الاسم ورقم الهاتف بصيغة دولية مثل +213555123456.',
    loadingText: 'جارٍ التنفيذ...',
    saved: 'تم بنجاح',
    submitted: 'تم إرسال طلبك بنجاح',
    noBookings: 'لا توجد طلبات بعد',
    status: 'الحالة',
    providerName: 'مقدم الخدمة',
    submittedStatus: 'تم الإرسال',
    matching: 'البحث عن مقدم خدمة',
    offer_received: 'عرض متاح',
    accepted: 'تم قبول الطلب',
    provider_en_route: 'مقدم الخدمة في الطريق',
    arrived: 'وصل مقدم الخدمة',
    in_progress: 'الخدمة قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    expired: 'منتهي',
    disputed: 'قيد المراجعة',
    draft: 'مسودة',
    available: 'الطلبات المتاحة',
    jobs: 'مهامي الحالية',
    applyTitle: 'انضم إلى شبكة مقدمي الخدمات',
    applySub: 'قدّم معلومات نشاطك واختر الخدمات التي تستطيع توفيرها.',
    business: 'اسم النشاط أو المؤسسة',
    serviceTypes: 'الخدمات التي تقدمها',
    apply: 'إرسال طلب الانضمام',
    pending: 'طلبك قيد مراجعة الإدارة',
    approved: 'تم اعتماد حسابك',
    notApplied: 'لم تقدم طلب انضمام بعد',
    accept: 'قبول الطلب',
    advance: 'تحديث حالة المهمة',
    noRequests: 'لا توجد طلبات متاحة حالياً',
    noJobs: 'ليست لديك مهام نشطة حالياً',
    safety: 'في حالة عطل على الطريق، انتقل إلى مكان آمن إن أمكن. وصلي لا يحل محل خدمات الطوارئ.',
    waterNote:
      'تصنيف المياه تصريح من مقدم الخدمة وليس شهادة صلاحية للشرب. تحقق من المصدر قبل الاستلام.',
    potable: 'مصرح بأنها صالحة للشرب',
    nonPotable: 'غير صالحة للشرب',
    irrigation: 'للري',
    residential: 'منزلي',
    agricultural: 'فلاحي',
    other: 'أخرى',
    car: 'سيارة',
    motorcycle: 'دراجة نارية',
    van: 'شاحنة صغيرة',
    truck: 'شاحنة',
    pickupTruck: 'بيك أب',
    flatbed: 'سطحة',
    boxTruck: 'شاحنة مغلقة',
    semi: 'مقطورة',
    mechanical: 'ميكانيكي',
    tyre: 'عجلة',
    battery: 'بطارية',
    fuel: 'وقود',
    towingIssue: 'سحب',
    error: 'حدث خطأ، حاول مرة أخرى.',
    market: 'مشاكل السوق التي نعالجها',
    problem1: 'العودة الفارغة للشاحنات',
    problem1d: 'تعود شاحنات كثيرة دون حمولة بعد التفريغ، ما يرفع التكاليف ويهدر فرص النقل.',
    problem2: 'تعطل سلاسل الإمداد',
    problem2d: 'غياب آلية سريعة ومنظمة لطلب المساعدة الميدانية عند تعطل المركبات في الطرق.',
    problem3: 'صعوبة تأمين المياه',
    problem3d: 'تتأخر تلبية احتياجات المنازل والمزارع من الصهاريج عبر الطرق التقليدية.',
    solutions: 'الحلول المقترحة',
    solution1: 'ربط الشحنات بالشاحنات المتاحة واستغلال رحلات العودة لتقليل التكلفة.',
    solution2: 'تسهيل الوصول إلى خدمات الديباناج والمساعدة الميدانية.',
    solution3: 'ربط المنازل والفلاحين بشبكة صهاريج متنقلة لتلبية الطلب.',
    company: 'نبذة عن المؤسسة الناشئة',
    companyText:
      'وصلي منصة رقمية جزائرية تهدف إلى تنظيم خدمات اللوجستيك والنقل والمساعدة الميدانية عبر تطبيق وموقع إلكتروني. تجمع المنصة بين اقتصاد المشاركة وتكنولوجيا المعلومات لتسهيل الربط بين التجار والسائقين والفلاحين والمواطنين، وتحويل الخدمات التقليدية المتفرقة إلى منظومة ذكية وأكثر كفاءة. تنطلق الرؤية من الخطوط الحيوية الرابطة بين ولايات الشرق الجزائري والعاصمة.',
    workflow: 'كيف يعمل التطبيق؟',
    customerFlow: 'واجهة العميل',
    customerFlowD:
      'يختار المستفيد نقل البضائع أو الديباناج أو توصيل المياه، ثم يحدد مكان الخدمة وتفاصيل الطلب.',
    providerFlow: 'واجهة مقدم الخدمة',
    providerFlowD:
      'تصل الطلبات المناسبة إلى مقدمي الخدمات المسجلين، ويمكن للمؤهل منهم معاينة الطلب وقبوله.',
    execution: 'التنفيذ والمتابعة',
    executionD: 'يتم تحديث حالة المهمة عبر مراحل التنفيذ حتى اكتمالها.',
    team: 'أعضاء المشروع',
    amjad: 'أمجد رزيق',
    omar: 'مزهود عمر',
    supervisor: 'إشراف الأستاذ رابح بنور',
    student: 'طلبة الإعلام الآلي',
    companyLabel: 'مؤسسة ناشئة · الجزائر',
    featureNote: 'نسخة تجريبية قيد التطوير',
    featureNoteD:
      'تعمل حالياً طلبات الخدمات ومراجعة مقدمي الخدمة وتحديث حالة المهام. التتبع المباشر عبر GPS والدفع الإلكتروني والتحقق الحقيقي من الهاتف تتطلب خدمات خلفية وتكاملات مستقلة قبل الإطلاق العام.',
    language: 'اللغة',
    languageArabic: 'العربية',
    languageFrench: 'Français',
    languageEnglish: 'English',
    footer: 'وصلي · الجزائر',
  },
  fr: {
    brand: 'Wessali',
    tagline: 'Transport, logistique et assistance terrain',
    greeting: 'Bonjour,',
    welcome: 'Les services de la route, réunis au même endroit',
    welcomeSub:
      'Du transport au dépannage et à la livraison d’eau, Wessali vous rapproche du bon prestataire.',
    choose: 'De quoi avez-vous besoin ?',
    services: 'Nos services',
    freight: 'Transport de marchandises',
    freightShort: 'Fret, marchandises et trajets inter-wilayas',
    roadside: 'Dépannage et assistance',
    roadsideShort: 'Assistance mécanique et remorquage',
    water: 'Citernes d’eau',
    waterShort: 'Livraison pour maisons, réservoirs et exploitations agricoles',
    start: 'Demander le service',
    learn: 'Découvrir Wessali',
    how: 'Comment ça marche ?',
    step1: 'Choisir le service',
    step1d: 'Sélectionnez le type de demande et ses détails.',
    step2: 'Indiquer le lieu',
    step2d: 'Saisissez le lieu de prise en charge et la destination si nécessaire.',
    step3: 'Recevoir un prestataire',
    step3d: 'Un prestataire qualifié consulte et accepte la demande.',
    step4: 'Suivre la mission',
    step4d: 'Consultez les mises à jour jusqu’à la fin du service.',
    story: 'Une plateforme algérienne pour des services mieux organisés',
    storySub:
      'Nous rapprochons commerçants, chauffeurs, agriculteurs et citoyens dans un même écosystème numérique.',
    corridor: 'Est algérien ↔ Alger',
    trustTitle: 'Des services clairs. Des demandes organisées.',
    trustSub:
      'Réduire le temps perdu, mieux utiliser les ressources et renforcer la confiance entre clients et prestataires.',
    about: 'À propos',
    history: 'Mes demandes',
    home: 'Accueil',
    login: 'Bienvenue sur Wessali',
    loginSub: 'Connectez-vous pour créer et suivre vos demandes.',
    name: 'Nom complet',
    phone: 'Téléphone au format international',
    api: 'Adresse du serveur API',
    showServer: 'Connexion serveur',
    hideServer: 'Masquer la connexion',
    customer: 'Demander un service',
    provider: 'Proposer un service',
    continue: 'Continuer',
    logout: 'Déconnexion',
    refresh: 'Actualiser',
    back: 'Retour',
    pickup: 'Adresse de prise en charge ou lieu',
    destination: 'Adresse de destination',
    cargo: 'Description de la marchandise',
    weight: 'Poids estimé en kg',
    truckType: 'Type de camion',
    loading: 'Exigences de chargement',
    vehicle: 'Type de véhicule',
    issue: 'Type de panne',
    towing: 'J’ai besoin d’un remorquage',
    towingDestination: 'Destination du remorquage',
    quantity: 'Quantité en litres',
    intendedUse: 'Utilisation',
    waterCategory: 'Catégorie d’eau',
    notes: 'Notes supplémentaires',
    create: 'Envoyer la demande',
    cancel: 'Annuler',
    details: 'Détails du service',
    select: 'Choisir',
    required: 'Veuillez remplir les champs obligatoires.',
    signInError: 'Vérifiez le nom et le téléphone international, par ex. +213555123456.',
    loadingText: 'En cours...',
    saved: 'Enregistré',
    submitted: 'Votre demande a été envoyée',
    noBookings: 'Aucune demande pour le moment',
    status: 'Statut',
    providerName: 'Prestataire',
    submittedStatus: 'Envoyée',
    matching: 'Recherche d’un prestataire',
    offer_received: 'Offre reçue',
    accepted: 'Demande acceptée',
    provider_en_route: 'Prestataire en route',
    arrived: 'Prestataire arrivé',
    in_progress: 'Service en cours',
    completed: 'Terminé',
    cancelled: 'Annulée',
    expired: 'Expirée',
    disputed: 'En vérification',
    draft: 'Brouillon',
    available: 'Demandes disponibles',
    jobs: 'Mes missions',
    applyTitle: 'Rejoignez le réseau de prestataires',
    applySub: 'Présentez votre activité et sélectionnez les services que vous proposez.',
    business: 'Nom de l’activité ou de l’entreprise',
    serviceTypes: 'Services proposés',
    apply: 'Envoyer la candidature',
    pending: 'Votre candidature est en cours de vérification',
    approved: 'Votre compte est approuvé',
    notApplied: 'Vous n’avez pas encore déposé de candidature',
    accept: 'Accepter la demande',
    advance: 'Mettre à jour le statut',
    noRequests: 'Aucune demande disponible pour le moment',
    noJobs: 'Aucune mission active',
    safety:
      'En cas de panne, rejoignez un endroit sûr si possible. Wessali ne remplace pas les services d’urgence.',
    waterNote:
      'La catégorie est déclarée par le prestataire et ne certifie pas la potabilité. Vérifiez la source avant livraison.',
    potable: 'Déclarée potable',
    nonPotable: 'Non potable',
    irrigation: 'Irrigation',
    residential: 'Résidentiel',
    agricultural: 'Agricole',
    other: 'Autre',
    car: 'Voiture',
    motorcycle: 'Moto',
    van: 'Fourgon',
    truck: 'Camion',
    pickupTruck: 'Pickup',
    flatbed: 'Plateau',
    boxTruck: 'Camion fermé',
    semi: 'Semi-remorque',
    mechanical: 'Mécanique',
    tyre: 'Pneu',
    battery: 'Batterie',
    fuel: 'Carburant',
    towingIssue: 'Remorquage',
    error: 'Une erreur est survenue. Réessayez.',
    market: 'Les problèmes du marché',
    problem1: 'Les retours à vide des camions',
    problem1d:
      'De nombreux camions repartent sans chargement après livraison, ce qui augmente les coûts et gaspille des trajets.',
    problem2: 'Les interruptions de la chaîne logistique',
    problem2d:
      'Il manque un moyen rapide et organisé de demander une assistance sur route en cas de panne.',
    problem3: 'L’approvisionnement en eau',
    problem3d:
      'Les besoins des foyers et des exploitations agricoles en citernes sont parfois satisfaits tardivement.',
    solutions: 'Les solutions proposées',
    solution1: 'Relier les marchandises aux camions disponibles et valoriser les trajets retour.',
    solution2: 'Faciliter l’accès au dépannage et à l’assistance sur le terrain.',
    solution3: 'Relier foyers et agriculteurs à un réseau mobile de citernes.',
    company: 'À propos de la startup',
    companyText:
      'Wessali est une plateforme numérique algérienne qui vise à organiser les services de logistique, de transport et d’assistance terrain via une application et un site web. Elle associe économie du partage et technologies de l’information pour rapprocher commerçants, chauffeurs, agriculteurs et citoyens. Sa vision est de transformer des services traditionnels dispersés en un écosystème intelligent et efficace, en ciblant d’abord les axes reliant l’Est algérien à la capitale.',
    workflow: 'Comment fonctionne l’application ?',
    customerFlow: 'Espace client',
    customerFlowD:
      'Le client choisit le transport, le dépannage ou une citerne d’eau, puis renseigne le lieu et les détails.',
    providerFlow: 'Espace prestataire',
    providerFlowD:
      'Les demandes adaptées sont proposées aux prestataires inscrits et approuvés, qui peuvent les consulter et les accepter.',
    execution: 'Exécution et suivi',
    executionD: 'Le statut de la mission est mis à jour à chaque étape jusqu’à sa clôture.',
    team: 'Équipe du projet',
    amjad: 'Amjad Rziq',
    omar: 'Mazhoud Omar',
    supervisor: 'Encadrement : Pr. Rabah Banour',
    student: 'Étudiants en informatique',
    companyLabel: 'Startup · Algérie',
    featureNote: 'Version de démonstration en développement',
    featureNoteD:
      'Les demandes, la validation des prestataires et les mises à jour de statut fonctionnent. Le GPS en direct, le paiement électronique et la vérification réelle du téléphone nécessitent des services et intégrations supplémentaires avant le lancement public.',
    language: 'Langue',
    languageArabic: 'العربية',
    languageFrench: 'Français',
    languageEnglish: 'English',
    footer: 'Wessali · Algérie',
  },
  en: {
    brand: 'Wessali',
    tagline: 'Transport, logistics and field assistance',
    greeting: 'Hello,',
    welcome: 'Road services, brought together in one place',
    welcomeSub:
      'From freight to roadside help and water delivery, Wessali connects you with the right provider.',
    choose: 'What do you need today?',
    services: 'Our services',
    freight: 'Freight transport',
    freightShort: 'Shipments, goods and inter-wilaya routes',
    roadside: 'Roadside assistance',
    roadsideShort: 'Mechanical help and vehicle recovery',
    water: 'Water tankers',
    waterShort: 'Delivery for homes, tanks and farms',
    start: 'Request service',
    learn: 'Discover Wessali',
    how: 'How Wessali works',
    step1: 'Choose a service',
    step1d: 'Select the request type and enter the key details.',
    step2: 'Set the location',
    step2d: 'Enter the pickup point and destination when needed.',
    step3: 'Connect with a provider',
    step3d: 'An eligible provider reviews and accepts the request.',
    step4: 'Follow the job',
    step4d: 'See status updates until the service is complete.',
    story: 'An Algerian platform for better-organized services',
    storySub: 'Connecting merchants, drivers, farmers and citizens through one digital ecosystem.',
    corridor: 'Eastern Algeria ↔ Algiers',
    trustTitle: 'Clear services. Organized requests.',
    trustSub:
      'Reduce wasted time, use resources more efficiently and build trust between customers and providers.',
    about: 'About',
    history: 'My requests',
    home: 'Home',
    login: 'Welcome to Wessali',
    loginSub: 'Sign in to create and follow your service requests.',
    name: 'Full name',
    phone: 'International phone number',
    api: 'API server address',
    showServer: 'Connection settings',
    hideServer: 'Hide connection settings',
    customer: 'Request a service',
    provider: 'Offer a service',
    continue: 'Continue',
    logout: 'Sign out',
    refresh: 'Refresh',
    back: 'Back',
    pickup: 'Pickup address or location',
    destination: 'Destination address',
    cargo: 'Cargo description',
    weight: 'Estimated weight in kg',
    truckType: 'Truck type',
    loading: 'Loading requirements',
    vehicle: 'Vehicle type',
    issue: 'Issue category',
    towing: 'I need towing',
    towingDestination: 'Towing destination',
    quantity: 'Quantity in litres',
    intendedUse: 'Intended use',
    waterCategory: 'Water category',
    notes: 'Additional notes',
    create: 'Submit request',
    cancel: 'Cancel',
    details: 'Service details',
    select: 'Select',
    required: 'Please complete the required fields.',
    signInError: 'Check your name and international phone, e.g. +213555123456.',
    loadingText: 'Working...',
    saved: 'Saved',
    submitted: 'Your request has been submitted',
    noBookings: 'No requests yet',
    status: 'Status',
    providerName: 'Service provider',
    submittedStatus: 'Submitted',
    matching: 'Finding a provider',
    offer_received: 'Offer received',
    accepted: 'Request accepted',
    provider_en_route: 'Provider en route',
    arrived: 'Provider arrived',
    in_progress: 'Service in progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    expired: 'Expired',
    disputed: 'Under review',
    draft: 'Draft',
    available: 'Available requests',
    jobs: 'My active jobs',
    applyTitle: 'Join the Wessali provider network',
    applySub: 'Tell us about your business and select the services you can provide.',
    business: 'Business or activity name',
    serviceTypes: 'Services you provide',
    apply: 'Submit provider application',
    pending: 'Your application is being reviewed',
    approved: 'Your account is approved',
    notApplied: 'You have not applied as a provider yet',
    accept: 'Accept request',
    advance: 'Update job status',
    noRequests: 'No requests are available right now',
    noJobs: 'You have no active jobs',
    safety:
      'For roadside breakdowns, move to a safe place if possible. Wessali does not replace emergency services.',
    waterNote:
      'This category is declared by the provider, not a drinking-water certification. Verify the source before delivery.',
    potable: 'Provider-declared potable',
    nonPotable: 'Non-potable',
    irrigation: 'Irrigation',
    residential: 'Residential',
    agricultural: 'Agricultural',
    other: 'Other',
    car: 'Car',
    motorcycle: 'Motorcycle',
    van: 'Van',
    truck: 'Truck',
    pickupTruck: 'Pickup',
    flatbed: 'Flatbed',
    boxTruck: 'Box truck',
    semi: 'Semi-trailer',
    mechanical: 'Mechanical',
    tyre: 'Tyre',
    battery: 'Battery',
    fuel: 'Fuel',
    towingIssue: 'Towing',
    error: 'Something went wrong. Please try again.',
    market: 'Market problems we address',
    problem1: 'Empty return journeys',
    problem1d:
      'Many trucks return without cargo after unloading, increasing costs and wasting transport capacity.',
    problem2: 'Roadside supply-chain interruptions',
    problem2d:
      'Drivers lack a fast, organized way to request field assistance when a vehicle breaks down on the road.',
    problem3: 'Difficult water access',
    problem3d:
      'Homes and farms can struggle to arrange timely tanker deliveries through traditional channels.',
    solutions: 'Our proposed solutions',
    solution1: 'Connect shipments to available trucks and make better use of return journeys.',
    solution2: 'Make roadside assistance and on-site support easier to request.',
    solution3: 'Connect households and farmers to a mobile water-tanker network.',
    company: 'About the startup',
    companyText:
      'Wessali is an Algerian digital platform designed to organize logistics, transport and field-assistance services through a mobile app and website. It combines the sharing economy with information technology to connect merchants, drivers, farmers and citizens. Its vision is to turn fragmented traditional services into a smarter, more efficient ecosystem, initially focusing on the vital routes linking eastern Algerian wilayas with the capital.',
    workflow: 'How the app works',
    customerFlow: 'Customer experience',
    customerFlowD:
      'Customers choose freight, roadside assistance or water delivery, then enter the service location and request details.',
    providerFlow: 'Provider experience',
    providerFlowD:
      'Suitable requests are presented to registered providers; eligible providers can review and accept them.',
    execution: 'Service execution and updates',
    executionD: 'The job status is updated through its milestones until completion.',
    team: 'Project members',
    amjad: 'Amjad Rziq',
    omar: 'Mazhoud Omar',
    supervisor: 'Supervisor: Prof. Rabah Banour',
    student: 'Computer science students',
    companyLabel: 'Startup · Algeria',
    featureNote: 'Development preview',
    featureNoteD:
      'Service requests, provider approval checks and job-status updates are working. Live GPS tracking, electronic payments and real phone verification still require dedicated backend services and integrations before public launch.',
    language: 'Language',
    languageArabic: 'العربية',
    languageFrench: 'Français',
    languageEnglish: 'English',
    footer: 'Wessali · Algeria',
  },
} as const;

const serviceContent: Record<ServiceKind, { photo: string; icon: string; accent: string }> = {
  freight: { photo: photo.freight, icon: '↗', accent: '#D6A15C' },
  roadside: { photo: photo.roadside, icon: '⌁', accent: '#E27C69' },
  water: { photo: photo.water, icon: '◌', accent: '#5B9EAA' },
};

const statusSteps = [
  'submitted',
  'matching',
  'offer_received',
  'accepted',
  'provider_en_route',
  'arrived',
  'in_progress',
  'completed',
];

function cleanBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

async function apiRequest<T>(
  baseUrl: string,
  path: string,
  token?: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(cleanBaseUrl(baseUrl) + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
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
    throw new Error(record?.message ?? 'HTTP ' + response.status);
  }
  return data as T;
}


type MotionPressableProps = Omit<ComponentProps<typeof Pressable>, 'style'> & {
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
};

function MotionPressable({
  children,
  style,
  onPressIn,
  onPressOut,
  ...props
}: MotionPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateScale = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      damping: 20,
      stiffness: 280,
      mass: 0.65,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <MotionPressable
        {...props}
        style={styles.motionPressableInner}
        onPressIn={(event) => {
          animateScale(0.975);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          animateScale(1);
          onPressOut?.(event);
        }}
      >
        {children}
      </MotionPressable>
    </Animated.View>
  );
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [apiBaseUrl, setApiBaseUrl] = useState(
    process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://192.168.2.2:4000/v1',
  );
  const [apiInput, setApiInput] = useState(apiBaseUrl);
  const [showServer, setShowServer] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [screen, setScreen] = useState<Screen>('home');
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
  const scrollY = useRef(new Animated.Value(0)).current;
  const screenProgress = useRef(new Animated.Value(1)).current;
  const bottomGlow = useRef(new Animated.Value(0)).current;

  const copy = getMessages(locale);
  const ui = words[locale];
  const isRtl = getDirection(locale) === 'rtl';
  const directionStyle = isRtl ? styles.textRtl : styles.textLtr;
  const rowStyle = isRtl ? styles.rowReverse : undefined;
  const brandTitle = locale === 'ar' ? 'وصلي' : 'Wessali';
  const heroGlowOpacity = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [0.92, 0.16],
    extrapolate: 'clamp',
  });
  const heroGlowScale = scrollY.interpolate({
    inputRange: [0, 220],
    outputRange: [1, 0.78],
    extrapolate: 'clamp',
  });
  const screenOpacity = screenProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.78, 1],
  });
  const screenTranslateY = screenProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });
  const bottomGlowOpacity = bottomGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.46],
  });
  const bottomGlowScale = bottomGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.08],
  });

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
    // Refresh when the authenticated identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  useEffect(() => {
    screenProgress.setValue(0);
    Animated.spring(screenProgress, {
      toValue: 1,
      damping: 22,
      stiffness: 165,
      mass: 0.85,
      useNativeDriver: true,
    }).start();
  }, [screen, screenProgress]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(bottomGlow, {
          toValue: 1,
          duration: 2300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bottomGlow, {
          toValue: 0,
          duration: 2300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [bottomGlow]);

  async function signIn() {
    if (name.trim().length < 2 || !/^\+[1-9]\d{7,14}$/.test(phone.trim())) {
      setError(ui.signInError);
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
      setScreen('home');
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
        // Clear the local session even when the API is offline.
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
    setNeedsTowing(false);
    setError('');
    setNotice('');
    setScreen('booking');
  }

  async function submitBooking() {
    if (!session || pickupAddress.trim().length < 3) {
      setError(ui.required);
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
        setError(ui.required);
        return;
      }
      const weight = Number(weightKg);
      if (!Number.isFinite(weight) || weight <= 0) {
        setError(ui.required);
        return;
      }
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
        towingDestination: needsTowing ? towingDestination.trim() : undefined,
      };
    } else {
      const quantity = Number(quantityLitres);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        setError(ui.required);
        return;
      }
      payload = {
        ...common,
        quantityLitres: quantity,
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
      await apiRequest(apiBaseUrl, '/bookings/' + id + '/cancel', session.accessToken, {
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
      setError(ui.required);
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
      await apiRequest(apiBaseUrl, '/providers/bookings/' + id + '/accept', session.accessToken, {
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
      await apiRequest(apiBaseUrl, '/providers/bookings/' + id + '/advance', session.accessToken, {
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

  const serviceTitle = (kind: ServiceKind) => {
    if (kind === 'freight') return ui.freight;
    if (kind === 'roadside') return ui.roadside;
    return ui.water;
  };

  const serviceDescription = (kind: ServiceKind) => {
    if (kind === 'freight') return ui.freightShort;
    if (kind === 'roadside') return ui.roadsideShort;
    return ui.waterShort;
  };

  const selectedServiceCopy = useMemo(
    () => SERVICE_CATEGORIES.find((service) => service.id === selectedService),
    [selectedService],
  );

  const renderField = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    placeholder?: string,
    keyboardType: 'default' | 'numeric' | 'phone-pad' = 'default',
    multiline = false,
  ) => (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, directionStyle]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#9AA6B2"
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
      <View style={[styles.choiceWrap, rowStyle]}>
        {options.map((option) => (
          <MotionPressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.choice, value === option.value && styles.choiceActive]}
          >
            <Text style={[styles.choiceText, value === option.value && styles.choiceTextActive]}>
              {option.label}
            </Text>
          </MotionPressable>
        ))}
      </View>
    </View>
  );

  const renderPill = (label: string, active: boolean, onPress: () => void) => (
    <MotionPressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </MotionPressable>
  );

  const renderStatus = (status: string) => {
    const failed = status === 'cancelled' || status === 'expired' || status === 'disputed';
    return (
      <View
        style={[styles.statusBadge, failed ? styles.statusBadgeMuted : styles.statusBadgeActive]}
      >
        <View style={[styles.statusDot, failed ? styles.statusDotMuted : styles.statusDotActive]} />
        <Text
          style={[styles.statusText, failed ? styles.statusTextMuted : styles.statusTextActive]}
        >
          {statusLabel(status)}
        </Text>
      </View>
    );
  };

  const renderProgress = (status: string) => {
    const current = statusSteps.indexOf(status);
    const isDone = status === 'completed';
    return (
      <View style={styles.progressWrap}>
        {statusSteps.map((step, index) => {
          const reached = current >= index || isDone;
          return (
            <View key={step} style={styles.progressStep}>
              <View style={[styles.progressNode, reached && styles.progressNodeActive]}>
                {reached ? (
                  <Text style={styles.progressCheck}>✓</Text>
                ) : (
                  <View style={styles.progressInner} />
                )}
              </View>
              {index < statusSteps.length - 1 ? (
                <View style={[styles.progressLine, reached && styles.progressLineActive]} />
              ) : null}
            </View>
          );
        })}
      </View>
    );
  };

  const renderBookingCard = (booking: Booking, providerMode = false) => {
    const detail =
      booking.service_type === 'freight'
        ? String(booking.freight?.cargo_description ?? '')
        : booking.service_type === 'roadside'
          ? String(booking.roadside?.issue_category ?? '')
          : booking.water
            ? String(booking.water.quantity_litres ?? '') + ' L'
            : '';
    const canCancel =
      !providerMode && ['submitted', 'matching', 'offer_received'].includes(booking.status);

    return (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={[styles.bookingTop, rowStyle]}>
          <View style={styles.referenceBlock}>
            <Text style={styles.overline}>WESSALI · {booking.public_reference}</Text>
            <Text style={[styles.bookingService, directionStyle]}>
              {serviceTitle(booking.service_type)}
            </Text>
          </View>
          {renderStatus(booking.status)}
        </View>
        <View style={[styles.routeBlock, rowStyle]}>
          <View style={styles.routePinColumn}>
            <View style={styles.routePinStart} />
            <View style={styles.routePinLine} />
            <View style={styles.routePinEnd} />
          </View>
          <View style={styles.routeLabels}>
            <Text style={[styles.routeCaption, directionStyle]}>{ui.pickup}</Text>
            <Text style={[styles.routeAddress, directionStyle]}>{booking.pickup_address}</Text>
            {booking.destination_address ? (
              <>
                <Text style={[styles.routeCaption, directionStyle, { marginTop: 9 }]}>
                  {ui.destination}
                </Text>
                <Text style={[styles.routeAddress, directionStyle]}>
                  {booking.destination_address}
                </Text>
              </>
            ) : null}
          </View>
        </View>
        {detail ? <Text style={[styles.bookingDetail, directionStyle]}>{detail}</Text> : null}
        {booking.provider_name ? (
          <Text style={[styles.providerName, directionStyle]}>
            {ui.providerName}: {booking.provider_name}
          </Text>
        ) : null}
        {!providerMode && !['cancelled', 'expired', 'disputed'].includes(booking.status)
          ? renderProgress(booking.status)
          : null}
        {providerMode ? (
          <MotionPressable
            style={styles.primaryButton}
            onPress={() => void acceptRequest(booking.id)}
            disabled={busy}
          >
            <Text style={styles.primaryButtonText}>{busy ? ui.loadingText : ui.accept}</Text>
          </MotionPressable>
        ) : canCancel ? (
          <MotionPressable
            style={styles.cancelButton}
            onPress={() => void cancelBooking(booking.id)}
            disabled={busy}
          >
            <Text style={styles.cancelButtonText}>{ui.cancel}</Text>
          </MotionPressable>
        ) : null}
      </View>
    );
  };

  const renderLanguagePicker = () => (
    <View style={[styles.languageSwitch, rowStyle]}>
      {(['ar', 'fr', 'en'] as const).map((item) => (
        <MotionPressable
          key={item}
          onPress={() => setLocale(item)}
          style={[styles.languageButton, locale === item && styles.languageButtonActive]}
        >
          <Text style={[styles.languageText, locale === item && styles.languageTextActive]}>
            {item.toUpperCase()}
          </Text>
        </MotionPressable>
      ))}
    </View>
  );

  const renderServiceCard = (kind: ServiceKind, index: number) => {
    const item = serviceContent[kind];
    return (
      <MotionPressable key={kind} onPress={() => beginBooking(kind)} style={styles.serviceCard}>
        <ImageBackground
          source={{ uri: item.photo }}
          style={styles.serviceImage}
          imageStyle={styles.serviceImageRadius}
          resizeMode="cover"
        >
          <View style={styles.imageShade} />
          <View style={[styles.serviceImageTop, rowStyle]}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>{item.icon}</Text>
            </View>
            <Text style={styles.serviceNumber}>0{index + 1}</Text>
          </View>
          <View style={styles.serviceImageBottom}>
            <Text style={[styles.serviceTitle, directionStyle]}>{serviceTitle(kind)}</Text>
            <Text style={[styles.serviceDescription, directionStyle]}>
              {serviceDescription(kind)}
            </Text>
            <View style={[styles.cardAction, rowStyle]}>
              <Text style={styles.cardActionText}>{ui.start}</Text>
              <Text style={styles.cardActionArrow}>{isRtl ? '←' : '↗'}</Text>
            </View>
          </View>
        </ImageBackground>
      </MotionPressable>
    );
  };

  const renderLogin = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.loginScroll} keyboardShouldPersistTaps="handled">
        {renderLanguagePicker()}
        <View style={styles.loginVisual}>
          <View style={styles.glowOrbOne} />
          <View style={styles.glowOrbTwo} />
          <ImageBackground
            source={{ uri: photo.freight }}
            style={styles.loginPhoto}
            imageStyle={styles.loginPhotoRadius}
            resizeMode="cover"
          >
            <View style={styles.loginPhotoShade} />
            <View style={styles.brandChip}>
              <Text style={styles.brandChipMark}>W</Text>
              <Text style={styles.brandChipText}>{brandTitle}</Text>
            </View>
            <View style={styles.loginPhotoCopy}>
              <Text style={styles.loginPhotoEyebrow}>ALGERIA · CONNECTED SERVICES</Text>
              <Text style={[styles.loginPhotoTitle, isRtl && styles.arabicHero]}>{ui.welcome}</Text>
              <Text style={styles.loginPhotoSub}>{ui.welcomeSub}</Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.loginHeading}>
          <Text style={[styles.loginTitle, directionStyle]}>{ui.login}</Text>
          <Text style={[styles.loginSubtitle, directionStyle]}>{ui.loginSub}</Text>
        </View>

        <View style={styles.glassPanel}>
          {renderField(ui.name, name, setName)}
          {renderField(ui.phone, phone, setPhone, '+213555123456', 'phone-pad')}
          {showServer
            ? renderField(ui.api, apiInput, setApiInput, 'http://192.168.2.2:4000/v1')
            : null}
          <MotionPressable onPress={() => setShowServer((value) => !value)} style={styles.serverToggle}>
            <Text style={styles.serverToggleText}>
              {showServer ? ui.hideServer : ui.showServer}
            </Text>
            <Text style={styles.serverToggleGlyph}>{showServer ? '−' : '+'}</Text>
          </MotionPressable>

          <View style={[styles.roleSwitch, rowStyle]}>
            {renderPill(ui.customer, role === 'customer', () => setRole('customer'))}
            {renderPill(ui.provider, role === 'provider', () => setRole('provider'))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <MotionPressable
            style={styles.primaryButtonLarge}
            onPress={() => void signIn()}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>{ui.continue}</Text>
                <Text style={styles.primaryButtonArrow}>{isRtl ? '←' : '↗'}</Text>
              </>
            )}
          </MotionPressable>
          <Text style={styles.demoNotice}>DEMO ACCESS · NOT PHONE VERIFICATION</Text>
        </View>

        <View style={styles.loginMiniFeatures}>
          <View style={styles.miniFeature}>
            <Text style={styles.miniFeatureIcon}>↗</Text>
            <Text style={styles.miniFeatureText}>{ui.freight}</Text>
          </View>
          <View style={styles.miniFeature}>
            <Text style={styles.miniFeatureIcon}>⌁</Text>
            <Text style={styles.miniFeatureText}>{ui.roadside}</Text>
          </View>
          <View style={styles.miniFeature}>
            <Text style={styles.miniFeatureIcon}>◌</Text>
            <Text style={styles.miniFeatureText}>{ui.water}</Text>
          </View>
        </View>
        <Text style={styles.footerText}>{ui.footer}</Text>
      </ScrollView>
    </SafeAreaView>
  );

  const renderCustomerHome = () => (
    <>
      <View style={styles.heroWrap}>
        <ImageBackground
          source={{ uri: photo.freight }}
          style={styles.heroImage}
          imageStyle={styles.heroImageRadius}
        >
          <View style={styles.heroShade} />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(10,42,40,0.06)', 'rgba(7,27,31,0.2)', 'rgba(5,22,25,0.42)']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.heroGlowOrb,
              { opacity: heroGlowOpacity, transform: [{ scale: heroGlowScale }] },
            ]}
          />
          <View style={[styles.heroHeader, rowStyle]}>
            <View style={styles.brandInline}>
              <View style={styles.brandSquare}>
                <Text style={styles.brandSquareText}>W</Text>
              </View>
              <View>
                <Text style={styles.brandName}>{brandTitle}</Text>
                <Text style={styles.brandTagline}>{ui.tagline}</Text>
              </View>
            </View>
            <MotionPressable onPress={() => setScreen('about')} style={styles.heroHeaderButton}>
              <Text style={styles.heroHeaderButtonText}>ⓘ</Text>
            </MotionPressable>
          </View>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroEyebrow}>WESSALI · ALGERIA</Text>
            <Text style={[styles.heroTitle, isRtl && styles.arabicHero]}>{ui.welcome}</Text>
            <Text style={[styles.heroSubtitle, isRtl && styles.arabicHero]}>{ui.welcomeSub}</Text>
            <View style={[styles.locationPill, rowStyle]}>
              <Text style={styles.locationPillIcon}>⌖</Text>
              <Text style={styles.locationPillText}>{ui.corridor}</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.sectionHeaderBlock}>
        <View>
          <Text style={[styles.sectionEyebrow, directionStyle]}>01 / WESSALI SERVICES</Text>
          <Text style={[styles.sectionTitle, directionStyle]}>{ui.choose}</Text>
        </View>
        <Text style={styles.sectionCount}>03</Text>
      </View>
      <View style={styles.servicesGrid}>
        {renderServiceCard('freight', 0)}
        {renderServiceCard('roadside', 1)}
        {renderServiceCard('water', 2)}
      </View>

      <View style={styles.softPanel}>
        <Text style={[styles.sectionEyebrow, directionStyle]}>02 / SIMPLE BY DESIGN</Text>
        <Text style={[styles.sectionTitle, directionStyle]}>{ui.how}</Text>
        <View style={styles.stepsGrid}>
          {[
            ['01', ui.step1, ui.step1d],
            ['02', ui.step2, ui.step2d],
            ['03', ui.step3, ui.step3d],
            ['04', ui.step4, ui.step4d],
          ].map(([number, title, description]) => (
            <View key={number} style={styles.stepCard}>
              <Text style={styles.stepNumber}>{number}</Text>
              <Text style={[styles.stepTitle, directionStyle]}>{title}</Text>
              <Text style={[styles.stepDescription, directionStyle]}>{description}</Text>
            </View>
          ))}
        </View>
      </View>

      <ImageBackground
        source={{ uri: photo.water }}
        style={styles.storyBanner}
        imageStyle={styles.storyBannerRadius}
      >
        <View style={styles.storyShade} />
        <Text style={styles.storyEyebrow}>THE WESSALI IDEA</Text>
        <Text style={[styles.storyTitle, isRtl && styles.arabicHero]}>{ui.story}</Text>
        <Text style={[styles.storyDescription, isRtl && styles.arabicHero]}>{ui.storySub}</Text>
        <MotionPressable style={styles.storyButton} onPress={() => setScreen('about')}>
          <Text style={styles.storyButtonText}>{ui.learn}</Text>
          <Text style={styles.storyButtonArrow}>{isRtl ? '←' : '↗'}</Text>
        </MotionPressable>
      </ImageBackground>

      <View style={styles.trustPanel}>
        <View style={styles.trustGlow} />
        <Text style={styles.trustMark}>✦</Text>
        <Text style={[styles.trustTitle, directionStyle]}>{ui.trustTitle}</Text>
        <Text style={[styles.trustText, directionStyle]}>{ui.trustSub}</Text>
        <View style={[styles.trustStats, rowStyle]}>
          <View style={styles.trustStat}>
            <Text style={styles.trustStatValue}>03</Text>
            <Text style={styles.trustStatLabel}>{ui.services}</Text>
          </View>
          <View style={styles.trustStatDivider} />
          <View style={styles.trustStat}>
            <Text style={styles.trustStatValue}>03</Text>
            <Text style={styles.trustStatLabel}>{ui.language}</Text>
          </View>
          <View style={styles.trustStatDivider} />
          <View style={styles.trustStat}>
            <Text style={styles.trustStatValue}>DZ</Text>
            <Text style={styles.trustStatLabel}>Algeria</Text>
          </View>
        </View>
      </View>
    </>
  );

  const renderBookingForm = () => (
    <View style={styles.pageContent}>
      <MotionPressable onPress={() => setScreen('home')} style={[styles.backButton, rowStyle]}>
        <Text style={styles.backGlyph}>{isRtl ? '→' : '←'}</Text>
        <Text style={styles.backText}>{ui.back}</Text>
      </MotionPressable>
      <ImageBackground
        source={{ uri: serviceContent[selectedService].photo }}
        style={styles.formHero}
        imageStyle={styles.formHeroRadius}
      >
        <View style={styles.heroShade} />
        <View style={styles.formHeroIcon}>
          <Text style={styles.formHeroIconText}>{serviceContent[selectedService].icon}</Text>
        </View>
        <Text style={[styles.formHeroTitle, isRtl && styles.arabicHero]}>
          {selectedServiceCopy?.labels[locale] ?? serviceTitle(selectedService)}
        </Text>
        <Text style={[styles.formHeroSub, isRtl && styles.arabicHero]}>
          {serviceDescription(selectedService)}
        </Text>
      </ImageBackground>

      <View style={styles.formSectionHeading}>
        <Text style={[styles.sectionEyebrow, directionStyle]}>SERVICE REQUEST</Text>
        <Text style={[styles.sectionTitle, directionStyle]}>{ui.details}</Text>
      </View>
      <View style={styles.glassPanel}>
        {renderField(ui.pickup, pickupAddress, setPickupAddress, undefined, 'default', true)}
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
              ui.loading,
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
                { label: ui.truck, value: 'truck' },
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
                { label: ui.towingIssue, value: 'towing' },
              ],
              issueCategory,
              setIssueCategory,
            )}
            <View style={[styles.switchCard, rowStyle]}>
              <View style={styles.switchCopy}>
                <Text style={[styles.switchTitle, directionStyle]}>{ui.towing}</Text>
                <Text style={[styles.switchSub, directionStyle]}>{ui.towingIssue}</Text>
              </View>
              <Switch
                value={needsTowing}
                onValueChange={setNeedsTowing}
                trackColor={{ true: '#1A8C80' }}
              />
            </View>
            {needsTowing
              ? renderField(ui.towingDestination, towingDestination, setTowingDestination)
              : null}
            <Text style={[styles.infoNote, directionStyle]}>{ui.safety}</Text>
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
            <Text style={[styles.infoNote, directionStyle]}>{ui.waterNote}</Text>
          </>
        ) : null}
        {renderField(ui.notes, customerNotes, setCustomerNotes, undefined, 'default', true)}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <MotionPressable
          style={styles.primaryButtonLarge}
          onPress={() => void submitBooking()}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>{ui.create}</Text>
              <Text style={styles.primaryButtonArrow}>{isRtl ? '←' : '↗'}</Text>
            </>
          )}
        </MotionPressable>
        <MotionPressable style={styles.secondaryButton} onPress={() => setScreen('home')}>
          <Text style={styles.secondaryButtonText}>{ui.cancel}</Text>
        </MotionPressable>
      </View>
    </View>
  );

  const renderHistory = () => (
    <View style={styles.pageContent}>
      <View style={[styles.sectionHeaderBlock, rowStyle]}>
        <View>
          <Text style={[styles.sectionEyebrow, directionStyle]}>YOUR ACTIVITY</Text>
          <Text style={[styles.sectionTitle, directionStyle]}>{ui.history}</Text>
        </View>
        <MotionPressable onPress={() => void refreshData()} style={styles.refreshButton}>
          <Text style={styles.refreshGlyph}>↻</Text>
          <Text style={styles.refreshText}>{ui.refresh}</Text>
        </MotionPressable>
      </View>
      {notice ? <Text style={styles.successText}>{notice}</Text> : null}
      {bookings.length ? (
        bookings.map((booking) => renderBookingCard(booking))
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>⌑</Text>
          </View>
          <Text style={[styles.emptyTitle, directionStyle]}>{ui.noBookings}</Text>
          <Text style={[styles.emptySubtitle, directionStyle]}>{ui.choose}</Text>
          <MotionPressable style={styles.primaryButton} onPress={() => setScreen('home')}>
            <Text style={styles.primaryButtonText}>{ui.start}</Text>
          </MotionPressable>
        </View>
      )}
    </View>
  );

  const renderProvider = () => (
    <View style={styles.pageContent}>
      <View style={styles.providerHero}>
        <Text style={styles.sectionEyebrow}>WESSALI · PROVIDER SPACE</Text>
        <Text style={[styles.providerHeroTitle, isRtl && styles.arabicHero]}>{ui.provider}</Text>
        <Text style={[styles.providerHeroSub, isRtl && styles.arabicHero]}>{ui.applySub}</Text>
      </View>

      {!providerProfile || providerProfile.status === 'not_applied' ? (
        <View style={styles.glassPanel}>
          <View style={styles.sectionHeaderBlock}>
            <Text style={[styles.sectionTitle, directionStyle]}>{ui.applyTitle}</Text>
            <Text style={styles.sectionCount}>01</Text>
          </View>
          <Text style={[styles.bodyCopy, directionStyle]}>{ui.applySub}</Text>
          {renderField(ui.business, businessName, setBusinessName)}
          <Text style={[styles.fieldLabel, directionStyle]}>{ui.serviceTypes}</Text>
          {SERVICE_CATEGORIES.map((service) => (
            <View key={service.id} style={[styles.providerServiceRow, rowStyle]}>
              <View
                style={[
                  styles.providerServiceIcon,
                  { backgroundColor: serviceContent[service.id].accent + '24' },
                ]}
              >
                <Text style={styles.providerServiceIconText}>
                  {serviceContent[service.id].icon}
                </Text>
              </View>
              <View style={styles.providerServiceCopy}>
                <Text style={[styles.providerServiceTitle, directionStyle]}>
                  {serviceTitle(service.id)}
                </Text>
                <Text style={[styles.providerServiceSub, directionStyle]}>
                  {serviceDescription(service.id)}
                </Text>
              </View>
              <Switch
                value={providerServices.includes(service.id)}
                onValueChange={() => toggleProviderService(service.id)}
                trackColor={{ true: '#1A8C80' }}
              />
            </View>
          ))}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <MotionPressable
            style={styles.primaryButtonLarge}
            onPress={() => void applyProvider()}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>{ui.apply}</Text>
            )}
          </MotionPressable>
        </View>
      ) : providerProfile.status !== 'approved' ? (
        <View style={styles.approvalCard}>
          <View style={styles.approvalIcon}>
            <Text style={styles.approvalIconText}>◷</Text>
          </View>
          <Text style={[styles.approvalTitle, directionStyle]}>{ui.pending}</Text>
          <Text style={[styles.approvalText, directionStyle]}>{providerProfile.business_name}</Text>
          <View style={styles.reviewTrack}>
            <View style={styles.reviewTrackFill} />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.approvalCard}>
            <View style={styles.approvalIcon}>
              <Text style={styles.approvalIconText}>✓</Text>
            </View>
            <Text style={[styles.approvalTitle, directionStyle]}>{ui.approved}</Text>
            <Text style={[styles.approvalText, directionStyle]}>
              {providerProfile.business_name}
            </Text>
          </View>
          <View style={styles.sectionHeaderBlock}>
            <Text style={[styles.sectionTitle, directionStyle]}>{ui.jobs}</Text>
            <Text style={styles.sectionCount}>{String(providerJobs.length).padStart(2, '0')}</Text>
          </View>
          {providerJobs.length ? (
            providerJobs.map((job) => (
              <View key={job.id} style={styles.bookingCard}>
                <View style={[styles.bookingTop, rowStyle]}>
                  <Text style={styles.overline}>{job.public_reference}</Text>
                  {renderStatus(job.status)}
                </View>
                <Text style={[styles.bookingService, directionStyle]}>
                  {serviceTitle(job.service_type)}
                </Text>
                <Text style={[styles.routeAddress, directionStyle]}>{job.pickup_address}</Text>
                {job.destination_address ? (
                  <Text style={[styles.routeAddress, directionStyle]}>
                    {job.destination_address}
                  </Text>
                ) : null}
                {job.status !== 'completed' ? (
                  <MotionPressable
                    style={styles.primaryButton}
                    onPress={() => void advanceJob(job.id)}
                    disabled={busy}
                  >
                    <Text style={styles.primaryButtonText}>
                      {busy ? ui.loadingText : ui.advance}
                    </Text>
                  </MotionPressable>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={[styles.emptySubtitle, directionStyle]}>{ui.noJobs}</Text>
          )}

          <View style={styles.sectionHeaderBlock}>
            <Text style={[styles.sectionTitle, directionStyle]}>{ui.available}</Text>
            <Text style={styles.sectionCount}>
              {String(providerRequests.length).padStart(2, '0')}
            </Text>
          </View>
          {providerRequests.length ? (
            providerRequests.map((booking) => renderBookingCard(booking, true))
          ) : (
            <Text style={[styles.emptySubtitle, directionStyle]}>{ui.noRequests}</Text>
          )}
        </>
      )}
    </View>
  );

  const renderAbout = () => (
    <View style={styles.pageContent}>
      <ImageBackground
        source={{ uri: photo.water }}
        style={styles.aboutHero}
        imageStyle={styles.aboutHeroRadius}
      >
        <View style={styles.heroShade} />
        <Text style={styles.heroEyebrow}>WESSALI · ALGERIA</Text>
        <Text style={[styles.aboutHeroTitle, isRtl && styles.arabicHero]}>{ui.brand}</Text>
        <Text style={[styles.aboutHeroSubtitle, isRtl && styles.arabicHero]}>{ui.tagline}</Text>
        <View style={styles.locationPill}>
          <Text style={styles.locationPillText}>{ui.companyLabel}</Text>
        </View>
      </ImageBackground>

      <View style={styles.glassPanel}>
        <Text style={[styles.sectionEyebrow, directionStyle]}>01 / OUR STORY</Text>
        <Text style={[styles.sectionTitle, directionStyle]}>{ui.company}</Text>
        <Text style={[styles.bodyCopy, directionStyle]}>{ui.companyText}</Text>
        <View style={styles.corridorCard}>
          <Text style={styles.corridorGlyph}>↔</Text>
          <View style={styles.corridorCopy}>
            <Text style={styles.corridorTitle}>{ui.corridor}</Text>
            <Text style={styles.corridorSub}>ALGERIA · REGIONAL CONNECTIONS</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeaderBlock}>
        <View>
          <Text style={[styles.sectionEyebrow, directionStyle]}>02 / THE CHALLENGE</Text>
          <Text style={[styles.sectionTitle, directionStyle]}>{ui.market}</Text>
        </View>
      </View>
      {[
        ['01', ui.problem1, ui.problem1d, '↗'],
        ['02', ui.problem2, ui.problem2d, '⌁'],
        ['03', ui.problem3, ui.problem3d, '◌'],
      ].map(([number, title, description, glyph]) => (
        <View key={number} style={styles.informationCard}>
          <View style={styles.infoCardTop}>
            <Text style={styles.infoCardNumber}>{number}</Text>
            <Text style={styles.infoCardGlyph}>{glyph}</Text>
          </View>
          <Text style={[styles.infoCardTitle, directionStyle]}>{title}</Text>
          <Text style={[styles.bodyCopy, directionStyle]}>{description}</Text>
        </View>
      ))}

      <View style={styles.softPanel}>
        <Text style={[styles.sectionEyebrow, directionStyle]}>03 / OUR RESPONSE</Text>
        <Text style={[styles.sectionTitle, directionStyle]}>{ui.solutions}</Text>
        {[
          ['↗', ui.solution1],
          ['⌁', ui.solution2],
          ['◌', ui.solution3],
        ].map(([glyph, value], index) => (
          <View key={String(index)} style={[styles.solutionRow, rowStyle]}>
            <View style={styles.solutionIcon}>
              <Text style={styles.solutionIconText}>{glyph}</Text>
            </View>
            <Text style={[styles.solutionText, directionStyle]}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.glassPanel}>
        <Text style={[styles.sectionEyebrow, directionStyle]}>04 / THE EXPERIENCE</Text>
        <Text style={[styles.sectionTitle, directionStyle]}>{ui.workflow}</Text>
        {[
          [ui.customerFlow, ui.customerFlowD],
          [ui.providerFlow, ui.providerFlowD],
          [ui.execution, ui.executionD],
        ].map(([title, description], index) => (
          <View key={title} style={styles.workflowRow}>
            <View style={styles.workflowNumber}>
              <Text style={styles.workflowNumberText}>0{index + 1}</Text>
            </View>
            <View style={styles.workflowText}>
              <Text style={[styles.workflowTitle, directionStyle]}>{title}</Text>
              <Text style={[styles.bodyCopy, directionStyle]}>{description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.teamCard}>
        <Text style={styles.sectionEyebrow}>05 / THE TEAM</Text>
        <Text style={[styles.teamTitle, isRtl && styles.arabicHero]}>{ui.team}</Text>
        <View style={[styles.teamMember, rowStyle]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AR</Text>
          </View>
          <View style={styles.teamMemberText}>
            <Text style={styles.teamMemberName}>{ui.amjad}</Text>
            <Text style={styles.teamMemberRole}>{ui.student}</Text>
          </View>
        </View>
        <View style={[styles.teamMember, rowStyle]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MO</Text>
          </View>
          <View style={styles.teamMemberText}>
            <Text style={styles.teamMemberName}>{ui.omar}</Text>
            <Text style={styles.teamMemberRole}>{ui.student}</Text>
          </View>
        </View>
        <View style={styles.teamDivider} />
        <Text style={[styles.supervisorText, isRtl && styles.arabicHero]}>{ui.supervisor}</Text>
      </View>

      <View style={styles.featureNoteCard}>
        <Text style={styles.featureNoteMark}>i</Text>
        <View style={styles.featureNoteCopy}>
          <Text style={[styles.featureNoteTitle, directionStyle]}>{ui.featureNote}</Text>
          <Text style={[styles.featureNoteText, directionStyle]}>{ui.featureNoteD}</Text>
        </View>
      </View>
    </View>
  );

  if (!session) return renderLogin();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.appShell}>
        <Animated.ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
        >
          <View style={[styles.accountBar, rowStyle]}>
            <View style={styles.accountIdentity}>
              <View style={styles.accountAvatar}>
                <Text style={styles.accountAvatarText}>
                  {session.user.displayName.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.accountEyebrow}>{ui.greeting}</Text>
                <Text style={styles.accountName}>{session.user.displayName}</Text>
              </View>
            </View>
            <View style={styles.accountActions}>
              {renderLanguagePicker()}
              <MotionPressable onPress={() => void signOut()} style={styles.logoutButton}>
                <Text style={styles.logoutGlyph}>⇥</Text>
              </MotionPressable>
            </View>
          </View>

          <Animated.View
            style={{
              opacity: screenOpacity,
              transform: [{ translateY: screenTranslateY }],
            }}
          >
            {session.user.role === 'provider' ? (
              renderProvider()
            ) : (
              <>
                {screen === 'home' ? renderCustomerHome() : null}
                {screen === 'booking' ? renderBookingForm() : null}
                {screen === 'history' ? renderHistory() : null}
                {screen === 'about' ? renderAbout() : null}
              </>
            )}
          </Animated.View>

          {notice && screen !== 'history' ? <Text style={styles.successText}>{notice}</Text> : null}
          {error && screen !== 'booking' && screen !== 'history' ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
          {busy ? <ActivityIndicator color="#168C82" style={styles.globalSpinner} /> : null}
          <Text style={styles.footerText}>{ui.footer} · 0.3.0</Text>
        </Animated.ScrollView>

        {session.user.role === 'customer' ? (
          <View style={styles.bottomBarShell}>
            <BlurView
              intensity={82}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[
                'rgba(255,255,255,0.46)',
                'rgba(250,255,252,0.7)',
                'rgba(242,250,246,0.92)',
              ]}
              locations={[0, 0.52, 1]}
              style={StyleSheet.absoluteFill}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.bottomGlow,
                {
                  opacity: bottomGlowOpacity,
                  transform: [{ scale: bottomGlowScale }],
                },
              ]}
            />
            <View style={styles.bottomBar}>
            {[
              ['home', '⌂', ui.home],
              ['history', '◷', ui.history],
              ['about', 'ⓘ', ui.about],
            ].map(([id, glyph, label]) => (
              <MotionPressable
                key={id}
                onPress={() => {
                  const next = id as Screen;
                  setScreen(next);
                  setError('');
                  if (next === 'history') void refreshData();
                }}
                style={styles.bottomTab}
              >
                <View
                  style={[styles.bottomGlyphWrap, screen === id && styles.bottomGlyphWrapActive]}
                >
                  <Text style={[styles.bottomGlyph, screen === id && styles.bottomGlyphActive]}>
                    {glyph}
                  </Text>
                </View>
                <Text style={[styles.bottomLabel, screen === id && styles.bottomLabelActive]}>
                  {label}
                </Text>
              </MotionPressable>
            ))}
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F5' },
  appShell: { flex: 1, backgroundColor: '#F4F6F5' },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 32, gap: 24 },
  loginScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 34,
    gap: 20,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  textRtl: { textAlign: 'right', writingDirection: 'rtl' },
  textLtr: { textAlign: 'left', writingDirection: 'ltr' },
  arabicHero: { textAlign: 'right', writingDirection: 'rtl' },
  languageSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    padding: 4,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  languageButton: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 18 },
  languageButtonActive: { backgroundColor: '#173F3A' },
  languageText: { color: '#7B8783', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  languageTextActive: { color: '#FFFFFF' },

  loginVisual: { height: 286, position: 'relative', justifyContent: 'center' },
  glowOrbOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 100,
    backgroundColor: 'rgba(52,166,150,0.18)',
    top: -12,
    right: -26,
  },
  glowOrbTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 100,
    backgroundColor: 'rgba(226,162,100,0.18)',
    bottom: -16,
    left: -18,
  },
  loginPhoto: { flex: 1, justifyContent: 'space-between', padding: 21, overflow: 'hidden' },
  loginPhotoRadius: { borderRadius: 30 },
  loginPhotoShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(7,26,29,0.38)',
    borderRadius: 30,
  },
  brandChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  brandChipMark: { color: '#FFFFFF', fontWeight: '900', fontSize: 17 },
  brandChipText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  loginPhotoCopy: { gap: 9, maxWidth: 310 },
  loginPhotoEyebrow: { color: '#C8E4DA', fontSize: 9, letterSpacing: 2.2, fontWeight: '800' },
  loginPhotoTitle: { color: '#FFFFFF', fontSize: 30, lineHeight: 37, fontWeight: '800' },
  loginPhotoSub: { color: 'rgba(255,255,255,0.84)', fontSize: 12, lineHeight: 19 },
  loginHeading: { gap: 6 },
  loginTitle: { color: '#132B27', fontSize: 27, fontWeight: '800', letterSpacing: -0.6 },
  loginSubtitle: { color: '#788580', fontSize: 13, lineHeight: 20 },
  glassPanel: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.96)',
    borderRadius: 27,
    padding: 18,
    gap: 15,
    shadowColor: '#25473E',
    shadowOpacity: 0.07,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  field: { gap: 7 },
  fieldLabel: { color: '#30423D', fontSize: 11, fontWeight: '800', letterSpacing: 0.1 },
  input: {
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5ECE8',
    backgroundColor: 'rgba(248,250,249,0.94)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: '#19342D',
  },
  inputRtl: { textAlign: 'right' },
  multilineInput: { minHeight: 82, textAlignVertical: 'top' },
  serverToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  serverToggleText: { color: '#648078', fontSize: 11, fontWeight: '700' },
  serverToggleGlyph: { color: '#168C82', fontSize: 18, fontWeight: '700' },
  roleSwitch: { backgroundColor: '#EDF2EF', padding: 4, borderRadius: 17, gap: 5 },
  pill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    borderRadius: 13,
    paddingHorizontal: 8,
  },
  pillActive: {
    backgroundColor: '#173F3A',
    shadowColor: '#173F3A',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  pillText: { color: '#81908A', fontWeight: '800', fontSize: 11 },
  pillTextActive: { color: '#FFFFFF' },
  primaryButtonLarge: {
    minHeight: 54,
    backgroundColor: '#173F3A',
    borderRadius: 17,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#173F3A',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  primaryButton: {
    minHeight: 47,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#173F3A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  primaryButtonArrow: { color: '#B9E4D8', fontSize: 18, fontWeight: '800' },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E3EAE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: '#73817B', fontSize: 12, fontWeight: '800' },
  demoNotice: {
    color: '#9AA6A0',
    fontSize: 8,
    textAlign: 'center',
    letterSpacing: 1.4,
    fontWeight: '800',
  },
  loginMiniFeatures: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  miniFeature: { flex: 1, alignItems: 'center', gap: 5 },
  miniFeatureIcon: { color: '#168C82', fontSize: 22, fontWeight: '700' },
  miniFeatureText: { color: '#64746E', fontSize: 9, fontWeight: '700', textAlign: 'center' },
  footerText: {
    color: '#A0AAA5',
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 1.1,
    paddingTop: 8,
  },

  accountBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
  accountIdentity: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
  accountAvatar: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#D7E8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarText: { color: '#1C574B', fontSize: 15, fontWeight: '900' },
  accountEyebrow: { color: '#95A19B', fontSize: 9, fontWeight: '700' },
  accountName: { color: '#19342D', fontSize: 12, fontWeight: '800' },
  accountActions: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logoutButton: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9EFEC',
  },
  logoutGlyph: { color: '#46665C', fontSize: 17, fontWeight: '800' },

  heroWrap: { height: 380, position: 'relative' },
  heroImage: { flex: 1, padding: 20, justifyContent: 'space-between', overflow: 'hidden' },
  heroImageRadius: { borderRadius: 29 },
  heroShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(7,28,30,0.48)',
    borderRadius: 29,
  },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandInline: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandSquare: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandSquareText: { color: '#173F3A', fontSize: 21, fontWeight: '900' },
  brandName: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  brandTagline: { color: 'rgba(255,255,255,0.7)', fontSize: 8, marginTop: 2 },
  heroHeaderButton: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeaderButtonText: { color: '#FFFFFF', fontSize: 17 },
  heroTextBlock: { gap: 10, maxWidth: 315 },
  heroEyebrow: { color: '#C5E5D9', fontSize: 9, letterSpacing: 2.1, fontWeight: '900' },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  heroSubtitle: { color: 'rgba(255,255,255,0.83)', fontSize: 12, lineHeight: 19 },
  locationPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginTop: 3,
  },
  locationPillIcon: { color: '#CBE9DE', fontSize: 15 },
  locationPillText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  sectionHeaderBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: -8,
  },
  sectionEyebrow: {
    color: '#8BA49A',
    fontSize: 8,
    letterSpacing: 1.8,
    fontWeight: '900',
    marginBottom: 7,
  },
  sectionTitle: {
    color: '#19342D',
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  sectionCount: { color: '#B1C1BA', fontSize: 21, fontWeight: '300' },
  servicesGrid: { gap: 13 },
  serviceCard: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#23473E',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  serviceImage: { height: 214, padding: 17, justifyContent: 'space-between' },
  serviceImageRadius: { borderRadius: 25 },
  imageShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(7,25,27,0.32)',
    borderRadius: 25,
  },
  serviceImageTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIconText: { color: '#1D5146', fontSize: 21, fontWeight: '800' },
  serviceNumber: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  serviceImageBottom: { gap: 5, alignItems: 'flex-start' },
  serviceTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '900', letterSpacing: -0.3 },
  serviceDescription: { color: 'rgba(255,255,255,0.82)', fontSize: 11, lineHeight: 17 },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cardActionText: { color: '#20463D', fontSize: 10, fontWeight: '900' },
  cardActionArrow: { color: '#168C82', fontSize: 14, fontWeight: '900' },

  softPanel: {
    backgroundColor: 'rgba(229,239,234,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 27,
    padding: 19,
    gap: 15,
  },
  stepsGrid: { gap: 12 },
  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 18,
    padding: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.88)',
  },
  stepNumber: { color: '#168C82', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  stepTitle: { color: '#244239', fontSize: 13, fontWeight: '900' },
  stepDescription: { color: '#788A82', fontSize: 11, lineHeight: 17 },
  storyBanner: { height: 255, padding: 20, justifyContent: 'flex-end', gap: 9, overflow: 'hidden' },
  storyBannerRadius: { borderRadius: 25 },
  storyShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(9,38,42,0.58)',
    borderRadius: 25,
  },
  storyEyebrow: { color: '#C2E5D9', fontSize: 8, letterSpacing: 2, fontWeight: '900' },
  storyTitle: { color: '#FFFFFF', fontSize: 20, lineHeight: 27, fontWeight: '900' },
  storyDescription: { color: 'rgba(255,255,255,0.82)', fontSize: 11, lineHeight: 17 },
  storyButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    marginTop: 4,
  },
  storyButtonText: { color: '#20463D', fontSize: 10, fontWeight: '900' },
  storyButtonArrow: { color: '#168C82', fontSize: 15, fontWeight: '900' },
  trustPanel: {
    backgroundColor: '#173F3A',
    padding: 20,
    borderRadius: 26,
    gap: 10,
    overflow: 'hidden',
  },
  trustGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: 'rgba(83,174,153,0.16)',
    top: -80,
    right: -55,
  },
  trustMark: { color: '#9BD7C3', fontSize: 19 },
  trustTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '900' },
  trustText: { color: 'rgba(255,255,255,0.72)', fontSize: 11, lineHeight: 18 },
  trustStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.13)',
  },
  trustStat: { flex: 1, gap: 3, alignItems: 'center' },
  trustStatValue: { color: '#BDE4D7', fontSize: 20, fontWeight: '900' },
  trustStatLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
  },
  trustStatDivider: { width: 1, height: 31, backgroundColor: 'rgba(255,255,255,0.16)' },

  pageContent: { gap: 17 },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  backGlyph: { color: '#168C82', fontSize: 19, fontWeight: '900' },
  backText: { color: '#64776F', fontSize: 11, fontWeight: '800' },
  formHero: {
    height: 190,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'flex-end',
    gap: 7,
    overflow: 'hidden',
  },
  formHeroRadius: { borderRadius: 24 },
  formHeroIcon: {
    width: 37,
    height: 37,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  formHeroIconText: { color: '#1C5147', fontSize: 20, fontWeight: '900' },
  formHeroTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '900' },
  formHeroSub: { color: 'rgba(255,255,255,0.82)', fontSize: 11 },
  formSectionHeading: { gap: 1 },
  choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  choice: {
    borderWidth: 1,
    borderColor: '#E2EAE5',
    backgroundColor: '#F9FBFA',
    borderRadius: 19,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  choiceActive: { backgroundColor: '#DCEFE7', borderColor: '#9CCBBB' },
  choiceText: { color: '#77877F', fontSize: 10, fontWeight: '800' },
  choiceTextActive: { color: '#205849' },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: '#F5F8F6',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  switchCopy: { flex: 1, gap: 3 },
  switchTitle: { color: '#30423D', fontSize: 11, fontWeight: '800' },
  switchSub: { color: '#9BA7A1', fontSize: 9 },
  infoNote: {
    backgroundColor: '#EEF4F1',
    borderRadius: 14,
    color: '#71847B',
    fontSize: 10,
    lineHeight: 17,
    padding: 12,
  },
  errorText: { color: '#B34C45', fontSize: 11, lineHeight: 17, fontWeight: '700' },
  successText: { color: '#27816E', fontSize: 11, lineHeight: 17, fontWeight: '700' },

  bookingCard: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 22,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.96)',
    shadowColor: '#25473E',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  bookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  referenceBlock: { flex: 1, gap: 4 },
  overline: { color: '#9BAAA3', fontSize: 8, letterSpacing: 1.3, fontWeight: '900' },
  bookingService: { color: '#1E3931', fontSize: 14, fontWeight: '900' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusBadgeActive: { backgroundColor: '#E7F3EC' },
  statusBadgeMuted: { backgroundColor: '#F1F3F2' },
  statusDot: { width: 5, height: 5, borderRadius: 5 },
  statusDotActive: { backgroundColor: '#278B70' },
  statusDotMuted: { backgroundColor: '#A7B0AB' },
  statusText: { fontSize: 8, fontWeight: '900' },
  statusTextActive: { color: '#367A65' },
  statusTextMuted: { color: '#8F9A94' },
  routeBlock: {
    flexDirection: 'row',
    gap: 11,
    backgroundColor: '#F8FAF9',
    borderRadius: 15,
    padding: 12,
  },
  routePinColumn: { alignItems: 'center', width: 8, paddingTop: 2 },
  routePinStart: { width: 7, height: 7, borderRadius: 5, backgroundColor: '#27917A' },
  routePinLine: { width: 1, height: 18, backgroundColor: '#B7CBC2' },
  routePinEnd: { width: 7, height: 7, borderRadius: 2, backgroundColor: '#D19B5D' },
  routeLabels: { flex: 1, gap: 3 },
  routeCaption: { color: '#A1AEA7', fontSize: 8, fontWeight: '800' },
  routeAddress: { color: '#435B51', fontSize: 11, lineHeight: 16, fontWeight: '700' },
  bookingDetail: { color: '#7A8B82', fontSize: 10, lineHeight: 16 },
  providerName: { color: '#537B6B', fontSize: 10, fontWeight: '800' },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingTop: 6,
  },
  progressStep: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  progressNode: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D9E2DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNodeActive: { backgroundColor: '#218B76', borderColor: '#218B76' },
  progressCheck: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  progressInner: { width: 4, height: 4, borderRadius: 3, backgroundColor: '#D9E2DD' },
  progressLine: { flex: 1, height: 2, backgroundColor: '#E4EBE7', marginHorizontal: 2 },
  progressLineActive: { backgroundColor: '#89C6B2' },
  cancelButton: {
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E9DAD6',
    backgroundColor: '#FFF9F7',
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: { color: '#B16C5D', fontWeight: '800', fontSize: 10 },
  refreshButton: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: '#E6F0EB',
    borderRadius: 16,
  },
  refreshGlyph: { color: '#248673', fontSize: 15, fontWeight: '900' },
  refreshText: { color: '#4E7A6C', fontSize: 9, fontWeight: '900' },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 24,
    gap: 10,
  },
  emptyIcon: {
    width: 53,
    height: 53,
    borderRadius: 18,
    backgroundColor: '#E6F1EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconText: { color: '#4B927E', fontSize: 25 },
  emptyTitle: { color: '#29473D', fontSize: 15, fontWeight: '900' },
  emptySubtitle: { color: '#8B9992', fontSize: 11, lineHeight: 17 },

  providerHero: { backgroundColor: '#173F3A', borderRadius: 25, padding: 20, gap: 7 },
  providerHeroTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '900' },
  providerHeroSub: { color: 'rgba(255,255,255,0.72)', fontSize: 11, lineHeight: 18 },
  bodyCopy: { color: '#75847D', fontSize: 11, lineHeight: 19 },
  providerServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F0',
  },
  providerServiceIcon: {
    width: 37,
    height: 37,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerServiceIconText: { color: '#23594A', fontSize: 19, fontWeight: '900' },
  providerServiceCopy: { flex: 1, gap: 3 },
  providerServiceTitle: { color: '#2C453B', fontSize: 11, fontWeight: '900' },
  providerServiceSub: { color: '#8B9992', fontSize: 9, lineHeight: 14 },
  approvalCard: {
    backgroundColor: '#E8F2EC',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    gap: 9,
  },
  approvalIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvalIconText: { color: '#25856F', fontSize: 25, fontWeight: '800' },
  approvalTitle: { color: '#285D4E', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  approvalText: { color: '#7D9287', fontSize: 11 },
  reviewTrack: {
    height: 5,
    width: '100%',
    borderRadius: 5,
    backgroundColor: '#D5E5DB',
    overflow: 'hidden',
    marginTop: 6,
  },
  reviewTrackFill: { height: 5, width: '64%', backgroundColor: '#5AAB91', borderRadius: 5 },

  aboutHero: {
    height: 250,
    borderRadius: 26,
    padding: 20,
    justifyContent: 'flex-end',
    gap: 8,
    overflow: 'hidden',
  },
  aboutHeroRadius: { borderRadius: 26 },
  aboutHeroTitle: { color: '#FFFFFF', fontSize: 35, fontWeight: '900' },
  aboutHeroSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 12 },
  corridorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EAF3EF',
    borderRadius: 17,
    padding: 13,
    marginTop: 7,
  },
  corridorGlyph: { color: '#248A75', fontSize: 24, fontWeight: '900' },
  corridorCopy: { flex: 1, gap: 3 },
  corridorTitle: { color: '#315C4C', fontSize: 12, fontWeight: '900' },
  corridorSub: { color: '#8CA39A', fontSize: 7, letterSpacing: 1.3, fontWeight: '900' },
  informationCard: {
    backgroundColor: 'rgba(255,255,255,0.83)',
    padding: 17,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    gap: 8,
  },
  infoCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoCardNumber: { color: '#A2B4AA', fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  infoCardGlyph: { color: '#28917A', fontSize: 20, fontWeight: '900' },
  infoCardTitle: { color: '#25473A', fontSize: 14, fontWeight: '900' },
  solutionRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 7 },
  solutionIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solutionIconText: { color: '#258875', fontSize: 18, fontWeight: '900' },
  solutionText: { flex: 1, color: '#5F756A', fontSize: 11, lineHeight: 18, fontWeight: '600' },
  workflowRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF3F1',
  },
  workflowNumber: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#E6F2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workflowNumberText: { color: '#33836D', fontSize: 9, fontWeight: '900' },
  workflowText: { flex: 1, gap: 4 },
  workflowTitle: { color: '#2F4A3E', fontSize: 12, fontWeight: '900' },
  teamCard: { backgroundColor: '#173F3A', borderRadius: 24, padding: 20, gap: 15 },
  teamTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  teamMember: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#C5E6D8', fontSize: 11, fontWeight: '900' },
  teamMemberText: { flex: 1, gap: 3 },
  teamMemberName: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  teamMemberRole: { color: 'rgba(255,255,255,0.55)', fontSize: 9 },
  teamDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  supervisorText: { color: '#C6E1D7', fontSize: 11, fontWeight: '800' },
  featureNoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 15,
    backgroundColor: '#FFF8EB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F2E9D7',
  },
  featureNoteMark: {
    width: 24,
    height: 24,
    borderRadius: 9,
    backgroundColor: '#F1DFC0',
    color: '#9A713E',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    overflow: 'hidden',
    textAlignVertical: 'center',
  },
  featureNoteCopy: { flex: 1, gap: 5 },
  featureNoteTitle: { color: '#896C45', fontSize: 11, fontWeight: '900' },
  featureNoteText: { color: '#9A896F', fontSize: 10, lineHeight: 17 },

  motionPressableInner: { flex: 1 },
  heroGlowOrb: {
    position: 'absolute',
    width: 235,
    height: 235,
    borderRadius: 118,
    backgroundColor: 'rgba(84,218,173,0.24)',
    borderWidth: 1,
    borderColor: 'rgba(210,255,237,0.18)',
    top: 28,
    right: -74,
  },
  bottomBarShell: {
    marginHorizontal: 12,
    marginBottom: 5,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#397C68',
    shadowOpacity: 0.13,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  bottomGlow: {
    position: 'absolute',
    width: 210,
    height: 90,
    borderRadius: 48,
    backgroundColor: 'rgba(92,202,161,0.25)',
    top: -46,
    left: '28%',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 17,
    paddingTop: 11,
    paddingBottom: 11,
    backgroundColor: 'transparent',
  },
  bottomTab: { flex: 1, alignItems: 'center', gap: 3 },
  bottomGlyphWrap: {
    width: 31,
    height: 28,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomGlyphWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.38)',
    overflow: 'hidden',
    shadowColor: '#59A98C',
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  bottomGlyph: { color: '#A2AEA8', fontSize: 18, fontWeight: '800' },
  bottomGlyphActive: { color: '#168C82' },
  bottomLabel: { color: '#9AA69F', fontSize: 8, fontWeight: '700' },
  bottomLabelActive: { color: '#347D69', fontWeight: '900' },
  globalSpinner: { marginVertical: 8 },
});
