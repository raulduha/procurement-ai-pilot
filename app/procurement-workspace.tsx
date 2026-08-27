"use client";

import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Bot, Boxes, BriefcaseBusiness, Building2, CheckCircle2, CircleDollarSign, Cloud, FileCheck2, FileSpreadsheet, FileText, LayoutDashboard, LoaderCircle, Search, ShieldCheck, Sparkles, Upload, UsersRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Row = Record<string, unknown>;
type UploadRecord = { name: string; type: "Excel" | "PDF"; rows: number; status: string; text?: string; pageCount?: number };

const money = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
const clean = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const skillGroups = [
  ["Procurement Assistant", "Arun Balaji Raju", Bot],
  ["Spend Analysis + spend-prism", "Arun + Maxbase91", CircleDollarSign],
  ["Supplier QBR + Truthcheck", "Arun + Maxbase91", UsersRound],
  ["RFP Drafting + Bid Compass", "Arun + Maxbase91", BriefcaseBusiness],
  ["Contract Risk + Redline Sentry", "Arun + Maxbase91", FileCheck2],
  ["Market Research", "Arun Balaji Raju", Search],
] as const;

function findKey(rows: Row[], candidates: string[]) {
  return Object.keys(rows[0] ?? {}).find((key) => candidates.some((candidate) => clean(key).includes(clean(candidate))));
}

function numeric(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  return Number(value.replace(/[^0-9,.-]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".")) || 0;
}

export default function ProcurementWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState("dashboard");
  const [rows, setRows] = useState<Row[]>([]);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [assistantResult, setAssistantResult] = useState("");
  const [runningSkill, setRunningSkill] = useState(false);

  const analysis = useMemo(() => {
    const amountKey = findKey(rows, ["monto", "total", "importe", "spend", "amount", "valor"]);
    const supplierKey = findKey(rows, ["proveedor", "supplier", "vendor", "acreedor"]);
    const categoryKey = findKey(rows, ["categoria", "category", "familia", "rubro"]);
    const dateKey = findKey(rows, ["fecha", "date", "periodo", "month"]);
    const total = rows.reduce((sum, row) => sum + numeric(amountKey ? row[amountKey] : 0), 0);
    const suppliers = new Set(rows.map((row) => String(supplierKey ? row[supplierKey] ?? "" : "")).filter(Boolean));
    const categories = new Map<string, number>();
    const months = new Map<string, number>();
    rows.forEach((row) => {
      const category = String(categoryKey ? row[categoryKey] ?? "Sin categoría" : "Sin categoría");
      categories.set(category, (categories.get(category) ?? 0) + numeric(amountKey ? row[amountKey] : 0));
      const raw = dateKey ? row[dateKey] : null;
      const date = raw instanceof Date ? raw : raw ? new Date(String(raw)) : null;
      const label = date && !Number.isNaN(date.valueOf()) ? date.toLocaleDateString("es-CL", { month: "short", year: "2-digit" }) : "Sin fecha";
      months.set(label, (months.get(label) ?? 0) + numeric(amountKey ? row[amountKey] : 0));
    });
    return {
      total,
      suppliers: suppliers.size,
      categories: [...categories.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6),
      trend: [...months.entries()].map(([name, value]) => ({ name, value })).slice(-8),
    };
  }, [rows]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setProcessing(true);
    setError("");
    const next: UploadRecord[] = [];
    try {
      for (const file of Array.from(files)) {
        if (file.name.toLowerCase().endsWith(".pdf")) {
          const form = new FormData();
          form.append("file", file);
          const response = await fetch("/api/documents/pdf", { method: "POST", body: form });
          const result = await response.json() as { error?: string; pageCount?: number; text?: string; truncated?: boolean };
          if (!response.ok || !result.text) throw new Error(result.error ?? `No fue posible procesar ${file.name}`);
          const storage = new FormData();
          storage.append("file", file);
          storage.append("extractedText", result.text);
          const storageResponse = await fetch("/api/documents/store", { method: "POST", body: storage });
          if (!storageResponse.ok && storageResponse.status !== 401 && storageResponse.status !== 503) {
            const storageResult = await storageResponse.json() as { error?: string };
            throw new Error(storageResult.error ?? `No fue posible guardar ${file.name}`);
          }
          next.push({ name: file.name, type: "PDF", rows: 0, pageCount: result.pageCount, text: result.text, status: result.truncated ? "Texto extraído (recortado)" : "Texto extraído" });
          continue;
        }
        if (!/\.(xlsx|xls|csv)$/i.test(file.name)) throw new Error(`Formato no compatible: ${file.name}`);
        const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
        const parsed = XLSX.utils.sheet_to_json<Row>(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
        if (!parsed.length) throw new Error(`El archivo ${file.name} no contiene filas legibles.`);
        setRows((current) => [...current, ...parsed]);
        next.push({ name: file.name, type: "Excel", rows: parsed.length, status: "Analizado" });
      }
      setUploads((current) => [...next, ...current]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible procesar el archivo.");
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function runSkill() {
    if (!question.trim()) return;
    setRunningSkill(true);
    setError("");
    setAssistantResult("");
    try {
      const documentText = uploads.filter((upload) => upload.type === "PDF").map((upload) => upload.text ?? "").join("\n\n");
      const response = await fetch("/api/skills", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ skillId: "procurement", question, documentText }) });
      const result = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !result.answer) throw new Error(result.error ?? "No fue posible ejecutar la skill.");
      setAssistantResult(result.answer);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible ejecutar la skill.");
    } finally {
      setRunningSkill(false);
    }
  }

  const hasData = rows.length > 0;
  const colors = ["#0d6b4f", "#77a43a", "#bdd950", "#ebbd54", "#55716a", "#9cae82"];
  const titles: Record<string, string> = { dashboard: "Vista ejecutiva", documents: "Centro documental", skills: "Biblioteca original", assistant: "Asistente de Procurement" };

  return (
    <main className="paper-grid min-h-screen p-3 md:p-5">
      <div className="mx-auto min-h-[calc(100vh-2.5rem)] max-w-[1540px] overflow-hidden rounded-[26px] border bg-[#fbfcf7] shadow-[0_24px_80px_rgba(27,45,36,.10)]">
        <Tabs value={active} onValueChange={setActive} orientation="vertical" className="min-h-[calc(100vh-2.5rem)] gap-0 lg:grid lg:grid-cols-[244px_1fr]">
          <aside className="border-b bg-[#102a20] p-4 text-[#edf5eb] lg:border-b-0 lg:border-r lg:p-5">
            <div className="flex items-center gap-3 px-1 py-2">
              <div className="grid size-10 place-items-center rounded-xl bg-[#d8f36a] text-[#173126]"><Boxes size={21} /></div>
              <div><p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#9fb2a7]">Private pilot</p><h1 className="font-semibold">Procurement AI</h1></div>
            </div>
            <TabsList variant="line" className="mt-6 grid h-auto w-full grid-cols-4 gap-1 bg-transparent p-0 lg:flex lg:flex-col">
              <TabsTrigger value="dashboard" className="justify-start rounded-xl px-3 py-2.5 text-[#b8c8bf] data-[state=active]:bg-white/10 data-[state=active]:text-white"><LayoutDashboard /><span className="hidden lg:inline">Resumen</span></TabsTrigger>
              <TabsTrigger value="documents" className="justify-start rounded-xl px-3 py-2.5 text-[#b8c8bf] data-[state=active]:bg-white/10 data-[state=active]:text-white"><FileText /><span className="hidden lg:inline">Documentos</span></TabsTrigger>
              <TabsTrigger value="skills" className="justify-start rounded-xl px-3 py-2.5 text-[#b8c8bf] data-[state=active]:bg-white/10 data-[state=active]:text-white"><Sparkles /><span className="hidden lg:inline">Skills originales</span></TabsTrigger>
              <TabsTrigger value="assistant" className="justify-start rounded-xl px-3 py-2.5 text-[#b8c8bf] data-[state=active]:bg-white/10 data-[state=active]:text-white"><Bot /><span className="hidden lg:inline">Asistente</span></TabsTrigger>
            </TabsList>
            <div className="mt-8 hidden rounded-2xl border border-white/10 bg-white/[.055] p-4 lg:block">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium"><ShieldCheck size={16} className="text-[#d8f36a]" />Fuentes verificadas</div>
              <p className="text-xs leading-5 text-[#aebfb5]">14 skills incluidas directamente desde los dos repositorios enviados.</p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#d8f36a]"><CheckCircle2 size={13}/>Licencias MIT conservadas</div>
            </div>
          </aside>

          <section className="min-w-0 bg-[#f6f7f2]">
            <header className="flex flex-col gap-4 border-b bg-[#fbfcf7]/90 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
              <div><p className="text-xs font-semibold uppercase tracking-[.17em] text-[#728078]">Workspace de compras</p><h2 className="mt-1 text-2xl font-semibold tracking-[-.035em]">{titles[active]}</h2></div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild><button className="inline-flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2 text-sm font-medium"><Cloud size={16}/>Microsoft 365</button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Conexión Microsoft 365</DialogTitle><DialogDescription>La integración usa Microsoft Graph y requiere autorización del administrador de la empresa.</DialogDescription></DialogHeader>
                    <div className="space-y-3 text-sm">
                      {["Registrar la aplicación en Microsoft Entra ID", "Autorizar lectura de archivos seleccionados", "Agregar Tenant ID, Client ID y secreto al despliegue"].map((item, index) => <div key={item} className="flex gap-3 rounded-xl bg-[#f0f3ec] p-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#0d6b4f] text-xs text-white">{index + 1}</span>{item}</div>)}
                    </div>
                  </DialogContent>
                </Dialog>
                <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-[#0d6b4f] px-3.5 py-2 text-sm font-semibold text-white"><Upload size={16}/>Cargar</button>
              </div>
            </header>
            <input ref={inputRef} className="hidden" type="file" accept=".xlsx,.xls,.csv,.pdf" multiple onChange={(event) => handleFiles(event.target.files)} />

            <TabsContent value="dashboard" className="p-5 md:p-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Gasto analizado", hasData ? money.format(analysis.total) : "—", CircleDollarSign, "Total reconocido"],
                  ["Proveedores", hasData ? analysis.suppliers.toLocaleString("es-CL") : "—", Building2, "Nombres únicos"],
                  ["Registros", hasData ? rows.length.toLocaleString("es-CL") : "—", FileSpreadsheet, "Filas procesadas"],
                  ["Documentos", uploads.length ? uploads.length.toString() : "—", FileCheck2, "Excel y PDF"],
                ].map(([label, value, Icon, detail]) => <article key={String(label)} className="rounded-2xl border bg-[#fbfcf7] p-5 shadow-[0_8px_25px_rgba(24,43,34,.045)]"><div className="flex items-center justify-between"><p className="text-sm text-[#66746c]">{String(label)}</p><span className="grid size-8 place-items-center rounded-lg bg-[#e6ecd9] text-[#0d6b4f]"><Icon size={17}/></span></div><p className="metric-number mt-5 text-3xl font-semibold">{String(value)}</p><p className="mt-1 text-xs text-[#839087]">{String(detail)}</p></article>)}
              </div>
              {!hasData ? (
                <section className="mt-5 grid overflow-hidden rounded-3xl border bg-[#143c2d] text-white lg:grid-cols-[1.2fr_.8fr]">
                  <div className="p-7 md:p-10"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-[#d8f36a]"><Sparkles size={13}/>Comenzar con datos reales</span><h3 className="mt-5 max-w-xl text-3xl font-semibold tracking-[-.04em] md:text-4xl">Carga el primer Excel de compras.</h3><p className="mt-3 max-w-xl text-sm leading-6 text-[#bed0c6]">El sistema detecta columnas de monto, proveedor, categoría y fecha. No muestra cifras ficticias.</p><button onClick={() => inputRef.current?.click()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#d8f36a] px-4 py-2.5 text-sm font-semibold text-[#173126]"><FileSpreadsheet size={17}/>Seleccionar Excel o PDF<ArrowUpRight size={15}/></button>{error && <p className="mt-3 text-sm text-[#ffb6b6]">{error}</p>}</div>
                  <div className="m-4 grid place-items-center rounded-2xl border border-white/10 bg-white/[.045] p-8"><div className="space-y-4 text-sm text-[#dce8e0]">{["Proveedor", "Categoría", "Monto", "Fecha"].map((label) => <div key={label} className="flex items-center gap-3"><CheckCircle2 className="text-[#d8f36a]" size={17}/>{label}</div>)}</div></div>
                </section>
              ) : (
                <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
                  <section className="rounded-2xl border bg-[#fbfcf7] p-5"><h3 className="font-semibold">Evolución del gasto</h3><p className="text-xs text-[#77847c]">Según la fecha detectada</p><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={analysis.trend}><defs><linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d6b4f" stopOpacity={.3}/><stop offset="1" stopColor="#0d6b4f" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#e1e5dc" vertical={false}/><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11}/><YAxis hide/><ChartTooltip formatter={(value) => money.format(Number(value))}/><Area type="monotone" dataKey="value" stroke="#0d6b4f" strokeWidth={3} fill="url(#spendFill)"/></AreaChart></ResponsiveContainer></div></section>
                  <section className="rounded-2xl border bg-[#fbfcf7] p-5"><h3 className="font-semibold">Categorías principales</h3><p className="text-xs text-[#77847c]">Distribución reconocida</p><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={analysis.categories} layout="vertical"><XAxis type="number" hide/><YAxis dataKey="name" type="category" width={95} tickLine={false} axisLine={false} fontSize={10}/><ChartTooltip formatter={(value) => money.format(Number(value))}/><Bar dataKey="value" radius={[0, 7, 7, 0]}>{analysis.categories.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]}/>)}</Bar></BarChart></ResponsiveContainer></div></section>
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="p-5 md:p-8">
              <section onClick={() => inputRef.current?.click()} className="cursor-pointer rounded-3xl border border-dashed border-[#9eaa9f] bg-[#fbfcf7] p-10 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e4eadb] text-[#0d6b4f]">{processing ? <LoaderCircle className="animate-spin"/> : <Upload/>}</div><h3 className="mt-4 font-semibold">Subir Excel o PDF</h3><p className="mt-1 text-sm text-[#6d7b72]">XLSX, XLS, CSV y PDF</p></section>
              {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <section className="mt-5 overflow-hidden rounded-2xl border bg-[#fbfcf7]"><div className="border-b px-5 py-4"><h3 className="font-semibold">Archivos de esta sesión</h3></div>{uploads.length ? <Table><TableHeader><TableRow><TableHead>Archivo</TableHead><TableHead>Tipo</TableHead><TableHead>Registros</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader><TableBody>{uploads.map((file) => <TableRow key={file.name + file.type}><TableCell className="font-medium">{file.name}</TableCell><TableCell>{file.type}</TableCell><TableCell>{file.rows || "—"}</TableCell><TableCell><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700"><CheckCircle2 size={12}/>{file.status}</span></TableCell></TableRow>)}</TableBody></Table> : <div className="p-8 text-center text-sm text-[#718078]">Aún no hay archivos cargados.</div>}</section>
            </TabsContent>

            <TabsContent value="skills" className="p-5 md:p-8">
              <div className="mb-5 rounded-2xl border bg-[#eaf0df] p-4 text-sm text-[#345044]"><strong>Sin skills inventadas.</strong> Se conservan los archivos originales y su licencia dentro del proyecto.</div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{skillGroups.map(([name, source, Icon]) => <article key={name} className="rounded-2xl border bg-[#fbfcf7] p-5"><span className="grid size-10 place-items-center rounded-xl bg-[#e6ecd9] text-[#0d6b4f]"><Icon size={19}/></span><h3 className="mt-5 font-semibold">{name}</h3><p className="mt-1 text-xs text-[#748178]">Fuente: {source}</p></article>)}</div>
            </TabsContent>

            <TabsContent value="assistant" className="p-5 md:p-8">
              <section className="mx-auto max-w-3xl overflow-hidden rounded-3xl border bg-[#fbfcf7]"><div className="border-b bg-[#143c2d] p-6 text-white"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#d8f36a] text-[#173126]"><Bot size={20}/></span><div><h3 className="font-semibold">Procurement Assistant</h3><p className="text-xs text-[#bcd0c5]">Skill principal original, cargada sin modificaciones</p></div></div></div><div className="p-6"><div className="rounded-2xl bg-[#eef1e9] p-4 text-sm leading-6">Los PDF cargados se procesan en el servidor únicamente después de iniciar sesión. La solicitud usa la skill upstream exacta y exige revisión humana.</div><div className="mt-5 flex gap-2"><input value={question} onChange={(event) => setQuestion(event.target.value)} className="flex-1 rounded-xl border bg-white px-4 py-3 text-sm" placeholder="Describe el análisis que necesitas"/><button onClick={runSkill} disabled={runningSkill || !question.trim()} className="rounded-xl bg-[#0d6b4f] px-4 text-white disabled:opacity-50">{runningSkill ? <LoaderCircle className="animate-spin" size={18}/> : <ArrowUpRight size={18}/>}</button></div>{assistantResult && <div className="mt-5 whitespace-pre-wrap rounded-2xl border border-[#dbe4d5] bg-[#f7faf4] p-4 text-sm leading-6">{assistantResult}</div>}{error && <p className="mt-3 text-sm text-red-700">{error}</p>}<p className="mt-3 text-xs text-[#7a877f]">Requiere <a className="underline" href="/login">inicio de sesión</a> con Supabase y una clave de Claude guardada únicamente en el servidor.</p></div></section>
            </TabsContent>
          </section>
        </Tabs>
      </div>
    </main>
  );
}
