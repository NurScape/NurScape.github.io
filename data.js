const FALLBACK_DATA = {
  homepage: {
    hero_title: "Votre <span>réussite</span>, notre mission.",
    hero_subtitle: "Des cours complets, des vidéos pédagogiques, des infographies claires et des ressources fiables créées par Chaima El Hoummadi, infirmière polyvalente.",
    primary_label: "Découvrir les cours",
    primary_href: "#cours",
    secondary_label: "Explorer les ressources",
    secondary_href: "#ressources",
    hero_image_url: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=1800&q=80",
    about_title: "À propos de Nurscape Academy",
    about_text: "Nurscape Academy est une plateforme créée par Chaima El Hoummadi, infirmière polyvalente, pour accompagner les étudiants infirmiers avec des ressources claires, fiables et proches de la réalité du terrain.",
    about_image_url: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1000&q=80",
    social_links: [
      { label: "Instagram", icon: "fa-brands fa-instagram", url: "#" },
      { label: "YouTube", icon: "fa-brands fa-youtube", url: "#" },
      { label: "Telegram", icon: "fa-brands fa-telegram", url: "#" },
      { label: "Facebook", icon: "fa-brands fa-facebook-f", url: "#" }
    ],
    features: [
      { title: "Contenu de qualité", icon: "fa-solid fa-graduation-cap", text: "Des cours structurés par Chaima El Hoummadi, infirmière polyvalente, avec une approche claire et pratique." },
      { title: "Apprentissage efficace", icon: "fa-solid fa-bullseye", text: "Ressources visuelles, fiches de révision et quiz pour mieux comprendre." },
      { title: "Communauté solidaire", icon: "fa-regular fa-heart", text: "Rejoignez une communauté motivée et partagez vos expériences." }
    ],
    stats: [
      { label: "Cours disponibles", value: "+150", icon: "fa-regular fa-book-open" },
      { label: "Vidéos pédagogiques", value: "+300", icon: "fa-regular fa-circle-play" },
      { label: "Infographies", value: "+200", icon: "fa-regular fa-image" },
      { label: "PDF téléchargeables", value: "+500", icon: "fa-regular fa-file-lines" },
      { label: "Étudiants accompagnés", value: "+1000", icon: "fa-solid fa-users" }
    ]
  },
  courses: [
    { title: "Anatomie & Physiologie", category: "clinique", icon: "fa-brain", description: "Comprendre le corps humain", sort_order: 1, is_published: true },
    { title: "Sémiologie", category: "clinique", icon: "fa-stethoscope", description: "Les signes cliniques essentiels", sort_order: 2, is_published: true },
    { title: "Stérilisation", category: "soins", icon: "fa-shield-heart", description: "Hygiène et prévention des infections", sort_order: 3, is_published: true },
    { title: "Pathologie Médicale", category: "clinique", icon: "fa-lungs", description: "Maladies médicales courantes", sort_order: 4, is_published: true },
    { title: "Pathologie Chirurgicale", category: "clinique", icon: "fa-scalpel-line-dashed", description: "Affections chirurgicales principales", sort_order: 5, is_published: true },
    { title: "Pathologie Pédiatrique", category: "clinique", icon: "fa-baby", description: "Soins adaptés à l'enfant", sort_order: 6, is_published: true },
    { title: "Urgentologie", category: "clinique", icon: "fa-truck-medical", description: "Urgences et soins immédiats", sort_order: 7, is_published: true },
    { title: "Pharmacologie", category: "clinique", icon: "fa-capsules", description: "Médicaments et thérapeutiques", sort_order: 8, is_published: true },
    { title: "Soins Infirmiers en Médecine", category: "soins", icon: "fa-bed-pulse", description: "Prise en charge médicale", sort_order: 9, is_published: true },
    { title: "Soins Infirmiers en Chirurgie", category: "soins", icon: "fa-scissors", description: "Soins pré-opératoires et post-opératoires", sort_order: 10, is_published: true },
    { title: "Système National de Santé", category: "sante", icon: "fa-hospital", description: "Organisation et politiques de santé", sort_order: 11, is_published: true },
    { title: "Épidémiologie", category: "sante", icon: "fa-chart-line", description: "Santé publique et études épidémiologiques", sort_order: 12, is_published: true },
    { title: "Soins Infirmiers de Base", category: "soins", icon: "fa-hand-holding-heart", description: "Les fondamentaux des soins", sort_order: 13, is_published: true }
  ],
  resources: [
    { title: "Introduction à l'anatomie", type: "video", subject: "Anatomie", description: "Vidéo de démonstration à remplacer depuis l'espace admin.", url: "#", sort_order: 1, is_published: true },
    { title: "Résumé soins de base", type: "infographic", subject: "Soins", description: "Infographie de démonstration pour organiser les révisions.", url: "#", sort_order: 2, is_published: true },
    { title: "Cours de pharmacologie", type: "pdf", subject: "Pharmacologie", description: "PDF exemple à remplacer par un fichier Supabase Storage.", url: "#", sort_order: 3, is_published: true },
    { title: "Mini quiz épidémiologie", type: "quiz", subject: "Épidémiologie", description: "Questionnaire dynamique publié depuis l'administration.", url: "#", sort_order: 4, is_published: true }
  ],
  quizzes: [
    { question: "La prévalence mesure quoi ?", answers: ["Le nombre de nouveaux cas seulement", "Le nombre total de cas à un moment donné ou sur une période", "Le risque relatif uniquement"], correct_answer: "Le nombre total de cas à un moment donné ou sur une période", explanation: "La prévalence correspond au nombre total de cas.", sort_order: 1, is_published: true }
  ]
};

const config = window.NURSCAPE_CONFIG || {};
const supabaseEnabled = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase);
const supabaseClient = supabaseEnabled ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;

async function loadPublishedContent() {
  if (!supabaseClient) return { ...FALLBACK_DATA, connected: false };

  try {
    const [homeRes, coursesRes, resourcesRes, quizzesRes] = await Promise.all([
      supabaseClient.from("homepage").select("*").eq("id", 1).maybeSingle(),
      supabaseClient.from("courses").select("*").eq("is_published", true).order("sort_order"),
      supabaseClient.from("resources").select("*").eq("is_published", true).order("sort_order"),
      supabaseClient.from("quizzes").select("*").eq("is_published", true).order("sort_order")
    ]);

    for (const res of [homeRes, coursesRes, resourcesRes, quizzesRes]) {
      if (res.error) throw res.error;
    }

    return {
      homepage: homeRes.data || FALLBACK_DATA.homepage,
      // An empty table is a valid result. Falling back here made deleted content
      // reappear as demo content and made the admin page look broken.
      courses: coursesRes.data || [],
      resources: resourcesRes.data || [],
      quizzes: quizzesRes.data || [],
      connected: true
    };
  } catch (error) {
    console.warn("Supabase indisponible, contenu de démonstration chargé.", error);
    return { ...FALLBACK_DATA, connected: false };
  }
}

async function loadAdminContent() {
  if (!supabaseClient) return { ...FALLBACK_DATA, connected: false };

  const [homeRes, coursesRes, resourcesRes, quizzesRes] = await Promise.all([
    supabaseClient.from("homepage").select("*").eq("id", 1).maybeSingle(),
    supabaseClient.from("courses").select("*").order("sort_order"),
    supabaseClient.from("resources").select("*").order("sort_order"),
    supabaseClient.from("quizzes").select("*").order("sort_order")
  ]);

  for (const res of [homeRes, coursesRes, resourcesRes, quizzesRes]) {
    if (res.error) throw res.error;
  }

  return {
    homepage: homeRes.data || FALLBACK_DATA.homepage,
    courses: coursesRes.data || [],
    resources: resourcesRes.data || [],
    quizzes: quizzesRes.data || [],
    connected: true
  };
}
