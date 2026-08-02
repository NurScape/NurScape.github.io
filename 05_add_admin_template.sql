-- 05_add_admin_template.sql
-- Run this last, after creating a user in Supabase Authentication.
-- Replace USER_UUID_HERE and your-email@example.com.

insert into public.admin_profiles (user_id, email)
values ('USER_UUID_HERE', 'your-email@example.com');
