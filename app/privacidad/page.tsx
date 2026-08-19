import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "Política de privacidad — CES Agencia",
  description:
    "Qué datos personales recoge CES Agencia, para qué los usa, dónde los guarda, con quién los comparte y cómo pedir que se eliminen.",
};

const CONTACTO = "cesagency2026@gmail.com";

export default function Privacidad() {
  return (
    <LegalPage title="Política de privacidad" updated="19 de agosto de 2026">
      <p>
        Esta política explica qué datos personales trata {BUSINESS.name} y qué
        puedes hacer con ellos. Está escrita para que se entienda, no para
        cubrirnos: si algo no queda claro, escríbenos y lo aclaramos.
      </p>

      <h2>Quién trata tus datos</h2>
      <p>
        {BUSINESS.name} es una agencia de desarrollo web de {BUSINESS.founders[0]} y{" "}
        {BUSINESS.founders[1]}, que opera en {BUSINESS.serviceArea}, Colombia.
        Para cualquier asunto relacionado con tus datos personales, incluida su
        eliminación, escribe a <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>.
      </p>
      <div className="callout">
        <p>
          <strong>Somos honestos sobre esto:</strong> {BUSINESS.name} todavía no
          está constituida como sociedad. Hoy responde por estos datos el equipo
          que la opera, en la dirección de correo de arriba. Cuando se formalice
          la figura jurídica, actualizaremos esta sección.
        </p>
      </div>

      <h2>Qué datos recogemos y por qué</h2>

      <h3>Si te registras en cesagencia.co</h3>
      <p>
        El formulario de registro pide el nombre de contacto, el nombre del
        negocio, el teléfono, el correo, una descripción de lo que necesitas y
        el plan que te interesa. Los usamos únicamente para contactarte y
        armarte una propuesta.
      </p>

      <h3>Si nos escribes por WhatsApp</h3>
      <p>
        Guardamos tu número y el contenido de la conversación, para darle
        continuidad a la charla y para que un asesor humano pueda retomarla
        cuando lo pidas. Las respuestas automáticas las genera un modelo de
        inteligencia artificial, así que el contenido de esos mensajes se
        procesa en los servidores de Anthropic.
      </p>

      <h3>Si eres cliente nuestro</h3>
      <p>
        Guardamos los datos de facturación necesarios para cobrar la mensualidad:
        nombre, correo, monto y fecha de inicio del servicio.
      </p>

      <h3>Si reservas una cita en la página de un negocio que atendemos</h3>
      <p>
        Algunos de nuestros clientes tienen motor de reservas —por ejemplo,
        barberías—. Cuando agendas un turno ahí, se guardan tu nombre, teléfono
        y correo para confirmarte la cita, recordártela y avisarle al
        profesional que te va a atender.
      </p>
      <div className="callout">
        <p>
          <strong>Aquí no somos los dueños de tus datos.</strong> Tú contrataste
          con ese negocio, no con {BUSINESS.name}. El negocio decide qué se hace
          con tu información y nosotros solo la procesamos por encargo suyo. Si
          quieres que la eliminen, puedes pedírselo directamente a ellos o
          escribirnos a nosotros y lo tramitamos con ellos.
        </p>
      </div>

      <h2>Dónde se guardan y con quién se comparten</h2>
      <p>
        No vendemos datos personales ni los cedemos con fines publicitarios. Sí
        usamos servicios de terceros para poder operar, y esos servicios
        almacenan o procesan la información en sus propios servidores:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — la base de datos donde vive todo lo
          anterior.
        </li>
        <li>
          <strong>Vercel</strong> — el alojamiento de los sitios web.
        </li>
        <li>
          <strong>Google</strong> — el correo desde el que escribimos y con el
          que enviamos confirmaciones y recordatorios.
        </li>
        <li>
          <strong>Twilio</strong> — por donde entran y salen los mensajes de
          WhatsApp.
        </li>
        <li>
          <strong>Anthropic</strong> — el modelo de inteligencia artificial que
          redacta las respuestas automáticas de WhatsApp.
        </li>
        <li>
          <strong>Meta y TikTok</strong> — solo para publicar y medir el
          contenido de nuestras propias redes. No les enviamos datos de
          clientes ni de personas que reservan.
        </li>
      </ul>
      <p>
        Varios de estos servicios están fuera de Colombia, así que tus datos
        pueden almacenarse en otros países.
      </p>

      <h2>Cuánto tiempo los guardamos</h2>
      <ul>
        <li>
          <strong>Reservas de citas</strong> — 12 meses después de la cita.
        </li>
        <li>
          <strong>Registros del formulario</strong> — 24 meses desde el último
          contacto.
        </li>
        <li>
          <strong>Conversaciones de WhatsApp</strong> — 6 meses desde el último
          mensaje.
        </li>
        <li>
          <strong>Datos de facturación</strong> — el tiempo que exijan las
          obligaciones contables y tributarias.
        </li>
      </ul>
      <p>
        Si pides que borremos tus datos antes de esos plazos, lo hacemos, salvo
        lo que estemos obligados a conservar por ley.
      </p>

      <h2>Tus derechos</h2>
      <p>
        De acuerdo con la Ley 1581 de 2012 de protección de datos personales,
        puedes en cualquier momento:
      </p>
      <ul>
        <li>Saber qué datos tuyos tenemos y de dónde salieron.</li>
        <li>Pedir que los corrijamos o actualicemos.</li>
        <li>Pedir que los eliminemos.</li>
        <li>Revocar la autorización que nos diste para usarlos.</li>
        <li>
          Presentar una queja ante la Superintendencia de Industria y Comercio
          si consideras que no atendimos tu solicitud.
        </li>
      </ul>

      <h2>Cómo pedir que borremos tus datos</h2>
      <p>
        Escribe a <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a> desde el correo
        con el que nos contactaste, o indícanos el teléfono con el que
        reservaste. Respondemos dentro de los 15 días hábiles siguientes. No
        cobramos nada por esto.
      </p>

      <h2>Cambios a esta política</h2>
      <p>
        Si cambiamos algo importante, actualizamos la fecha del encabezado. Te
        recomendamos revisarla de vez en cuando.
      </p>
    </LegalPage>
  );
}
