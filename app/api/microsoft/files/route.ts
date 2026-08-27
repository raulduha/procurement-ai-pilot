import { NextResponse } from "next/server";
import { requirePilotUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function graphToken() {
  const tenant = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const secret = process.env.MICROSOFT_CLIENT_SECRET;
  if (!tenant || !clientId || !secret) throw new Error("Microsoft Graph no está configurado.");
  const body = new URLSearchParams({ client_id: clientId, client_secret: secret, scope: "https://graph.microsoft.com/.default", grant_type: "client_credentials" });
  const response = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  if (!response.ok) throw new Error("Microsoft Entra rechazó la autenticación de la aplicación.");
  return (await response.json() as { access_token: string }).access_token;
}

export async function GET() {
  try {
    await requirePilotUser();
    const site = process.env.MICROSOFT_SHAREPOINT_SITE_ID;
    const drive = process.env.MICROSOFT_SHAREPOINT_DRIVE_ID;
    const folder = process.env.MICROSOFT_SHAREPOINT_FOLDER_ID;
    if (!site || !drive || !folder) return NextResponse.json({ error: "Falta definir el sitio, unidad o carpeta autorizados." }, { status: 503 });
    const token = await graphToken();
    const url = `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(site)}/drives/${encodeURIComponent(drive)}/items/${encodeURIComponent(folder)}/children?$select=id,name,size,file,folder,lastModifiedDateTime&$top=100`;
    const response = await fetch(url, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo leer la carpeta autorizada de SharePoint.");
    const payload = await response.json() as { value: unknown[] };
    return NextResponse.json({ files: payload.value });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible conectar Microsoft Graph.";
    return NextResponse.json({ error: message }, { status: message.includes("iniciar sesión") || message.includes("autorizada") ? 401 : 500 });
  }
}
