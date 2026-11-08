import type { ServiceKind } from '@wessali/contracts';

export type Role = 'customer' | 'provider';

export type Session = {
  accessToken: string;
  user: { id: string; displayName: string; phoneE164: string; role: Role };
};

export type FreightDetails = {
  cargo_description?: string;
  weight_kg?: string | number;
  truck_type?: string;
  loading_requirements?: string | null;
};

export type RoadsideDetails = {
  vehicle_type?: string;
  issue_category?: string;
  needs_towing?: boolean;
  towing_destination?: string | null;
};

export type WaterDetails = {
  quantity_litres?: string | number;
  intended_use?: string;
  water_category?: string;
};

export type Booking = {
  id: string;
  public_reference: string;
  service_type: ServiceKind;
  status: string;
  pickup_address: string;
  destination_address?: string | null;
  requested_at?: string | null;
  created_at?: string | null;
  customer_notes?: string | null;
  provider_name?: string | null;
  estimated_amount_minor?: number | null;
  agreed_amount_minor?: number | null;
  currency?: string | null;
  freight?: FreightDetails | null;
  roadside?: RoadsideDetails | null;
  water?: WaterDetails | null;
};

export type ProviderProfile = {
  id?: string;
  status: string;
  business_name?: string;
  verification_notes?: string | null;
  approved_at?: string | null;
  created_at?: string | null;
  services?: Array<{ serviceType: ServiceKind; approved: boolean }>;
};
