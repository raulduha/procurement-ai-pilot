-- Integration-owned schema. Run in Supabase SQL Editor before enabling production traffic.
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  storage_path text not null unique,
  mime_type text not null,
  extracted_text text,
  created_at timestamptz not null default now()
);
create table if not exists public.skill_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id text not null,
  prompt text not null,
  result text not null,
  created_at timestamptz not null default now()
);
alter table public.documents enable row level security;
alter table public.skill_runs enable row level security;
insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict (id) do update set public = false;
drop policy if exists "Users manage only their documents" on public.documents;
drop policy if exists "Users view only their skill runs" on public.skill_runs;
drop policy if exists "Users create only their skill runs" on public.skill_runs;
drop policy if exists "Users manage only their document objects" on storage.objects;
create policy "Users manage only their documents" on public.documents for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users view only their skill runs" on public.skill_runs for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users create only their skill runs" on public.skill_runs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users manage only their document objects" on storage.objects for all to authenticated using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid()::text)) with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid()::text));
