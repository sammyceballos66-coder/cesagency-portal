-- Prospectos del formulario "Regístrate" de la página de CES Agencia
-- (components/sections/SignUp.tsx -> app/api/register/route.ts). No va
-- particionada por business_id como el resto del esquema compartido (ver
-- quality-barber-shop-web/supabase/schema.sql) porque estos son prospectos
-- de la propia agencia, no reservas de un cliente ya existente.
--
-- Mismo proyecto de Supabase compartido de CES Agencia. Ejecutar una sola
-- vez en el SQL editor del dashboard de Supabase.

create table registrations (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  business_name text,
  phone text not null,
  email text not null,
  description text,
  plan_id text not null,
  created_at timestamptz not null default now()
);

create index registrations_created_at_idx on registrations (created_at);
