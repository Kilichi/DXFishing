# 🎣 DX Fishing

PWA de pesca: mapa de spots, registro de capturas y club. Construida con Next.js 15 (App Router), Supabase (Postgres + PostGIS + Auth + Storage) y Leaflet.

> Estado: **Fase 0 — Setup** completada. Estructura, dependencias y configuración base listas.

## Stack

| Capa            | Tecnología                                            |
| --------------- | ----------------------------------------------------- |
| Framework       | Next.js 15 (App Router) + TypeScript estricto         |
| UI              | TailwindCSS + shadcn/ui + lucide-react + framer-motion |
| Mapas           | react-leaflet 5 + Leaflet + tiles OpenStreetMap       |
| Backend         | Supabase (Postgres + PostGIS + Auth + Storage + RLS)  |
| Integración SSR | @supabase/ssr                                         |
| PWA             | @ducanh2912/next-pwa _(fork mantenido de next-pwa)_   |
| Formularios     | react-hook-form + Zod                                 |
| Fotos           | browser-image-compression                             |
| Fechas          | date-fns                                              |
| Toasts          | sonner                                                |

## Requisitos previos

- **Node.js** ≥ 18.18 (recomendado 20+)
- **Supabase CLI** instalado ([docs](https://supabase.com/docs/guides/cli))
- **Docker** en marcha (lo necesita `supabase start` para el entorno local)

## Arranque local

```bash
# 1. Instalar dependencias
npm install

# 2. Inicializar Supabase en este proyecto (genera supabase/config.toml)
#    Solo la primera vez. Si ya existe config.toml, sáltalo.
supabase init

# 3. Levantar Supabase local (Postgres, Auth, Storage, Studio...)
#    Imprime las URLs y claves al terminar.
npm run db:start

# 4. Configurar variables de entorno
cp .env.example .env.local
#    Pega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
#    con los valores que mostró `supabase start` (o `supabase status`).

# 5. Arrancar Next.js
npm run dev
```

App en http://localhost:3000 · Supabase Studio en http://127.0.0.1:54323

## Scripts

| Script              | Acción                                                   |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo Next.js                           |
| `npm run build`     | Build de producción                                      |
| `npm run start`     | Servir build de producción                               |
| `npm run lint`      | ESLint                                                   |
| `npm run typecheck` | Comprobación de tipos (`tsc --noEmit`)                   |
| `npm run db:start`  | `supabase start`                                         |
| `npm run db:stop`   | `supabase stop`                                          |
| `npm run db:reset`  | Recrea la BD local aplicando todas las migraciones+seed  |
| `npm run db:types`  | Genera `src/types/database.ts` desde la BD local         |
| `npm run db:diff`   | Diff de cambios de esquema en una nueva migración        |
| `npm run db:push`   | Aplica migraciones al proyecto Supabase Cloud enlazado   |

## Estructura

```
dx-fishing/
├── src/
│   ├── app/                # App Router (rutas, layouts)
│   │   ├── layout.tsx      # Root layout + fuentes Geist
│   │   ├── page.tsx        # Landing temporal (Fase 0)
│   │   └── globals.css     # Tailwind + tokens de tema (paleta sky)
│   ├── components/
│   │   └── ui/             # Componentes shadcn/ui (Fase 3+)
│   ├── lib/
│   │   ├── utils.ts        # cn() helper
│   │   └── supabase/       # Clientes browser/server/middleware (Fase 1)
│   └── types/              # Tipos generados de la BD (Fase 1)
├── supabase/
│   └── migrations/         # Migraciones SQL versionadas (Fase 1)
├── public/                 # Estáticos + manifest/SW (Fase 7)
├── next.config.mjs         # Next + PWA
├── tailwind.config.ts      # Tema (paleta sky, rounded-2xl, sombras)
└── components.json         # Config shadcn/ui
```

## Paleta

| Token          | Hex       | Uso              |
| -------------- | --------- | ---------------- |
| white          | `#FFFFFF` | Superficies      |
| sky-50         | `#F0F9FF` | Fondos           |
| sky-500        | `#0EA5E9` | Primario         |
| sky-700        | `#0369A1` | Acentos          |
| slate-900      | `#0F172A` | Texto            |

## Roadmap

- [x] **Fase 0** — Setup
- [x] **Fase 1** — Supabase (migración SQL, tipos, clientes SSR)
- [x] **Fase 2** — Auth (email+contraseña + magic link)
- [x] **Fase 3** — Layout base (bottom nav, navegación)
- [x] **Fase 4** — Mapa
- [x] **Fase 5** — Capturas
- [x] **Fase 6** — Club (placeholder)
- [x] **Fase 7** — PWA (manifest, iconos, service worker)
- [x] **Fase 8** — Deploy → ver [`DEPLOY.md`](./DEPLOY.md)

## Deploy

Guía paso a paso de Vercel + Supabase Cloud en [`DEPLOY.md`](./DEPLOY.md).
