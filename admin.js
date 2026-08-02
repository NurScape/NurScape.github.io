const adminState = { content: null, session: null, isAdmin: false, busy: false };

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function setStatus(text, connected) {
  const pill = $("#connectionStatus");
  pill.textContent = text;
  pill.classList.toggle("online", connected);
}

function showMessage(text, type = "success") {
  const message = $("#adminMessage");
  message.textContent = text;
  message.classList.toggle("error", type === "error");
  message.hidden = false;
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => { message.hidden = true; }, 6000);
}

function errorText(error) {
  if (!error) return "Une erreur inconnue s’est produite.";
  if (/row-level security|permission denied|42501/i.test(error.message || "")) {
    return "Accès refusé par Supabase. Vérifiez que ce compte existe dans admin_profiles et que les politiques SQL ont été installées.";
  }
  return error.message || String(error);
}

async function runAction(action, successText) {
  if (adminState.busy) return;
  adminState.busy = true;
  $$('button[type="submit"], [data-delete]').forEach((button) => { button.disabled = true; });
  try {
    await action();
    if (successText) showMessage(successText);
  } catch (error) {
    console.error(error);
    showMessage(errorText(error), "error");
  } finally {
    adminState.busy = false;
    $$('button[type="submit"], [data-delete]').forEach((button) => { button.disabled = false; });
  }
}

function valueFromForm(form) {
  return Object.fromEntries([...new FormData(form).entries()].filter(([, value]) => !(value instanceof File)));
}

function fillForm(form, data) {
  Object.entries(data || {}).forEach(([key, value]) => {
    const field = form.elements[key];
    if (!field) return;
    if (field.type === "checkbox") field.checked = Boolean(value);
    else if (Array.isArray(value) || (value && typeof value === "object")) field.value = JSON.stringify(value, null, 2);
    else field.value = value ?? "";
  });
}

function resetForm(form) {
  form.reset();
  if (form.elements.id) form.elements.id.value = "";
  if (form.elements.is_published) form.elements.is_published.checked = true;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function listItem(item, type) {
  const published = item.is_published ? "Publié" : "Masqué";
  const label = escapeHtml(item.title || item.question || "Sans titre");
  const detail = escapeHtml(item.category || item.type || "");
  const id = escapeHtml(item.id || item.title || item.question);
  return `<article class="list-item"><div><strong>${label}</strong><span>${detail} · ${published}</span></div>
    <div class="list-actions"><button type="button" data-edit="${type}" data-id="${id}">Modifier</button>
    ${item.id ? `<button type="button" data-delete="${type}" data-id="${id}">Supprimer</button>` : ""}</div></article>`;
}

function renderLists() {
  $("#courseList").innerHTML = adminState.content.courses.map((item) => listItem(item, "course")).join("");
  $("#resourceList").innerHTML = adminState.content.resources.map((item) => listItem(item, "resource")).join("");
  $("#quizList").innerHTML = adminState.content.quizzes.map((item) => listItem(item, "quiz")).join("");
}

async function requireAdmin() {
  adminState.session = null;
  adminState.isAdmin = false;
  if (!supabaseClient) {
    setStatus("Configuration requise", false);
    $("#loginCard").hidden = false;
    $("#adminWorkspace").hidden = true;
    return false;
  }

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  adminState.session = data.session;
  if (adminState.session) {
    const { data: profile, error: profileError } = await supabaseClient
      .from("admin_profiles").select("user_id").eq("user_id", adminState.session.user.id).maybeSingle();
    if (profileError && !/row-level security|permission denied/i.test(profileError.message || "")) throw profileError;
    adminState.isAdmin = Boolean(profile);
  }

  const loggedIn = Boolean(adminState.session);
  $("#loginCard").hidden = loggedIn && adminState.isAdmin;
  $("#adminWorkspace").hidden = !adminState.isAdmin;
  $("#logoutBtn").hidden = !loggedIn;
  if (adminState.isAdmin) setStatus("Administrateur connecté", true);
  else if (loggedIn) {
    setStatus("Compte non autorisé", false);
    $("#loginNote").textContent = "Ce compte est connecté, mais il n’est pas déclaré dans admin_profiles.";
  } else setStatus("Connexion requise", false);
  return adminState.isAdmin;
}

async function refreshAdmin() {
  if (!adminState.isAdmin) return;
  adminState.content = await loadAdminContent();
  fillForm($("#homeForm"), adminState.content.homepage);
  renderLists();
}

function assertAdmin() {
  if (!supabaseClient || !adminState.session || !adminState.isAdmin) throw new Error("Connexion administrateur requise.");
}

function safeFileName(fileName) {
  return fileName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || "fichier";
}

async function uploadFile(bucket, file, folder = "uploads") {
  assertAdmin();
  if (file.size > 25 * 1024 * 1024) throw new Error("Le fichier dépasse la limite de 25 Mo.");
  const path = `${folder}/${Date.now()}-${safeFileName(file.name)}`;
  const { error } = await supabaseClient.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Supabase n’a pas retourné de lien public pour le fichier.");
  return data.publicUrl;
}

async function saveHomepage(form) {
  assertAdmin();
  const allowed = ["hero_title", "hero_subtitle", "primary_label", "primary_href", "secondary_label", "secondary_href", "hero_image_url", "about_title", "about_text", "about_image_url"];
  const raw = valueFromForm(form);
  const payload = { id: 1 };
  allowed.forEach((key) => { payload[key] = raw[key] || null; });
  if (!payload.hero_title || !payload.hero_subtitle) throw new Error("Le titre et le sous-titre sont obligatoires.");
  const heroFile = form.elements.hero_image_file.files[0];
  const aboutFile = form.elements.about_image_file.files[0];
  if (heroFile) payload.hero_image_url = await uploadFile("site-images", heroFile, "homepage");
  if (aboutFile) payload.about_image_url = await uploadFile("site-images", aboutFile, "homepage");
  const { error } = await supabaseClient.from("homepage").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  await refreshAdmin();
}

async function upsertTable(table, form, fields, transform = (payload) => payload) {
  assertAdmin();
  const raw = valueFromForm(form);
  let payload = {};
  fields.forEach((key) => { if (raw[key] !== undefined) payload[key] = raw[key]; });
  if (raw.id) payload.id = raw.id;
  payload.sort_order = Number(raw.sort_order || 1);
  payload.is_published = form.elements.is_published.checked;
  payload = transform(payload);
  const upload = form.elements.upload_file?.files?.[0];
  if (upload) {
    const bucket = payload.type === "infographic" ? "site-images" : "course-files";
    payload.url = await uploadFile(bucket, upload, payload.type || table);
  }
  const { error } = await supabaseClient.from(table).upsert(payload);
  if (error) throw error;
  resetForm(form);
  await refreshAdmin();
}

async function deleteRow(table, id) {
  assertAdmin();
  const { error } = await supabaseClient.from(table).delete().eq("id", id);
  if (error) throw error;
  await refreshAdmin();
}

function bindAdmin() {
  $$(".admin-tab").forEach((tab) => tab.addEventListener("click", () => {
    $$(".admin-tab").forEach((item) => item.classList.remove("active"));
    $$(".admin-panel").forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    $(`#${tab.dataset.panel}`).classList.add("active");
  }));

  $("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    runAction(async () => {
      if (!supabaseClient) throw new Error("La configuration Supabase est absente.");
      const { email, password } = valueFromForm(event.currentTarget);
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      $("#loginNote").textContent = "";
      await requireAdmin();
      await refreshAdmin();
      if (!adminState.isAdmin) throw new Error("Compte connecté, mais non autorisé comme administrateur.");
    }, "Connexion réussie.");
  });

  $("#logoutBtn").addEventListener("click", () => runAction(async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    await requireAdmin();
  }, "Déconnexion réussie."));

  $("#homeForm").addEventListener("submit", (event) => { event.preventDefault(); runAction(() => saveHomepage(event.currentTarget), "Page d’accueil enregistrée."); });
  $("#courseForm").addEventListener("submit", (event) => { event.preventDefault(); runAction(() => upsertTable("courses", event.currentTarget, ["title", "category", "icon", "description", "sort_order"]), "Cours enregistré."); });
  $("#resourceForm").addEventListener("submit", (event) => { event.preventDefault(); runAction(() => upsertTable("resources", event.currentTarget, ["title", "type", "subject", "url", "description", "sort_order"]), "Ressource enregistrée."); });
  $("#quizForm").addEventListener("submit", (event) => { event.preventDefault(); runAction(() => upsertTable("quizzes", event.currentTarget, ["question", "answers", "correct_answer", "explanation", "sort_order"], (payload) => ({ ...payload, answers: payload.answers.split("\n").map((a) => a.trim()).filter(Boolean) })), "Quiz enregistré."); });

  document.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");
    if (editButton) {
      const map = { course: ["courses", "courseForm"], resource: ["resources", "resourceForm"], quiz: ["quizzes", "quizForm"] };
      const [collection, formId] = map[editButton.dataset.edit];
      const item = adminState.content[collection].find((entry) => String(entry.id || entry.title || entry.question) === editButton.dataset.id);
      if (!item) return showMessage("Élément introuvable. Rechargez la page.", "error");
      fillForm($(`#${formId}`), item);
      if (editButton.dataset.edit === "quiz" && Array.isArray(item.answers)) $(`#${formId}`).elements.answers.value = item.answers.join("\n");
      $(`#${formId}`).scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (deleteButton && confirm("Supprimer définitivement cet élément ?")) {
      const table = { course: "courses", resource: "resources", quiz: "quizzes" }[deleteButton.dataset.delete];
      runAction(() => deleteRow(table, deleteButton.dataset.id), "Élément supprimé.");
    }
  });
}

async function initAdmin() {
  bindAdmin();
  await runAction(async () => { await requireAdmin(); await refreshAdmin(); });
  if (supabaseClient) supabaseClient.auth.onAuthStateChange(() => setTimeout(() => runAction(async () => { await requireAdmin(); await refreshAdmin(); }), 0));
}

initAdmin();
