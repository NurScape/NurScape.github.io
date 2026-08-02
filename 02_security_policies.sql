-- 02_security_policies.sql
-- Run after 01_tables.sql.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
  );
$$;

alter table public.admin_profiles enable row level security;
alter table public.homepage enable row level security;
alter table public.courses enable row level security;
alter table public.resources enable row level security;
alter table public.quizzes enable row level security;

drop policy if exists "Admins can read admin profiles" on public.admin_profiles;
create policy "Admins can read admin profiles"
on public.admin_profiles for select
to authenticated
using (public.is_admin());

drop policy if exists "Published homepage is readable" on public.homepage;
create policy "Published homepage is readable"
on public.homepage for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage homepage" on public.homepage;
create policy "Admins manage homepage"
on public.homepage for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Published courses are readable" on public.courses;
create policy "Published courses are readable"
on public.courses for select
to anon, authenticated
using (is_published = true or public.is_admin());

drop policy if exists "Admins manage courses" on public.courses;
create policy "Admins manage courses"
on public.courses for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Published resources are readable" on public.resources;
create policy "Published resources are readable"
on public.resources for select
to anon, authenticated
using (is_published = true or public.is_admin());

drop policy if exists "Admins manage resources" on public.resources;
create policy "Admins manage resources"
on public.resources for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Published quizzes are readable" on public.quizzes;
create policy "Published quizzes are readable"
on public.quizzes for select
to anon, authenticated
using (is_published = true or public.is_admin());

drop policy if exists "Admins manage quizzes" on public.quizzes;
create policy "Admins manage quizzes"
on public.quizzes for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
