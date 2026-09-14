-- onda: run this once in the Supabase SQL editor of a NEW project.
-- (Upgrading an existing project instead? See migrate-to-auth.sql and
-- migrate-to-couples.sql — this file is the fresh-install end state,
-- those are the deltas that get an existing project there.)
--
-- Real Supabase Auth (email+password): only signed-in accounts that
-- belong to a couple can read or write anything, and only that
-- couple's own rows. Before using the app, go to Authentication >
-- Providers > Email and turn OFF "Confirm email" — otherwise signUp()
-- won't hand back an active session immediately and the in-app signup
-- screen won't work in one step.
--
-- Multi-couple: any number of couples can use the same project. Two
-- people are matched into a couple via a 6-character invite code —
-- one person creates a couple (gets a code), the other joins with it.
-- Every couple-scoped table carries a "coupleId" and RLS restricts
-- each signed-in account to only its own couple's rows.

create table if not exists couples (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists profile (
  id uuid primary key references couples(id) on delete cascade,
  "nameA" text,
  "nameB" text,
  anniversary date
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  "coupleId" uuid not null references couples(id) on delete cascade,
  date date not null,
  title text not null,
  author text not null check (author in ('a','b')),
  "createdAt" bigint not null
);

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  "coupleId" uuid not null references couples(id) on delete cascade,
  date date not null,
  text text not null,
  author text not null check (author in ('a','b')),
  "createdAt" bigint not null
);

create table if not exists bucket (
  id uuid primary key default gen_random_uuid(),
  "coupleId" uuid not null references couples(id) on delete cascade,
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
  "coupleId" uuid not null references couples(id) on delete cascade,
  text text not null,
  author text not null check (author in ('a','b')),
  "createdAt" bigint not null
);

create table if not exists answers (
  id text primary key, -- '{coupleId}_{date}_{author}'
  "coupleId" uuid not null references couples(id) on delete cascade,
  date date not null,
  author text not null check (author in ('a','b')),
  text text not null,
  "createdAt" bigint not null
);

create table if not exists "lastSeen" (
  id text primary key, -- '{coupleId}_{a|b}'
  "coupleId" uuid not null references couples(id) on delete cascade,
  ts bigint not null
);

-- members: maps a real auth.users account to one seat (a/b) within one
-- couple. Role is unique PER COUPLE, not globally, so any number of
-- couples can each have their own 'a' and 'b' — the insert policy below
-- is what caps each couple at exactly two accounts, self-serve, with no
-- admin step: you can only ever claim a role nobody's claimed in that
-- specific couple yet.
create table if not exists members (
  uid uuid primary key references auth.users(id) on delete cascade,
  "coupleId" uuid not null references couples(id) on delete cascade,
  role text not null check (role in ('a','b')),
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  unique ("coupleId", role)
);

alter table couples enable row level security;
alter table profile enable row level security;
alter table events enable row level security;
alter table entries enable row level security;
alter table bucket enable row level security;
alter table messages enable row level security;
alter table answers enable row level security;
alter table "lastSeen" enable row level security;
alter table members enable row level security;

create policy "signed-in users can read couples" on couples
  for select using (auth.uid() is not null);
create policy "signed-in users can create a couple" on couples
  for insert with check (auth.uid() is not null);

create policy "same couple only" on profile for all
  using (id = (select "coupleId" from members where uid = auth.uid()))
  with check (id = (select "coupleId" from members where uid = auth.uid()));
create policy "same couple only" on events for all
  using ("coupleId" = (select "coupleId" from members where uid = auth.uid()))
  with check ("coupleId" = (select "coupleId" from members where uid = auth.uid()));
create policy "same couple only" on entries for all
  using ("coupleId" = (select "coupleId" from members where uid = auth.uid()))
  with check ("coupleId" = (select "coupleId" from members where uid = auth.uid()));
create policy "same couple only" on bucket for all
  using ("coupleId" = (select "coupleId" from members where uid = auth.uid()))
  with check ("coupleId" = (select "coupleId" from members where uid = auth.uid()));
create policy "same couple only" on messages for all
  using ("coupleId" = (select "coupleId" from members where uid = auth.uid()))
  with check ("coupleId" = (select "coupleId" from members where uid = auth.uid()));
create policy "same couple only" on answers for all
  using ("coupleId" = (select "coupleId" from members where uid = auth.uid()))
  with check ("coupleId" = (select "coupleId" from members where uid = auth.uid()));
create policy "same couple only" on "lastSeen" for all
  using ("coupleId" = (select "coupleId" from members where uid = auth.uid()))
  with check ("coupleId" = (select "coupleId" from members where uid = auth.uid()));

-- deliberately NOT couple-scoped: checking whether a couple's role slot
-- is free (joining by code) has to happen before you have a members row
-- of your own to scope a restrictive policy by.
create policy "members readable by signed-in users" on members
  for select using (auth.uid() is not null);
create policy "claim an open role for yourself" on members
  for insert with check (
    uid = auth.uid()
    and not exists (select 1 from members existing where existing."coupleId" = "coupleId" and existing.role = role)
  );

-- enable realtime (live sync within each couple)
alter publication supabase_realtime add table
  couples, profile, events, entries, bucket, messages, answers, "lastSeen", members;
