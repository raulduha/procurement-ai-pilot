import { NextResponse } from "next/server";
import { requirePilotUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
const MAX_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const extractedText = form.get("extractedText");
    if (!(file instanceof File) || file.size > MAX_BYTES) return NextResponse.json({ error: "Archivo inválido o superior a 20 MB." }, { status: 400 });
    const { supabase, user } = await requirePilotUser();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("documents").upload(storagePath, file, { contentType: file.type || "application/octet-stream", upsert: false });
    if (uploadError) throw uploadError;
    const { error: recordError } = await supabase.from("documents").insert({ user_id: user.id, name: file.name, storage_path: storagePath, mime_type: file.type || "application/octet-stream", extracted_text: typeof extractedText === "string" ? extractedText.slice(0, 120_000) : null });
    if (recordError) {
      await supabase.storage.from("documents").remove([storagePath]);
      throw recordError;
    }
    return NextResponse.json({ storagePath });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible guardar el documento.";
    return NextResponse.json({ error: message }, { status: message.includes("iniciar sesión") || message.includes("autorizada") ? 401 : 500 });
  }
}
