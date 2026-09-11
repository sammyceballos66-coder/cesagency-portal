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
// Promoción por tiempo limitado
// ---------------------------------------------------------------------------
// Para encenderla o apagarla se cambia `active`. `endsOn` es el último día en
// que aplica (hora de Colombia): pasado ese día la promo se cae sola, sin que
// haya que acordarse de venir a apagarla.
//
// Que se caiga sola no es un detalle técnico: un "descuento limitado" que
// nunca se acaba deja de ser un descuento, y el Estatuto del Consumidor
// (Ley 1480 de 2011) exige que el precio tachado sea uno que de verdad se
// haya cobrado. Si la promo va a estar siempre encendida, el precio de lista
// es mentira y toca bajar los números de arriba en vez de tachar.

export const PROMO = {
  active: true,
  label: "Descuento por apertura",
  /** Último día en que aplica, en formato AAAA-MM-DD. `null` = sin fecha de fin. */
  endsOn: "2026-09-30" as string | null,
};

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

/** ¿La promoción está vigente en este momento? */
export function promoIsLive(now: Date = new Date()): boolean {
  if (!PROMO.active) return false;
  if (!PROMO.endsOn) return true;
  const [y, m, d] = PROMO.endsOn.split("-").map(Number);
  // Fin del día en Colombia = medianoche del día siguiente, corrida 5 horas.
  const endsAtUTC = Date.UTC(y, m - 1, d + 1) + BOGOTA_OFFSET_MS;
  return now.getTime() < endsAtUTC;
}

/** "30 de septiembre", para mostrarle al cliente hasta cuándo tiene. */
export function promoDeadlineLabel(): string | null {
  if (!PROMO.endsOn) return null;
  const [, m, d] = PROMO.endsOn.split("-").map(Number);
  return `${d} de ${MESES[m - 1]}`;
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
