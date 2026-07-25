"use client";

import { useState } from "react";
import Image from "next/image";
import { PLANS } from "@/lib/business";

type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-blue-bright";

function RegisterModal({ onClose }: { onClose: () => void }) {
  const [contactName, setContactName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [planId, setPlanId] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactName, businessName, phone, email, description, planId }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-5 overflow-y-auto"
      onClick={onClose}
    >
      {/* items-start + py-8 on the backdrop (not items-center) — if this
          panel is ever taller than the viewport, centering it would clip
          the top (logo, close button) above the scrollable area with no
          way to reach it. Starting from the top keeps everything reachable
          regardless of viewport height. The panel itself is wide + compact
          (2-column fields, tight gaps) specifically so it fits on a normal
          screen without needing that scroll in the first place. */}
      <div
        className="w-full max-w-[600px] max-h-full overflow-y-auto bg-white rounded-2xl shadow-xl p-4 md:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3.5 right-3.5 text-ink-faint hover:text-ink transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {status === "sent" ? (
          <div className="py-6 text-center">
            <h3 className="text-xl font-bold font-display mb-2 text-ink">¡Listo!</h3>
            <p className="text-ink-muted text-sm">
              Ya recibimos tus datos. Te escribimos por WhatsApp muy pronto para arrancar.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5 mb-1">
              <Image src="/logo.png" alt="CES" width={642} height={205} unoptimized className="h-6 w-auto" />
              <h3 className="text-lg font-bold font-display text-ink">Regístrate</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-sm text-ink">
                Nombre completo
                <input
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className={inputClass}
                  placeholder="Ej. David Montes"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-ink">
                Nombre de la empresa <span className="text-ink-faint">(opcional)</span>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={inputClass}
                  placeholder="Ej. Quality Barber Shop"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-ink">
                Número de teléfono
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="300 123 4567"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-ink">
                Correo electrónico
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="tu@correo.com"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm text-ink">
              Descripción <span className="text-ink-faint">(opcional)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={1}
                className={`${inputClass} resize-none`}
                placeholder="Cuéntanos brevemente de tu negocio"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PLANS.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-start gap-2.5 text-sm text-ink border rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                    planId === p.id ? "border-blue-bright bg-blue/5" : "border-line"
                  }`}
                >
                  <input
                    required
                    type="radio"
                    name="plan"
                    value={p.id}
                    checked={planId === p.id}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="mt-0.5 accent-blue-bright"
                  />
                  <span>
                    <span className="font-semibold">{p.name}</span>{" "}
                    <span className="text-ink-muted">— {p.setupPrice}</span>
                  </span>
                </label>
              ))}
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600">
                Algo falló enviando tus datos. Intenta de nuevo, o escríbenos directo por WhatsApp.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="justify-center w-full inline-flex items-center gap-2 rounded-full px-5 py-[11px] text-sm font-semibold transition-all duration-300 ease-out bg-gradient-to-br from-blue-bright to-blue text-white hover:brightness-110 disabled:opacity-60"
            >
              {status === "sending" ? "Enviando..." : "Regístrate"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function SignUp() {
  const [open, setOpen] = useState(false);

  return (
    <section id="registro" className="pt-[20px] pb-16 relative z-1">
      <div className="text-center max-w-[560px] mx-auto border border-blue bg-gradient-to-b from-blue/10 to-panel-2 rounded-2xl p-6 md:p-10">
        <h2 className="text-[clamp(32px,4.6vw,48px)] leading-[1.08] tracking-[-0.01em] mb-4 hero-gradient-text font-bold font-display">
          Únete a la comunidad CES
        </h2>
        <p className="text-ink text-base mb-8">
          Regístrate, cuéntanos de tu negocio, y te contactamos personalmente para arrancar con tu página.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out bg-gradient-to-br from-blue-bright to-blue text-white hover:brightness-110 hover:-translate-y-1.5 hover:shadow-[0_10px_24px_-6px_rgba(29,79,216,0.5)]"
        >
          Regístrate
        </button>
      </div>
      {open && <RegisterModal onClose={() => setOpen(false)} />}
    </section>
  );
}
