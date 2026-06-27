-- Foothouse schema
-- Run once in Supabase SQL Editor

-- series
create table if not exists series (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  blurb text,
  kind text,
  sort int default 0
);

-- posts
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  excerpt text,
  body text,
  series_id uuid references series(id) on delete set null,
  canonical text not null default 'self',
  medium_url text,
  status text not null default 'draft',
  published_at timestamptz,
  reading_min int
);

create unique index if not exists posts_series_slug on posts(series_id, slug);

-- places
create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lat float8 not null,
  lng float8 not null,
  arrived_on date,
  kind text not null default 'travel',
  pin_type text not null default 'place',
  note text,
  sort int default 0
);

-- place_media
create table if not exists place_media (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references places(id) on delete cascade not null,
  storage_path text not null,
  caption text,
  taken_on date,
  sort int default 0
);

-- projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null,
  body text,
  repo_url text,
  live_url text,
  github_sync boolean default false,
  status text not null default 'active',
  featured boolean default false,
  sort int default 0
);

-- now
create table if not exists now (
  id uuid primary key default gen_random_uuid(),
  listening_text text,
  reading_title text,
  reading_author text,
  building_text text,
  status_line text,
  updated_at timestamptz default now()
);

-- RLS: public read-only on all tables
alter table series enable row level security;
alter table posts enable row level security;
alter table places enable row level security;
alter table place_media enable row level security;
alter table projects enable row level security;
alter table now enable row level security;

create policy "public read series" on series for select using (true);
create policy "public read posts" on posts for select using (true);
create policy "public read places" on places for select using (true);
create policy "public read place_media" on place_media for select using (true);
create policy "public read projects" on projects for select using (true);
create policy "public read now" on now for select using (true);
