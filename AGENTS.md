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
  Hoy solo está *Descuento por apertura*, del 10 al 30 de septiembre de 2026.
  Del 1 al 19 de octubre rigen los precios de lista, y el 20 abre sola
  *Listo para diciembre*.

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

⚠️ **El logo del cliente se muestra por decisión de Samuel** (octubre de 2026),
en `public/cliente-todo-renault-pereira.webp`. Ellos autorizaron que se les
nombre, pero su logo trae el **rombo de Renault**, que es del fabricante y no
suyo. Si algún día hay reclamo, se quita el logo y queda solo el nombre, como
estaba antes. Se les describe como ellos se describen en su propio sitio
("repuestos Renault y multimarca"), no como concesionario.

El enlace a su Instagram está guardado pero **apagado a propósito** detrás de
`CONTENIDO.cliente.mostrarRedes`: la cuenta tenía 33 seguidores, y mandar ahí
a un prospecto justo después de prometerle visibilidad argumenta en contra de
la venta.

### Ficha de Google (servicio adicional)

`FICHA_GOOGLE` en `lib/business.ts`, sección `components/sections/FichaGoogle.tsx`
(`#ficha-google`). Lanzado el 5 de octubre de 2026: montaje de **$250.000**
(pago único, **incluye una tarjeta NFC de reseñas**) y **$150.000 al mes**.
Precios de Samuel; la referencia del mercado está en el comentario de la
constante (Labweb cobra $800.000 + $600.000/mes).

Tres reglas que dicen la sección, los términos, las preguntas y el agente, y
que no se negocian: **nunca se pide la contraseña** (el dueño agrega a CES como
administrador y la ficha sigue siendo suya), **no se compran ni inventan
reseñas** (se responden todas, también las malas) y **no se promete el primer
lugar** en Google.

Va entre "Cómo funciona" y la banda oscura de contenido, y en el resumen de
servicios de arriba (que pasó de tres a cuatro tarjetas).

### Tarjeta NFC (servicio adicional)

`TARJETA_NFC` en `lib/business.ts`, sección `components/sections/TarjetaNfc.tsx`.
$50.000, **pago único**. La tarjeta es del cliente y sigue funcionando aunque
no pague ninguna mensualidad — así lo dicen los términos y las preguntas
frecuentes. Pasa por un desvío de CES (ver abajo), y por eso ese desvío no se
apaga nunca.

Hay cinco diseños, en `public/tarjeta-nfc-*.webp`: reseñas de Google,
WhatsApp, Facebook, Instagram y TikTok. Son los que Samuel escogió (octubre de
2026). La sección muestra uno grande y los demás como miniaturas para cambiar
entre ellos. **Todos valen lo mismo por unidad** (`precio`). `precioDos` es
**solo para dos del mismo diseño**: una de Google y una de WhatsApp son dos
tarjetas a `precio` cada una, no un par.

Antes la muestra era una tarjeta dibujada en código, sin logos. Estos diseños
**sí llevan los logos de cada marca, por decisión de Samuel**. Son marcas de
esas empresas; si algún día hay reclamo, el cambio es volver a muestras sin
ellos.

#### Tarjetas con número: el desvío `/r/<número>`

La tarjeta **no lleva el enlace del negocio**. Su QR (atrás) y su chip llevan
`https://www.cesagencia.co/r/7`, y la tabla `tarjetas_nfc` de Supabase dice a
dónde manda el 7 (`supabase/tarjetas-nfc.sql`, `app/r/[numero]/route.ts`).
Así se imprimen en lote **antes de saber de quién van a ser**, y en plena
venta Samuel asigna el número desde el celular en `/admin/tarjetas`, en
menos de un minuto, sin imprenta ni NFC Tools. Si el negocio cambia de
enlace, se edita la fila y la tarjeta sigue igual.

- El redirect es **302 con `no-store`**, nunca 301/308: un permanente se
  queda guardado en el celular de quien ya escaneó, y el cambio de destino
  no le llegaría.
- **El enlace se queda activo siempre.** El cliente pagó la tarjeta una vez
  y los términos prometen que funciona aunque no pague nada más. Nunca se
  libera la tarjeta de alguien por falta de pago.
- `/r/muestra` es el QR de la página de CES y trae de vuelta a
  `#tarjeta-nfc`. **No lo apuntes a un cliente real**: los visitantes que
  lo escanean por curiosidad le dejarían reseñas sin haber ido nunca.
- No se guarda nada de quien escanea (ni IP ni conteo). Contar toques sería
  una decisión nueva que toca la política de privacidad.
- `/admin` entra con **una sola clave** (`TARJETAS_CLAVE` en Vercel), sin
  usuarios. La cookie guarda una firma HMAC derivada de la clave, así que
  cambiar la clave cierra todas las sesiones. `haySesion()` lee la cookie
  antes de mirar la clave **a propósito**: si no, sin la variable el build
  congelaba las páginas privadas como estáticas.
- Asignar un número que ya es de **otro** negocio da error: un dedazo le
  quitaría la tarjeta del mostrador a alguien sin que nadie se diera cuenta.
  Las tarjetas vendidas se cambian con "Editar" en la lista.

Los reversos para imprimir (QR + número) están en el OneDrive de Samuel,
`CES - Tarjetas NFC para imprimir/reverso/<diseño>/`, del 1 al 40 (21 a 40
desde el 10 de octubre de 2026, para el lote de 40 tarjetas): cada
diseño del frente tiene su reverso con los mismos colores, así que la
imprenta combina `tarjeta-google-resenas.png` con `reverso/google/reverso-07.png`.
El número sale del reverso, no del frente. **No le pidas el QR a ChatGPT**:
dibuja algo que parece un QR y no se lee. Los QR se generan con código y se
comprobaron todos con un lector antes de entregarlos. Para un lote nuevo
hay que generar los siguientes números **y** agregarlos en el panel con
"Agregar tarjetas": un QR impreso sin fila en la tabla lleva a "sin activar".

El generador vive en `CES - Tarjetas NFC para imprimir/generador/`:
`npm install` una vez, luego `node reversos.cjs 41 60` y `node verificar.cjs`
(lee cada QR con jsQR; hay que cambiarle el rango adentro). Usa el `sharp`
de `node_modules` de este repo, por ruta absoluta.

Las imágenes de la página son **los mismos archivos que se imprimen**, pasados
a webp: tarjeta de PVC vertical de 54 x 85,6 mm, 638 x 1012 px a 300 dpi. Los
PNG para la imprenta están fuera del repo, en el OneDrive de Samuel
(`CES - Tarjetas NFC para imprimir`). Si cambia un diseño, se cambia en los dos
lados, o la página promete una tarjeta distinta a la que se entrega.

⚠️ El copy dice "dejar una reseña", **nunca** "reseñas positivas". Google
permite estas tarjetas pero prohíbe filtrar a quién se le pide la reseña y dar
cualquier cosa a cambio. El agente de WhatsApp tiene la misma prohibición
escrita en su prompt.

## Estructura

```
app/
  page.tsx              Hero → Servicios → Showcase → Plans → ComoFunciona →
                        FichaGoogle → Contenido → TarjetaNfc → Preguntas → SignUp
                        (+ Header, Footer)
  r/[numero]/           desvío de las tarjetas NFC (QR y chip) → tabla tarjetas_nfc
  admin/                página privada con clave: asignar tarjetas NFC
  tarjeta-sin-activar/  a donde cae una tarjeta sin vender o si la base falla
  terminos/             términos de servicio (pública, enlazada en el footer)
  privacidad/           política de privacidad (pública, enlazada en el footer)
  layout.tsx            fuentes (Bricolage Grotesque títulos + Inter texto)
  globals.css           tokens de color en :root, clases .field/.tilt/.bubble
  api/
    register/           formulario "Regístrate" → tabla registrations (Supabase)
    whatsapp/           webhook de Twilio → agente de ventas (Claude)
    whatsapp/digest/    cron diario 1am UTC → resumen de leads a los fundadores
components/
  Header.tsx            nav sticky, logo, CTA a #registro
  HeroVisual.tsx        composición del hero: celular + tarjeta NFC + aviso de cita
  PromoBar.tsx          franja de promoción, encima del header
  SmoothScroll.tsx      Lenis + sync con ScrollTrigger de GSAP
  sections/             Hero, Servicios, Showcase, Plans, ComoFunciona,
                        FichaGoogle, Contenido, TarjetaNfc, Preguntas, SignUp, Footer
hooks/useTilt.ts        efecto tilt 3D en tarjetas
lib/
  business.ts           ⚠️ fuente única de planes/precios (sitio + agente)
  supabase.ts           cliente server-side, llave secreta
  whatsapp-agent.ts     system prompt del agente de ventas
  tarjetas.ts           destinos y validación de enlaces de las tarjetas NFC
  admin-sesion.ts       clave y cookie de /admin
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

**Enlaces internos y Lenis**: `components/SmoothScroll.tsx` crea Lenis con
`anchors: true`, y **no se puede quitar**. Sin esa opción los enlaces a
`#planes`, `#preguntas`, etc. fallaban de forma intermitente: la dirección
cambiaba pero la página no se movía, o se movía una vez y la siguiente no. Las
secciones con `id` llevan `scroll-margin-top` en `globals.css` para que el
header fijo no les tape el título, y Lenis lo respeta al saltar.

Para probar esto **no sirve el panel del navegador de Claude cuando está
oculto**: ahí `requestAnimationFrame` no corre y ninguna animación de scroll
avanza, así que todo parece roto. Hay que usar un navegador que esté pintando
(Playwright, o el celular).

**Preguntas frecuentes**: `components/sections/Preguntas.tsx` repite lo que
dicen `/terminos` y `lib/business.ts`. Si cambian los términos, cambia esto
también — un "sí" en las preguntas y un "no" en los términos es lo único que
no puede pasar.

**Modales**: usa `<dialog>` nativo con `showModal()`, no un `div` con
`fixed inset-0`. Dos intentos con overlay propio chocaron con un bug real de
WebKit móvil (hueco blanco enorme arriba del panel cuando la barra del
navegador está visible). Ver `components/sections/SignUp.tsx`.

**Reels de las redes de CES**: viven en otro proyecto, `../ces-reels` (Remotion), con su propio `AGENTS.md`. Copian los diseños de las tarjetas y el logo de `public/` de aquí: si cambian aquí, hay que copiarlos allá.

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
  típica. Las palabras clave (`.marker`) llevaron un subrayado dorado hasta
  el 4 de octubre de 2026; Samuel pidió quitarlo y ahora van en el azul de la
  marca, color sólido. No vuelvas al degradado.
- **Se dejó de meter todo en tarjetas blancas.** El fondo pasó de un
  periwinkle saturado a casi blanco, y con eso el texto puede ir sobre la
  página; las tarjetas quedan solo para lo que de verdad es una tarjeta.
- **El dorado es el segundo color de la marca**, no un adorno: marca la
  promoción, el plan destacado y las etiquetas de las bandas oscuras. Sale del mismo par
  negro+dorado del sitio de Quality Barber Shop.
- **Hay una banda oscura** (la sección `Showcase`) para que la página cambie
  de valor en algún punto en vez de ser clara de arriba abajo.

**Tipografía (4 de octubre de 2026):** los títulos van en **Bricolage
Grotesque** con eje de tamaño óptico; el texto sigue en Inter. Samuel la
escogió entre cuatro opciones con sus títulos reales; Space Grotesk, la de
antes, no le convencía y es de las más repetidas en páginas de plantilla.

**Etiquetas de sección (`.eyebrow`):** píldora con un punto, no raya con
texto suelto. En celular (≤ 480 px) baja el tracking para que la del hero
quepa en una línea, y el radio pasa a 14 px para que, si igual se parte en
un celular angosto, no quede como cápsula estirada.

`.drift` es lo único del fondo que se mueve, y se anima con `transform` para
que lo resuelva la GPU. Se apaga entero con `prefers-reduced-motion`.

### La captura de Quality Barber Shop

`public/trabajo-quality-barber-shop.webp` es una **foto del sitio del cliente
tomada el 10 de septiembre de 2026**: hay que volver a tomarla cuando la
barbería cambie su diseño, o la portada queda mostrando algo que ya no es.

Desde el 4 de octubre de 2026 hay una segunda, **en celular**:
`public/trabajo-quality-barber-shop-movil.webp` (390 px a 2x), dentro del
celular de la composición del hero (`components/HeroVisual.tsx`). Se renueva
junto con la de escritorio.

### La composición del hero

`HeroVisual` llena el lado derecho del hero, que era un espacio vacío, con
los tres lugares del título: el celular con la página de la barbería
("en Google"), la tarjeta NFC ("en el mostrador") y tres avisos tipo
notificación, uno por servicio: reel publicado, cita nueva y reseña nueva.
Se descartó un fondo decorativo porque no decía nada de lo que vende CES.
Los avisos **no llevan cifras ni estrellas**. Samuel pidió "recibiste 100
reseñas hoy" y se cambió por "Nueva reseña en Google · Un cliente usó tu
tarjeta": una cifra así no la logra ningún negocio con una tarjeta
(publicidad engañosa, Ley 1480) y unas estrellas prometerían reseñas
positivas. Lo mismo con redes: "Reel publicado", sin vistas ni seguidores
inventados. El resplandor de detrás va con
`inset` positivo para no abrir scroll lateral en celular.

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

**Botones de WhatsApp del sitio**: desde el 10 de octubre de 2026 llevan al
**WhatsApp Business propio de CES** (`573127780076`, eSIM de Claro a nombre
del papá de Samuel). Antes iban al personal de Emmanuel. Salen de
`NEXT_PUBLIC_WHATSAPP_NUMBER` en Vercel, que se lee en el build: cambiarla
exige redesplegar (`npx vercel redeploy <última de producción>`).
`AGENCY_WHATSAPP_NUMBERS` es otra cosa: a quién le llega el resumen diario.

El pie de página publica **los dos números** (`CONTACTOS_WHATSAPP` en
`lib/business.ts`): el de CES y el personal de Emmanuel (`573117331386`),
pedido de Samuel el 10 de octubre de 2026. Los botones grandes siguen yendo
solo al de CES, para que las conversaciones entren por un lado. Los reels y
flyers de `../ces-reels` también traen los dos.

Este número es de la **app** WhatsApp Business. El agente automático sigue en
el sandbox de Twilio; pasarlo a este número exige Meta y es otra decisión.

**Twilio + WhatsApp**: el agente automático todavía corre sobre el **número
sandbox compartido** (`+1 415 523 8886`), no uno propio de CES. Para tener
número propio falta: pasar la cuenta de Twilio de trial a pagada (bloqueada
por verificación de identidad de la titular), verificar el negocio en Meta
Business Manager, registrar el número y aprobar plantillas.

**El webhook verifica la firma de Twilio** (`lib/twilio-firma.ts`) antes de
hacer cualquier cosa, y responde 403 sin ella. Hasta el 5 de octubre de 2026
aceptaba cualquier POST: una auditoría (skill security-audit de Cloudflare)
confirmó que cualquiera podía gastar sin límite en Anthropic, escribir en la
conversación de cualquier número y meter texto en el resumen de los
fundadores. Además: el remitente tiene que ser `whatsapp:+<dígitos>`, el
mensaje se corta a 1.500 caracteres, hay freno de 20 mensajes cada 10
minutos por remitente, al modelo van solo los últimos 20 mensajes (se guardan
60) y el resumen diario recorta cada fila, quita enlaces y no pasa de 25.
**Si el asistente deja de contestar** después de un cambio en Twilio, mira los
logs: "firma de Twilio ausente o inválida" significa que `TWILIO_AUTH_TOKEN`
no es de la cuenta dueña del número/sandbox, o que Twilio apunta a una URL
distinta (ponla en `TWILIO_WEBHOOK_URL`).

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
