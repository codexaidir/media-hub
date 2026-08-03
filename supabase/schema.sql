create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  filename text not null,
  mime_type text,
  asset_type text not null check (asset_type in ('image', 'video')),
  size_bytes bigint,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.downloads enable row level security;

create policy "Users can read their own downloads"
  on public.downloads
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own downloads"
  on public.downloads
  for insert
  with check (auth.uid() = user_id);

create table if not exists public.searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  result_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.searches enable row level security;

create policy "Users can read their own searches"
  on public.searches
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own searches"
  on public.searches
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own searches"
  on public.searches
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.media_outputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  search_id uuid references public.searches(id) on delete cascade,
  bucket text not null default 'user-media-outputs',
  storage_path text not null,
  filename text not null,
  mime_type text,
  size_bytes bigint,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.media_outputs enable row level security;

create policy "Users can read their own media outputs"
  on public.media_outputs
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own media outputs"
  on public.media_outputs
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own media outputs"
  on public.media_outputs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();
