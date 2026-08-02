# Nurscape Academy

Dynamic Supabase-ready static website for Nurscape Academy.

## Local preview

Open `index.html` directly in your browser. The site shows built-in sample content until Supabase is configured.

## Connect Supabase

1. Create a Supabase project.
2. Open the Supabase SQL editor and run `supabase/schema.sql`.
3. Create an admin user in Supabase Authentication → Users.
4. Copy that user's UUID, open `supabase/split/05_add_admin_template.sql`, replace both placeholders, and run it once in the SQL editor.
5. Copy your project URL and anon key into `assets/js/config.js`.
6. Open `admin.html` and sign in.

If the page says **Compte non autorisé**, authentication works but step 4 is missing or contains the wrong UUID. Files are stored in the public `site-images` and `course-files` buckets; uploads are limited to 25 MB by the admin interface.

## Content model

- `homepage`: hero text, buttons, images, stats, features, social links.
- `courses`: public course cards and categories.
- `resources`: videos, infographics, PDFs, and quiz placeholders.
- `quizzes`: quiz questions for the first dynamic quiz layer.

The public homepage reads only published content. The admin page requires Supabase Auth and RLS admin permissions before it can write.
