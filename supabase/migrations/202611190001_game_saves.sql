-- Run in the project's Supabase SQL editor as an administrator.
-- No public access; authenticated users can access only their own save.
begin;
create table if not exists public.game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object' and octet_length(state::text) <= 1000000),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.game_saves enable row level security;
revoke all on public.game_saves from public, anon;
grant select, insert, update, delete on public.game_saves to authenticated;
drop policy if exists "player selects own save" on public.game_saves;
create policy "player selects own save" on public.game_saves for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "player creates own save" on public.game_saves;
create policy "player creates own save" on public.game_saves for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "player updates own save" on public.game_saves;
create policy "player updates own save" on public.game_saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "player deletes own save" on public.game_saves;
create policy "player deletes own save" on public.game_saves for delete to authenticated using ((select auth.uid()) = user_id);
commit;