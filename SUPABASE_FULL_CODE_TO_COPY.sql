-- Nurscape Academy Supabase setup
-- Run this in the Supabase SQL editor after creating your project.

create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.homepage (
  id int primary key default 1 check (id = 1),
  hero_title text not null,
  hero_subtitle text not null,
  primary_label text default 'Découvrir les cours',
  primary_href text default '#cours',
  secondary_label text default 'Explorer les ressources',
  secondary_href text default '#ressources',
  hero_image_url text,
  about_title text,
  about_text text,
  about_image_url text,
  stats jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  social_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('clinique', 'soins', 'sante')),
  icon text not null default 'fa-heart-pulse',
  description text not null,
  sort_order int not null default 1,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('video', 'infographic', 'pdf', 'quiz')),
  subject text,
  description text,
  url text,
  sort_order int not null default 1,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answers jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  explanation text,
  sort_order int not null default 1,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

insert into public.homepage (
  id,
  hero_title,
  hero_subtitle,
  primary_label,
  primary_href,
  secondary_label,
  secondary_href,
  hero_image_url,
  about_title,
  about_text,
  about_image_url,
  stats,
  features,
  social_links
) values (
  1,
  'Votre <span>réussite</span>, notre mission.',
  'Des cours complets, des vidéos pédagogiques, des infographies claires et des ressources fiables créées par Chaima El Hoummadi, infirmière polyvalente.',
  'Découvrir les cours',
  '#cours',
  'Explorer les ressources',
  '#ressources',
  'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=1800&q=80',
  'À propos de Nurscape Academy',
  'Nurscape Academy est une plateforme créée par Chaima El Hoummadi, infirmière polyvalente, pour accompagner les étudiants infirmiers avec des ressources claires, fiables et proches de la réalité du terrain.',
  'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1000&q=80',
  '[
    {"label":"Cours disponibles","value":"+150","icon":"fa-regular fa-book-open"},
    {"label":"Vidéos pédagogiques","value":"+300","icon":"fa-regular fa-circle-play"},
    {"label":"Infographies","value":"+200","icon":"fa-regular fa-image"},
    {"label":"PDF téléchargeables","value":"+500","icon":"fa-regular fa-file-lines"},
    {"label":"Étudiants accompagnés","value":"+1000","icon":"fa-solid fa-users"}
  ]'::jsonb,
  '[
    {"title":"Contenu de qualité","icon":"fa-solid fa-graduation-cap","text":"Des cours structurés par Chaima El Hoummadi, infirmière polyvalente, avec une approche claire et pratique."},
    {"title":"Apprentissage efficace","icon":"fa-solid fa-bullseye","text":"Ressources visuelles, fiches de révision et quiz pour mieux comprendre."},
    {"title":"Communauté solidaire","icon":"fa-regular fa-heart","text":"Rejoignez une communauté motivée et partagez vos expériences."}
  ]'::jsonb,
  '[
    {"label":"Instagram","icon":"fa-brands fa-instagram","url":"#"},
    {"label":"YouTube","icon":"fa-brands fa-youtube","url":"#"},
    {"label":"Telegram","icon":"fa-brands fa-telegram","url":"#"},
    {"label":"Facebook","icon":"fa-brands fa-facebook-f","url":"#"}
  ]'::jsonb
) on conflict (id) do nothing;

insert into public.courses (title, category, icon, description, sort_order) values
('Anatomie & Physiologie', 'clinique', 'fa-brain', 'Comprendre le corps humain', 1),
('Sémiologie', 'clinique', 'fa-stethoscope', 'Les signes cliniques essentiels', 2),
('Stérilisation', 'soins', 'fa-shield-heart', 'Hygiène et prévention des infections', 3),
('Pathologie Médicale', 'clinique', 'fa-lungs', 'Maladies médicales courantes', 4),
('Pathologie Chirurgicale', 'clinique', 'fa-scissors', 'Affections chirurgicales principales', 5),
('Pathologie Pédiatrique', 'clinique', 'fa-baby', 'Soins adaptés à l''enfant', 6),
('Urgentologie', 'clinique', 'fa-truck-medical', 'Urgences et soins immédiats', 7),
('Pharmacologie', 'clinique', 'fa-capsules', 'Médicaments et thérapeutiques', 8),
('Soins Infirmiers en Médecine', 'soins', 'fa-bed-pulse', 'Prise en charge médicale', 9),
('Soins Infirmiers en Chirurgie', 'soins', 'fa-scissors', 'Soins pré-opératoires et post-opératoires', 10),
('Système National de Santé', 'sante', 'fa-hospital', 'Organisation et politiques de santé', 11),
('Épidémiologie', 'sante', 'fa-chart-line', 'Santé publique et études épidémiologiques', 12),
('Soins Infirmiers de Base', 'soins', 'fa-hand-holding-heart', 'Les fondamentaux des soins', 13)
on conflict do nothing;

insert into public.resources (title, type, subject, description, url, sort_order) values
('Introduction à l''anatomie', 'video', 'Anatomie', 'Vidéo de démonstration à remplacer depuis l''espace admin.', '#', 1),
('Résumé soins de base', 'infographic', 'Soins', 'Infographie de démonstration pour organiser les révisions.', '#', 2),
('Cours de pharmacologie', 'pdf', 'Pharmacologie', 'PDF exemple à remplacer par un fichier Supabase Storage.', '#', 3),
('Mini quiz épidémiologie', 'quiz', 'Épidémiologie', 'Questionnaire dynamique publié depuis l''administration.', '#', 4)
on conflict do nothing;

insert into public.quizzes (question, answers, correct_answer, explanation, sort_order) values
(
  'La prévalence mesure quoi ?',
  '["Le nombre de nouveaux cas seulement", "Le nombre total de cas à un moment donné ou sur une période", "Le risque relatif uniquement"]'::jsonb,
  'Le nombre total de cas à un moment donné ou sur une période',
  'La prévalence correspond au nombre total de cas.',
  1
) on conflict do nothing;

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

-- After creating your admin user in Supabase Auth, run this with their user id:
-- insert into public.admin_profiles (user_id, email) values ('USER_UUID_HERE', 'you@example.com');
