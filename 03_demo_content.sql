-- 03_demo_content.sql
-- Run after 02_security_policies.sql.

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
('Soins Infirmiers de Base', 'soins', 'fa-hand-holding-heart', 'Les fondamentaux des soins', 13);

insert into public.resources (title, type, subject, description, url, sort_order) values
('Introduction à l''anatomie', 'video', 'Anatomie', 'Vidéo de démonstration à remplacer depuis l''espace admin.', '#', 1),
('Résumé soins de base', 'infographic', 'Soins', 'Infographie de démonstration pour organiser les révisions.', '#', 2),
('Cours de pharmacologie', 'pdf', 'Pharmacologie', 'PDF exemple à remplacer par un fichier Supabase Storage.', '#', 3),
('Mini quiz épidémiologie', 'quiz', 'Épidémiologie', 'Questionnaire dynamique publié depuis l''administration.', '#', 4);

insert into public.quizzes (question, answers, correct_answer, explanation, sort_order) values
(
  'La prévalence mesure quoi ?',
  '["Le nombre de nouveaux cas seulement", "Le nombre total de cas à un moment donné ou sur une période", "Le risque relatif uniquement"]'::jsonb,
  'Le nombre total de cas à un moment donné ou sur une période',
  'La prévalence correspond au nombre total de cas.',
  1
);
