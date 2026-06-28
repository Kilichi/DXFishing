-- ============================================================================
-- DX Fishing — esquema inicial
-- profiles · fishing_spots · catches + PostGIS + RLS + Storage + RPC
-- ============================================================================

-- PostGIS vive en el esquema `extensions` (recomendación de Supabase).
create extension if not exists postgis with schema extensions;

-- ----------------------------------------------------------------------------
-- Helper: trigger genérico para mantener updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- profiles — extiende auth.users
-- ============================================================================
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Perfil público de cada usuario (1:1 con auth.users).';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea el perfil automáticamente al registrarse un usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- fishing_spots
-- ============================================================================
create table public.fishing_spots (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 120),
  description text,
  location    extensions.geography(Point, 4326) not null,
  fish_types  text[] not null default '{}',
  is_public   boolean not null default true,
  created_at  timestamptz not null default now(),
  -- Coordenadas planas derivadas para leer lat/lng sin RPC en el cliente.
  latitude    double precision generated always as (extensions.st_y(location::extensions.geometry)) stored,
  longitude   double precision generated always as (extensions.st_x(location::extensions.geometry)) stored
);

comment on table public.fishing_spots is 'Puntos de pesca creados por usuarios; públicos o privados.';

create index fishing_spots_location_gix on public.fishing_spots using gist (location);
create index fishing_spots_user_id_idx  on public.fishing_spots (user_id);

-- ============================================================================
-- catches
-- ============================================================================
create table public.catches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  spot_id     uuid references public.fishing_spots (id) on delete set null,
  species     text not null check (char_length(species) between 1 and 80),
  weight_kg   numeric(6, 3) check (weight_kg is null or weight_kg >= 0),
  length_cm   numeric(6, 2) check (length_cm is null or length_cm >= 0),
  photo_url   text,
  location    extensions.geography(Point, 4326),
  notes       text,
  caught_at   timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  latitude    double precision generated always as (extensions.st_y(location::extensions.geometry)) stored,
  longitude   double precision generated always as (extensions.st_x(location::extensions.geometry)) stored
);

comment on table public.catches is 'Capturas registradas por usuarios.';

create index catches_location_gix    on public.catches using gist (location);
create index catches_caught_at_idx   on public.catches (caught_at desc);
create index catches_user_id_idx     on public.catches (user_id);
create index catches_spot_id_idx     on public.catches (spot_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.fishing_spots enable row level security;
alter table public.catches       enable row level security;

-- profiles: lectura pública, escritura solo propia ------------------------
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- fishing_spots: SELECT si público o propio; mutación solo propia ----------
create policy "spots_select_public_or_own"
  on public.fishing_spots for select
  using (is_public or auth.uid() = user_id);

create policy "spots_insert_own"
  on public.fishing_spots for insert to authenticated
  with check (auth.uid() = user_id);

create policy "spots_update_own"
  on public.fishing_spots for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "spots_delete_own"
  on public.fishing_spots for delete to authenticated
  using (auth.uid() = user_id);

-- catches: SELECT público; mutación solo propia ---------------------------
create policy "catches_select_public"
  on public.catches for select
  using (true);

create policy "catches_insert_own"
  on public.catches for insert to authenticated
  with check (auth.uid() = user_id);

create policy "catches_update_own"
  on public.catches for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "catches_delete_own"
  on public.catches for delete to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- Storage: bucket 'catches' (público en lectura, escritura autenticada)
-- Paths: {user_id}/{uuid}.jpg
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('catches', 'catches', true)
on conflict (id) do nothing;

create policy "catches_storage_select_public"
  on storage.objects for select
  using (bucket_id = 'catches');

create policy "catches_storage_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'catches'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "catches_storage_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'catches'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "catches_storage_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'catches'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- RPC: nearby_spots(lat, lng, radius_m)
-- Devuelve los spots visibles dentro del radio, ordenados por distancia.
-- security invoker => respeta RLS (solo públicos o propios).
-- ============================================================================
create or replace function public.nearby_spots(
  lat double precision,
  lng double precision,
  radius_m double precision default 5000
)
returns table (
  id          uuid,
  user_id     uuid,
  name        text,
  description text,
  fish_types  text[],
  is_public   boolean,
  latitude    double precision,
  longitude   double precision,
  distance_m  double precision,
  created_at  timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    s.id,
    s.user_id,
    s.name,
    s.description,
    s.fish_types,
    s.is_public,
    s.latitude,
    s.longitude,
    extensions.st_distance(
      s.location,
      extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography
    ) as distance_m,
    s.created_at
  from public.fishing_spots s
  where extensions.st_dwithin(
    s.location,
    extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography,
    radius_m
  )
  order by distance_m asc;
$$;
