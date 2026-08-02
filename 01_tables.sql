-- 01_tables.sql
-- Run first in Supabase SQL Editor.

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
