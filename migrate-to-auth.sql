-- onda: upgrade an EXISTING project from the "?u=a/?u=b link" trust model
-- to real Supabase Auth (email+password). Run this once in your project's
-- SQL editor (Supabase dashboard > SQL Editor > New query). Every
-- statement here is safe to re-run.
--
-- BEFORE running this: Authentication > Providers > Email > turn OFF
-- "Confirm email". Without this, signUp() won't hand back an active
-- session right away, and the in-app signup screen (which claims your
-- seat in the same step as signing up) won't work in one go.

-- members: maps a real auth.users account to one of the two seats.
-- The insert policy below is what actually caps this app at exactly two
-- accounts, self-serve, with no admin step needed from you: each person
-- can only ever claim a role nobody has claimed yet.
create table if not exists members (
  uid uuid primary key references auth.users(id) on delete cascade,
  role text not null unique check (role in ('a','b')),
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);
alter table members enable row level security;

drop policy if exists "members readable by signed-in users" on members;
create policy "members readable by signed-in users" on members
  for select using (auth.uid() is not null);

drop policy if exists "claim an open role for yourself" on members;
create policy "claim an open role for yourself" on members
  for insert with check (
    uid = auth.uid()
    and not exists (select 1 from members existing where existing.role = role)
  );

alter publication supabase_realtime add table members;

-- lock every existing table down to the two registered members only —
-- was `using (true) with check (true)` (anyone with the anon key could
-- read/write), which was fine while the app was localhost-only but isn't
-- once the anon key is sitting in a public GitHub repo.
drop policy if exists "allow all" on profile;
drop policy if exists "allow all" on events;
drop policy if exists "allow all" on entries;
drop policy if exists "allow all" on bucket;
drop policy if exists "allow all" on messages;
drop policy if exists "allow all" on answers;
drop policy if exists "allow all" on "lastSeen";

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
