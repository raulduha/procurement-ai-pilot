# Procurement AI Pilot

Aplicación privada para analizar Excel, CSV y PDF de compras, revisar gasto y solicitar análisis a Claude usando las skills de procurement originales que incluye este repositorio.

No necesitas saber de agentes ni programación. Sigue esta guía en orden y no cargues documentos empresariales hasta completar Supabase y el acceso privado.

## Qué hace

- Lee Excel, CSV y PDF cargados por la persona usuaria.
- Detecta monto, proveedor, categoría y fecha para mostrar métricas de gasto.
- Extrae texto real de PDFs en el servidor.
- Ejecuta la skill original apropiada mediante Claude API.
- Guarda documentos y ejecuciones de skills en Supabase, con reglas RLS.
- Nunca adjudica compras, firma contratos, contacta proveedores ni toma decisiones automáticamente: una persona debe revisar toda recomendación.

**Microsoft SharePoint/OneDrive es opcional.** La aplicación funciona con carga manual de Excel, CSV y PDF; déjalo para después.

## Antes de usar información real

Completa primero estas tres configuraciones:

1. Supabase: cuentas y documentos privados.
2. Anthropic: clave para Claude.
3. Vercel o el computador local: variables de configuración.

Sin ellas puedes conocer la interfaz y analizar Excel localmente. No subas PDFs ni documentos corporativos al sitio publicado hasta que Supabase esté configurado.

## Inicio rápido local

### Windows

1. Instala [Node.js 22 o superior](https://nodejs.org/).
2. Descarga o clona el repositorio.
3. Haz doble clic en `INICIAR-LOCALMENTE.cmd`.
4. Abre `http://localhost:3000`.

El primer inicio crea `.env.local`. Es privado: nunca lo subas a GitHub.

### macOS, Linux o PowerShell

```bash
npm install
cp .env.example .env.local
npm run dev
```

En PowerShell usa esto en vez de `cp`:

```powershell
Copy-Item .env.example .env.local
```

## Supabase: paso a paso

Supabase es obligatorio para iniciar sesión, procesar PDFs, guardar archivos privados y usar Claude de forma segura.

1. Entra a [supabase.com](https://supabase.com/) y crea una cuenta con correo de la empresa.
2. Pulsa **New project**, nómbralo `procurement-ai-pilot` y guarda la contraseña de base de datos en el gestor de contraseñas de la empresa.
3. Cuando el proyecto esté listo, abre **SQL Editor → New query**.
4. Abre localmente `supabase/migrations/20260827_private_pilot.sql`, copia todo su contenido en el editor y pulsa **Run**.
   - Crea las tablas, el bucket privado `documents` y las reglas RLS.
5. Abre **Authentication → Providers → Email** y habilita Email / Magic Link.
6. En **Authentication → URL Configuration**, configura:
   - **Site URL**: tu URL final de Vercel, por ejemplo `https://procurement-ai-pilot.vercel.app`.
   - **Redirect URLs**: `http://localhost:3000/auth/callback` y `https://TU-URL-DE-VERCEL/auth/callback`.
7. En **Project Settings → API**, copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`.
   - **Publishable key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

La Publishable key puede estar en la web porque RLS protege los datos. La clave secreta de Supabase no es necesaria para la versión actual del piloto.

## Claude: paso a paso

1. Entra a la consola de Anthropic con una cuenta autorizada por la empresa.
2. Crea una API key para este piloto.
3. Guárdala solo en Vercel y/o `.env.local`.
4. Nunca la pegues en GitHub, documentos compartidos ni conversaciones.

Usa `claude-sonnet-4-5` en `ANTHROPIC_MODEL`, salvo que la empresa apruebe otro modelo.

## Variables de configuración

Completa `.env.local` para trabajar localmente y agrega las mismas variables en **Vercel → Project → Settings → Environment Variables** para producción.

| Variable | Valor | ¿Secreta? |
| --- | --- | --- |
| `ALLOWED_USER_EMAIL` | Único correo autorizado para el piloto | No, pero privada |
| `ANTHROPIC_API_KEY` | API key de Anthropic | Sí |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-5` | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL de Supabase | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key de Supabase | No |

No necesitas `SUPABASE_SECRET_KEY` por ahora. Después de agregar las variables, reinicia `npm run dev` localmente o redepliega desde `main` en Vercel.

## Usar la aplicación

1. Abre `/login` e ingresa el correo definido en `ALLOWED_USER_EMAIL`.
2. Revisa el enlace mágico que envía Supabase.
3. Carga primero un archivo de prueba no confidencial.
4. En **Documentos**, revisa que un PDF aparezca como texto extraído.
5. En **Asistente**, escribe una pregunta concreta.
6. Revisa siempre la respuesta antes de usarla en una compra, contrato, proveedor o negociación.

Ejemplo: “Resume los riesgos contractuales de este PDF y señala qué debe revisar una persona responsable.”

## Desplegar en Vercel

1. Revisa y fusiona `development` a `main`.
2. En Vercel importa el repositorio privado `raulduha/procurement-ai-pilot`.
3. Vercel detecta Next.js automáticamente.
4. Agrega las cinco variables de la tabla anterior en Production y Preview.
5. Pulsa **Deploy**.
6. Copia la URL publicada y agrégala a las Redirect URLs de Supabase.
7. Prueba iniciar sesión antes de usar documentos reales.

Si tu equipo restringe despliegues o integraciones de terceros, deja que el dueño del proyecto haga ese paso manualmente. No amplíes permisos de Vercel o GitHub por comodidad.

## Microsoft: dejar para después

**No es necesario ahora.** La carga manual de Excel, CSV y PDF cubre el uso inicial del piloto.

Solo conecta SharePoint/OneDrive cuando la empresa lo apruebe. Un administrador de Microsoft 365 debe crear una aplicación de Entra ID con permisos mínimos (`Sites.Selected`) y autorizar solamente una carpeta. Entonces agrega:

```text
MICROSOFT_TENANT_ID=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_SHAREPOINT_SITE_ID=
MICROSOFT_SHAREPOINT_DRIVE_ID=
MICROSOFT_SHAREPOINT_FOLDER_ID=
```

`MICROSOFT_CLIENT_SECRET` es secreto. La integración es solo de lectura y solo enumera la carpeta configurada.

## Cómo funciona por dentro

No hay un servidor separado que instalar:

- **Frontend y backend:** Next.js.
- **Backend:** rutas internas para PDF, Claude, documentos y Microsoft Graph.
- **Usuarios, base de datos y archivos:** Supabase con RLS.
- **IA:** Claude API desde el servidor; la clave no llega al navegador.
- **Despliegue:** Vercel.

## Skills originales y licencias

Las skills canónicas están en `vendor/upstream/` y no se modifican:

- `arunbalajiraju-proc/procurement-ai-assistant` — commit `67b7e02bfb613f9939f3d7347d75100954d3bc03`.
- `Maxbase91/procurement-skills` — commit `f1f1cbb136ade6bd15e6bcf21fdf254963c18689`.

Las licencias MIT originales se mantienen junto con los archivos. La aplicación carga el `SKILL.md` original al ejecutar Claude, sin reescribir su lógica.

## Seguridad

- Nunca subas `.env.local`, API keys, tokens o documentos empresariales a GitHub.
- Mantén el repositorio privado.
- Prueba primero con datos no confidenciales.
- Usa un único correo autorizado mientras el piloto sea pequeño.
- Microsoft debe tener acceso a una carpeta, no a toda la organización.
- Toda recomendación requiere revisión humana.

## Verificar cambios técnicos

Antes de fusionar código ejecuta:

```bash
npm run typecheck
npm run lint
npm run build
```

## Problemas comunes

| Problema | Solución |
| --- | --- |
| “Supabase no está configurado” | Revisa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; luego reinicia o redepliega. |
| No llega el enlace de acceso | Revisa Email/Magic Link y las Redirect URLs en Supabase. |
| “Claude API no está configurada” | Agrega `ANTHROPIC_API_KEY` solo en Vercel o `.env.local`. |
| No puedo usar un PDF | Inicia sesión primero; solo usuarios autorizados pueden procesarlo. |
| SharePoint no funciona | Déjalo desactivado hasta tener los permisos y los seis valores configurados. |

Para una guía más visual, revisa `docs/GUIA-PARA-PRIMO.md`.
