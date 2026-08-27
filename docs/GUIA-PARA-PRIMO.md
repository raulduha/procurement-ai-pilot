# Guía simple: Procurement AI Pilot

Esta guía permite poner en marcha el piloto sin saber programar ni usar agentes. La aplicación analiza archivos de compras y permite pedirle a Claude que aplique una de las instrucciones originales de procurement incluidas en el proyecto.

## Antes de empezar

Necesitas acceso a cuatro cuentas: GitHub, Vercel, Supabase y Anthropic (Claude). Si la empresa usa SharePoint, también se necesita un administrador de Microsoft 365. No compartas claves por WhatsApp, correo ni GitHub.

## Conceptos en una frase

- La aplicación es la página web que abre el usuario.
- Claude es el modelo que responde.
- Las *skills* son instrucciones originales de procurement que ya vienen dentro del proyecto. No se editan.
- Supabase guarda las cuentas y los documentos de forma privada.
- Vercel publica la página web.

## Paso 1: probar la aplicación en el computador

1. Instala [Node.js 22](https://nodejs.org/) si aún no está instalado.
2. Abre la carpeta del proyecto.
3. Haz doble clic en `INICIAR-LOCALMENTE.cmd` si existe; si no, abre PowerShell en la carpeta y ejecuta:

   ```powershell
   npm install
   Copy-Item .env.example .env.local
   npm run dev
   ```

4. Abre `http://localhost:3000` en el navegador.

Sin las claves de los siguientes pasos podrás revisar la interfaz y analizar Excel localmente. Para iniciar sesión, guardar documentos o pedir respuestas a Claude debes completar la configuración.

## Paso 2: crear Supabase (cuentas y documentos privados)

1. Entra a [Supabase](https://supabase.com/) y crea un proyecto nuevo para la empresa.
2. En **Authentication → URL Configuration**, agrega como Site URL la dirección final de Vercel. Agrega también `http://localhost:3000/auth/callback` y `https://TU-DOMINIO/auth/callback` en Redirect URLs.
3. En **Authentication → Providers → Email**, habilita los enlaces mágicos por correo.
4. En **SQL Editor**, abre el archivo `supabase/migrations/20260827_private_pilot.sql`, copia todo su contenido y pulsa **Run** una vez. Esto crea las tablas, el bucket privado `documents` y las reglas RLS.
5. En **Project Settings → API**, copia la Project URL y la Publishable key. No copies la clave secreta al navegador.

## Paso 3: crear una clave de Claude

1. Entra a la consola de Anthropic con la cuenta de la empresa.
2. Crea una API key para este piloto y guárdala en el gestor de contraseñas de la empresa.
3. Nunca la pegues en un archivo que se vaya a subir a GitHub.

## Paso 4: configurar el archivo local

Abre `.env.local` (no `.env.example`) y completa únicamente los valores que tengas:

```text
ALLOWED_USER_EMAIL=correo-autorizado@empresa.com
ANTHROPIC_API_KEY=clave-de-anthropic
ANTHROPIC_MODEL=claude-sonnet-4-5
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=clave-publica-de-supabase
```

Guarda el archivo, detén la aplicación con `Ctrl+C` y vuelve a ejecutar `npm run dev`. Entra a `http://localhost:3000/login`, solicita el enlace de acceso y usa exactamente el correo definido en `ALLOWED_USER_EMAIL`.

## Paso 5: usar la aplicación

1. Inicia sesión.
2. Carga un Excel, CSV o PDF de prueba no confidencial.
3. Para un PDF, la aplicación extrae el texto y lo guarda en el bucket privado de Supabase.
4. En **Asistente**, escribe una pregunta concreta, por ejemplo: “Resume los principales riesgos de este contrato”.
5. Lee la respuesta y revísala con una persona responsable. La aplicación nunca adjudica compras, firma contratos ni contacta proveedores automáticamente.

## Paso 6: conectar SharePoint (solo si el administrador lo aprueba)

No concedas permisos generales de Microsoft 365. El administrador debe registrar una aplicación en Microsoft Entra ID con permiso de aplicación `Sites.Selected`, otorgar consentimiento y autorizar solamente el sitio/carpeta que contenga archivos permitidos. Después debe entregar estos valores al responsable del piloto:

```text
MICROSOFT_TENANT_ID=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_SHAREPOINT_SITE_ID=
MICROSOFT_SHAREPOINT_DRIVE_ID=
MICROSOFT_SHAREPOINT_FOLDER_ID=
```

La integración solo lista archivos dentro de esa carpeta. No descarga, edita ni borra archivos de SharePoint.

## Paso 7: publicar en Vercel

1. Sube el proyecto a un repositorio **privado** de GitHub.
2. Entra a [Vercel](https://vercel.com/), pulsa **Add New → Project** e importa ese repositorio.
3. En **Settings → Environment Variables**, agrega los valores de `.env.local`. No subas el archivo `.env.local`.
4. Pulsa **Deploy**.
5. Copia la URL publicada y vuelve a Supabase para agregar `https://TU-URL/auth/callback` en Redirect URLs.
6. Prueba el inicio de sesión con el correo autorizado antes de cargar información real.

## Problemas frecuentes

| Problema | Qué hacer |
| --- | --- |
| “Supabase no está configurado” | Revisa las dos variables `NEXT_PUBLIC_SUPABASE_*` y reinicia la aplicación. |
| No llega el enlace de acceso | Confirma que Email está activo en Supabase y que la URL de retorno está configurada. |
| “Claude API no está configurada” | Agrega `ANTHROPIC_API_KEY` en el servidor o Vercel, nunca en el navegador. |
| No puedo abrir un documento de SharePoint | Pide al administrador que confirme el sitio, unidad y carpeta exactos; no amplíes permisos por comodidad. |
| GitHub rechaza el push | Verifica que el repositorio sea privado y que el usuario tenga acceso de escritura. |

## Reglas de seguridad que no se negocian

- Nunca subas `.env.local`, claves, tokens o documentos empresariales a GitHub.
- Usa solo un correo autorizado mientras sea un piloto.
- Haz pruebas con archivos no confidenciales antes de usar información real.
- Toda recomendación de proveedor, contrato o adjudicación requiere revisión humana.
