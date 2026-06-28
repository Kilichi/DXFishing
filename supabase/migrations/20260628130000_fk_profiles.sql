-- ============================================================================
-- Reapunta las FK de user_id a public.profiles (en vez de auth.users) para
-- poder embeber el autor con PostgREST: select(..., author:profiles(...)).
-- profiles.id ya referencia auth.users(id) on delete cascade, así que el
-- borrado en cascada se mantiene.
-- ============================================================================

alter table public.fishing_spots
  drop constraint if exists fishing_spots_user_id_fkey;
alter table public.fishing_spots
  add constraint fishing_spots_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.catches
  drop constraint if exists catches_user_id_fkey;
alter table public.catches
  add constraint catches_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;
