import { z } from 'zod';

export const SERVICE_KINDS = ['freight', 'roadside', 'water'] as const;
export type ServiceKind = (typeof SERVICE_KINDS)[number];

export const BOOKING_STATUSES = [
  'draft',
  'submitted',
  'matching',
  'offer_received',
  'accepted',
  'provider_en_route',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'expired',
  'disputed',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const SERVICE_CATEGORIES = [
  {
    id: 'freight',
    code: '01',
    labels: {
      ar: 'نقل البضائع',
      fr: 'Transport de marchandises',
      en: 'Freight transport',
    },
    descriptions: {
      ar: 'اربط شحنتك بسائقي الشاحنات المناسبين.',
      fr: 'Trouvez un transporteur adapté à votre marchandise.',
      en: 'Connect your shipment with suitable truck drivers.',
    },
  },
  {
    id: 'roadside',
    code: '02',
    labels: {
      ar: 'المساعدة على الطريق',
      fr: 'Dépannage routier',
      en: 'Roadside assistance',
    },
    descriptions: {
      ar: 'اعثر على المساعدة الميدانية عند الحاجة.',
      fr: 'Trouvez une assistance à proximité.',
      en: 'Find nearby field assistance when you need it.',
    },
  },
  {
    id: 'water',
    code: '03',
    labels: {
      ar: 'توصيل صهاريج المياه',
      fr: 'Livraison par citerne',
      en: 'Water tanker delivery',
    },
    descriptions: {
      ar: 'اطلب صهريج مياه للمنزل أو للاستغلال الفلاحي.',
      fr: 'Commandez une citerne pour votre domicile ou votre exploitation.',
      en: 'Request a water tanker for home or agricultural use.',
    },
  },
] as const;

export const CoordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const CreateFreightRequestSchema = z.object({
  pickup: CoordinateSchema,
  destination: CoordinateSchema,
  pickupAt: z.string().min(1),
  cargoDescription: z.string().trim().min(3).max(1000),
  weightKg: z.number().positive(),
  truckType: z.enum(['pickup', 'van', 'flatbed', 'box_truck', 'semi_trailer', 'other']),
});

export const CreateRoadsideRequestSchema = z.object({
  location: CoordinateSchema,
  vehicleType: z.enum(['car', 'motorcycle', 'van', 'truck', 'other']),
  issueCategory: z.enum(['mechanical', 'tyre', 'battery', 'fuel', 'towing', 'other']),
  notes: z.string().trim().max(1000).optional(),
  needsTowing: z.boolean(),
});

export const CreateWaterRequestSchema = z.object({
  deliveryLocation: CoordinateSchema,
  quantityLitres: z.number().positive().max(100000),
  intendedUse: z.enum(['residential', 'agricultural', 'other']),
  waterCategory: z.enum(['potable', 'non_potable', 'irrigation']),
  preferredAt: z.string().min(1),
});

export type CreateFreightRequest = z.infer<typeof CreateFreightRequestSchema>;
export type CreateRoadsideRequest = z.infer<typeof CreateRoadsideRequestSchema>;
export type CreateWaterRequest = z.infer<typeof CreateWaterRequestSchema>;
