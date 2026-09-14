-- onda: add multi-couple support (invite-code based matching), on top of
-- an existing project that already ran migrate-to-auth.sql. Run once in
-- the SQL editor.
--
-- IMPORTANT: this WIPES every row in members/profile/events/entries/
-- bucket/messages/answers/"lastSeen" (couple_id can't be backfilled onto
-- data that predates the concept of a couple). Back up first if you
-- want to keep anything — otherwise this is exactly the "데이터 초기화"
-- step, done in the same pass as the schema change.
truncate table members, profile, events, entries, bucket, messages, answers, "lastSeen";

-- couples: a couple is just an id + an invite code linking exactly two
-- members accounts together. No personal data lives here.
create table if not exists couples (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);
alter table couples enable row level security;
drop policy if exists "signed-in users can read couples" on couples;
create policy "signed-in users can read couples" on couples
  for select using (auth.uid() is not null);
drop policy if exists "signed-in users can create a couple" on couples;
create policy "signed-in users can create a couple" on couples
  for insert with check (auth.uid() is not null);
alter publication supabase_realtime add table couples;

-- members: role is now unique PER COUPLE, not globally (was: at most
-- one 'a' and one 'b' in the whole app; now: at most one 'a' and one
-- 'b' per couple, so any number of couples can each have their own).
alter table members add column if not exists "coupleId" uuid references couples(id) on delete cascade;
alter table members alter column "coupleId" set not null;
alter table members drop constraint if exists members_role_key;
alter table members drop constraint if exists members_couple_role_unique;
alter table members add constraint members_couple_role_unique unique ("coupleId", role);

drop policy if exists "claim an open role for yourself" on members;
create policy "claim an open role for yourself" on members
  for insert with check (
    uid = auth.uid()
    and not exists (select 1 from members existing where existing."coupleId" = "coupleId" and existing.role = role)
  );
-- the existing "members readable by signed-in users" select policy is
-- left as-is (not couple-scoped) on purpose: joining a couple by code
-- requires checking whether that couple's role slots are free BEFORE
-- you have a members row of your own to scope by.

-- profile: was one fixed global row (id='profile'); now one row per
-- couple, keyed by the couple's own id directly (no separate coupleId
-- column needed here — the row IS the couple's profile).
alter table profile drop constraint if exists profile_pkey;
alter table profile alter column id drop default;
alter table profile alter column id type uuid using id::uuid;
alter table profile add primary key (id);
alter table profile add constraint profile_id_fkey foreign key (id) references couples(id) on delete cascade;

drop policy if exists "members only" on profile;
drop policy if exists "same couple only" on profile;
create policy "same couple only" on profile for all
  using (id = (select "coupleId" from members where uid = auth.uid()))
  with check (id = (select "coupleId" from members where uid = auth.uid()));

-- events/entries/bucket/messages/answers/"lastSeen": add coupleId and
-- scope RLS to it instead of "any of the app's two seats"
alter table events add column if not exists "coupleId" uuid references couples(id) on delete cascade;
alter table events alter column "coupleId" set not null;
drop policy if exists "members only" on events;
drop policy if exists "same couple only" on events;
create policy "same couple only" on events for all
  using ("coupleId" = (select "coupleId" from members where uid = auth.uid()))
  with check ("coupleId" = (select "coupleId" from members where uid = auth.uid()));

alter table entries add column if not exists "coupleId" uuid references couples(id) on delete cascade;
alter table entries alter column "coupleId" set not null;
drop policy if exists "members only" on entries;
drop policy if exists "same couple only" on entries;
create policy "same couple only" on entries for all
  using ("coupleId" = (select "coupleId" from members where uid = auth.uid()))
  with check ("coupleId" = (select "coupleId" from members where uid = auth.uid()));

alter table bucket add column if not exists "coupleId" uuid references couples(id) on delete cascade;
alter table bucket alter column "coupleId" set not null;
drop policy if exists "members only" on bucket;
drop policy if exists "same couple only" on bucket;
create policy "same couple only" on bucket for all
  using ("coupleId" = (select "coupleId" from members where uid = auth.uid()))
  with check ("coupleId" = (select "coupleId" from members where uid = auth.uid()));

alter table messages add column if not exists "coupleId" uuid references couples(id) on delete cascade;
alter table messages alter column "coupleId" set not null;
drop policy if exists "members only" on messages;
drop policy if exists "same couple only" on messages;
create policy "same couple only" on messages for all
  using ("coupleId" = (select "coupleId" from members where uid = auth.uid()))
  with check ("coupleId" = (select "coupleId" from members where uid = auth.uid()));

alter table answers add column if not exists "coupleId" uuid references couples(id) on delete cascade;
alter table answers alter column "coupleId" set not null;
drop policy if exists "members only" on answers;
drop policy if exists "same couple only" on answers;
create policy "same couple only" on answers for all
  using ("coupleId" = (select "coupleId" from members where uid = auth.uid()))
  with check ("coupleId" = (select "coupleId" from members where uid = auth.uid()));

alter table "lastSeen" add column if not exists "coupleId" uuid references couples(id) on delete cascade;
alter table "lastSeen" alter column "coupleId" set not null;
drop policy if exists "members only" on "lastSeen";
drop policy if exists "same couple only" on "lastSeen";
create policy "same couple only" on "lastSeen" for all
  using ("coupleId" = (select "coupleId" from members where uid = auth.uid()))
  with check ("coupleId" = (select "coupleId" from members where uid = auth.uid()));
