-- ============================================================================
-- Seed SOLO para entorno LOCAL (supabase start / db reset).
-- Crea un usuario demo y datos de ejemplo. No ejecutar en producción.
-- Login demo:  demo@dxfishing.test  /  password: demo1234
-- ============================================================================

-- Usuario demo en auth.users (UUID fijo para referenciarlo abajo).
insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  'd0000000-0000-4000-a000-000000000001',
  'authenticated', 'authenticated', 'demo@dxfishing.test',
  crypt('demo1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Pescador Demo"}',
  now(), now()
)
on conflict (id) do nothing;

-- Identidad email (necesaria para login con password en algunas versiones).
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, created_at, updated_at
)
values (
  gen_random_uuid(),
  'd0000000-0000-4000-a000-000000000001',
  'd0000000-0000-4000-a000-000000000001',
  '{"sub":"d0000000-0000-4000-a000-000000000001","email":"demo@dxfishing.test"}',
  'email', now(), now()
)
on conflict do nothing;

-- El trigger handle_new_user ya creó el profile; le ponemos username.
update public.profiles
  set username = 'demo'
  where id = 'd0000000-0000-4000-a000-000000000001';

-- Spots de ejemplo (embalses/ríos reales de España).
insert into public.fishing_spots (id, user_id, name, description, location, fish_types, is_public)
values
  ('5a000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000001',
   'Embalse de Mequinenza', 'El "Mar de Aragón", referencia de siluro y black bass.',
   'SRID=4326;POINT(0.2956 41.3717)', array['siluro','black bass','carpa','lucio'], true),
  ('5a000000-0000-4000-a000-000000000002', 'd0000000-0000-4000-a000-000000000001',
   'Embalse de Ebro', 'Aguas frías cántabras, buena trucha y lucio.',
   'SRID=4326;POINT(-3.9889 42.9931)', array['trucha','lucio','black bass'], true),
  ('5a000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000001',
   'Río Tajo (Aranjuez)', 'Tramo bajo con barbo y carpa.',
   'SRID=4326;POINT(-3.6030 40.0312)', array['barbo','carpa'], true);

-- Capturas de ejemplo.
insert into public.catches (user_id, spot_id, species, weight_kg, length_cm, location, notes, caught_at)
values
  ('d0000000-0000-4000-a000-000000000001', '5a000000-0000-4000-a000-000000000001',
   'siluro', 32.500, 178, 'SRID=4326;POINT(0.2956 41.3717)', 'Vinilo al atardecer.', now() - interval '3 days'),
  ('d0000000-0000-4000-a000-000000000001', '5a000000-0000-4000-a000-000000000002',
   'lucio', 4.200, 92, 'SRID=4326;POINT(-3.9889 42.9931)', 'Spinnerbait blanco.', now() - interval '10 days'),
  ('d0000000-0000-4000-a000-000000000001', '5a000000-0000-4000-a000-000000000003',
   'barbo', 1.800, 54, 'SRID=4326;POINT(-3.6030 40.0312)', 'Boilie de fresa.', now() - interval '1 day');
