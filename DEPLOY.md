# 🚀 Deploy — DX Fishing

Frontend en **Vercel** + backend en **Supabase Cloud**, ambos free tier.

Resumen del flujo: creas el proyecto en Supabase Cloud → enlazas tu carpeta local → empujas las migraciones → configuras auth → despliegas en Vercel con las variables de entorno.

---

## 1. Supabase Cloud

### 1.1 Crear proyecto

1. [app.supabase.com](https://app.supabase.com) → **New project**.
2. Apunta la **DB password** y la **Project ref** (cadena tipo `abcd1234...`, en Settings → General).
3. Region: elige una cercana (ej. `West EU (Ireland)`).

### 1.2 Enlazar tu proyecto local con el remoto

```bash
cd dx-fishing
supabase login                       # abre el navegador, autoriza
supabase link --project-ref <TU_PROJECT_REF>
# te pedirá la DB password del proyecto
```

### 1.3 Empujar el esquema (migraciones versionadas)

```bash
supabase db push
```

Esto aplica `supabase/migrations/*.sql` en la nube: tablas, PostGIS, RLS, índices, RPC `nearby_spots` y el bucket `catches`.

> ⚠️ `db push` **no** ejecuta `seed.sql` — el usuario demo solo existe en local. Producción arranca vacía, como debe ser.

### 1.4 Configurar Auth

Dos opciones:

**A) Desde la CLI (recomendado, versiona la config):**

```bash
supabase config push
```

Sube `config.toml`, incluida la plantilla de magic link. **Antes**, edita en `config.toml` el `site_url` y `additional_redirect_urls` para apuntar a tu dominio de Vercel (ver 1.5).

**B) Desde el Dashboard:** Authentication → **URL Configuration** (ver 1.5) y, si quieres personalizar el correo, Authentication → **Email Templates → Magic Link** pegando el HTML de `supabase/templates/magic_link.html`.

### 1.5 URLs de redirección

En **Authentication → URL Configuration** (o en `config.toml` antes del `config push`):

- **Site URL:** `https://TU-APP.vercel.app`
- **Redirect URLs:** `https://TU-APP.vercel.app/**`

Sin esto, login con magic link y los callbacks fallan.

### 1.6 Email en producción (free tier) ⚠️

El email integrado de Supabase está **muy limitado** (unos pocos correos/hora) y no es apto para producción. Si usas magic link de forma real:

- Configura **SMTP propio**: Authentication → **SMTP Settings**. [Resend](https://resend.com) tiene free tier (3.000/mes) y se integra en minutos.
- El login email+contraseña funciona sin SMTP **si** desactivas confirmación de email (Authentication → Providers → Email → *Confirm email* off). Con confirmación activada, necesitas SMTP para enviar el correo de verificación. La ruta `/auth/confirm` ya gestiona ese enlace.

### 1.7 Claves de API

Settings → **API**. Copia:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

(La `service_role` / `secret` **no** se usa en esta app y nunca debe ir al frontend.)

---

## 2. Vercel

### 2.1 Importar

1. Sube el repo a GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo.
3. Framework: Next.js (autodetectado). No cambies build/output.

### 2.2 Variables de entorno

En **Settings → Environment Variables** (Production + Preview), antes del primer build:

| Variable                        | Valor                              |
| ------------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL del proyecto Supabase Cloud    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key             |
| `NEXT_PUBLIC_SITE_URL`          | `https://TU-APP.vercel.app`        |

> El build **falla** si falta alguna: `src/lib/env.ts` valida con Zod al arrancar. Es intencional.

### 2.3 Desplegar

**Deploy**. Cuando termine, copia el dominio real y, si difiere del que pusiste, actualiza:

- `NEXT_PUBLIC_SITE_URL` en Vercel,
- Site URL + Redirect URLs en Supabase (1.5),

y vuelve a desplegar (**Redeploy**).

---

## 3. Comprobación post-deploy

1. Abre `https://TU-APP.vercel.app` → redirige a `/login`.
2. Crea una cuenta (o magic link si configuraste SMTP).
3. Mapa: añade un punto → recarga → persiste.
4. Capturas: nueva captura con foto → se sube a Storage y aparece.
5. Instala la PWA: en Chrome móvil/desktop, menú → **Instalar app** (icono y splash de DX Fishing).

---

## 4. Límites del free tier (a tener en cuenta)

| Servicio          | Límite relevante                                                        |
| ----------------- | ----------------------------------------------------------------------- |
| Supabase DB       | 500 MB · **el proyecto se pausa tras ~1 semana sin actividad** (se reactiva manualmente) |
| Supabase Storage  | 1 GB · suficiente para miles de fotos a ≤1 MB                            |
| Supabase Auth     | Email integrado fuertemente rate-limited → usa SMTP propio (1.6)        |
| Vercel Hobby      | Solo proyectos no comerciales · 100 GB-hora de funciones/mes            |

Todo lo demás de esta app (PostGIS, RLS, RPC, PWA) entra en el free tier sin coste.
