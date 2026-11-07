import { z } from 'zod';

export const SERVICE_KINDS = ['freight', 'roadside', 'water'] as const;
export type ServiceKind = (typeof SERVICE_KINDS)[number];

export const BOOKING_STATUSES = [
  'draft', 'submitted', 'matching', 'offer_received', 'accepted',
  'provider_en_route', 'arrived', 'in_progress', 'completed',
  'cancelled', 'expired', 'disputed',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const SERVICE_CATEGORIES = [
  {
    id: 'freight', code: '01',
    labels: { ar: 'نقل البضائع', fr: 'Transport de marchandises', en: 'Freight transport' },
    descriptions: {
      ar: 'اربط شحنتك بسائقي الشاحنات المناسبين.',
      fr: 'Trouvez un transporteur adapté à votre marchandise.',
      en: 'Connect your shipment with suitable truck drivers.',
    },
  },
  {
    id: 'roadside', code: '02',
    labels: { ar: 'المساعدة على الطريق', fr: 'Dépannage routier', en: 'Roadside assistance' },
    descriptions: {
      ar: 'اعثر على المساعدة الميدانية عند الحاجة.',
      fr: 'Trouvez une assistance à proximité.',
      en: 'Find nearby field assistance when you need it.',
    },
  },
  {
    id: 'water', code: '03',
    labels: { ar: 'توصيل صهاريج المياه', fr: 'Livraison par citerne', en: 'Water tanker delivery' },
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

const CommonBookingFields = {
  pickupAddress: z.string().trim().min(3).max(300),
  pickupLatitude: z.number().min(-90).max(90).optional(),
  pickupLongitude: z.number().min(-180).max(180).optional(),
  requestedAt: z.string().datetime().optional(),
  customerNotes: z.string().trim().max(1000).optional(),
};

function validateCoordinatePairs(
  value: Record<string, unknown>,
  context: z.RefinementCtx,
  pairs: Array<[string, string]>,
) {
  for (const [latitude, longitude] of pairs) {
    if ((value[latitude] === undefined) !== (value[longitude] === undefined)) {
      context.addIssue({
        code: 'custom',
        path: [latitude],
        message: `${latitude} and ${longitude} must be supplied together.`,
      });
    }
  }
}

export const CreateFreightBookingSchema = z.object({
  serviceType: z.literal('freight'),
  ...CommonBookingFields,
  destinationAddress: z.string().trim().min(3).max(300),
  destinationLatitude: z.number().min(-90).max(90).optional(),
  destinationLongitude: z.number().min(-180).max(180).optional(),
  cargoDescription: z.string().trim().min(3).max(1000),
  weightKg: z.number().positive().max(1000000),
  truckType: z.enum(['pickup', 'van', 'flatbed', 'box_truck', 'semi_trailer', 'other']),
  loadingRequirements: z.string().trim().max(500).optional(),
}).superRefine((value, context) => {
  validateCoordinatePairs(value, context, [
    ['pickupLatitude', 'pickupLongitude'],
    ['destinationLatitude', 'destinationLongitude'],
  ]);
});

export const CreateRoadsideBookingSchema = z.object({
  serviceType: z.literal('roadside'),
  ...CommonBookingFields,
  vehicleType: z.enum(['car', 'motorcycle', 'van', 'truck', 'other']),
  issueCategory: z.enum(['mechanical', 'tyre', 'battery', 'fuel', 'towing', 'other']),
  needsTowing: z.boolean(),
  towingDestination: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(1000).optional(),
}).superRefine((value, context) => {
  validateCoordinatePairs(value, context, [['pickupLatitude', 'pickupLongitude']]);
});

export const CreateWaterBookingSchema = z.object({
  serviceType: z.literal('water'),
  ...CommonBookingFields,
  quantityLitres: z.number().int().positive().max(100000),
  intendedUse: z.enum(['residential', 'agricultural', 'other']),
  waterCategory: z.enum(['potable', 'non_potable', 'irrigation']),
  accessNotes: z.string().trim().max(500).optional(),
}).superRefine((value, context) => {
  validateCoordinatePairs(value, context, [['pickupLatitude', 'pickupLongitude']]);
});

export const CreateBookingSchema = z.discriminatedUnion('serviceType', [
  CreateFreightBookingSchema,
  CreateRoadsideBookingSchema,
  CreateWaterBookingSchema,
]);
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export const DevSessionSchema = z.object({
  phoneE164: z.string().trim().regex(/^\+[1-9]\d{7,14}$/),
  displayName: z.string().trim().min(2).max(80),
  role: z.enum(['customer', 'provider', 'admin']),
  adminKey: z.string().optional(),
});
export type DevSessionInput = z.infer<typeof DevSessionSchema>;

export const ProviderApplicationSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  serviceTypes: z.array(z.enum(SERVICE_KINDS)).min(1).max(3),
});
export type ProviderApplicationInput = z.infer<typeof ProviderApplicationSchema>;

export const ProviderReviewSchema = z.object({
  decision: z.enum(['approve', 'reject', 'suspend']),
  notes: z.string().trim().max(1000).optional(),
});
export type ProviderReviewInput = z.infer<typeof ProviderReviewSchema>;

export function isLocale(value: string): value is 'ar' | 'fr' | 'en' {
  return value === 'ar' || value === 'fr' || value === 'en';
}
