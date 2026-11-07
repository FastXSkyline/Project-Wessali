CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164 text NOT NULL UNIQUE,
  password_hash text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  preferred_locale text NOT NULL DEFAULT 'ar' CHECK (preferred_locale IN ('ar', 'fr', 'en')),
  avatar_object_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE provider_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'suspended')),
  verification_notes text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE provider_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN ('freight', 'roadside', 'water')),
  is_approved boolean NOT NULL DEFAULT false,
  capabilities jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, service_type)
);

CREATE TABLE vehicles_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN ('freight', 'roadside', 'water')),
  display_name text NOT NULL,
  vehicle_type text NOT NULL,
  capacity_kg numeric(12, 2),
  capacity_litres integer,
  registration_reference text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (capacity_kg IS NULL OR capacity_kg > 0),
  CHECK (capacity_litres IS NULL OR capacity_litres > 0)
);

CREATE TABLE provider_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles_equipment(id) ON DELETE SET NULL,
  document_type text NOT NULL,
  object_key text NOT NULL,
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'expired')),
  expires_at timestamptz,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  wilaya_code text,
  boundary geography(MultiPolygon, 4326),
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE provider_coverage (
  provider_id uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  service_area_id uuid NOT NULL REFERENCES service_areas(id) ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN ('freight', 'roadside', 'water')),
  PRIMARY KEY (provider_id, service_area_id, service_type)
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_reference text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_provider_id uuid REFERENCES provider_profiles(id) ON DELETE SET NULL,
  service_type text NOT NULL CHECK (service_type IN ('freight', 'roadside', 'water')),
  status text NOT NULL DEFAULT 'submitted' CHECK (
    status IN ('draft', 'submitted', 'matching', 'offer_received', 'accepted',
    'provider_en_route', 'arrived', 'in_progress', 'completed', 'cancelled', 'expired', 'disputed')
  ),
  pickup_location geography(Point, 4326),
  destination_location geography(Point, 4326),
  pickup_address text,
  destination_address text,
  requested_at timestamptz,
  estimated_amount_minor bigint CHECK (estimated_amount_minor IS NULL OR estimated_amount_minor >= 0),
  agreed_amount_minor bigint CHECK (agreed_amount_minor IS NULL OR agreed_amount_minor >= 0),
  currency char(3) NOT NULL DEFAULT 'DZD',
  customer_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz
);

CREATE TABLE freight_details (
  booking_id uuid PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,
  cargo_description text NOT NULL,
  cargo_category text,
  weight_kg numeric(12, 2) NOT NULL CHECK (weight_kg > 0),
  length_cm numeric(10, 2),
  width_cm numeric(10, 2),
  height_cm numeric(10, 2),
  truck_type text NOT NULL,
  loading_requirements text
);

CREATE TABLE roadside_details (
  booking_id uuid PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,
  vehicle_type text NOT NULL,
  issue_category text NOT NULL,
  needs_towing boolean NOT NULL DEFAULT false,
  towing_destination text,
  notes text
);

CREATE TABLE water_details (
  booking_id uuid PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,
  quantity_litres integer NOT NULL CHECK (quantity_litres > 0),
  intended_use text NOT NULL CHECK (intended_use IN ('residential', 'agricultural', 'other')),
  water_category text NOT NULL CHECK (water_category IN ('potable', 'non_potable', 'irrigation')),
  source_declaration text,
  access_notes text
);

CREATE TABLE provider_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE RESTRICT,
  amount_minor bigint CHECK (amount_minor IS NULL OR amount_minor >= 0),
  currency char(3) NOT NULL DEFAULT 'DZD',
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, provider_id)
);

CREATE TABLE booking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  previous_status text,
  new_status text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE location_samples (
  id bigserial PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  location geography(Point, 4326) NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  amount_minor bigint NOT NULL CHECK (amount_minor >= 0),
  currency char(3) NOT NULL DEFAULT 'DZD',
  method text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'paid', 'failed', 'refunded', 'cancelled')),
  external_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  entry_type text NOT NULL CHECK (entry_type IN ('customer_charge', 'provider_amount', 'platform_fee', 'refund', 'adjustment', 'settlement')),
  amount_minor bigint NOT NULL,
  currency char(3) NOT NULL DEFAULT 'DZD',
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  subject_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  moderation_status text NOT NULL DEFAULT 'visible' CHECK (moderation_status IN ('visible', 'hidden', 'flagged')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, author_user_id, subject_user_id)
);

CREATE TABLE support_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  opened_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  category text NOT NULL,
  description text NOT NULL,
  resolution text,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id bigserial PRIMARY KEY,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_provider_services_type_approved ON provider_services(service_type, is_approved);
CREATE INDEX idx_vehicles_provider_status ON vehicles_equipment(provider_id, status);
CREATE INDEX idx_bookings_customer_created ON bookings(customer_id, created_at DESC);
CREATE INDEX idx_bookings_provider_status ON bookings(assigned_provider_id, status);
CREATE INDEX idx_bookings_service_status_created ON bookings(service_type, status, created_at DESC);
CREATE INDEX idx_bookings_pickup_location ON bookings USING GIST(pickup_location);
CREATE INDEX idx_service_areas_boundary ON service_areas USING GIST(boundary);
CREATE INDEX idx_location_samples_booking_recorded ON location_samples(booking_id, recorded_at DESC);
CREATE INDEX idx_location_samples_location ON location_samples USING GIST(location);
CREATE INDEX idx_offers_booking_status ON provider_offers(booking_id, status);
CREATE INDEX idx_booking_events_booking_created ON booking_events(booking_id, created_at);
CREATE INDEX idx_payment_records_booking_status ON payment_records(booking_id, status);
CREATE INDEX idx_support_cases_status_created ON support_cases(status, created_at DESC);
