"use client";

import { useActionState, useRef, useState } from "react";
import { DESTINOS, nombreDestino, type DestinoId, type Tarjeta } from "@/lib/tarjetas";
import { accionAgregar, accionAsignar, accionLiberar, type Estado } from "../acciones";

// Lo que se pide en el campo del enlace, según a dónde lleve la tarjeta. Es
// lo que hay que saber en plena venta sin tener que acordarse.
const AYUDA_ENLACE: Record<DestinoId, string> = {
  google:
    'Lo mejor: que el dueño abra su perfil de Google, toque "Pedir reseñas" y te mande el enlace. Si no sabe: búscalo en Google Maps → Compartir → Copiar enlace.',
  whatsapp: "Basta con el número, por ejemplo 300 123 4567.",
  instagram: "Abre su perfil → los tres puntos → Copiar enlace del perfil.",
  facebook: "Abre su página → Compartir → Copiar enlace.",
  tiktok: "Abre su perfil → Compartir → Copiar enlace.",
  web: "La dirección de su página, por ejemplo https://minegocio.com",
};

const campo =
  "w-full rounded-[12px] border border-line-strong bg-white px-4 py-3 text-[16px] text-ink outline-none focus:border-blue-bright";
const etiqueta = "block text-[13px] font-semibold text-ink-muted mb-1.5";

export function Panel({ tarjetas }: { tarjetas: Tarjeta[] }) {
  const [numeros, setNumeros] = useState("");
  const [negocio, setNegocio] = useState("");
  const [destino, setDestino] = useState<DestinoId>("google");
  const [url, setUrl] = useState("");
  const [editando, setEditando] = useState<number | null>(null);
  // Se esconde el aviso de "listo" al empezar a editar otra tarjeta.
  const [verListo, setVerListo] = useState(false);
  const formulario = useRef<HTMLFormElement>(null);

  function limpiar() {
    setEditando(null);
    setNumeros("");
    setNegocio("");
    setUrl("");
  }

  // Al guardar bien se limpia el formulario para la siguiente venta. Se hace
  // aquí, cuando vuelve la respuesta, y no en un efecto que mire el estado.
  const [estado, asignar, guardando] = useActionState<Estado, FormData>(async (previo, datos) => {
    const resultado = await accionAsignar(previo, datos);
    if (resultado.listo) limpiar();
    setVerListo(Boolean(resultado.listo));
    return resultado;
  }, {});
  const [estadoLote, agregar, agregando] = useActionState<Estado, FormData>(accionAgregar, {});

  function editar(t: Tarjeta) {
    setEditando(t.numero);
    setNumeros(String(t.numero));
    setNegocio(t.negocio ?? "");
    setDestino(t.destino ?? "google");
    setUrl(t.url ?? "");
    setVerListo(false);
    formulario.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const activas = tarjetas.filter((t) => t.url).length;
  const libres = tarjetas.length - activas;

  return (
    <div className="flex flex-col gap-8">
      <form
        ref={formulario}
        action={asignar}
        className="scroll-mt-4 rounded-[16px] border border-line bg-white p-5 shadow-[0_10px_30px_-20px_rgba(10,19,48,0.35)]"
      >
        <h2 className="text-[19px] font-bold text-ink mb-5">
          {editando ? `Editar la tarjeta ${editando}` : "Asignar tarjeta"}
        </h2>
        {editando && <input type="hidden" name="editando" value={editando} />}

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="numeros" className={etiqueta}>
              Número de la tarjeta
            </label>
            <input
              id="numeros"
              name="numeros"
              required
              value={numeros}
              onChange={(e) => setNumeros(e.target.value)}
              readOnly={editando !== null}
              placeholder="7  ·  si son dos: 7 y 8"
              autoComplete="off"
              className={`${campo} ${editando ? "bg-panel text-ink-muted" : ""}`}
            />
            <p className="mt-1.5 text-[12.5px] text-ink-faint">Es el número impreso atrás, junto al QR.</p>
          </div>

          <div>
            <label htmlFor="negocio" className={etiqueta}>
              Negocio
            </label>
            <input
              id="negocio"
              name="negocio"
              required
              maxLength={120}
              value={negocio}
              onChange={(e) => setNegocio(e.target.value)}
              placeholder="Restaurante Pedro"
              autoComplete="off"
              className={campo}
            />
          </div>

          <fieldset>
            <legend className={etiqueta}>¿A dónde lleva?</legend>
            <div className="flex flex-wrap gap-2">
              {DESTINOS.map((d) => (
                <label key={d.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="destino"
                    value={d.id}
                    checked={destino === d.id}
                    onChange={() => setDestino(d.id)}
                    className="peer sr-only"
                  />
                  <span className="block rounded-full border border-line-strong bg-white px-3.5 py-2 text-[14px] text-ink peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-blue-bright">
                    {d.nombre}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="url" className={etiqueta}>
              {destino === "whatsapp" ? "Número o enlace" : "Enlace"}
            </label>
            <input
              id="url"
              name="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              inputMode={destino === "whatsapp" ? "tel" : "url"}
              placeholder={destino === "whatsapp" ? "300 123 4567" : "Pega el enlace aquí"}
              autoComplete="off"
              autoCapitalize="off"
              className={campo}
            />
            <p className="mt-1.5 text-[12.5px] leading-[1.5] text-ink-faint">{AYUDA_ENLACE[destino]}</p>
          </div>
        </div>

        {estado.error && (
          <p role="alert" className="mt-4 rounded-[10px] bg-[#fff1f2] px-4 py-3 text-[14px] text-accent-red">
            {estado.error}
          </p>
        )}

        <button type="submit" disabled={guardando} className="btn-primary mt-5 w-full justify-center disabled:opacity-60">
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        {editando && (
          <button type="button" onClick={limpiar} className="mt-3 w-full text-[14px] text-ink-muted underline underline-offset-4">
            Cancelar
          </button>
        )}
      </form>

      {verListo && estado.listo && estado.numeros && (
        <div role="status" className="rounded-[16px] border border-accent-green/30 bg-accent-green-bg p-5">
          <p className="text-[15px] font-semibold text-ink mb-3">✓ {estado.listo}</p>
          <p className="text-[13.5px] text-ink-muted mb-4">
            Pruébala tú antes de entregarla: escanea el QR o acerca el celular. O toca aquí:
          </p>
          <div className="flex flex-wrap gap-2">
            {estado.numeros.map((n) => (
              <a
                key={n}
                href={`/r/${n}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-accent-green px-4 py-2 text-[14px] font-semibold text-accent-green"
              >
                Probar la {n}
              </a>
            ))}
          </div>
        </div>
      )}

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[17px] font-bold text-ink">Todas las tarjetas</h2>
          <span className="text-[13px] text-ink-faint">
            {activas} activas · {libres} libres
          </span>
        </div>
        <ul className="flex flex-col gap-2 list-none">
          {tarjetas.map((t) => (
            <li key={t.numero}>
              {t.url ? (
                <div className="flex items-center gap-3 rounded-[12px] border border-line bg-white p-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[9px] bg-navy text-[15px] font-bold text-white">
                    {t.numero}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">{t.negocio}</span>
                    <span className="block text-[12.5px] text-ink-faint">{nombreDestino(t.destino)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => editar(t)}
                    className="shrink-0 rounded-full border border-line-strong px-3 py-1.5 text-[13px] font-semibold text-blue-bright"
                  >
                    Editar
                  </button>
                  <form
                    action={accionLiberar}
                    onSubmit={(e) => {
                      if (!confirm(`¿Liberar la tarjeta ${t.numero}? Dejará de llevar a ${t.negocio}.`)) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="numero" value={t.numero} />
                    <button type="submit" aria-label={`Liberar la tarjeta ${t.numero}`} className="shrink-0 px-1.5 py-1.5 text-[13px] text-ink-faint">
                      Liberar
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-[12px] border border-dashed border-line-strong p-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[9px] border-2 border-dashed border-line-strong text-[15px] font-bold text-ink-faint">
                    {t.numero}
                  </span>
                  <span className="text-[14px] text-ink-faint">Libre · lista para vender</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <form action={agregar} className="rounded-[16px] border border-line bg-white/70 p-5">
        <h2 className="text-[17px] font-bold text-ink mb-1">Agregar tarjetas</h2>
        <p className="text-[13.5px] leading-[1.55] text-ink-muted mb-4">
          Cuando mandes a imprimir un lote nuevo. Se numeran seguido de la última
          ({tarjetas.at(-1)?.numero ?? 0}).
        </p>
        <div className="flex gap-2">
          <input
            name="cantidad"
            type="number"
            min={1}
            max={100}
            defaultValue={20}
            aria-label="Cuántas tarjetas"
            className={campo.replace("w-full", "w-24")}
          />
          <button type="submit" disabled={agregando} className="btn-ghost flex-1 justify-center disabled:opacity-60">
            {agregando ? "Agregando…" : "Agregar"}
          </button>
        </div>
        {estadoLote.error && <p role="alert" className="mt-3 text-[14px] text-accent-red">{estadoLote.error}</p>}
        {estadoLote.listo && <p role="status" className="mt-3 text-[14px] text-accent-green">{estadoLote.listo}</p>}
      </form>
    </div>
  );
}
