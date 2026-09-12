<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CES Agencia — sitio propio (cesagencia.co)

Sitio de marketing de CES Agencia, la agencia de Samuel Ceballos y Emmanuel
Castañeda (Pereira / Dosquebradas, Colombia). Vende páginas web a pequeños
negocios bajo un modelo SaaS de subdominios.

## El modelo de negocio (afecta decisiones técnicas)

Los clientes **no compran dominio propio**: reciben un subdominio de
`cesagencia.co` (ej. `qualitybarbershop.cesagencia.co`) y "arriendan" la
plataforma. CES es dueña del código y la infraestructura.

Dos planes, definidos en `lib/business.ts`:

| Plan | Pago único | Mensualidad | En promoción |
|---|---|---|---|
| Esencial — página informativa | $300.000 COP | $200.000 COP/mes | $250.000 + $150.000/mes |
| Reservas — página con citas automáticas | $500.000 COP | $300.000 COP/mes | $500.000 + $250.000/mes |

El primer mes de mantenimiento es gratis (`BUSINESS.firstMonthFree`). La
mensualidad cubre dominio, actualizaciones y modificaciones — **no digas
"hosting"**, se quitó a propósito de todo el copy.

Los precios se guardan como **números**, no como texto ya formateado. Antes
eran strings (`"$250.000 COP (pago único)"`) que la tarjeta partía por
espacios para sacar la cifra; eso no permitía mostrar el precio anterior
tachado y se rompía con solo cambiar la redacción. Para pintarlos:
`formatCOP()` y `pricingFor(plan, live)`.

### Promociones

Los descuentos viven en **ventanas** con fecha de inicio y fin, en
`lib/business.ts`. Se prenden y se apagan solas; nadie tiene que acordarse.

- `VENTANAS_ANUALES` se repiten todos los años en las mismas fechas (`MM-DD`).
  Hoy son tres: **Listo para diciembre** (20 oct – 8 nov), **Arranque de año**
  (8 – 31 ene) y **Antes del Día de la Madre** (6 – 26 abr).
- `VENTANAS_PUNTUALES` pasan una sola vez, con año explícito (`AAAA-MM-DD`).
  Hoy solo está *Descuento por apertura*, del 10 sep al 8 nov de 2026.

Las fechas salen del calendario **del cliente**, no del calendario general.
Una barbería en diciembre está llena y sin tiempo para pensar en una página;
el momento de venderle es el de *antes* del pico, no el del pico.

**Precedencia: si una puntual y una anual se solapan, gana la puntual.** Es
una regla escrita, no un efecto del orden de la lista. Sin ella, el 20 de
octubre de 2026 el nombre de la promoción cambiaría solo a mitad de camino sin
que cambiara ni un peso del precio.

**Todas las ventanas dan el mismo descuento.** Los precios rebajados viven en
cada plan (`promoSetup`/`promoMonthly`), no en la ventana. Si alguna necesita
un descuento propio, hay que mover esos campos y cambiar la firma de
`pricingFor`.

Que caduquen no es un capricho técnico. Un "descuento limitado" que nunca
termina deja de ser un descuento, y el Estatuto del Consumidor (Ley 1480 de
2011) exige que el precio tachado sea uno que de verdad se haya cobrado. Entre
ventana y ventana el sitio cobra el precio de lista **de verdad**, y eso es lo
que lo hace cierto. Por eso son pocas y cortas.

`promoVigente()` es la **única** función que mira el reloj, y devuelve la
ventana activa o `null`. Antes eran dos (`promoIsLive` + `promoDeadlineLabel`)
y con varias ventanas eso es una carrera: a las 23:59:59 del último día la
primera podía decir que sí y la segunda devolver la fecha de otra ventana.

`app/page.tsx` la resuelve **una sola vez en el servidor** y baja el resultado
como prop. `PromoBar` y `Plans` **no importan las ventanas** — si volvieran a
leer una constante global, mostrarían el nombre de una promoción y la fecha de
otra. El agente de WhatsApp la resuelve por petición dentro de
`buildSystemPrompt()`: como constante de módulo, una función serverless tibia
seguiría ofreciendo un descuento vencido o se perdería uno recién abierto.

Cuando **no** hay ventana viva, el agente tiene prohibido decir cuándo vuelve
el descuento. Es una decisión comercial, no técnica: anunciarle a alguien que
en enero hay promoción le da una razón para no comprar hoy.

`revalidate = 600` en la portada (diez minutos, no una hora): ahora el ciclo
también tiene que **encender** ventanas, y abrir tarde cuesta plata mientras
que cerrar tarde cuesta credibilidad.

Un error de dedo en una fecha **revienta el build**, no la página: la
validación corre al importar el módulo, así que Vercel cancela el despliegue y
el sitio en línea se queda como estaba.

### Contenido para redes (servicio adicional)

`CONTENIDO` en `lib/business.ts`, sección `components/sections/Contenido.tsx`.
**No es un plan más y no va dentro de `PLANS`**: las páginas valen lo mismo
para todos, pero aquí lo que se produce cada mes se acuerda con cada negocio,
así que el precio es un "desde" y no una cifra cerrada.

Eso obligó a corregir el copy de los planes, que decía "el precio es el mismo
para todos" y con este servicio dejaba de ser cierto. Ahora dice "las páginas
valen lo mismo para todos".

**Lo que NO se publica, a propósito:**

- *El piso real de negociación.* `desde` es el precio de arranque. El número
  al que Samuel está dispuesto a bajar hablando es más bajo y no vive en el
  código: publicarlo es regalarlo antes de sentarse.
- *El paquete exacto de un cliente.* Lo que paga uno por su volumen no es lo
  que va a pagar otro. Poner una cifra al lado de un paquete concreto haría
  que todos esperen ese paquete por ese precio.

**Todo Renault Pereira** es el cliente que aparece como prueba. CES le crea el
contenido que publica cada mes, y ellos autorizaron que se les nombre.

⚠️ **No uses el logo ni la identidad de Renault.** Ellos pueden autorizar que
se les nombre como cliente —y lo hicieron— pero la marca Renault no es suya
sino del fabricante, así que no pueden licenciarla. Va el nombre del negocio y
el enlace a lo suyo, nada más. Se les describe como ellos se describen en su
propio sitio ("repuestos Renault y multimarca"), no como concesionario.

Los enlaces a sus redes están vacíos en `CONTENIDO.cliente` y la sección los
pinta solo si tienen algo — falta que Samuel pase los usuarios.

## Estructura

```
app/
  page.tsx              Hero → Showcase → Plans → Contenido → SignUp (+ Header, Footer)
  terminos/             términos de servicio (pública, enlazada en el footer)
  privacidad/           política de privacidad (pública, enlazada en el footer)
  layout.tsx            fuentes (Space Grotesk display + Inter body)
  globals.css           tokens de color en :root, clases .field/.tilt/.bubble
  api/
    register/           formulario "Regístrate" → tabla registrations (Supabase)
    whatsapp/           webhook de Twilio → agente de ventas (Claude)
    whatsapp/digest/    cron diario 1am UTC → resumen de leads a los fundadores
components/
  Header.tsx            nav sticky, logo, CTA a #registro
  PromoBar.tsx          franja de promoción, encima del header
  SmoothScroll.tsx      Lenis + sync con ScrollTrigger de GSAP
  sections/             Hero, Showcase, Plans, Contenido, SignUp, Footer
hooks/useTilt.ts        efecto tilt 3D en tarjetas
lib/
  business.ts           ⚠️ fuente única de planes/precios (sitio + agente)
  supabase.ts           cliente server-side, llave secreta
  whatsapp-agent.ts     system prompt del agente de ventas
  conversations.ts      historial de WhatsApp (Supabase)
  gsap.ts               registro de plugins + prefersReducedMotion()
supabase/*.sql          esquemas: registrations, whatsapp_conversations
```

## Reglas del proyecto

**`lib/business.ts` es la fuente única de verdad** para planes, precios y
datos del negocio. El sitio y el agente de WhatsApp leen de ahí — si cambias
un precio solo en un componente, el agente queda contradiciendo la página.

**Stack de animación instalado en todos los proyectos**: `framer-motion`,
`gsap`, `lenis`, `animejs`, `three` + `@react-three/fiber` + `@react-three/drei`.
Se instalan por defecto aunque no se usen todavía. GSAP se usa vía
`useGSAP` con `{ scope }`, y siempre con guarda `prefersReducedMotion()`.

**Stacking en móvil**: nunca uses z-index negativo para mandar el fondo
atrás. El patrón correcto (ya aplicado en `app/page.tsx`) es dejar el fondo
en flujo normal y envolver **el contenido** en `relative z-10`. El z-index
negativo + WebKit móvil causó un bug real donde el fondo solo aparecía
durante el rebote del overscroll.

**Modales**: usa `<dialog>` nativo con `showModal()`, no un `div` con
`fixed inset-0`. Dos intentos con overlay propio chocaron con un bug real de
WebKit móvil (hueco blanco enorme arriba del panel cuando la barra del
navegador está visible). Ver `components/sections/SignUp.tsx`.

**Sitios de clientes**: viven en subcarpetas (`quality-barber-shop-web/`,
`aicontador-web/`, `renault-pereira-web/`) y están en el `.gitignore` de este
repo. Cada uno tiene **su propio repo de GitHub**. No los toques desde aquí.

Solo `quality-barber-shop-web` es cliente real en producción, y es el único
con proyecto de Vercel: los otros dos son pruebas que existen en GitHub pero
no están desplegadas. Sus repos se crearon el 19 de agosto de 2026 —antes
vivían únicamente en el disco de Samuel, sin respaldo en ningún lado.

## Diseño

El sitio se rediseñó el 10 de septiembre de 2026 porque se veía genérico.
Lo que lo hacía verse así, y lo que se hizo:

- **Los blobs animados de Aceternity se eliminaron** (el componente ya no
  existe). Esos manchones azules desenfocados son la firma visual de media
  web hecha con plantilla. El fondo ahora es CSS puro en `.field`: un
  resplandor fijo, una **retícula fina** y un grano muy leve. La retícula es
  lo que da el aire de "hecho a propósito" en vez de "degradado bonito".
- **El texto con degradado del titular se quitó**, que es la otra señal
  típica. En su lugar va tinta sólida con un **subrayado dorado** (`.marker`)
  detrás de las palabras clave.
- **Se dejó de meter todo en tarjetas blancas.** El fondo pasó de un
  periwinkle saturado a casi blanco, y con eso el texto puede ir sobre la
  página; las tarjetas quedan solo para lo que de verdad es una tarjeta.
- **El dorado es el segundo color de la marca**, no un adorno: marca la
  promoción, el plan destacado y el subrayado. Sale del mismo par
  negro+dorado del sitio de Quality Barber Shop.
- **Hay una banda oscura** (la sección `Showcase`) para que la página cambie
  de valor en algún punto en vez de ser clara de arriba abajo.

`.drift` es lo único del fondo que se mueve, y se anima con `transform` para
que lo resuelva la GPU. Se apaga entero con `prefers-reduced-motion`.

### La captura de Quality Barber Shop

`public/trabajo-quality-barber-shop.webp` es una **foto del sitio del cliente
tomada el 10 de septiembre de 2026**: hay que volver a tomarla cuando la
barbería cambie su diseño, o la portada queda mostrando algo que ya no es.

Se probó primero con un `<iframe>` del sitio en vivo, que tenía la ventaja de
no quedar nunca desactualizado. Se descartó: ese sitio anima su fondo sin
parar, y tenerlo corriendo dentro de la portada dejaba al visitante
renderizando dos páginas a la vez — en celulares de gama media eso se nota, y
este proyecto ya tiene historial de bugs que solo aparecen en móvil real.

## Almacenamiento

Todo en **Supabase** (`fadbwnnnhfzkefctyoco`), el proyecto compartido de
toda la plataforma:

- `registrations` — prospectos del formulario de este sitio. Guarda **con qué
  precio entró** cada uno (`promo_id`, `promo_label`, `setup_cop`,
  `monthly_cop`), porque `/terminos` promete respetarle a cada quien el precio
  del día en que contrató y, con los descuentos en ventanas, la mayoría entra
  con precio rebajado. Se resuelve **en el servidor** al guardar; aceptarlo del
  navegador dejaría que cualquiera dijera que le ofrecieron la página por mil
  pesos. Se guardan el `id` y el `label`: el id es la llave estable para
  agrupar, el label es el copy exacto que la persona vio y se va a reescribir.

  **El SQL va antes que el despliegue.** `app/api/register/route.ts` manda las
  cuatro columnas en un único insert, así que si el código llega primero,
  PostgREST rechaza la fila entera y se pierde **el prospecto completo**, no
  solo el precio. Migración en `supabase/registrations-precio.sql`.

  El endpoint es público y sin captcha. Tiene topes de tamaño por campo, un
  corte a 8 KB antes de parsear el cuerpo —antes entraba una descripción de
  4 MB, y la base es la **compartida** con las reservas de Quality Barber
  Shop— y un freno de **5 registros cada 10 minutos por IP** (`lib/rate-limit.ts`),
  que corre antes de leer el cuerpo y antes de tocar la base.

  Ese freno está **en código y no en el Firewall de Vercel a propósito**: el
  rate limit del WAF es de los planes pagos y este proyecto está en Hobby, así
  que "se configura en el panel" no era una opción. El contador vive en la
  memoria de la función, o sea que el límite es **por instancia, no global**:
  frena en seco un bucle desde una máquina, pero no garantiza nada contra un
  ataque repartido entre muchas IP. Para eso habría que llevar el contador a
  Supabase, lo que implica guardar direcciones IP —dato personal— y tocar la
  política de privacidad. Hoy la IP solo vive en memoria unos minutos y no se
  escribe en ningún lado.
- `whatsapp_conversations` — historial del agente de ventas, una fila por
  número (`lib/conversations.ts`).
- El esquema multi-tenant de las barberías (`businesses`, `barbers`,
  `bookings`, `date_blocks`, separado por `business_id`) vive en el mismo
  proyecto pero se administra desde `quality-barber-shop-web`.

Vercel Blob **ya no se usa**: el historial de WhatsApp vivía ahí como un
único JSON y se migró a Supabase. Si algún día vuelve a hacer falta
almacenamiento de archivos, es una decisión nueva, no un regreso a esto.

El resumen diario de leads (`/api/whatsapp/digest`) define "hoy" en hora de
Colombia (UTC-5 fijo, sin horario de verano), no en UTC — comparar contra el
día UTC dejaba por fuera casi toda la jornada. El cron corre a las 4:00 UTC
= 11:00 p.m. de Colombia para alcanzar a cubrir el día completo.

## Páginas legales

`/terminos` y `/privacidad` son estáticas y públicas. Existen porque TikTok
las exige para conectar su API —ya bloqueó a CES por no tenerlas— y porque
las pedirán Meta y cualquier pasarela de pago.

No son plantilla: dicen lo que el código hace de verdad. Los planes y precios
de los términos salen de `lib/business.ts`, así que no se desincronizan. La
política nombra los seis terceros que tocan datos —Supabase, Vercel, Google,
Twilio, Anthropic, y Meta/TikTok— y admite dos cosas en vez de esconderlas:
que CES todavía no está constituida como sociedad, y que en las reservas de
los clientes de nuestros clientes CES es **encargado**, no responsable.

**Falta todavía**, y hay que hacerlo antes de que la barbería reciba citas
reales: la casilla de autorización en los dos formularios (reservas y
registro), y una política propia para la barbería en su dominio. El aviso
tiene que estar donde se recogen los datos — quien reserva en
`qualitybarbershop.cesagencia.co` nunca pasa por cesagencia.co.

El registro en el RNBD de la SIC **no aplica**: obliga solo a sociedades y
entidades sin ánimo de lucro con activos sobre 100.000 UVT.

## Integraciones

**Twilio + WhatsApp**: el sitio y el agente todavía corren sobre el **número
sandbox compartido** (`+1 415 523 8886`), no uno propio de CES. Para tener
número propio falta: pasar la cuenta de Twilio de trial a pagada (bloqueada
por verificación de identidad de la titular), verificar el negocio en Meta
Business Manager, registrar el número y aprobar plantillas.

**Anthropic**: `lib/whatsapp-agent.ts` arma el system prompt desde
`BUSINESS` y `PLANS`. Responde en español colombiano, mensajes cortos, y
marca `wantsHuman` cuando el prospecto quiere hablar con una persona.

## Comandos

```bash
npm run dev      # localhost:3000
npm run build    # verificar antes de desplegar
npx vercel deploy --prod
```

Despliegue automático por push a `main` (repo:
`sammyceballos66-coder/cesagency-portal`). Variables de entorno en Vercel —
ver `.env.example`.

## Verificación

**El formulario de registro no se puede probar en `localhost`** desde el
portátil de Samuel: Node no logra verificar la cadena TLS de Supabase y el
insert falla con `UNABLE_TO_VERIFY_LEAF_SIGNATURE` antes de salir de la
máquina. No es un bug del código y en Vercel funciona. Si hay que probarlo en
local, `node --use-system-ca`.

Este proyecto tiene historial de bugs que **solo aparecen en móvil real** y
que las herramientas automatizadas no detectan. Antes de dar por bueno un
cambio visual, pide al usuario que lo revise en su celular. Un bug de
animación costó una sesión entera de depuración y resultó ser la gráfica
híbrida AMD/NVIDIA del portátil, no el código.
