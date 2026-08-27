"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      if (error) throw error;
      setMessage("Revisa tu correo para continuar.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible iniciar sesión.");
    }
  }

  return <main className="grid min-h-screen place-items-center bg-[#f6f7f2] p-6"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border bg-white p-7 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[.17em] text-[#728078]">Procurement AI Pilot</p><h1 className="mt-2 text-2xl font-semibold">Acceso privado</h1><p className="mt-2 text-sm text-slate-600">Usa el correo autorizado para recibir un enlace de acceso.</p><label className="mt-6 block text-sm font-medium">Correo<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5" /></label><button className="mt-4 w-full rounded-xl bg-[#0d6b4f] px-4 py-2.5 font-semibold text-white">Enviar enlace seguro</button>{message && <p className="mt-4 text-sm text-slate-700">{message}</p>}</form></main>;
}
