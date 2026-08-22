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

| Plan | Pago único | Mensualidad |
|---|---|---|
| Esencial — sitio informativo | $250.000 COP | $150.000 COP/mes |
| Reservas — sitio + motor de citas | $500.000 COP | $150.000 COP/mes |

El primer mes de mantenimiento es gratis (`BUSINESS.firstMonthFree`). La
mensualidad cubre dominio, actualizaciones y modificaciones — **no digas
"hosting"**, se quitó a propósito de todo el copy.

## Estructura

```
app/
  page.tsx              Hero → Plans → SignUp (+ Header, Footer)
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
  SmoothScroll.tsx      Lenis + sync con ScrollTrigger de GSAP
  sections/             Hero, Plans, SignUp, Footer
  ui/background-gradient-animation.tsx   fondo animado (Aceternity)
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

## Almacenamiento

Todo en **Supabase** (`fadbwnnnhfzkefctyoco`), el proyecto compartido de
toda la plataforma:

- `registrations` — prospectos del formulario de este sitio.
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

Este proyecto tiene historial de bugs que **solo aparecen en móvil real** y
que las herramientas automatizadas no detectan. Antes de dar por bueno un
cambio visual, pide al usuario que lo revise en su celular. Un bug de
animación costó una sesión entera de depuración y resultó ser la gráfica
híbrida AMD/NVIDIA del portátil, no el código.
