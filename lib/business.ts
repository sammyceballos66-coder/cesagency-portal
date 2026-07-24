// Datos del negocio que usa el agente de WhatsApp para responder. Es la
// misma información que ya aparece en la página — si cambia el precio o el
// servicio, actualiza aquí también para que el agente no quede desalineado
// con lo que dice el sitio.

export const BUSINESS = {
  name: "CES Agencia",
  founders: ["Samuel Ceballos", "Emmanuel Castañeda"],
  serviceArea: "Pereira y Dosquebradas",
  website: "https://cesagencia.co",
  service: {
    designPrice: "$300.000 COP (pago único)",
    maintenancePrice: "$150.000 COP/mes",
    maintenanceIncludes: "dominio y hosting",
    delivery: "lista en minutos una vez el cliente da la información de su negocio",
    features: [
      "Diseño profesional a la medida del negocio",
      "Adaptada a celular y computador",
      "Botón directo a WhatsApp",
      "Hasta 5 secciones (inicio, servicios, contacto, etc.)",
    ],
  },
};

// Número de WhatsApp de la agencia (el que reciben los clientes). Se llena
// en build time desde la variable de entorno pública — ver .env.example.
export const AGENCY_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export function whatsAppLink(prefillText: string): string {
  if (!AGENCY_WHATSAPP_NUMBER) return "#contacto";
  return `https://wa.me/${AGENCY_WHATSAPP_NUMBER}?text=${encodeURIComponent(prefillText)}`;
}
