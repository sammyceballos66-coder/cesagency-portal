// Datos del negocio que usa el agente de WhatsApp para responder. Es la
// misma información que ya aparece en la página — si cambia el precio o el
// servicio, actualiza aquí también para que el agente no quede desalineado
// con lo que dice el sitio.

export type Plan = {
  id: string;
  name: string;
  setupPrice: string;
  maintenancePrice: string;
  description: string;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "esencial",
    name: "Plan Esencial",
    setupPrice: "$250.000 COP (pago único)",
    maintenancePrice: "$150.000 COP/mes",
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
    setupPrice: "$500.000 COP (pago único)",
    maintenancePrice: "$150.000 COP/mes",
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

export const BUSINESS = {
  name: "CES Agencia",
  founders: ["Samuel Ceballos", "Emmanuel Castañeda"],
  serviceArea: "Pereira y Dosquebradas",
  website: "https://cesagencia.co",
  maintenanceIncludes: "dominio, hosting, actualizaciones y modificaciones",
  delivery: "lista en minutos una vez el cliente da la información de su negocio",
};

// Número de WhatsApp de la agencia (el que reciben los clientes). Se llena
// en build time desde la variable de entorno pública — ver .env.example.
export const AGENCY_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export function whatsAppLink(prefillText: string): string {
  if (!AGENCY_WHATSAPP_NUMBER) return "#registro";
  return `https://wa.me/${AGENCY_WHATSAPP_NUMBER}?text=${encodeURIComponent(prefillText)}`;
}
