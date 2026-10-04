"use client";

import { useActionState } from "react";
import { accionEntrar, type Estado } from "../acciones";

export function FormEntrar() {
  const [estado, accion, enviando] = useActionState<Estado, FormData>(accionEntrar, {});

  return (
    <form action={accion} className="flex flex-col gap-3">
      <label htmlFor="clave" className="text-[13px] font-semibold text-ink-muted">
        Clave
      </label>
      <input
        id="clave"
        name="clave"
        type="password"
        required
        autoComplete="current-password"
        className="rounded-[12px] border border-line-strong bg-white px-4 py-3 text-[16px] text-ink outline-none focus:border-blue-bright"
      />
      {estado.error && (
        <p role="alert" className="text-[14px] text-accent-red">
          {estado.error}
        </p>
      )}
      <button type="submit" disabled={enviando} className="btn-primary mt-2 justify-center disabled:opacity-60">
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
