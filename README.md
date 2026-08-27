# Procurement AI Pilot

Piloto privado para analizar información de compras desde Excel y PDF, ejecutar workflows de procurement y preparar una conexión limitada con SharePoint/OneDrive.

> ¿No programas ni usas agentes? Empieza por [la guía simple de puesta en marcha](docs/GUIA-PARA-PRIMO.md). Explica cada cuenta, clave y prueba en orden.

El proyecto usa como fuente canónica las skills originales de:

- [Procurement AI Assistant](https://github.com/arunbalajiraju-proc/procurement-ai-assistant)
- [Procurement Skills for Claude](https://github.com/Maxbase91/procurement-skills)

Los archivos originales están en `vendor/upstream/`, conservan sus licencias MIT y no deben modificarse. Las versiones exactas están registradas en `vendor/upstream/SOURCES.md`.

## Estado actual

- Dashboard privado en Next.js.
- Carga local de XLSX, XLS y CSV.
- Detección de columnas de monto, proveedor, categoría y fecha.
- Métricas y gráficos calculados únicamente desde los datos cargados.
- Procesamiento real de PDF en servidor con extracción de texto.
- Biblioteca visible de skills originales.
- Ejecución de skills mediante Claude API con el `SKILL.md` original cargado sin modificaciones.
- Inicio de sesión de Supabase, tablas, Storage privado y políticas RLS en una migración.
- Microsoft Graph de solo lectura limitado a una carpeta explícitamente autorizada.
- Configuración de seguridad para Vercel y ejemplo de variables de entorno.

La conexión productiva con Claude, Supabase y Microsoft 365 requiere credenciales del propietario y autorización de la empresa. Ninguna clave debe enviarse a la persona usuaria.

## Puesta en marcha para una persona no técnica

En Windows, haz doble clic en `INICIAR-LOCALMENTE.cmd`. La primera vez crea `.env.local` sin claves y abre la aplicación cuando terminen de instalarse las dependencias. Después sigue [la guía simple](docs/GUIA-PARA-PRIMO.md) para conectar Supabase, Claude y, si está autorizado, SharePoint.

## Requisitos

- Node.js 22 o superior.
- npm.
- Git.

En Windows se recomienda PowerShell 7 y VS Code.

## Ejecutar localmente

```bash
git clone https://github.com/raulduha/procurement-ai-pilot.git
cd procurement-ai-pilot
npm install
copy .env.example .env.local
npm run dev
```

En macOS o Linux reemplaza `copy` por:

```bash
cp .env.example .env.local
```

Abre [http://localhost:3000](http://localhost:3000).

Para ejecutar una versión de producción:

```bash
npm run build
npm run start
```

## Trabajar con Codex

1. Clona y abre el repositorio en VS Code.
2. Inicia Codex dentro de la carpeta del proyecto.
3. Pídele que lea primero `AGENTS.md`.
4. Trabaja en una rama y ejecuta:

```bash
npm run typecheck
npm run lint
npm run build
```

Ejemplo de instrucción:

> Lee AGENTS.md y vendor/upstream/SOURCES.md. Implementa el cambio sin modificar las skills originales. Ejecuta typecheck, lint y build.

## Trabajar con Claude Code

```bash
claude
```

Prompt inicial recomendado:

> Lee completamente AGENTS.md. Usa las skills originales de vendor/upstream como fuente canónica y no reescribas su lógica. Revisa el estado del proyecto y ejecuta las verificaciones antes de proponer cambios.

Claude Code trabaja sobre el mismo repositorio y sus cambios pueden desplegarse desde GitHub.

## Usar las skills en Claude Desktop

La aplicación web y las skills son dos superficies diferentes. Claude Desktop no levanta el dashboard: puede recibir las skills originales como paquetes ZIP.

En Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\package-skills.ps1
```

En macOS, Linux o WSL:

```bash
bash scripts/package-skills.sh
```

Los ZIP se crean en `dist/skills/`. En Claude, abre **Settings → Capabilities → Skills → Upload skill** y carga solo las skills que necesites. La disponibilidad depende del plan y de los controles de la organización.

## Usar las skills en ChatGPT

En un espacio de ChatGPT con soporte para Skills:

1. Genera los ZIP con uno de los scripts anteriores.
2. Abre la administración de Skills.
3. Sube la skill principal de Procurement AI Assistant.
4. Agrega únicamente las skills especializadas necesarias.

Si tu cuenta no permite instalar Skills, usa el dashboard local o desplegado; no copies secretos ni documentos empresariales a una conversación no aprobada.

## Variables de entorno

Copia `.env.example` a `.env.local`.

| Variable | Uso |
|---|---|
| `ALLOWED_USER_EMAIL` | Correo único autorizado para el piloto |
| `ANTHROPIC_API_KEY` | Clave de Claude guardada solo en servidor |
| `ANTHROPIC_MODEL` | Modelo aprobado para el piloto |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública protegida por RLS |
| `SUPABASE_SECRET_KEY` | Clave exclusiva del backend |
| `MICROSOFT_TENANT_ID` | Tenant de Microsoft Entra |
| `MICROSOFT_CLIENT_ID` | Identificador de la aplicación |
| `MICROSOFT_CLIENT_SECRET` | Secreto guardado solo en servidor |

## Despliegue en Vercel

1. Importa este repositorio privado en Vercel.
2. Mantén Next.js como framework detectado.
3. Agrega las variables de `.env.example` en **Project Settings → Environment Variables**.
4. Despliega primero sin documentos corporativos.
5. Verifica autenticación, RLS y permisos antes de cargar información real.

Cada cambio fusionado a `main` actualiza producción. Las ramas y pull requests generan previews independientes.

## Seguridad

- Repositorio privado.
- Archivos y tablas privadas.
- RLS habilitado en todas las tablas de Supabase.
- Claves secretas únicamente en backend.
- Microsoft Graph con permisos seleccionados para el sitio o carpeta autorizada.
- Revisión humana obligatoria antes de usar recomendaciones de contratos, proveedores, negociación o adjudicación.
- No cargar información confidencial hasta obtener aprobación formal de seguridad y tratamiento de datos.

## Licencias

Las skills vendorizadas mantienen sus archivos de licencia originales. El código de integración del piloto debe conservar este aviso y no atribuirse la autoría de las skills upstream.
