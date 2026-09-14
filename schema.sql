-- onda: run this once in the Supabase SQL editor of a NEW project.
-- (Upgrading an existing project that already ran an older version of
-- this file? Run migrate-to-auth.sql instead — it's the delta, and it
-- won't fight with data you already have.)
--
-- Real Supabase Auth (email+password): only the two accounts registered
-- in "members" can read or write anything. Before using the app, go to
-- Authentication > Providers > Email and turn OFF "Confirm email" —
-- otherwise signUp() won't hand back an active session immediately and
-- the in-app signup screen won't work in one step.

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

-- members: maps a real auth.users account to one of the two seats. The
-- insert policy below caps the app at exactly two accounts, self-serve —
-- each person can only ever claim a role nobody has claimed yet.
create table if not exists members (
  uid uuid primary key references auth.users(id) on delete cascade,
  role text not null unique check (role in ('a','b')),
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

alter table profile enable row level security;
alter table events enable row level security;
alter table entries enable row level security;
alter table bucket enable row level security;
alter table messages enable row level security;
alter table answers enable row level security;
alter table "lastSeen" enable row level security;
alter table members enable row level security;

create policy "members only" on profile for all
  using (exists (select 1 from members where uid = auth.uid()))
  with check (exists (select 1 from members where uid = auth.uid()));
create policy "members only" on events for all
  using (exists (select 1 from members where uid = auth.uid()))
  with check (exists (select 1 from members where uid = auth.uid()));
create policy "members only" on entries for all
  using (exists (select 1 from members where uid = auth.uid()))
  with check (exists (select 1 from members where uid = auth.uid()));
create policy "members only" on bucket for all
  using (exists (select 1 from members where uid = auth.uid()))
  with check (exists (select 1 from members where uid = auth.uid()));
create policy "members only" on messages for all
  using (exists (select 1 from members where uid = auth.uid()))
  with check (exists (select 1 from members where uid = auth.uid()));
create policy "members only" on answers for all
  using (exists (select 1 from members where uid = auth.uid()))
  with check (exists (select 1 from members where uid = auth.uid()));
create policy "members only" on "lastSeen" for all
  using (exists (select 1 from members where uid = auth.uid()))
  with check (exists (select 1 from members where uid = auth.uid()));
create policy "members readable by signed-in users" on members
  for select using (auth.uid() is not null);
create policy "claim an open role for yourself" on members
  for insert with check (
    uid = auth.uid()
    and not exists (select 1 from members existing where existing.role = role)
  );

-- enable realtime (live sync between the two of you)
alter publication supabase_realtime add table
  profile, events, entries, bucket, messages, answers, "lastSeen", members;
