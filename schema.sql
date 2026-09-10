-- onda: run this once in the Supabase SQL editor of your new project.
-- Intentionally permissive RLS (allow all) -- same trust model as before:
-- the app identifies "who you are" via a ?u=a / ?u=b link, not real auth.
-- Anyone with the anon key + these table names could read/write, same
-- exposure as the previous private-link scheme. Tighten later with real
-- auth if you want stronger protection.

create table if not exists profile (
  id text primary key default 'profile',
  "nameA" text,
  "nameB" text,
  anniversary date
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  author text not null check (author in ('a','b')),
  "createdAt" bigint not null
);

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  text text not null,
  author text not null check (author in ('a','b')),
  "createdAt" bigint not null
);

create table if not exists bucket (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('bucket','date')),
  text text not null,
  done boolean not null default false,
  "doneDate" date,
  "mapUrl" text,
  author text not null check (author in ('a','b')),
  "createdAt" bigint not null
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  author text not null check (author in ('a','b')),
  "createdAt" bigint not null
);

create table if not exists answers (
  id text primary key, -- '{date}_{author}', e.g. '2026-09-10_a'
  date date not null,
  author text not null check (author in ('a','b')),
  text text not null,
  "createdAt" bigint not null
);

create table if not exists "lastSeen" (
  id text primary key, -- 'a' | 'b'
  ts bigint not null
);

alter table profile enable row level security;
alter table events enable row level security;
alter table entries enable row level security;
alter table bucket enable row level security;
alter table messages enable row level security;
alter table answers enable row level security;
alter table "lastSeen" enable row level security;

create policy "allow all" on profile for all using (true) with check (true);
create policy "allow all" on events for all using (true) with check (true);
create policy "allow all" on entries for all using (true) with check (true);
create policy "allow all" on bucket for all using (true) with check (true);
create policy "allow all" on messages for all using (true) with check (true);
create policy "allow all" on answers for all using (true) with check (true);
create policy "allow all" on "lastSeen" for all using (true) with check (true);

-- enable realtime (live sync between the two of you)
alter publication supabase_realtime add table
  profile, events, entries, bucket, messages, answers, "lastSeen";
