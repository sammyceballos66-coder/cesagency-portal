-- Tarjetas NFC: a dónde lleva cada número.
--
-- Ejecutar una sola vez en el SQL editor del dashboard de Supabase, ANTES de
-- desplegar el código que la usa (app/r/[numero], app/admin/tarjetas).
--
-- CÓMO FUNCIONA: cada tarjeta lleva impreso un QR, y grabado en el chip, el
-- mismo enlace: https://www.cesagencia.co/r/<numero>. Ese enlace no cambia
-- nunca. Lo que decide a qué negocio llega la persona es esta tabla, que se
-- llena el día que se vende la tarjeta. Así las tarjetas se imprimen en lote
-- antes de saber de quién van a ser, y un negocio que cambia de enlace no
-- necesita tarjeta nueva.
--
-- No se guarda NADA de quien escanea la tarjeta: ni IP ni conteo. Si algún
-- día se quiere contar usos, es una decisión nueva que toca la política de
-- privacidad.

create table tarjetas_nfc (
  numero integer primary key check (numero > 0),
  -- null = tarjeta impresa pero sin vender todavía.
  negocio text,
  destino text check (destino in ('google', 'whatsapp', 'instagram', 'facebook', 'tiktok', 'web')),
  url text check (url is null or url ~* '^https?://'),
  actualizada_en timestamptz not null default now(),
  -- Las tres van juntas: o la tarjeta está libre, o tiene todo.
  check (
    (negocio is null and destino is null and url is null)
    or (negocio is not null and destino is not null and url is not null)
  )
);

-- Crear la tabla no da permisos: sin esto la llave secreta del servidor
-- recibe "permission denied" (ya pasó con otras tablas de este proyecto).
grant select, insert, update, delete on tarjetas_nfc to service_role;

-- RLS prendido y sin políticas: nadie entra con la llave pública. El sitio
-- usa la llave secreta, que salta RLS.
alter table tarjetas_nfc enable row level security;

-- Las primeras 20, el primer lote impreso. Para un lote nuevo se agregan
-- desde la página privada, no a mano.
insert into tarjetas_nfc (numero)
select generate_series(1, 20);
