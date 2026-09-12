-- Guardar con qué precio entró cada prospecto.
--
-- Ejecutar una sola vez en el SQL editor del dashboard de Supabase. Es una
-- migración sobre la tabla que ya existe, no un `create table`: los registros
-- viejos quedan con estas tres columnas en null, que es correcto — de ellos
-- no se sabe el precio y no hay que inventarlo.
--
-- POR QUÉ HACE FALTA: /terminos promete que "el precio que rige tu contrato es
-- el que esté publicado el día en que contratas", y desde que los descuentos
-- corren en ventanas la mayoría de prospectos entra con precio rebajado. Sin
-- estas columnas, en unos meses la única forma de saber qué precio le tocaba a
-- quién sería el `created_at` y la memoria de Samuel.
--
-- Los montos van en pesos enteros (no centavos): el peso colombiano no se
-- cobra fraccionado y todos los precios del sitio son múltiplos de mil.
--
-- No hace falta volver a dar permisos: un `grant` es a nivel de tabla, así que
-- las columnas nuevas quedan cubiertas por el que ya tiene `registrations`.

alter table registrations
  add column if not exists promo_id text,
  add column if not exists promo_label text,
  add column if not exists setup_cop integer,
  add column if not exists monthly_cop integer;

comment on column registrations.promo_id is
  'Id estable de la ventana (ej. antes-de-diciembre). Es la llave para agrupar: el label es copy de venta y se reescribe.';
comment on column registrations.promo_label is
  'El nombre exacto que la persona vio, o null si no había promoción. Sirve para saber qué se le prometió, no para agrupar.';
comment on column registrations.setup_cop is
  'Pago único en COP que se le mostró, resuelto en el servidor al momento de guardar.';
comment on column registrations.monthly_cop is
  'Mensualidad en COP que se le mostró, resuelta en el servidor al momento de guardar.';
