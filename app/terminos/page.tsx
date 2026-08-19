import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BUSINESS, PLANS } from "@/lib/business";

export const metadata: Metadata = {
  title: "Términos de servicio — CES Agencia",
  description:
    "Condiciones bajo las que CES Agencia crea y mantiene las páginas web de sus clientes: planes, pagos, propiedad del código y cancelación.",
};

const CONTACTO = "cesagency2026@gmail.com";

export default function Terminos() {
  return (
    <LegalPage title="Términos de servicio" updated="19 de agosto de 2026">
      <p>
        Estas condiciones aplican a quien contrata a {BUSINESS.name} para crear
        y mantener su página web. Están escritas en lenguaje corriente a
        propósito.
      </p>

      <h2>Quiénes somos</h2>
      <p>
        {BUSINESS.name} es una agencia de desarrollo web de {BUSINESS.founders[0]}{" "}
        y {BUSINESS.founders[1]}, que atiende negocios de{" "}
        {BUSINESS.serviceArea}, Colombia. Puedes escribirnos a{" "}
        <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>.
      </p>

      <h2>Qué incluye el servicio</h2>
      <p>Trabajamos con dos planes:</p>
      <ul>
        {PLANS.map((plan) => (
          <li key={plan.id}>
            <strong>{plan.name}</strong> — {plan.setupPrice} más{" "}
            {plan.maintenancePrice}. {plan.description}
          </li>
        ))}
      </ul>
      <p>
        La página queda {BUSINESS.delivery}. La mensualidad cubre{" "}
        {BUSINESS.maintenanceIncludes}.
        {BUSINESS.firstMonthFree
          ? " El primer mes de mantenimiento no se cobra: la mensualidad empieza a correr desde el segundo."
          : ""}
      </p>

      <h2>Dominio y propiedad: léelo con atención</h2>
      <div className="callout">
        <p>
          <strong>Tu página vive en un subdominio nuestro</strong>, con la forma{" "}
          <em>tunegocio.cesagencia.co</em>. No estás comprando un dominio propio
          ni el código de la página: estás contratando el uso de una plataforma
          que seguimos operando nosotros.
        </p>
      </div>
      <p>
        En la práctica esto significa que {BUSINESS.name} conserva la propiedad
        del código y de la infraestructura, y que el servicio funciona mientras
        la mensualidad esté al día. Lo que sí es tuyo es tu contenido: textos,
        fotos, logo, precios y los datos de tu negocio.
      </p>
      <p>
        Si más adelante quieres un dominio propio o llevarte el sitio a otro
        lado, se puede conversar, pero es un acuerdo aparte y no está incluido
        en estos planes.
      </p>

      <h2>Pagos</h2>
      <p>
        El pago inicial se cobra una sola vez, antes de empezar. La mensualidad
        se cobra cada mes a partir del segundo. Si se atrasa, te avisamos; si el
        atraso se prolonga, podemos suspender la página hasta que se ponga al
        día.
      </p>

      <h2>Qué esperamos de ti</h2>
      <ul>
        <li>
          Que la información que nos des sea veraz y que tengas derecho a usar
          las fotos, textos y marcas que nos entregues.
        </li>
        <li>
          Que no uses la página para actividades ilegales, engañosas o que
          vulneren derechos de terceros.
        </li>
        <li>
          Que si tu página recoge datos de tus clientes —por ejemplo, un motor
          de reservas—, cumplas con la ley de protección de datos frente a esas
          personas. Nosotros procesamos esa información por encargo tuyo; el
          responsable ante ellas eres tú.
        </li>
      </ul>

      <h2>Cancelación</h2>
      <p>
        Puedes cancelar cuando quieras avisándonos por escrito. El servicio va
        hasta el final del mes ya pagado. No devolvemos el pago inicial, porque
        corresponde a un trabajo de diseño y desarrollo ya realizado. Al
        cancelar, la página deja de estar disponible y podemos eliminar los
        datos asociados según los plazos de nuestra{" "}
        <a href="/privacidad">política de privacidad</a>.
      </p>

      <h2>Hasta dónde respondemos</h2>
      <p>
        Hacemos lo razonable para que tu página esté disponible y funcione bien,
        pero depende de servicios de terceros —alojamiento, dominio, bases de
        datos, mensajería— que pueden fallar. No respondemos por interrupciones
        causadas por esos servicios, ni por lucro cesante o pérdidas indirectas.
        Nuestra responsabilidad máxima se limita a lo que hayas pagado en los
        últimos tres meses.
      </p>

      <h2>Cambios a estos términos</h2>
      <p>
        Podemos actualizarlos. Si el cambio es relevante, te avisamos por el
        canal que uses con nosotros. La fecha del encabezado indica la última
        versión.
      </p>

      <h2>Ley aplicable</h2>
      <p>
        Estos términos se rigen por la ley colombiana. Cualquier diferencia
        intentamos resolverla hablando, antes que por otra vía.
      </p>
    </LegalPage>
  );
}
