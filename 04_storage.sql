-- 04_storage.sql
-- Run after 03_demo_content.sql.

insert into storage.buckets (id, name, public)
values
  ('site-images', 'site-images', true),
  ('course-files', 'course-files', true)
on conflict (id) do nothing;

drop policy if exists "Public can view site images" on storage.objects;
create policy "Public can view site images"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('site-images', 'course-files'));

drop policy if exists "Admins manage storage" on storage.objects;
create policy "Admins manage storage"
on storage.objects for all
to authenticated
using (bucket_id in ('site-images', 'course-files') and public.is_admin())
with check (bucket_id in ('site-images', 'course-files') and public.is_admin());
