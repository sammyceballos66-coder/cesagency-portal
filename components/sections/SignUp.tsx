"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PLANS } from "@/lib/business";

type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-blue-bright";

function RegisterModal({ onClose }: { onClose: () => void }) {
  // Two custom `fixed inset-0` overlay attempts in a row both hit the same
  // real mobile-WebKit bug: when the browser's own toolbar is showing (as
  // opposed to collapsed after scrolling), a fixed element's centering math
  // uses a viewport size that doesn't match what's actually visible,
  // leaving a large blank gap. A native <dialog> sidesteps this entirely —
  // the browser itself positions and sizes it correctly against whatever is
  // actually on screen (it renders in the "top layer", immune to this
  // whole class of fixed-position/viewport bug), and showModal() handles
  // background scroll-locking natively too, so no manual body-overflow
  // hacks are needed here anymore.
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    // Belt-and-suspenders: the native `close` event (fired by Escape, or by
    // our own .close() calls below) is the only signal for the Escape-key
    // case, so it's still wired up here — but the X button and backdrop
    // click below call onClose directly too rather than relying on this
    // alone, since event-dispatch-on-.close() proved unreliable in testing.
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [onClose]);

  function closeDialog() {
    dialogRef.current?.close();
    onClose();
  }

  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    // A click that lands on the <dialog> element itself (not one of its
    // descendants) means it landed on the ::backdrop / the dialog's own
    // padding area — the equivalent of "clicked outside the content".
    if (e.target === dialogRef.current) closeDialog();
  }

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
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      className="w-full max-w-[600px] max-h-[85dvh] overflow-y-auto overscroll-contain bg-white rounded-2xl shadow-xl p-4 md:p-6 m-auto border-0 backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <div className="relative">
        <button
          type="button"
          onClick={closeDialog}
          aria-label="Cerrar"
          className="absolute top-0 right-0 text-ink-faint hover:text-ink transition-colors"
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
    </dialog>
  );
}

export function SignUp() {
  const [open, setOpen] = useState(false);

  return (
    <section id="registro" className="pt-[20px] pb-16 relative z-1">
      <div className="text-center max-w-[560px] mx-auto border border-blue bg-gradient-to-b from-blue/10 to-panel-2 rounded-2xl p-6 md:p-10">
        <h2 className="flex flex-wrap items-center justify-center gap-x-3 text-[clamp(32px,4.6vw,48px)] leading-[1.08] tracking-[-0.01em] mb-4 font-bold font-display">
          <span className="hero-gradient-text">Únete a la comunidad</span>
          <Image
            src="/logo.png"
            alt="CES"
            width={642}
            height={205}
            unoptimized
            className="h-[0.8em] w-auto"
          />
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
