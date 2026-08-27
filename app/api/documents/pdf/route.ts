import { NextResponse } from "next/server";

export const runtime = "nodejs";
const MAX_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".pdf")) return NextResponse.json({ error: "Selecciona un PDF válido." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "El PDF supera el límite de 20 MB." }, { status: 413 });
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") return NextResponse.json({ error: "El archivo no tiene una cabecera PDF válida." }, { status: 400 });
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const document = await pdfjs.getDocument({ data: bytes }).promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" ").replace(/\s+/g, " ").trim());
    }
    const text = pages.join("\n\n").trim();
    document.cleanup();
    return NextResponse.json({ pageCount: pages.length, characters: text.length, text: text.slice(0, 120_000), truncated: text.length > 120_000 });
  } catch (error) {
    console.error("PDF processing failed", error);
    return NextResponse.json({ error: "No fue posible extraer texto de este PDF. Puede estar dañado, protegido o ser una imagen escaneada." }, { status: 422 });
  }
}
