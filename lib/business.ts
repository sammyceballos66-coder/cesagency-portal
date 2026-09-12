// Datos del negocio que usan el sitio, los términos y el agente de WhatsApp.
// Es la fuente única de verdad de planes y precios: si cambias una cifra
// aquí, cambia en los tres lados a la vez y no quedan contradiciéndose.
//
// Los precios se guardan como NÚMEROS, no como texto ya formateado. Antes
// eran strings ("$250.000 COP (pago único)") que la tarjeta partía por
// espacios para sacar la cifra. Eso no permitía mostrar el precio anterior
// tachado junto al vigente, y se rompía con solo cambiar la redacción.

// Colombia es UTC-5 fijo, sin horario de verano.
const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000;

export type Plan = {
  id: string;
  name: string;
  /** En lenguaje llano, para quien no sabe qué es un "Plan Esencial". */
  tagline: string;
  /** Precio de lista, pago único. */
  setup: number;
  /** Precio de lista, mensualidad. */
  monthly: number;
  /** Precio durante la promoción. Si falta, ese cobro no lleva descuento. */
  promoSetup?: number;
  promoMonthly?: number;
  description: string;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "esencial",
    name: "Plan Esencial",
    tagline: "Página informativa",
    setup: 300_000,
    monthly: 200_000,
    promoSetup: 250_000,
    promoMonthly: 150_000,
    description:
      "Para cualquier negocio que quiere un sitio informativo — profesional y llamativo, sin necesidad de reservas en línea.",
    features: [
      "Diseño profesional a la medida de tu negocio",
      "Adaptada a celular y computador",
      "4 o más secciones (inicio, servicios, nosotros, ubicación, etc.)",
      "Entrega de página en minutos",
      "Personalizado a tu gusto",
    ],
  },
  {
    id: "reservas",
    name: "Plan Reservas",
    tagline: "Página con citas automáticas",
    setup: 500_000,
    // El pago único de este plan no lleva descuento — solo la mensualidad.
    monthly: 300_000,
    promoMonthly: 250_000,
    description:
      "Para negocios que viven de las citas (barberías, peluquerías, salones de belleza) — el mismo motor de reservas automático que le armamos a Quality Barber Shop.",
    features: [
      "Diseño profesional a la medida de tu negocio",
      "Adaptada a celular y computador",
      "5 o más secciones (inicio, servicios, productos, nosotros, ubicación, testimonios, etc.)",
      "Entrega de página en minutos",
      "Animaciones sutiles y agradables en la página",
      "Personalizado a tu gusto",
      "Motor de agendamiento de citas dinámico y automático",
    ],
  },
];

// ---------------------------------------------------------------------------
// Promociones por tiempo limitado
// ---------------------------------------------------------------------------
// Los descuentos viven en ventanas con fecha de inicio y de fin. Se prenden y
// se apagan solos; nadie tiene que acordarse de nada.
//
// Que se apaguen solos no es un detalle técnico. Un "descuento limitado" que
// nunca se acaba deja de ser un descuento, y el Estatuto del Consumidor
// (Ley 1480 de 2011) exige que el precio tachado sea uno que de verdad se haya
// cobrado. Entre una ventana y la siguiente el sitio cobra el precio de lista
// de verdad, y eso es justamente lo que hace cierto el precio tachado. Por eso
// las ventanas son pocas y cortas: si cubrieran casi todo el año, el precio de
// lista sería mentira y lo honesto sería bajarlo en vez de tacharlo.
//
// Hay dos clases de ventana:
//
//   VENTANAS_ANUALES    se repiten todos los años en las mismas fechas (MM-DD).
//   VENTANAS_PUNTUALES  pasan una sola vez, con año explícito (AAAA-MM-DD).
//
// PRECEDENCIA: si una puntual y una anual se solapan, gana la puntual. Es una
// regla escrita, no un efecto del orden de la lista: la puntual es la excepción
// que alguien puso a mano, así que manda sobre el calendario de siempre. Sin
// esta regla, el 20 de octubre de 2026 el nombre de la promoción cambiaría solo
// a mitad de camino sin que cambiara ni un peso del precio, y quien volviera al
// sitio vería dos promociones distintas con las mismas cifras.
//
// TODAS LAS VENTANAS DAN EL MISMO DESCUENTO. Los precios rebajados viven en
// cada plan (`promoSetup` / `promoMonthly`), no en la ventana. Si algún día una
// ventana necesita un descuento distinto al de las otras, hay que mover esos
// dos campos a la ventana y cambiar la firma de `pricingFor`.

export type Ventana = {
  id: string;
  /** El nombre que ve el cliente en la franja de arriba y en la sección de planes. */
  label: string;
  /** Por qué existe. Se le pasa al agente de WhatsApp para que sepa qué decir. */
  motivo: string;
  /** Primer día en que aplica, inclusive. */
  desde: string;
  /** Último día en que aplica, inclusive. */
  hasta: string;
};

// Las fechas salen del calendario del CLIENTE, no del calendario general. Una
// barbería en diciembre está llena y sin tiempo para pensar en una página web;
// el momento de venderle es el de ANTES del pico, no el del pico.
export const VENTANAS_ANUALES: Ventana[] = [
  {
    id: "antes-de-diciembre",
    label: "Listo para diciembre",
    motivo:
      "para que la página quede lista antes de diciembre, que es el mes de más clientes para barberías y peluquerías",
    desde: "10-20",
    hasta: "11-08",
  },
  {
    id: "arranque-de-ano",
    label: "Arranque de año",
    motivo:
      "en enero los negocios vienen de su mejor mes y vuelven a tener tiempo para pensar en mejorar",
    desde: "01-08",
    hasta: "01-31",
  },
  {
    id: "antes-del-dia-de-la-madre",
    label: "Antes del Día de la Madre",
    motivo:
      "para llegar con la página lista al Día de la Madre, que es pico fuerte en peluquerías y spas",
    desde: "04-06",
    hasta: "04-26",
  },
];

export const VENTANAS_PUNTUALES: Ventana[] = [
  {
    // La promoción con la que CES abrió. Se corrió hasta el 8 de noviembre de
    // 2026 para que empalme con el final de "Listo para diciembre" y no haya
    // un hueco sin descuento mientras se trabaja la lista de prospectos.
    id: "apertura-2026",
    label: "Descuento por apertura",
    motivo: "es la promoción con la que CES Agencia abrió",
    desde: "2026-09-10",
    hasta: "2026-11-08",
  },
];

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// Las fechas se comparan como números (aaaammdd o mmdd) en vez de construir
// objetos Date. Así no hay aritmética de milisegundos que equivocar, el 29 de
// febrero entra solo en cualquier ventana que lo abarque, y una ventana que
// cruce el 31 de diciembre se resuelve con una sola condición.
function aNumeroCompleto(fecha: string): number {
  const [y, m, d] = fecha.split("-").map(Number);
  return y * 10000 + m * 100 + d;
}

function aNumeroMesDia(fecha: string): number {
  const [m, d] = fecha.split("-").map(Number);
  return m * 100 + d;
}

/**
 * La fecha civil colombiana, sin depender de la zona horaria del servidor.
 * Se corre el reloj 5 horas hacia atrás y se lee en UTC: Vercel corre en UTC,
 * pero no hay por qué darlo por sentado y Colombia no tiene horario de verano.
 */
function fechaEnColombia(now: Date): { completa: number; mesDia: number } {
  const t = new Date(now.getTime() - BOGOTA_OFFSET_MS);
  const y = t.getUTCFullYear();
  const m = t.getUTCMonth() + 1;
  const d = t.getUTCDate();
  return { completa: y * 10000 + m * 100 + d, mesDia: m * 100 + d };
}

// Un error de dedo en una fecha revienta el build, no la página en producción:
// esto corre al importar el módulo, así que `npm run build` falla, Vercel
// cancela el despliegue y el sitio que ya está en línea se queda como estaba.
// Es a propósito — fallar ruidosamente y temprano en vez de servir una promo
// que no se prende nunca sin que nadie se entere.
function revisarVentana(v: Ventana, conAno: boolean): void {
  const formato = conAno ? "AAAA-MM-DD" : "MM-DD";
  for (const campo of ["desde", "hasta"] as const) {
    const valor = v[campo];
    const trozos = valor.split("-").map(Number);
    const mes = conAno ? trozos[1] : trozos[0];
    const dia = conAno ? trozos[2] : trozos[1];
    const bien =
      trozos.length === (conAno ? 3 : 2) &&
      trozos.every((n) => Number.isInteger(n)) &&
      mes >= 1 &&
      mes <= 12 &&
      dia >= 1 &&
      dia <= 31;
    if (!bien) {
      throw new Error(
        `Ventana de promoción "${v.id}": ${campo} = "${valor}" no es una fecha válida. Se espera ${formato}.`,
      );
    }
  }
}

VENTANAS_ANUALES.forEach((v) => revisarVentana(v, false));
VENTANAS_PUNTUALES.forEach((v) => revisarVentana(v, true));

/**
 * La ventana vigente en este momento, o `null` si no hay descuento.
 *
 * Es la ÚNICA función que mira el reloj. Antes había dos (una decía si había
 * promo y otra daba la fecha de fin) y con varias ventanas eso se vuelve una
 * carrera: a las 23:59:59 del último día la primera podía decir que sí y la
 * segunda, medio segundo después, devolver la fecha de otra ventana. Una sola
 * llamada, un solo resultado, y de ahí sale todo lo demás.
 */
export function promoVigente(now: Date = new Date()): Ventana | null {
  const hoy = fechaEnColombia(now);

  for (const v of VENTANAS_PUNTUALES) {
    if (hoy.completa >= aNumeroCompleto(v.desde) && hoy.completa <= aNumeroCompleto(v.hasta)) {
      return v;
    }
  }

  for (const v of VENTANAS_ANUALES) {
    const desde = aNumeroMesDia(v.desde);
    const hasta = aNumeroMesDia(v.hasta);
    // Si `desde` es mayor que `hasta`, la ventana cruza el 31 de diciembre y
    // está viva en los dos extremos del año.
    const viva =
      desde <= hasta
        ? hoy.mesDia >= desde && hoy.mesDia <= hasta
        : hoy.mesDia >= desde || hoy.mesDia <= hasta;
    if (viva) return v;
  }

  return null;
}

/** "8 de noviembre", para decirle al cliente hasta cuándo tiene. */
export function fechaLarga(fecha: string): string {
  const trozos = fecha.split("-").map(Number);
  const [m, d] = trozos.length === 3 ? [trozos[1], trozos[2]] : [trozos[0], trozos[1]];
  return `${d} de ${MESES[m - 1]}`;
}

/**
 * Lo que necesitan los componentes, ya listo para cruzar del servidor al
 * navegador. Los componentes NO importan las ventanas: reciben esto como prop
 * desde `app/page.tsx`, que lo resuelve una sola vez. Si cada componente
 * mirara el reloj por su cuenta, el HTML del servidor y el del navegador
 * podrían no coincidir justo en el minuto en que abre o cierra una ventana.
 */
export type PromoActiva = {
  label: string;
  motivo: string;
  /** Ya formateada: "8 de noviembre". */
  hasta: string;
};

export function promoParaLaPagina(now: Date = new Date()): PromoActiva | null {
  const v = promoVigente(now);
  if (!v) return null;
  return { label: v.label, motivo: v.motivo, hasta: fechaLarga(v.hasta) };
}

// ---------------------------------------------------------------------------
// Precios
// ---------------------------------------------------------------------------

// Se formatea a mano en vez de con Intl/toLocaleString a propósito: esas dos
// pueden dar resultados distintos en el servidor y en el navegador según los
// datos de locale disponibles, y eso rompe la hidratación de React.
function conPuntos(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatCOP(n: number): string {
  return `$${conPuntos(n)}`;
}

export type PlanPricing = {
  /** Lo que se cobra hoy. */
  setup: number;
  monthly: number;
  /** El precio normal, para tacharlo cuando hay descuento. */
  setupList: number;
  monthlyList: number;
  setupDiscounted: boolean;
  monthlyDiscounted: boolean;
  anyDiscount: boolean;
};

/**
 * `live` se pasa como argumento en vez de calcularse aquí adentro para que
 * el servidor decida una sola vez y los componentes de cliente reciban el
 * mismo valor. Si cada uno mirara el reloj por su cuenta, el HTML del
 * servidor y el del navegador podrían no coincidir.
 */
export function pricingFor(plan: Plan, live: boolean): PlanPricing {
  const setupDiscounted = live && plan.promoSetup !== undefined && plan.promoSetup < plan.setup;
  const monthlyDiscounted =
    live && plan.promoMonthly !== undefined && plan.promoMonthly < plan.monthly;

  return {
    setup: setupDiscounted ? plan.promoSetup! : plan.setup,
    monthly: monthlyDiscounted ? plan.promoMonthly! : plan.monthly,
    setupList: plan.setup,
    monthlyList: plan.monthly,
    setupDiscounted,
    monthlyDiscounted,
    anyDiscount: setupDiscounted || monthlyDiscounted,
  };
}

/** Una línea con el precio del plan, para los términos y para el agente. */
export function planPriceSentence(plan: Plan, live: boolean): string {
  const p = pricingFor(plan, live);
  const setup = p.setupDiscounted
    ? `${formatCOP(p.setup)} COP de pago único (antes ${formatCOP(p.setupList)})`
    : `${formatCOP(p.setup)} COP de pago único`;
  const monthly = p.monthlyDiscounted
    ? `${formatCOP(p.monthly)} COP/mes (antes ${formatCOP(p.monthlyList)})`
    : `${formatCOP(p.monthly)} COP/mes`;
  return `${setup} más ${monthly}`;
}

export const BUSINESS = {
  name: "CES Agencia",
  founders: ["Samuel Ceballos", "Emmanuel Castañeda"],
  serviceArea: "Pereira y Dosquebradas",
  website: "https://cesagencia.co",
  maintenanceIncludes: "dominio, actualizaciones y modificaciones",
  // Gancho comercial: el mantenimiento mensual arranca a cobrarse hasta el
  // segundo mes — el primero después del pago inicial es gratis.
  firstMonthFree: true,
  delivery: "lista en minutos una vez el cliente da la información de su negocio",
};

// ---------------------------------------------------------------------------
// Servicio adicional: contenido para redes
// ---------------------------------------------------------------------------
// No es un plan más: no tiene precio cerrado porque lo que se produce cada mes
// se acuerda con cada negocio. Por eso va aparte de PLANS y no dentro.
//
// `desde` es el precio de arranque que se publica, NO el piso real. El piso
// que Samuel acepta negociando es más bajo y se queda fuera del código a
// propósito: publicar el piso es regalarlo antes de sentarse a hablar.
//
// El paquete exacto que recibe cada cliente tampoco se publica. Lo que paga
// uno por su volumen no es lo que va a pagar otro, y poner una cifra al lado
// de un paquete concreto haría que todos esperen ese paquete por ese precio.
export const CONTENIDO = {
  desde: 550_000,
  cliente: {
    nombre: "Todo Renault Pereira",
    // Como se describen ellos en su propio sitio, no como suena mejor.
    que: "repuestos Renault y multimarca en Pereira",
    web: "https://todorenaultpereira.com",
    // Se pintan solo si tienen algo. Falta que Samuel pase los usuarios.
    //
    // OJO CON LA MARCA: ellos pueden autorizar que se les nombre como
    // cliente, y lo hicieron. Lo que no pueden autorizar es el uso del logo
    // ni de la identidad de Renault, que no es de ellos sino del fabricante.
    // Por eso aquí solo va el nombre del negocio y el enlace a lo suyo.
    instagram: "",
    tiktok: "",
    facebook: "",
  },
};

// El único cliente en producción hoy. Se nombra aquí para que la sección que
// lo muestra no invente nada y para no repetir el dato en varios archivos.
export const SHOWCASE = {
  clientName: "Quality Barber Shop",
  city: "Dosquebradas",
  url: "https://qualitybarbershop.cesagencia.co",
  planId: "reservas",
};

// Número de WhatsApp de la agencia (el que reciben los clientes). Se llena
// en build time desde la variable de entorno pública — ver .env.example.
export const AGENCY_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export function whatsAppLink(prefillText: string): string {
  if (!AGENCY_WHATSAPP_NUMBER) return "#registro";
  return `https://wa.me/${AGENCY_WHATSAPP_NUMBER}?text=${encodeURIComponent(prefillText)}`;
}
