create table public.seed_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);
grant select, insert, update, delete on public.seed_presets to authenticated;
grant all on public.seed_presets to service_role;
alter table public.seed_presets enable row level security;
create policy "Users select own presets" on public.seed_presets for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own presets" on public.seed_presets for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own presets" on public.seed_presets for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own presets" on public.seed_presets for delete to authenticated using (auth.uid() = user_id);

create table public.seed_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  api_key_id uuid,
  schema_hash text,
  rows_total int not null default 0,
  duration_ms int not null default 0,
  status text not null default 'ok',
  domain text,
  format text,
  output_url text,
  created_at timestamptz not null default now()
);
grant select, insert on public.seed_runs to authenticated;
grant all on public.seed_runs to service_role;
alter table public.seed_runs enable row level security;
create policy "Users select own runs" on public.seed_runs for select to authenticated using (auth.uid() = user_id);